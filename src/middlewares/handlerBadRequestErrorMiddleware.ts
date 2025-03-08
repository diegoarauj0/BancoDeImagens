import { NextFunction, Request, Response } from "express"

export default function handlerBadRequestErrorMiddleware(badRequestError:any, req:Request, res:Response, next:NextFunction): void {
  if (badRequestError.name !== "BadRequestError") {
    next(badRequestError)
    return
  }

  if (req.pageToRenderOnError) {
    console.log(badRequestError.renderJSON)
    res.status(400).render(req.pageToRenderOnError.name, { ...badRequestError.renderJSON, layout:req.pageToRenderOnError.layout })
    return
  }

  res.status(400).json(badRequestError.renderJSON)
}