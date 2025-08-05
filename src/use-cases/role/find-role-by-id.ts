import { RoleRepository } from '@/repositories/role.repository';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Role } from '@/entities/role.entity';

export class FindByIdUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async handler(roleId: string): Promise<Role | undefined> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }
}
