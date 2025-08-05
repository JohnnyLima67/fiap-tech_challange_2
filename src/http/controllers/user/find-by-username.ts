import { UserRepository } from '@/repositories/user.repository';
import { FindByUsernameUseCase } from '@/use-cases/user/find-user-by-username';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function findByUsername(request: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    username: z.string().min(1).max(50),
  });

  const { username } = querySchema.parse(request.query);
  try {
    const userRepository = new UserRepository();
    const findByUsernameUseCase = new FindByUsernameUseCase(userRepository);

    const users = await findByUsernameUseCase.handler(username);
    if (!users) {
      return reply.status(404).send({ error: 'No users found' });
    }
    return reply.status(200).send(users);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while fetching the users' });
  }
}
