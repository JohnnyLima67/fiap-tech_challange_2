import { PostRepository } from '@/repositories/post.repository';
import { CreatePostUseCase } from '@/use-cases/post/create-post';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    post_title: z.string().min(1, 'Post title is required'),
    post_description: z.string().optional(),
    post_content: z.string().min(1, 'Post content is required'),
    author: z.string().min(1, 'Author is required'),
  });

  const { post_title, post_description, post_content, author } = registerBodySchema.parse(
    request.body
  );
  try {
    const postRepository = new PostRepository();
    const createPostUseCase = new CreatePostUseCase(postRepository);

    await createPostUseCase.handler({
      post_title,
      post_description,
      post_content,
      post_id: '',
      author,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return reply.status(201).send({ message: 'Post created successfully' });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while creating the post' });
  }
}
