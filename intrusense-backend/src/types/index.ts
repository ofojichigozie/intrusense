import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload extends JwtPayload {
  sub: string;
  role: string;
}

export interface AuthRequest extends Request {
  admin?: AuthPayload;
}
