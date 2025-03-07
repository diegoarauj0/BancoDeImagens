import { Request } from "express"

export interface ErrorDetails {
  message: string;
  type: string;
  path: string;
  value: string;
}

export class BadRequestError extends Error {
  public readonly body:ErrorDetails[]
  public readonly header:ErrorDetails[]
  public readonly cookie:ErrorDetails[]
  public readonly query:ErrorDetails[]
  public readonly params:ErrorDetails[]
  public readonly request:Request

  constructor(request:Request, errors:{  body?:ErrorDetails[], header?:ErrorDetails[], cookie?:ErrorDetails[], query?:ErrorDetails[], params?:ErrorDetails[] }) {
    super()

    this.name = "BadRequestError"
    this.message = "Bad Request Error"

    this.request = request
    this.body = errors.body || []
    this.header = errors.header || []
    this.cookie = errors.cookie || []
    this.query = errors.query || []
    this.params = errors.params || []

    Object.setPrototypeOf(this, BadRequestError.prototype)
  }

  public get renderJSON(): { errors:{  body:{[key:string]:ErrorDetails}, header:{[key:string]:ErrorDetails}, cookie:{[key:string]:ErrorDetails}, query:{[key:string]:ErrorDetails}, params:{[key:string]:ErrorDetails} } } {
    return this.convertArrayToObject
  }

  public get JSON(): { status:number, errors:{  body:ErrorDetails[], header:ErrorDetails[], cookie:ErrorDetails[], query:ErrorDetails[], params:ErrorDetails[] } } {
    return {
      status:400,
      errors: {
        body:this.body,
        header:this.header,
        cookie:this.cookie,
        query:this.query,
        params:this.params
      }
    }
  }

  public get convertArrayToObject(): { errors:{  body:{[key:string]:ErrorDetails}, header:{[key:string]:ErrorDetails}, cookie:{[key:string]:ErrorDetails}, query:{[key:string]:ErrorDetails}, params:{[key:string]:ErrorDetails} } } {

    const body:{[key:string]:ErrorDetails} = {}
    this.body.forEach((error) => {body[error.path] = error})

    const header:{[key:string]:ErrorDetails} = {}
    this.header.forEach((error) => {header[error.path] = error})

    const cookie:{[key:string]:ErrorDetails} = {}
    this.cookie.forEach((error) => {cookie[error.path] = error})

    const query:{[key:string]:ErrorDetails} = {}
    this.query.forEach((error) => {query[error.path] = error})

    const params:{[key:string]:ErrorDetails} = {}
    this.params.forEach((error) => {params[error.path] = error})

    return {
      errors: {
        body:body,
        header:header,
        cookie:cookie,
        query:query,
        params:params
      }
    }
  }
}