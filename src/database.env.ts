import { z } from "zod";

export function getDatabaseCredentials() {
  const {
    POSTGRES_HOST,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DATABASE,
    POSTGRES_PORT,
  } = z
    .object({
      POSTGRES_HOST: z.string({
        message: "env variable POSTGRES_HOST is required",
      }),
      POSTGRES_USER: z.string({
        message: "env variable POSTGRES_USER is required",
      }),
      POSTGRES_PASSWORD: z.string({
        message: "env variable POSTGRES_PASSWORD is required",
      }),
      POSTGRES_DATABASE: z.string({
        message: "env variable POSTGRES_DATABASE is required",
      }),
      POSTGRES_PORT: z.coerce
        .number({
          message: "env variable POSTGRES_PORT is required",
        })
        .default(5432),
    })
    .parse(process.env);

  return {
    host: POSTGRES_HOST,
    password: POSTGRES_PASSWORD,
    user: POSTGRES_USER,
    database: POSTGRES_DATABASE,
    port: POSTGRES_PORT,
  };
}

export function getPostgresConnectionString() {
  const { host, user, password, database, port } = getDatabaseCredentials();
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
