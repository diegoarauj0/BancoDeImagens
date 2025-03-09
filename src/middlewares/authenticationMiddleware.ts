import { Request, Response, NextFunction } from "express"
import asyncHandlerMiddleware from "./asyncHandlerMiddleware"
import UnauthorizedError from "../error/unauthorizedError"
import { userModel } from "../models/userModel"

export default function authenticationMiddleware(findUser:boolean = false): ((req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return asyncHandlerMiddleware(async (req:Request, res:Response, next:NextFunction) => {
    if (req.session.user === undefined) { throw new UnauthorizedError() }

    if (findUser) {
      const user = await userModel.findById(req.session.user._id)
      if (user === null) { throw new UnauthorizedError() }
      req.userModel = user
    }

    next()
  })
}
