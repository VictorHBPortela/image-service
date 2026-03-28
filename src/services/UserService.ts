import mongoose from 'mongoose';
import config from '../config/config';
import { IUser } from '../dto/IUser';
import { BadRequestError, InternalError, UnauthorizedError } from '../errors/MainErrors';
import { IUserRepository } from '../repositories/user/UserRepository';
import { ILoginService, LoginService } from './LoginService';
import jwt from 'jsonwebtoken';
export interface IUserService {
  register(name: string, email: string, password: string): Promise<IUser>;
  login(email: string, password: string): Promise<IUser | null>;
  refresh(refreshToken: string): Promise<{ accessToken: string }>;
}

export class UserService implements IUserService {
  private repository: IUserRepository;
  private loginService: ILoginService;

  constructor(repository: IUserRepository, loginService?: ILoginService) {
    this.repository = repository;
    this.loginService = loginService ?? new LoginService();
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<IUser> {
    const _id = new mongoose.Types.ObjectId().toString()
    const hash = await this.loginService.createHash(password);
    const accessToken = this.loginService.signToken(_id, name, email);
    const refreshToken = this.loginService.signRefreshToken(_id, name, email);
    return await this.repository.create(_id, name, email, hash, accessToken, refreshToken);
  }

  async login(email: string, password: string): Promise<IUser | null> {
    let matches = false;
    const user = await this.repository.findCredentials(email);
    if (!user) throw new BadRequestError('User not found, check your credentials and try again.');
    
    matches = await this.loginService.passwordMatchesHash(password, user.password);
    if (!matches) throw new UnauthorizedError('Invalid password')
    
    const accessToken = this.loginService.signToken(user._id, user.name, user.email)
    const refreshToken = this.loginService.signRefreshToken(user._id, user.name, user.email)
    await this.repository.update(user._id, { accessToken, refreshToken })

    return user;
  }

async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const secret = config.refreshToken;
    if (!secret) throw new InternalError('Missing refresh token secret');

    try {
        jwt.verify(refreshToken, secret);
    } catch {
        throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.repository.findByRefreshToken(refreshToken);
    const accessToken = this.loginService.signToken(user._id, user.name, user.email);
    await this.repository.update(user._id, { accessToken });
    return { accessToken };
}
}
