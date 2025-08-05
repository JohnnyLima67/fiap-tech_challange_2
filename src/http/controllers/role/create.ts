import { RoleRepository } from '@/repositories/role.repository';
import { CreateRoleUseCase } from '@/use-cases/role/create-role';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    role_name: z.string().min(1).max(50),
    description: z.string().max(200).optional(),
  });

  const { role_name, description } = registerBodySchema.parse(request.body);
  try {
    const roleRepository = new RoleRepository();
    const createRoleUseCase = new CreateRoleUseCase(roleRepository);

    await createRoleUseCase.handler({
      role_name,
      description,
      role_id: '',
    });
    return reply.status(201).send({ message: 'Role created successfully' });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while creating the role' });
  }
}
