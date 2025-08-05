import { PostRepository } from '@/repositories/post.repository';
import { FindByIdUseCase } from '@/use-cases/post/find-post-by-id';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function findById(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid('Invalid post ID format'),
  });

  const { id } = paramsSchema.parse(request.params);
  try {
    const postRepository = new PostRepository();
    const findByIdUseCase = new FindByIdUseCase(postRepository);

    const post = await findByIdUseCase.handler(id);
    if (!post) {
      return reply.status(404).send({ error: 'Post not found' });
    }
    return reply.status(200).send(post);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while fetching the post' });
  }
}
