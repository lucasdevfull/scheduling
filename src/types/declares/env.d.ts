declare namespace NodeJS {
  export interface ProcessEnv {
    ENCRYPT_KEY: string
    BETTER_AUTH_SECRET: string
    DATABASE_URL: string
    EXPIRES_IN: string
    REFRESH_EXPIRES_IN: string
    PORT?: string
  }
}
