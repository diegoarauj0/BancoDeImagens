import express from "express"
import dotenv from "dotenv"
import path from "path"
import cors from "cors"
import router from "./router"
import session from "express-session"
import connectRedis from "./database/connectRedis"
import connectMongoDB from "./database/connectMongoDB"
import { engine } from "express-handlebars"
import { RedisClientType } from "redis"
import { RedisStore } from "connect-redis"

dotenv.config()

export default class App {
  private app:express.Application
  private redisClient?:RedisClientType

  constructor() {
    this.app = express()
    this.initiate()
  }

  private async initiate(): Promise<void> {
    //Database
    console.group("----- Connect Database -----\n")
    await connectMongoDB()
    this.redisClient = await connectRedis()
    console.groupEnd()

    //express
    this.engine()
    this.session()
    this.middleware()

    //listen
    await this.listen()
  }

  private session(): void {
    this.app.use(session({
      name:"session",
      store:new RedisStore({
        client:this.redisClient,
        prefix:"session"
      }),
      secret:process.env.SESSION_SECRET,
      resave:false,
      saveUninitialized:false,
      cookie: { secure: false, httpOnly: true, maxAge:2592000000 }
    }))
  }

  private engine(): void {
    this.app.engine('handlebars', engine())
    this.app.set('view engine', 'handlebars')
    this.app.set('views', './views')
  }

  private middleware(): void {
    this.app.use(express.urlencoded({ extended:true }))
    this.app.use(express.json({ strict:true }))
    this.app.use("/static", express.static(path.join(__dirname, "../", "static")))
    this.app.use(cors())
    this.app.use(router)
  }

  private listen(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.app.listen(process.env.PORT, () => {
        console.log(`http/express server connected to port ${process.env.PORT}`)
        resolve()
      })
    })
  }
}