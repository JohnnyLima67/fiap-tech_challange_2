import { UserRepository } from '@/repositories/user.repository';
import { SignInUseCase } from '@/use-cases/user/signin';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export async function signin(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    username: z.string().min(1).max(50),
    password: z.string().min(6),
  });

  const { username, password } = registerBodySchema.parse(request.body);

  const signInUseCase = new SignInUseCase(new UserRepository());

  const user = await signInUseCase.handler(username);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return reply.status(401).send({ error: 'Invalid username or password' });
  }

  const token = await reply.jwtSign({ username });

  return reply
    .status(200)
    .send({ token, user: { username: user.username, full_name: user.full_name } });
}
