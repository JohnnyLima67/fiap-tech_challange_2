import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../entities/user.entity';

export class SignInUseCase {
  constructor(private userRepository: UserRepository) {}

  async handler(username: string): Promise<User> {
    const foundUser = await this.userRepository.findByUsername(username);
    if (!foundUser) {
      throw new Error('User not found');
    }
    return foundUser;
  }
}
