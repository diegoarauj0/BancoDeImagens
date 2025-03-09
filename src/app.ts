import { engine } from "express-handlebars"
import session from "express-session"
import express from "express"
import dotenv from "dotenv"
import path from "path"
import cors from "cors"

import { unauthorizedErrorHandlerMiddleware, badRequestErrorHandlerMiddleware, internalServerErrorHandlerMiddleware, notFoundErrorHandlerMiddleware} from "./middlewares/errors/index"
import { connectMongoDB} from "./config/database"
import configureSession from "./config/session"
import router from "./router"

dotenv.config()

export default class App {
  private app: express.Application

  constructor() {
    this.app = express()
    this.initialize()
  }

  private listen(): void {
    this.app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`)
    })
  }

  private async initialize(): Promise<void> {
    await this.setupDatabase()
    await this.setupMiddlewares()
    await this.setupRoutes()
    this.setupErrorHandling()
    this.listen()
  }

  private async setupDatabase(): Promise<void> {
    await connectMongoDB()
  }

  private async setupMiddlewares(): Promise<void> {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(express.static(path.join(__dirname, "../", "static")))
    this.app.use(cors())
    this.app.use(session(await configureSession()))
    this.setupEngine()
  }

  private setupEngine(): void {
    this.app.engine("handlebars", engine())
    this.app.set("view engine", "handlebars")
    this.app.set("views", path.join(__dirname, "../", "views"))
  }

  private async setupRoutes(): Promise<void> {
    this.app.use(await router())
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundErrorHandlerMiddleware)
    this.app.use(unauthorizedErrorHandlerMiddleware)
    this.app.use(badRequestErrorHandlerMiddleware)
    this.app.use(internalServerErrorHandlerMiddleware)
  }

  public getApp(): express.Application {
    return this.app
  }
}