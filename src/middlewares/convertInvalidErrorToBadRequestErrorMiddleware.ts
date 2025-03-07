import { Request, Response, NextFunction } from "express"
import { BadRequestError, ErrorDetails } from "../error/badRequestError"

export default function convertInvalidErrorToBadRequestErrorMiddleware(validationError:any, req:Request, res:Response, next:NextFunction): void {
  if (validationError.name !== "ValidationError") {
    next(validationError)
    return
  }

  const badRequestError:ErrorDetails[] = []

  Object.keys(validationError.errors).forEach((name) => {
    const error = validationError.errors[name]

    const errorDetails = {
      message:error.properties.message,
      type:error.properties.type,
      path:error.properties.path,
      value:error.properties.value
    }

    errorDetails.message = errorDetails.message.replace(/[`´]/g, "'")

    if (errorDetails.type.indexOf("--") !== -1) {
      const params = errorDetails.type.substring(errorDetails.type.indexOf("--") + 2)

      errorDetails.type = errorDetails.type.substring(0, errorDetails.type.indexOf("--"))
      errorDetails.message = Function(`const params = ${params};`+"return `"+errorDetails.message+"`")()
    }

    badRequestError.push(errorDetails)
  })

  next(new BadRequestError(req, {
    body:req.convertInvalidErrorToBadRequestError.badRequestErrorPath === "body" ? badRequestError : [],
    header:req.convertInvalidErrorToBadRequestError.badRequestErrorPath === "header" ? badRequestError : [],
    cookie:req.convertInvalidErrorToBadRequestError.badRequestErrorPath === "cookie" ? badRequestError : [],
    query:req.convertInvalidErrorToBadRequestError.badRequestErrorPath === "query" ? badRequestError : [],
    params:req.convertInvalidErrorToBadRequestError.badRequestErrorPath === "params" ? badRequestError : []
  }))
}