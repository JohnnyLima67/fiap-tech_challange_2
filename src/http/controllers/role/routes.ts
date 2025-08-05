import { FastifyInstance } from 'fastify';
import { create } from './create';
import { updateById } from './update-role';
import { deleteRole } from './delete-role';
export async function roleRoutes(app: FastifyInstance) {
  app.post('/roles', create);
  app.put('/roles/:id', updateById);
  app.delete('/roles/:id', deleteRole);
}
