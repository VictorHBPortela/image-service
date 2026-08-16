import { rateLimit } from 'express-rate-limit';
import config from '../config/config';

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: config.requestLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

export const transformLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: config.requestLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anonymous',
});
