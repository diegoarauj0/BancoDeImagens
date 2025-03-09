import { Request, Response, NextFunction } from "express"

export default function unauthorizedErrorHandlerMiddleware(unauthorizedError:any, req:Request, res:Response, next:NextFunction): void {
  if (unauthorizedError.name === "UnauthorizedError") {
    res.redirect("/login")
    return
  }

  next(unauthorizedError)
} 