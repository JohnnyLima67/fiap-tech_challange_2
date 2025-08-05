import { database } from '@/lib/´pg/db';
import { Post } from '../entities/post.entity';

export class PostRepository {
  async create({
    post_title,
    post_content,
    post_description,
    author,
  }: Post): Promise<Post | undefined> {
    // Simulate a database insert operation
    const post = await database.clientInstance?.query(
      'INSERT INTO "post" (post_title, post_content, post_description, created_at, updated_at, author) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [post_title, post_content, post_description, new Date(), new Date(), author]
    );
    return post?.rows[0];
  }

  async findById(postId: string): Promise<Post | undefined> {
    // Simulate a database select operation
    const post = await database.clientInstance?.query('SELECT * FROM "post" WHERE post_id = $1', [
      postId,
    ]);
    return post?.rows[0];
  }

  async findByKeywords(keywords: string, page: number, limit: number): Promise<Post[] | undefined> {
    const offset = (page - 1) * limit;
    // Simulate a database select operation with keywords
    const posts = await database.clientInstance?.query(
      'SELECT * FROM "post" WHERE post_title ILIKE $1 OR post_content ILIKE $1 OR post_description ILIKE $1 LIMIT $2 OFFSET $3',
      [`%${keywords}%`, limit, offset]
    );
    return posts?.rows || [];
  }

  async findAll(page: number, limit: number): Promise<Post[] | undefined> {
    const offset = (page - 1) * limit;
    // Simulate a database select operation for all posts
    const posts = await database.clientInstance?.query('SELECT * FROM "post" LIMIT $1 OFFSET $2', [
      limit,
      offset,
    ]);
    return posts?.rows || [];
  }

  async update({
    post_id,
    post_title,
    post_content,
    post_description,
    author,
  }: Post): Promise<Post | undefined> {
    // Simulate a database update operation
    const post = await database.clientInstance?.query(
      'UPDATE "post" SET post_title = $1, post_content = $2, post_description = $3, updated_at = $4, author = $5 WHERE post_id = $6 RETURNING *',
      [post_title, post_content, post_description, new Date(), author, post_id]
    );
    return post?.rows[0];
  }

  async delete(postId: string): Promise<void | undefined> {
    // Simulate a database delete operation
    await database.clientInstance?.query('DELETE FROM "post" WHERE post_id = $1', [postId]);
  }
}
