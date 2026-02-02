import { IUser } from '../dto/IUser';
import { UnauthorizedError } from '../errors/MainErrors';
import { IUserRepository } from '../repositories/UserRepository';
import { ILoginService, LoginService } from './LoginService';

export interface IUserService {
  register(name: string, email: string, password: string): Promise<IUser>;
  login(email: string, password: string): Promise<IUser | null>;
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
    const accessToken = this.loginService.signToken(name);
    return await this.repository.create(name, email, hash, accessToken);
  }

  async login(email: string, password: string): Promise<IUser | null> {
    let matches = false;
    const user = await this.repository.findCredentials(email);
    if (user) {
      const { password: hash } = user;
      matches = await this.loginService.passwordMatchesHash(password, hash);
      if (!matches) throw new UnauthorizedError('Invalid password');
      return user;
    }
    return user;
  }
}
