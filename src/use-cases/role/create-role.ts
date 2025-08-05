import { RoleRepository } from '../../repositories/role.repository';
import { Role } from '../../entities/role.entity';

export class CreateRoleUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async handler(role: Role): Promise<Role> {
    const createdRole = await this.roleRepository.create(role);
    if (!createdRole) {
      throw new Error('Failed to create role');
    }
    return createdRole;
  }
}
