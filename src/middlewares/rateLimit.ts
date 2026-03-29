import { rateLimit } from 'express-rate-limit';
import config from '../config/config';
import { IUser } from '../dto/IUser';
import { Request, Response } from 'express'

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: config.requestLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

export const transformLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anonymous',
});