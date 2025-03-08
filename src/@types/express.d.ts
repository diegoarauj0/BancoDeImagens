declare namespace Express {
  export interface Request {
    validationErrors?:{[key:string]: any};
    pageToRenderOnError:{
      name:string;
      layout?:string;
    };
    requiredValueError:{body:{}[], params:{}[], query:{}[]};
    convertInvalidErrorToBadRequestError: {
      badRequestErrorPath?:"body"|"header"|"cookie"|"query"|"params";
    };
  }
}