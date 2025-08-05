import { PostRepository } from '@/repositories/post.repository';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Post } from '@/entities/post.entity';

export class FindAllUseCase {
  constructor(private postRepository: PostRepository) {}

  async handler(page: number, limit: number): Promise<Post[]> {
    const posts = await this.postRepository.findAll(page, limit);
    if (!posts) {
      throw new Error('No posts found');
    }
    return posts;
  }
}
