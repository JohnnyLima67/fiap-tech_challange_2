import { FastifyReply, FastifyRequest } from 'fastify';

export async function validateJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    const routeFreelist = [
      'POST-/users',
      'POST-/users/signin',
      'GET-/posts',
      'GET-/posts/:id',
      'GET-/posts/search',
    ];
    const route = request.routeOptions.url;
    const method = request.method;

    if (routeFreelist.includes(`${method}-${route}`)) return;

    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}
