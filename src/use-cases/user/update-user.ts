import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../entities/user.entity';

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async handler(user: User): Promise<User> {
    const updatedUser = await this.userRepository.update(user);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }
    return updatedUser;
  }
}
