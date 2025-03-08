import { Router, Request, Response } from "express"
import convertInvalidErrorToBadRequestErrorMiddleware from "../../middlewares/convertInvalidErrorToBadRequestErrorMiddleware"
import HandlerBadRequestErrorMiddleware from "../../middlewares/handlerBadRequestErrorMiddleware"
import asyncHandlerMiddleware from "../../middlewares/asyncHandlerMiddleware"
import { BadRequestError, ErrorDetails } from "../../error/badRequestError"
import { userModel } from "../../models/userModel"
import requiredValueMiddleware from "../../middlewares/requiredValueMiddleware"

class LocalAuthenticationController {
  public async router(): Promise<Router> {
    const router = Router()

    router.use("/login", requiredValueMiddleware("body", "email"), requiredValueMiddleware("body", "password"), asyncHandlerMiddleware(this.login), convertInvalidErrorToBadRequestErrorMiddleware, HandlerBadRequestErrorMiddleware)
    router.use("/register", asyncHandlerMiddleware(this.register), convertInvalidErrorToBadRequestErrorMiddleware, HandlerBadRequestErrorMiddleware)

    return router
  }

  private async login(req:Request, res:Response): Promise<void> {
    if (req.method === "POST") {
      req.pageToRenderOnError = {
        name:"login",
        layout:"authentication",
      }

      req.convertInvalidErrorToBadRequestError = {
        badRequestErrorPath: "body"
      }

      if (req.requiredValueError.body.length > 0) {
        throw new BadRequestError(req, {
          body:req.requiredValueError.body as any
        })
      }

      const user = await userModel.findOne({ email:req.body.email }).select("+password")

      if (user === null) {
        throw new BadRequestError(req, {
          body:[{
            message:"Path `email` does not exist",
            type:"notFound",
            path:"email",
            value:req.body.email
          }]
        })
      }

      if (await user.comparePassword(req.body.password) === false) {
        throw new BadRequestError(req, {
          body:[{
            message:"Path `password` is different",
            type:"different",
            path:"password",
            value:req.body.password
          }]
        })
      }
      
      req.session.user = user.createSession()

      res.redirect("/")
      return
    }

    res.render("login", { layout:"authentication" })
  }

  private async register(req:Request, res:Response): Promise<void> {
    if (req.method === "POST") {
      req.pageToRenderOnError = {
        name:"register",
        layout:"authentication",
      }
      
      req.convertInvalidErrorToBadRequestError = {
        badRequestErrorPath: "body"
      }

      const user = new userModel({
        email:req.body.email,
        password:req.body.password,
        username:req.body.username
      })

      await user.save()
      
      req.session.user = user.createSession()

      res.redirect("/")
      return
    }

    res.render("register", { layout:"authentication" })
  }
}

export default new LocalAuthenticationController()