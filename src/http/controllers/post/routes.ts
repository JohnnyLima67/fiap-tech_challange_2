import { FastifyInstance } from 'fastify';
import { create } from './create';
import { findById } from './find-by-id';
import { findAll } from './find-all';
import { updateById } from './update-post';
import { deletePost } from './delete-post';
import { findByKeywords } from './find-by-keywords';
export async function postRoutes(app: FastifyInstance) {
  app.post('/posts', create);
  app.get('/posts/:id', findById);
  app.get('/posts', findAll);
  app.put('/posts/:id', updateById);
  app.delete('/posts/:id', deletePost);
  app.get('/posts/search', findByKeywords);
}
