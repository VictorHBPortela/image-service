import { IUser } from '../dto/IUser';
import { BadRequestError, UnauthorizedError } from '../errors/MainErrors';
import { IUserRepository } from '../repositories/user/UserRepository';
import { ILoginService, LoginService } from './LoginService';

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
    const hash = await this.loginService.createHash(password);
    const accessToken = this.loginService.signToken(name, email);
    const refreshToken = this.loginService.signRefreshToken(name, email);
    return await this.repository.create(name, email, hash, accessToken, refreshToken);
  }

  async login(email: string, password: string): Promise<IUser | null> {
    let matches = false;
    const user = await this.repository.findCredentials(email);
    if (!user) throw new BadRequestError('User not found, check your credentials and try again.');
    
    matches = await this.loginService.passwordMatchesHash(password, user.password);
    if (!matches) throw new UnauthorizedError('Invalid password')
    
    const accessToken = this.loginService.signToken(user.name, user.email)
    const refreshToken = this.loginService.signRefreshToken(user.name, user.email)
    await this.repository.update(user._id, { accessToken, refreshToken })

    return user;
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    if (this.loginService.isTokenExpired(refreshToken)) {
      throw new Error("This token is expired.")
    }
    const user = await this.repository.findByRefreshToken(refreshToken);
    const accessToken = this.loginService.signToken(user.name, user.email)
    await this.repository.update(user._id, { accessToken })
    return { accessToken }

  }
}
