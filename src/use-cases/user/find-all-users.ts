import { UserRepository } from '@/repositories/user.repository';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { User } from '@/entities/user.entity';

export class FindAllUseCase {
  constructor(private userRepository: UserRepository) {}

  async handler(page: number, limit: number): Promise<User[]> {
    const users = await this.userRepository.findAll(page, limit);
    if (!users) {
      throw new Error('No users found');
    }
    return users;
  }
}
