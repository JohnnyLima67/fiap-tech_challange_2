import { RoleRepository } from '../../repositories/role.repository';
import { Role } from '../../entities/role.entity';

export class DeleteRoleUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async handler(roleId: string): Promise<void> {
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new Error('Role not found');
    }
    await this.roleRepository.delete(roleId);
  }
}
