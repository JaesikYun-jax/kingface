import { AsyncLocalStorage } from "async_hooks";
import debug from "debug";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { connection } from "next/server";
import { DatabaseError, Pool } from "pg";

import { getDatabaseCredentials } from "./database.env";

let postgresPool: Pool | null = null;

let db: Database | null = null;

type Database = ReturnType<typeof createDatabaseClient>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/**
 * transaction 안에서 getDatabaseUnsafe 를 호출하면 connection이 부족해서 lock상태가 될 수 있습니다.
 */
async function getDatabaseUnsafe() {
  await connection();
  if (db != null) {
    return db;
  }
  db = createDatabaseClient();
  return db;
}

const pgPoolLogger = debug("kingface-debug:pg:pool");
const pgQueryLogger = debug("kingface-debug:pg:query");

const poolSize = 10;
// RDS 가 내부 private network 접근이라 안전하고, ssl 사용하기 위한 설정이 복잡하셔 ssl 사용 안함
// https://haechilabs.slack.com/archives/C03EVTP0RSB/p1743479954078039?thread_ts=1743470704.071259&cid=C03EVTP0RSB
const ssl = false;

function getPoolInner() {
  if (postgresPool == null) {
    postgresPool = new Pool({
      ...getDatabaseCredentials(),
      statement_timeout: 10_000,
      idleTimeoutMillis: 10_000,
      ssl,
      idle_in_transaction_session_timeout: 60 * 1000, // 1 minute
      max: poolSize,
      log: (message: unknown, ...args: unknown[]) => {
        pgPoolLogger(message, ...args);
      },
    });
    postgresPool.on("connect", (client) => {
      client.query("SET search_path TO kingface");
    });
  }
  return postgresPool;
}

function createDatabaseClient() {
  return drizzle(getPoolInner(), {
    schema: {},
    logger: {
      logQuery(query: string, params: unknown[]) {
        pgQueryLogger(query, params);
      },
    },
  });
}

interface TransactionContext {
  transaction: Transaction;
  markAsRollback: () => void;
}

const unstable_transactionStorage = new AsyncLocalStorage();

const NEVER_ASSIGNED = Symbol("NEVER_ASSIGNED");

function unstable_getCurrentTransactionContext() {
  return (
    (unstable_transactionStorage.getStore() as
      | TransactionContext
      | undefined) ?? null
  );
}

export async function provideTransaction<T>(
  callback: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  const transactionContext = unstable_getCurrentTransactionContext();
  if (transactionContext != null) {
    throw new Error("Only one transaction can be active at a time");
  }
  const database = await getDatabaseUnsafe();
  let shouldRollback = false;
  let result: T | typeof NEVER_ASSIGNED = NEVER_ASSIGNED;
  function markAsRollback() {
    shouldRollback = true;
  }
  await database
    .transaction(async (transaction) => {
      const context = {
        transaction,
        markAsRollback,
      };
      result = await unstable_transactionStorage.run(
        context,
        callback.bind(null, transaction),
      );
      // transaction scope 안에서 {rollback} 함수를 호출하면 shouldRollback가 true가 됩니다.
      if (shouldRollback) {
        transaction.rollback();
      }
    })
    .catch((error: unknown) => {
      // rollback 후 result를 return하기 위해 여기서 예외를 던지지 않습니다.
      if (shouldRollback) {
        return;
      }
      throw error;
    });
  if (result === NEVER_ASSIGNED) {
    throw new Error("transaction callback must return a value");
  }
  return result;
}

// rollback 이후 result를 return하기 위해 사용합니다.
export function rollback() {
  const transactionContext = unstable_getCurrentTransactionContext();
  if (transactionContext == null) {
    throw new Error("called outside of transaction scope");
  }
  transactionContext.markAsRollback();
}

export async function getDatabaseOrTransaction(): Promise<
  Database | Transaction
> {
  const transactionContext = unstable_getCurrentTransactionContext();
  return transactionContext != null
    ? transactionContext.transaction
    : getDatabaseUnsafe();
}

/**
 * transaction scope 안에서 호출하는 경우 error가 throw 됩니다.
 * connection starving이 나는 걸 방지하기 위해서입니다.
 */
export async function getDatabaseSafe() {
  const transactionContext = unstable_getCurrentTransactionContext();
  if (transactionContext != null) {
    throw new Error("getDatabaseSafe called inside of transaction scope");
  }
  return getDatabaseUnsafe();
}

export async function getTransaction() {
  const transactionContext = unstable_getCurrentTransactionContext();
  if (transactionContext == null) {
    throw new Error("called outside of transaction scope");
  }
  return transactionContext.transaction;
}

export async function migrateDatabase() {
  return migrate(await getDatabaseUnsafe(), {
    migrationsFolder: "drizzle/migrations",
    migrationsSchema: "kingface",
    migrationsTable: "__drizzle_migrations_kingface",
  });
}

export async function getOrNull<T>(
  promise: Promise<T>,
): Promise<NonNullable<T> | null> {
  const result = await promise;
  if (result == null) {
    return null;
  }
  return result as NonNullable<T>;
}

export async function getOneOrNull<T>(
  promise: Promise<T[]>,
): Promise<NonNullable<T> | null> {
  const results = await promise;
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }
  return results[0] as NonNullable<T>;
}

export function getPoolForCheckpoint() {
  return getPoolInner();
}

export function isUniqueConstraintError(
  error: unknown,
  targetConstraints: string[],
): boolean {
  const isUniqueError =
    error instanceof DatabaseError && error.code === "23505";
  if (!isUniqueError) {
    return false;
  }
  const constraint = error.detail?.split("Key (")[1]?.split(")")[0];
  return (
    constraint != null &&
    targetConstraints.some((targetConstraint) =>
      constraint.includes(targetConstraint),
    )
  );
}
