import { PostRepository } from '@/repositories/post.repository';
import { UpdatePostUseCase } from '@/use-cases/post/update-post';
import { FindByIdUseCase } from '@/use-cases/post/find-post-by-id';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function deletePost(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid('Invalid post ID format'),
  });

  const { id } = paramsSchema.parse(request.params);

  try {
    const postRepository = new PostRepository();
    const findByIdUseCase = new FindByIdUseCase(postRepository);
    const existingPost = await findByIdUseCase.handler(id);

    if (!existingPost) {
      return reply.status(404).send({ error: 'Post not found' });
    }

    await postRepository.delete(id);
    return reply.status(204).send();
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while deleting the post' });
  }
}
