import { Request, Response, NextFunction } from "express"

export default function notFoundErrorHandlerMiddleware(req:Request, res:Response, next:NextFunction): void {
  res.status(404).render("notFound")
} 