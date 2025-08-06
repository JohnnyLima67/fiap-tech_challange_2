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
  //limpa a tabela de posts
  await database.clientInstance.query('DELETE FROM post');
  // fecha a conexão do app
  await database.clientInstance.release();
  // fecha o servidor
  await app.close();
});

describe('POST /posts', () => {
  it('deve criar um post com sucesso', async () => {
    const res = await request(`http://localhost:${env.PORT}`)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        post_title: 'Título de Teste',
        post_description: 'Descrição breve',
        post_content: 'Conteúdo completo',
        author: 'Autor da postagem',
      });

    expect(res.statusCode).toBe(201);
  });

  it('deve retornar erro ao criar post sem título', async () => {
    const res = await request(`http://localhost:${env.PORT}`)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        post_description: 'Descrição breve',
        post_content: 'Conteúdo completo',
        author: 'Autor da postagem',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
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
  it('deve retornar erro ao acessar sem posts', async () => {
    //limpa a tabela de posts
    await database.clientInstance.query('DELETE FROM post');
    const res = await request(`http://localhost:${env.PORT}`)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
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
