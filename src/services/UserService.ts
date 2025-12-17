import { IUserRepository } from '../repositories/UserRepository';
import { ILoginService, LoginService } from './LoginService';

export interface IUserService {
  register(name: string, email: string, password: string): Promise<void>;
  login(email: string, password: string): Promise<string | boolean>;
}

export class UserService implements IUserService {
  private repository: IUserRepository;
  private loginService: ILoginService;

  constructor(repository: IUserRepository, loginService?: ILoginService) {
    this.repository = repository;
    this.loginService = loginService ?? new LoginService();
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const hash = await this.loginService.createHash(password);
    await this.repository.create(name, email, hash);
  }

  async login(email: string, password: string): Promise<string | boolean> {
    let matches = false;
    const user = await this.repository.findCredentials(email);
    if (user) {
      const { name, password: hash, _id } = user;
      matches = await this.loginService.passwordMatchesHash(password, hash);
      if (!matches) return false;
      const token = this.loginService.signToken(name);
      await this.repository.update(_id, { accessToken: token });
    }
    return false;
  }
}
