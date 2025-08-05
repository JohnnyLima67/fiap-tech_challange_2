import { RoleRepository } from '@/repositories/role.repository';
import { FindByIdUseCase } from '@/use-cases/role/find-role-by-id';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export async function deleteRole(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid('Invalid role ID format'),
  });

  const { id } = paramsSchema.parse(request.params);

  try {
    const roleRepository = new RoleRepository();
    const findByIdUseCase = new FindByIdUseCase(roleRepository);
    const existingRole = await findByIdUseCase.handler(id);

    if (!existingRole) {
      return reply.status(404).send({ error: 'Role not found' });
    }

    await roleRepository.delete(id);
    return reply.status(204).send();
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'An error occurred while deleting the role' });
  }
}
