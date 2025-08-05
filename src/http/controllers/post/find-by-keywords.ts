import { PostRepository } from '@/repositories/post.repository';
import { FindByKeywordsUseCase } from '@/use-cases/post/find-post-by-keywords';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function findByKeywords(request: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    keywords: z.string().min(1).max(100),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  });

  const { keywords, page = 1, limit = 10 } = querySchema.parse(request.query);
  try {
    const postRepository = new PostRepository();
    const findByKeywordsUseCase = new FindByKeywordsUseCase(postRepository);

    const posts = await findByKeywordsUseCase.handler(keywords, page, limit);
    if (!posts) {
      return reply.status(404).send({ error: 'No posts found' });
    }
    return reply.status(200).send(posts);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while fetching the posts' });
  }
}
