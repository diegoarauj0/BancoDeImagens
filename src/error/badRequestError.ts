import { Request } from "express"

export interface ErrorDetails {
  message: string;
  type: string;
  path: string;
  value: string;
}

export class BadRequestError extends Error {
  public body:ErrorDetails[]
  public header:ErrorDetails[]
  public cookie:ErrorDetails[]
  public query:ErrorDetails[]
  public param:ErrorDetails[]
  public readonly request:Request

  constructor(request:Request, errors:{  body?:ErrorDetails[], header?:ErrorDetails[], cookie?:ErrorDetails[], query?:ErrorDetails[], param?:ErrorDetails[] }) {
    super()

    this.name = "BadRequestError"
    this.message = "Bad Request Error"

    this.request = request
    this.body = errors.body || []
    this.header = errors.header || []
    this.cookie = errors.cookie || []
    this.query = errors.query || []
    this.param = errors.param || []

    Object.setPrototypeOf(this, BadRequestError.prototype)
  }

  public addValidationError(validationError:any, path:"body" | "header" | "param" | "cookie" | "query" = "body"): void {
    if (validationError.name !== "ValidationError") {
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
        const param = errorDetails.type.substring(errorDetails.type.indexOf("--") + 2)
  
        errorDetails.type = errorDetails.type.substring(0, errorDetails.type.indexOf("--"))
        errorDetails.message = Function(`const param = ${param};`+"return `"+errorDetails.message+"`")()
      }
  
      badRequestError.push(errorDetails)
    })
  
    this[path] = [ ...(this[path] as any), badRequestError ]
  }

  public get renderJSON(): { errors:{  body:{[key:string]:ErrorDetails}, header:{[key:string]:ErrorDetails}, cookie:{[key:string]:ErrorDetails}, query:{[key:string]:ErrorDetails}, param:{[key:string]:ErrorDetails} } } {
    return this.convertArrayToObject
  }

  public get JSON(): { status:number, errors:{  body:ErrorDetails[], header:ErrorDetails[], cookie:ErrorDetails[], query:ErrorDetails[], param:ErrorDetails[] } } {
    return {
      status:400,
      errors: {
        body:this.body,
        header:this.header,
        cookie:this.cookie,
        query:this.query,
        param:this.param
      }
    }
  }

  public get convertArrayToObject(): { errors:{  body:{[key:string]:ErrorDetails}, header:{[key:string]:ErrorDetails}, cookie:{[key:string]:ErrorDetails}, query:{[key:string]:ErrorDetails}, param:{[key:string]:ErrorDetails} } } {

    const body:{[key:string]:ErrorDetails} = {}
    this.body.forEach((error) => {body[error.path] = error})

    const header:{[key:string]:ErrorDetails} = {}
    this.header.forEach((error) => {header[error.path] = error})

    const cookie:{[key:string]:ErrorDetails} = {}
    this.cookie.forEach((error) => {cookie[error.path] = error})

    const query:{[key:string]:ErrorDetails} = {}
    this.query.forEach((error) => {query[error.path] = error})

    const param:{[key:string]:ErrorDetails} = {}
    this.param.forEach((error) => {param[error.path] = error})

    return {
      errors: {
        body:body,
        header:header,
        cookie:cookie,
        query:query,
        param:param
      }
    }
  }
}