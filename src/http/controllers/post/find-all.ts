import { PostRepository } from '@/repositories/post.repository';
import { FindAllUseCase } from '@/use-cases/post/find-all-posts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  try {
    const postRepository = new PostRepository();
    const findAllUseCase = new FindAllUseCase(postRepository);

    const querySchema = z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
    });
    const { page = 1, limit = 10 } = querySchema.parse(request.query);

    const posts = await findAllUseCase.handler(page, limit);
    if (!posts) {
      return reply.status(404).send({ error: 'No posts found' });
    }
    return reply.status(200).send(posts);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while fetching the posts' });
  }
}
