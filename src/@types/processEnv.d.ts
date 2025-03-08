declare namespace NodeJS {
  interface ProcessEnv {
    PORT:string;
    MONGODB:string;
    PASSWORD_SALT:string;
    SESSION_SECRET:string;
    GOOGLE_CLIENT_ID:string;
    GOOGLE_CLIENT_SECRET:string;
    GOOGLE_REDIRECT_URL:string;
  }
}