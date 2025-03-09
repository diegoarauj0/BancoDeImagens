declare namespace Express {
  export interface Request {
    userModel?: import("../models/userModel").IUser;
    validationErrors?:{[key:string]: any};
    badRequestErrorHandlers: {
      type:"render" | "json" | "redirect";
      options?:{
        name?:string;
        layout?:string;
        redirect?:string
      }
    }
    requiredValueError:{body:import("../error/badRequestError").ErrorDetails[], params:import("../error/badRequestError").ErrorDetails[], query:import("../error/badRequestError").ErrorDetails[]};
    convertInvalidErrorToBadRequestError: {
      badRequestErrorPath?:"body"|"header"|"cookie"|"query"|"params";
    };
  }
}