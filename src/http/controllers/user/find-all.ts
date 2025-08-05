import { UserRepository } from '@/repositories/user.repository';
import { FindAllUseCase } from '@/use-cases/user/find-all-users';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function findAll(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userRepository = new UserRepository();
    const findAllUseCase = new FindAllUseCase(userRepository);

    const querySchema = z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
    });
    const { page = 1, limit = 10 } = querySchema.parse(request.query);

    const users = await findAllUseCase.handler(page, limit);
    if (!users) {
      return reply.status(404).send({ error: 'No users found' });
    }
    return reply.status(200).send(users);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while fetching the users' });
  }
}
