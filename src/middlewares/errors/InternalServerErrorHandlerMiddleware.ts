import { Request, Response, NextFunction } from "express"

export default function InternalServerErrorHandlerMiddleware(error:any, req: Request, res: Response, next: NextFunction): void {
  console.error(error.stack || error)
  res.status(500).render("internalServerError")
}