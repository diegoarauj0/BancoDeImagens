import { NextFunction, Request, Response } from "express"

export default function HandlerBadRequestErrorMiddleware(badRequestError:any, req:Request, res:Response, next:NextFunction): void {
  if (badRequestError.name !== "BadRequestError") {
    next(badRequestError)
    return
  }

  if (req.pageToRenderOnError) {
    res.status(400).render(req.pageToRenderOnError, badRequestError.renderJSON)
    return
  }

  res.status(400).json(badRequestError.renderJSON)
}