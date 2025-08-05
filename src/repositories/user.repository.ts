import { database } from '@/lib/´pg/db';
import { User } from '../entities/user.entity';

export class UserRepository {
  async create({ username, password, full_name, role_id }: User): Promise<User | undefined> {
    const user = await database.clientInstance?.query(
      'INSERT INTO "app_user" (username, password, full_name, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, password, full_name, role_id]
    );
    return user?.rows[0];
  }

  async findById(userId: string): Promise<User | undefined> {
    const user = await database.clientInstance?.query(
      'SELECT * FROM "app_user" WHERE user_id = $1',
      [userId]
    );
    return user?.rows[0];
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await database.clientInstance?.query(
      'SELECT * FROM "app_user" WHERE username ILIKE $1',
      [username]
    );
    return user?.rows[0];
  }

  async findAll(page: number, limit: number): Promise<User[] | undefined> {
    const offset = (page - 1) * limit;
    const users = await database.clientInstance?.query(
      'SELECT * FROM "app_user" LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return users?.rows || [];
  }

  async update({
    user_id,
    username,
    password,
    full_name,
    role_id,
  }: User): Promise<User | undefined> {
    const user = await database.clientInstance?.query(
      'UPDATE "app_user" SET username = $1, password = $2, full_name = $3, role_id = $4 WHERE user_id = $5 RETURNING *',
      [username, password, full_name, role_id, user_id]
    );
    return user?.rows[0];
  }

  async delete(userId: string): Promise<void | undefined> {
    await database.clientInstance?.query('DELETE FROM "app_user" WHERE user_id = $1', [userId]);
  }
}
