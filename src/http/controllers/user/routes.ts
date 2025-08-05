import { FastifyInstance } from 'fastify';
import { create } from './create';
import { findById } from './find-by-id';
import { findAll } from './find-all';
import { updateById } from './update-user';
import { deleteUser } from './delete-user';
import { findByUsername } from './find-by-username';
import { signin } from './signin';
export async function userRoutes(app: FastifyInstance) {
  app.post('/users', create);
  app.get('/users/:id', findById);
  app.get('/users', findAll);
  app.put('/users/:id', updateById);
  app.delete('/users/:id', deleteUser);
  app.get('/users/search', findByUsername);
  app.post('/users/signin', signin);
}
