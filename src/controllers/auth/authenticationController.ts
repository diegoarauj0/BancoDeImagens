import { Router, Request, Response } from "express"
import asyncHandlerMiddleware from "../../middlewares/asyncHandlerMiddleware"

class AuthenticationController {
  public async router(): Promise<Router> {
    const router = Router()

    router.get("/session", asyncHandlerMiddleware(this.session))
    router.get("/logout", asyncHandlerMiddleware(this.logout))

    return router
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