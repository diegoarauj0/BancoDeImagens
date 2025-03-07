import { Router, Request, Response } from "express"
import convertInvalidErrorToBadRequestErrorMiddleware from "../middlewares/convertInvalidErrorToBadRequestErrorMiddleware"
import { userModel } from "../models/userModel"
import HandlerBadRequestErrorMiddleware from "../middlewares/handlerBadRequestErrorMiddleware"
import asyncHandlerMiddleware from "../middlewares/asyncHandlerMiddleware"
import { BadRequestError, ErrorDetails } from "../error/badRequestError"

export default class AuthenticationController {

  public get router(): Router {
    const router = Router()

    router.use("/login", asyncHandlerMiddleware(this.login), convertInvalidErrorToBadRequestErrorMiddleware, HandlerBadRequestErrorMiddleware)
    router.use("/register", asyncHandlerMiddleware(this.register), convertInvalidErrorToBadRequestErrorMiddleware, HandlerBadRequestErrorMiddleware)

    return router
  }

  private async login(req:Request, res:Response): Promise<void> {
    if (req.method === "POST") {
      req.pageToRenderOnError = "login"
      req.convertInvalidErrorToBadRequestError = {
        badRequestErrorPath: "body"
      }

      const body = {
        email:req.body.email,
        password:req.body.password,
      }

      const bodyErrorDetails: ErrorDetails[] = [] 

      if (body.email === undefined) {
        bodyErrorDetails.push({
          message:"Path `email` is required",
          type:"required",
          path:"email",
          value:body.email
        })
      }

      if (body.password === undefined) {
        bodyErrorDetails.push({
          message:"Path `password` is required",
          type:"required",
          path:"password",
          value:body.password
        })
      }

      if (bodyErrorDetails.length > 0) {
        throw new BadRequestError(req, {
          body:bodyErrorDetails
        })
      }

      const user = await userModel.findOne({ email:body.email }).select("+password")

      if (user === null) {
        throw new BadRequestError(req, {
          body:[{
            message:"Path `email` does not exist",
            type:"notFound",
            path:"email",
            value:body.email
          }]
        })
      }

      if (await user.comparePassword(body.password) === false) {
        throw new BadRequestError(req, {
          body:[{
            message:"Path `password` is different",
            type:"different",
            path:"password",
            value:body.password
          }]
        })
      }
      
      req.session.user = {
        _id:user._id.toString()
      }

      res.redirect("/")
      return
    }

    res.render("login")
  }

  private async register(req:Request, res:Response): Promise<void> {
    if (req.method === "POST") {
      req.pageToRenderOnError = "register"
      req.convertInvalidErrorToBadRequestError = {
        badRequestErrorPath: "body"
      }

      const body = {
        email:req.body.email,
        password:req.body.password,
        username:req.body.username
      }

      const user = new userModel(body)

      await user.save()
      
      req.session.user = {
        _id:user._id.toString()
      }

      res.redirect("/")
      return
    }

    res.render("register")
  }
}