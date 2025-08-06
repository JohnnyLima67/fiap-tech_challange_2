# Blogging App

Este projeto é uma API construída com **Node.js**, utilizando os princípios da **Clean Architecture** e **DDD (Domain-Driven Design)**. A aplicação é baseada no framework **Fastify**, usa **Zod** para validações e **PostgreSQL** como banco de dados relacional.

---

## Arquitetura e Estrutura de Pastas

```bash
src/
├── entities/          # Entidades de domínio (ex: User, Post)
├── http/              # Controladores e rotas HTTP (interface com o mundo externo)
├── lib/
│   └── pg/            # Instância e configuração do PostgreSQL
├── repositories/      # Implementações de acesso a dados (DAO)
├── use-cases/         # Casos de uso e lógica de negócio
├── app.ts             # Inicialização do app Fastify
└── server.ts          # Entrada da aplicação
````
## Descrição das Camadas
entities/
- Define as entidades de domínio com suas regras e validações.
- Exemplo: User, Post.
- Contém tipagens e validações específicas do negócio.

http/
- Camada de interface HTTP com rotas, controllers e validações via Zod.
- Responsável por: signin, signup, createPost, etc.
- Retorna respostas apropriadas com base nas entradas.

lib/pg/
- Configurações e instância do cliente PostgreSQL utilizando a lib pg.
- Fornece integração com o banco via conexão pool.

repositories/
- Camada de persistência de dados (repositórios concretos).
- Responsável por acessar o banco e executar queries SQL.
- Injetada nos use cases via inversão de dependência.

use-cases/
- Contém os casos de uso do domínio, desacoplados da infraestrutura.
- Exemplo: CreatePostUseCase, SignInUseCase.
- Onde reside a lógica central da aplicação.

## Como Executar o Projeto
Clone este repositório:
git clone https://github.com/JohnnyLima67/fiap-tech_challange_2.git
Suba os containers com Docker:
docker-compose up -d
Isso iniciará o banco de dados e o servidor da aplicação.

A aplicação estará disponível na porta 3000.

Utilize ferramentas como Postman ou Insomnia para testar as rotas.

## Testes
Os testes estão localizados em src/tests.

⚠️ Devido à configuração com Docker, para rodar os testes é necessário:
- Parar o container da aplicação, mantendo apenas o banco em execução.
Em seguida, executar os testes com:
npm run test

## Desafios Encontrados
Este projeto foi significativamente mais desafiador que o anterior. Eu nunca havia trabalhado com Node.js e bibliotecas como Fastify, Zod ou Jest, o que exigiu bastante aprendizado. Além disto, a dificuldade que tive em integrar o aplicativo com Docker e testes acabou gerando contra tempos, fazendo com que a aplicação parasse de funcionar depois de alguns commits.

Os principais obstáculos enfrentados foram:
- Integração entre as camadas de forma coesa.
- Configuração de testes automatizados e pipelines de CI/CD.

## Tecnologias Utilizadas
- Node.js
- Fastify
- PostgreSQL
- Zod (validação de esquemas)
- Docker & Docker Compose
- Jest (testes)
