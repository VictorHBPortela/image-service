import { Request, Response, NextFunction } from "express";
import { LoginService } from "../services/LoginService";
import { UnauthorizedError } from "../errors/MainErrors";

const loginService = new LoginService()

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('Token missing'));
    }

    if (loginService.isTokenExpired(token)) {
        return next(new UnauthorizedError('Token expired'));
    }

    return next();
}