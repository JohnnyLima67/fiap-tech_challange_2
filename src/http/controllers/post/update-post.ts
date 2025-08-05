import { PostRepository } from '@/repositories/post.repository';
import { UpdatePostUseCase } from '@/use-cases/post/update-post';
import { FindByIdUseCase } from '@/use-cases/post/find-post-by-id';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function updateById(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid('Invalid post ID format'),
  });

  const { id } = paramsSchema.parse(request.params);

  const bodySchema = z.object({
    post_title: z.string().min(1).max(100),
    post_content: z.string().min(1).max(1000),
    post_description: z.string().min(1).max(500),
    author: z.string().min(1, 'Author is required'),
  });

  const { post_title, post_content, post_description, author } = bodySchema.parse(request.body);
  try {
    const postRepository = new PostRepository();
    const findByIdUseCase = new FindByIdUseCase(postRepository);
    const existingPost = await findByIdUseCase.handler(id);

    if (!existingPost) {
      return reply.status(404).send({ error: 'Post not found' });
    }
    const updatePostUseCase = new UpdatePostUseCase(postRepository);

    const updatedPost = await updatePostUseCase.handler({
      post_id: id,
      post_title,
      post_content,
      post_description,
      author,
      created_at: existingPost.created_at,
    });

    return reply.status(200).send(updatedPost);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while updating the post' });
  }
}
