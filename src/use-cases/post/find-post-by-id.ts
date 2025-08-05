import { PostRepository } from '@/repositories/post.repository';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Post } from '@/entities/post.entity';

export class FindByIdUseCase {
  constructor(private postRepository: PostRepository) {}

  async handler(postId: string): Promise<Post | undefined> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }
}
