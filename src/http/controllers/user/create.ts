import { UserRepository } from '@/repositories/user.repository';
import { CreateUserUseCase } from '@/use-cases/user/create-user';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    username: z.string().min(1).max(50),
    password: z.string().min(6),
    full_name: z.string().max(100),
    role_id: z.string().uuid(),
  });

  const { username, password, full_name, role_id } = registerBodySchema.parse(request.body);

  const hashedPassword = await bcrypt.hash(password, 8);

  const userWithHashedPassword = {
    user_id: '',
    username,
    password: hashedPassword,
    full_name,
    role_id,
  };
  try {
    const userRepository = new UserRepository();
    const createUserUseCase = new CreateUserUseCase(userRepository);

    await createUserUseCase.handler(userWithHashedPassword);
    return reply.status(201).send({ username, message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while creating the user' });
  }
}
