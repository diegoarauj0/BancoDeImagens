import { Router, Request, Response } from "express"
import asyncHandlerMiddleware from "../../middlewares/asyncHandlerMiddleware"
import { BadRequestError } from "../../error/badRequestError"
import { userModel } from "../../models/userModel"
import requiredValueMiddleware from "../../middlewares/requiredValueMiddleware"

class LocalAuthenticationController {
  private router: Router

  constructor() {
    this.router = Router()
    this.initializeRoutes()
  }

  public get getRouter(): Router {
    return this.router
  }

  private initializeRoutes(): void {
    this.router.use(
      "/login",
      requiredValueMiddleware("body", "email"),
      requiredValueMiddleware("body", "password"),
      asyncHandlerMiddleware(this.login)
    )

    this.router.use(
      "/register",
      asyncHandlerMiddleware(this.register)
    )
  }

  private async login(req:Request, res:Response): Promise<void> {
    if (req.method === "POST") {
      req.badRequestErrorHandlers = {
        type:"render",
        options:{
          name:"login",
          layout:"authentication",
        }
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
      req.badRequestErrorHandlers = {
        type:"render",
        options:{
          name:"login",
          layout:"authentication",
        }
      }
      
      req.convertInvalidErrorToBadRequestError = {
        badRequestErrorPath: "body"
      }

      try {
        const user = new userModel({
          email:req.body.email,
          password:req.body.password,
          username:req.body.username
        })
  
        user.save()
        req.session.user = user.createSession()
        res.redirect("/")
      } catch(error) {
        const badRequestError = new BadRequestError(req, {})
        badRequestError.addValidationError(error)
        throw badRequestError
      }
    
      return
    }

    res.render("register", { layout:"authentication" })
  }
}

export default new LocalAuthenticationController()