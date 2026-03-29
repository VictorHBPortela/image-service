import { rateLimit } from 'express-rate-limit';
import config from '../config/config';

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: config.requestLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});