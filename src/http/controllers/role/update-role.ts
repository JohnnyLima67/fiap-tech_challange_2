import { RoleRepository } from '@/repositories/role.repository';
import { UpdateRoleUseCase } from '@/use-cases/role/update-role';
import { FindByIdUseCase } from '@/use-cases/role/find-role-by-id';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function updateById(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid('Invalid role ID format'),
  });

  const { id } = paramsSchema.parse(request.params);

  const bodySchema = z.object({
    role_name: z.string().min(1).max(50),
    description: z.string().max(200).optional(),
  });

  const { role_name, description } = bodySchema.parse(request.body);
  try {
    const roleRepository = new RoleRepository();
    const findByIdUseCase = new FindByIdUseCase(roleRepository);
    const existingRole = await findByIdUseCase.handler(id);

    if (!existingRole) {
      return reply.status(404).send({ error: 'Role not found' });
    }
    const updateRoleUseCase = new UpdateRoleUseCase(roleRepository);

    const updatedRole = await updateRoleUseCase.handler({
      role_id: id,
      role_name,
      description,
    });

    return reply.status(200).send(updatedRole);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while updating the role' });
  }
}
