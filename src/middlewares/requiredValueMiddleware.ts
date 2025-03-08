import { NextFunction, Request, Response } from "express"

export default function requiredValueMiddleware(path:"body" | "query" | "params", name:string): (req:Request, res:Response, next:NextFunction) => void {
  return (req:Request, res:Response, next:NextFunction): void => {
    if (req.requiredValueError === undefined) { req.requiredValueError = { body:[], query:[], params:[] }}
    if (req.requiredValueError[path] === undefined) { req.requiredValueError[path] = [] }

    if (req[path][name] === undefined) {
      req.requiredValueError[path].push({
        message:`Path '${name}' is required`,
        type:"required",
        path:name,
        value:""
      })
    }
    next()
  }
}