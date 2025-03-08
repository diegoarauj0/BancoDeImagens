import { Request, Response, Router } from "express"
import asyncHandlerMiddleware from "../../middlewares/asyncHandlerMiddleware"
import googleapis, { google } from "googleapis"
import { BadRequestError } from "../../error/badRequestError"
import { userModel } from "../../models/userModel"
import requiredValueMiddleware from "../../middlewares/requiredValueMiddleware"
import handlerBadRequestErrorMiddleware from "../../middlewares/handlerBadRequestErrorMiddleware"

class GoogleAuthenticationController {
  public async router(): Promise<Router> {
    const router = Router()

    try {
      const OAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL
      )
  
      router.get("/google/callback", requiredValueMiddleware("query", "code") ,asyncHandlerMiddleware(this.OAuthCallback(OAuth2Client)), handlerBadRequestErrorMiddleware)
      router.get("/google", asyncHandlerMiddleware(this.OAuthRedirect(OAuth2Client)))
    } catch (error) {
      console.log(error)
    }

    return router
  }

  private OAuthRedirect(OAuth2Client:googleapis.Auth.OAuth2Client): (req:Request, res:Response) => Promise<void> {
    return async (req:Request, res:Response) => {
      const URL = OAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
      })

      res.redirect(URL)
    }
  }

  private OAuthCallback(OAuth2Client:googleapis.Auth.OAuth2Client): (req:Request, res:Response) => Promise<void> {
    return async (req:Request, res:Response) => {
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
    }}
}

export default new GoogleAuthenticationController()