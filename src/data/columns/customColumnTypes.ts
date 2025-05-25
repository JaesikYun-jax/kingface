import { text } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { PrimaryId } from "../primaryId";

export const primaryIdColumn = () =>
  text("id")
    .$type<PrimaryId>()
    .$defaultFn(() => createPrimaryId())
    .primaryKey()
    .notNull();

const createPrimaryId = (): PrimaryId => {
  return ulid() as PrimaryId;
};

export const idColumn = (dbName: string) => text(dbName).$type<PrimaryId>();
