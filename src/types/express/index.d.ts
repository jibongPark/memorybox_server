import { JWTPayload } from "../../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      files?: Express.Multer.File[];
    }
  }
}

declare global {
  namespace Express {
    interface Response {
      /**
       * Send a uniform JSON response
       * @param success - operation success flag
       * @param status - status code
       * @param message - descriptive message
       * @param data - optional payload
       */
      sendResponse(success: boolean, status: number, message?: any, data?: any): this;
      /**
       * Alias for sendResponse(true, ...), supports chaining after res.status()
       * @param status - status code
       * @param message - descriptive message
       * @param data - optional payload
       */
      ok(status: number, message?: any, data?: any): this;
      /**
       * Alias for sendResponse(false, ...), supports chaining after res.status()
       * @param status - status code
       * @param message - descriptive error message
       * @param data - optional payload
       */
      error(status: number, message?: any, data?: any): this;
    }
  }
}