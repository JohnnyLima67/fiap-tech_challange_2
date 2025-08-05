import { database } from '@/lib/´pg/db';
import { Role } from '../entities/role.entity';

export class RoleRepository {
  async create({ role_name, description }: Role): Promise<Role | undefined> {
    const role = await database.clientInstance?.query(
      'INSERT INTO "role" (role_name, description) VALUES ($1, $2) RETURNING *',
      [role_name, description]
    );
    return role?.rows[0];
  }

  async findById(roleId: string): Promise<Role | undefined> {
    const role = await database.clientInstance?.query('SELECT * FROM "role" WHERE role_id = $1', [
      roleId,
    ]);
    return role?.rows[0];
  }
  async update({ role_id, role_name, description }: Role): Promise<Role | undefined> {
    const role = await database.clientInstance?.query(
      'UPDATE "role" SET role_name = $1, description = $2 WHERE role_id = $3 RETURNING *',
      [role_name, description, role_id]
    );
    return role?.rows[0];
  }

  async delete(roleId: string): Promise<void | undefined> {
    await database.clientInstance?.query('DELETE FROM "role" WHERE role_id = $1', [roleId]);
  }
}
