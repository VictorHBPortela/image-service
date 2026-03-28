import { Request, Response, NextFunction } from "express";
import { InternalError, UnauthorizedError } from "../errors/MainErrors";
import jwt from 'jsonwebtoken'
import config from "../config/config";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    const secret = config.accessToken;

    if (!secret) return next(new InternalError('Missing access token secret'));
    if (!token) return next(new UnauthorizedError('Token missing'));

    try {
        const payload = jwt.verify(token, secret) as { id: string; name: string; email: string };
        req.user = payload;
        return next();
    } catch (error) {
        return next(new UnauthorizedError('Invalid or expired token'));
    }
};