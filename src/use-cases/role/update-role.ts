import { RoleRepository } from '../../repositories/role.repository';
import { Role } from '../../entities/role.entity';

export class UpdateRoleUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async handler(role: Role): Promise<Role> {
    const updatedRole = await this.roleRepository.update(role);
    if (!updatedRole) {
      throw new Error('Failed to update role');
    }
    return updatedRole;
  }
}
