import { UserRepository } from '@/repositories/user.repository';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { User } from '@/entities/user.entity';

export class FindByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async handler(userId: string): Promise<User | undefined> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
