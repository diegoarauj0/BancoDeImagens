import { RedisStore } from "connect-redis"
import { SessionOptions } from "express-session"
import { connectRedis } from "./database"

export default async function configureSession(): Promise<SessionOptions> {
  const redisClient = await connectRedis()

  return ({
    name:"session",
    store:new RedisStore({
      client:redisClient,
      prefix:"session"
    }),
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie: { secure: false, httpOnly: true, maxAge:2592000000 }
  })
}