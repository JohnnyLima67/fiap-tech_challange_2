import fastify from 'fastify';
import { env } from './env';
import { postRoutes } from '@/http/controllers/post/routes';
import { roleRoutes } from '@/http/controllers/role/routes';
import { userRoutes } from '@/http/controllers/user/routes';
import fastifyJwt from '@fastify/jwt';
import { validateJwt } from './http/middleware/jwt-validate';
export const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '10m',
  },
});

app.addHook('onRequest', validateJwt);

app.register(postRoutes);
app.register(roleRoutes);
app.register(userRoutes);
