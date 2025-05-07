import { JWTPayload } from "../../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}