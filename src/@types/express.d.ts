declare namespace Express {
  export interface Request {
    validationErrors?:{[key:string]: any};
    pageToRenderOnError?:string;
    convertInvalidErrorToBadRequestError: {
      badRequestErrorPath?:"body"|"header"|"cookie"|"query"|"params";
    };
  }
}