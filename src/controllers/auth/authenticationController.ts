import { Router, Request, Response } from "express"
import asyncHandlerMiddleware from "../../middlewares/asyncHandlerMiddleware"

class AuthenticationController {
  private router: Router

  constructor() {
    this.router = Router()
    this.initializeRoutes()
  }

  public get getRouter(): Router {
    return this.router
  }

  private initializeRoutes(): void {
    this.router.get(
      "/session",
      asyncHandlerMiddleware(this.session)
    )

    this.router.get(
      "/logout",
      asyncHandlerMiddleware(this.logout)
    )
  }

  private async logout(req:Request, res:Response): Promise<void> {
    req.session.destroy((err) => {})
    res.redirect("/")
  }

  private async session(req:Request, res:Response): Promise<void> {
    res.status(200).json({
      session:req.session.user
    })
  }
}

export default new AuthenticationController()