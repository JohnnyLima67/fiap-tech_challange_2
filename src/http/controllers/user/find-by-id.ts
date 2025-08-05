import { UserRepository } from '@/repositories/user.repository';
import { FindByIdUseCase } from '@/use-cases/user/find-user-by-id';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function findById(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid('Invalid user ID format'),
  });

  const { id } = paramsSchema.parse(request.params);
  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase(userRepository);

    const user = await findByIdUseCase.handler(id);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.status(200).send(user);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while fetching the user' });
  }
}
