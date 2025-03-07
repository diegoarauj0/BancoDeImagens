declare namespace NodeJS {
  interface ProcessEnv {
    PORT:number,
    MONGODB:string,
    PASSWORD_SALT:10,
    SESSION_SECRET:string,
  }
}