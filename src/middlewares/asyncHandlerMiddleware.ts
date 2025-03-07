import { Request, Response, NextFunction, Handler } from "express"

export default function asyncHandlerMiddleware(handler:Handler) {
  return (req:Request, res:Response, next:NextFunction) => {
    return Promise.resolve(handler(req, res, next)).catch((reason) => {next(reason)})
  }
}