import { UserRepository } from '@/repositories/user.repository';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { User } from '@/entities/user.entity';

export class FindByUsernameUseCase {
  constructor(private userRepository: UserRepository) {}

  async handler(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('No users found');
    }
    return user;
  }
}
