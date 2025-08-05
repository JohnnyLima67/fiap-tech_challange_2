import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../entities/user.entity';

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async handler(userId: string): Promise<void> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    await this.userRepository.delete(userId);
  }
}
