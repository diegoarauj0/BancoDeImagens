import { NextFunction, Request, Response } from "express"

export default function badRequestErrorHandlerMiddleware(badRequestError:any, req:Request, res:Response, next:NextFunction): void {
  if (badRequestError.name !== "BadRequestError") {
    next(badRequestError)
    return
  }

  if (req.badRequestErrorHandlers.type === "redirect" && req.badRequestErrorHandlers.options?.redirect !== undefined) {
    res.redirect(req.badRequestErrorHandlers.options.redirect)
    return
  }

  if (req.badRequestErrorHandlers.type === "render" && req.badRequestErrorHandlers.options?.name !== undefined) {
    res.render(req.badRequestErrorHandlers.options.name, {
      layout: req.badRequestErrorHandlers.options.layout,
      error: badRequestError
    })
    return
  }

  if (req.badRequestErrorHandlers.type === "json") {
    res.status(400).json(badRequestError)
    return
  }

  next(badRequestError)
}