import { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends DefaultJwtPayload {
  id: string;
  email: string;
}
