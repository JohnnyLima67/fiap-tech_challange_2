import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../entities/user.entity';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async handler(user: User): Promise<User> {
    const createdUser = await this.userRepository.create(user);
    if (!createdUser) {
      throw new Error('Failed to create user');
    }
    return createdUser;
  }
}
