import { UserRepository } from '@/repositories/user.repository';
import { UpdateUserUseCase } from '@/use-cases/user/update-user';
import { FindByIdUseCase } from '@/use-cases/user/find-user-by-id';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid('Invalid user ID format'),
  });

  const { id } = paramsSchema.parse(request.params);

  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase(userRepository);
    const existingUser = await findByIdUseCase.handler(id);

    if (!existingUser) {
      return reply.status(404).send({ error: 'User not found' });
    }

    await userRepository.delete(id);
    return reply.status(204).send();
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while deleting the user' });
  }
}
