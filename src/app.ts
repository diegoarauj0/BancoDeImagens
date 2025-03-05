import express from "express"
import dotenv from "dotenv"
import path from "path"
import cors from "cors"
import router from "./router"
import connectMongoDB from "./connectMongoDB"
import { engine } from "express-handlebars"

dotenv.config()

export default class App {
  private app:express.Application
  
  constructor() {
    this.app = express()
    this.initiate()
  }

  private async initiate(): Promise<void> {
    await connectMongoDB()
    this.engine()
    this.middleware()
    await this.listen()
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