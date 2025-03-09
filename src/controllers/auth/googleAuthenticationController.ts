import { Request, Response, Router } from "express"
import { google } from "googleapis"
import requiredValueMiddleware from "../../middlewares/requiredValueMiddleware"
import asyncHandlerMiddleware from "../../middlewares/asyncHandlerMiddleware"
import { BadRequestError } from "../../error/badRequestError"
import { userModel } from "../../models/userModel"
import googleAuth from "../../config/googleAuth"

class GoogleAuthenticationController {
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
      "/google/callback",
      requiredValueMiddleware("query", "code"),
      asyncHandlerMiddleware(this.OAuthCallback)
    )

    this.router.get(
      "/google",
      asyncHandlerMiddleware(this.OAuthRedirect)
    )
  }

  private async OAuthRedirect(req:Request, res:Response): Promise<void> {
    const OAuth2Client = googleAuth()

    const URL = OAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
    })

    res.redirect(URL)
  }

  private async OAuthCallback(req:Request, res:Response): Promise<void> {
    const OAuth2Client = googleAuth()

    if (req.requiredValueError.query.length > 0) {
      throw new BadRequestError(req, { query: req.requiredValueError.query as any })
    }

    const token = await OAuth2Client.getToken(req.query.code as string)

    OAuth2Client.setCredentials(token.tokens)

    const OAuth2 = google.oauth2({
      version: "v2",
      auth: OAuth2Client
    })

    const userInfo = await OAuth2.userinfo.get()

    if (userInfo.data.id === undefined || userInfo.data.id === null) {
      throw "User not found"
    }

    let user = await userModel.findOne({ googleID:userInfo.data.id }) as any

    if (user === null) {
      let username = userInfo.data.name || ""

      username = username.replace(/[^\wà-úÀ-Ú]/g, '')
  
      user = new userModel({
        googleID: userInfo.data.id,
        username: username,
      })
      
      await user.validate().catch(() => { user.username = `${user}_${userInfo.data.id}` })
      await user.save()
    }

    req.session.user = user.createSession()
    res.redirect("/")
  }
}

export default new GoogleAuthenticationController()