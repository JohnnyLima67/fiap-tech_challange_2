import { UserRepository } from '@/repositories/user.repository';
import { UpdateUserUseCase } from '@/use-cases/user/update-user';
import { FindByIdUseCase } from '@/use-cases/user/find-user-by-id';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function updateById(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid('Invalid user ID format'),
  });

  const { id } = paramsSchema.parse(request.params);

  const bodySchema = z.object({
    username: z.string().min(1).max(50),
    password: z.string().min(6),
    full_name: z.string().max(100),
    role_id: z.string().uuid(),
  });

  const { username, password, full_name, role_id } = bodySchema.parse(request.body);
  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase(userRepository);
    const existingUser = await findByIdUseCase.handler(id);

    if (!existingUser) {
      return reply.status(404).send({ error: 'User not found' });
    }
    const updateUserUseCase = new UpdateUserUseCase(userRepository);

    const updatedUser = await updateUserUseCase.handler({
      user_id: id,
      username,
      password,
      full_name,
      role_id,
    });

    return reply.status(200).send(updatedUser);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while updating the user' });
  }
}
