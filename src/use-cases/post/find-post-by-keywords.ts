import { PostRepository } from '@/repositories/post.repository';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Post } from '@/entities/post.entity';

export class FindByKeywordsUseCase {
  constructor(private postRepository: PostRepository) {}

  async handler(keywords: string, page: number, limit: number): Promise<Post[] | undefined> {
    const posts = await this.postRepository.findByKeywords(keywords, page, limit);
    if (!posts) {
      throw new Error('No posts found');
    }
    return posts;
  }
}
