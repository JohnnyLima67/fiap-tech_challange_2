import request from 'supertest';
import { app } from '@/app';
import { env } from '@/env';
import { database } from '@/lib/´pg/db';

let token: string;

beforeAll(async () => {
  await waitForDatabaseReady(); // garante client conectado
  await app.listen({ port: env.PORT });
  await app.ready();
  const res = await request(`http://localhost:${env.PORT}`).post('/users/signin').send({
    username: 'Johnny_Lima',
    password: '12345678',
  });
  console.log(res.body);
  token = res.body.token;
});

afterAll(async () => {
  //limpa a tabela de users
  await database.clientInstance.query('DELETE FROM app_user');
  // fecha a conexão do app
  await database.clientInstance.release();
  // fecha o servidor
  await app.close();
});

describe('POST /users', () => {
  const novoId = '11111111-1111-1111-1111-111111111111';
  it('deve criar um user com sucesso', async () => {
    const res = await request(`http://localhost:${env.PORT}`)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'User_Teste',
        password: '12345678',
        full_name: 'Nome Completo',
        role_id: novoId,
      });

    expect(res.statusCode).toBe(201);
  });

  it('deve deletar um user com sucesso', async () => {
    const res = await request(`http://localhost:${env.PORT}`)
      .delete(`/users/${novoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});

describe('GET /posts', () => {
  it('deve retornar lista de posts criados', async () => {
    const res = await request(`http://localhost:${env.PORT}`)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

// Função para esperar conexão ativa
async function waitForDatabaseReady(retries = 10, interval = 500): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await database.clientInstance.query('SELECT 1');
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
}
