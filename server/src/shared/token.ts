import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { UnauthorizedError } from './errors.js';

const { JsonWebTokenError, TokenExpiredError } = jwt;


interface SignInput {
  sub:  string;
  role: 'admin' | 'recruiter' | 'applicant';
}


export interface TokenPayload {
  sub:  string;
  role: 'admin' | 'recruiter' | 'applicant';
  iat:  number;
  exp:  number;
}

export function signAccessToken(payload: SignInput): string {
  
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    
    return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    if (err instanceof JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw err;
  }
}