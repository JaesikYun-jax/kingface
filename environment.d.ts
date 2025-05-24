declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_ENV: "production" | "stage" | "development";
  }
}
