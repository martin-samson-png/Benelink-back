import { JwtPayload } from "jsonwebtoken";
import { JwtUserPayload } from "./auth";

declare global {
  namespace Express {
    export interface Request {
      user?: JwtUserPayload;
    }
  }
}
