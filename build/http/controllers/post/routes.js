"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/http/controllers/post/routes.ts
var routes_exports = {};
__export(routes_exports, {
  postRoutes: () => postRoutes
});
module.exports = __toCommonJS(routes_exports);

// src/lib/´pg/db.ts
var import_pg = require("pg");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
  PORT: import_zod.z.coerce.number().default(3e3),
  DATABASE_USER: import_zod.z.string().min(1, "DATABASE_USER is required"),
  DATABASE_PASSWORD: import_zod.z.string().min(1, "DATABASE_PASSWORD is required"),
  DATABASE_HOST: import_zod.z.string().min(1, "DATABASE_HOST is required"),
  DATABASE_PORT: import_zod.z.coerce.number().default(5432),
  DATABASE_NAME: import_zod.z.string().min(1, "DATABASE_NAME is required"),
  JWT_SECRET: import_zod.z.string().min(1, "JWT_SECRET is required")
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.log("Invalid enviroment variables", _env.error.format());
  throw new Error("Invalid enviroment variables");
}
var env = _env.data;

// src/lib/´pg/db.ts
var CONFIG = {
  user: env.DATABASE_USER,
  host: env.DATABASE_HOST,
  database: env.DATABASE_NAME,
  password: env.DATABASE_PASSWORD,
  port: env.DATABASE_PORT
};
var Database = class {
  pool;
  client;
  constructor() {
    this.pool = new import_pg.Pool(CONFIG);
    this.connection();
  }
  async connection() {
    try {
      this.client = await this.pool.connect();
    } catch (error) {
      console.error("Error connecting to the database", error);
      throw new Error(`Database connection failed: ${error}`);
    }
  }
  get clientInstance() {
    if (!this.client) {
      throw new Error("Database client is not connected. Call connect() first.");
    }
    return this.client;
  }
};
var database = new Database();

// src/repositories/post.repository.ts
var PostRepository = class {
  async create({
    post_title,
    post_content,
    post_description,
    author
  }) {
    const post = await database.clientInstance?.query(
      'INSERT INTO "post" (post_title, post_content, post_description, created_at, updated_at, author) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [post_title, post_content, post_description, /* @__PURE__ */ new Date(), /* @__PURE__ */ new Date(), author]
    );
    return post?.rows[0];
  }
  async findById(postId) {
    const post = await database.clientInstance?.query('SELECT * FROM "post" WHERE post_id = $1', [
      postId
    ]);
    return post?.rows[0];
  }
  async findByKeywords(keywords, page, limit) {
    const offset = (page - 1) * limit;
    const posts = await database.clientInstance?.query(
      'SELECT * FROM "post" WHERE post_title ILIKE $1 OR post_content ILIKE $1 OR post_description ILIKE $1 LIMIT $2 OFFSET $3',
      [`%${keywords}%`, limit, offset]
    );
    return posts?.rows || [];
  }
  async findAll(page, limit) {
    const offset = (page - 1) * limit;
    const posts = await database.clientInstance?.query('SELECT * FROM "post" LIMIT $1 OFFSET $2', [
      limit,
      offset
    ]);
    return posts?.rows || [];
  }
  async update({
    post_id,
    post_title,
    post_content,
    post_description,
    author
  }) {
    const post = await database.clientInstance?.query(
      'UPDATE "post" SET post_title = $1, post_content = $2, post_description = $3, updated_at = $4, author = $5 WHERE post_id = $6 RETURNING *',
      [post_title, post_content, post_description, /* @__PURE__ */ new Date(), author, post_id]
    );
    return post?.rows[0];
  }
  async delete(postId) {
    await database.clientInstance?.query('DELETE FROM "post" WHERE post_id = $1', [postId]);
  }
};

// src/use-cases/post/create-post.ts
var CreatePostUseCase = class {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }
  async handler(post) {
    const createdPost = await this.postRepository.create(post);
    if (!createdPost) {
      throw new Error("Failed to create post");
    }
    return createdPost;
  }
};

// src/http/controllers/post/create.ts
var import_zod2 = require("zod");
async function create(request, reply) {
  const registerBodySchema = import_zod2.z.object({
    post_title: import_zod2.z.string().min(1, "Post title is required"),
    post_description: import_zod2.z.string().optional(),
    post_content: import_zod2.z.string().min(1, "Post content is required"),
    author: import_zod2.z.string().min(1, "Author is required")
  });
  const { post_title, post_description, post_content, author } = registerBodySchema.parse(
    request.body
  );
  try {
    const postRepository = new PostRepository();
    const createPostUseCase = new CreatePostUseCase(postRepository);
    await createPostUseCase.handler({
      post_title,
      post_description,
      post_content,
      post_id: "",
      author,
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    });
    return reply.status(201).send({ message: "Post created successfully" });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while creating the post" });
  }
}

// src/use-cases/post/find-post-by-id.ts
var FindByIdUseCase = class {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }
  async handler(postId) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  }
};

// src/http/controllers/post/find-by-id.ts
var import_zod3 = require("zod");
async function findById(request, reply) {
  const paramsSchema = import_zod3.z.object({
    id: import_zod3.z.string().uuid("Invalid post ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  try {
    const postRepository = new PostRepository();
    const findByIdUseCase = new FindByIdUseCase(postRepository);
    const post = await findByIdUseCase.handler(id);
    if (!post) {
      return reply.status(404).send({ error: "Post not found" });
    }
    return reply.status(200).send(post);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while fetching the post" });
  }
}

// src/use-cases/post/find-all-posts.ts
var FindAllUseCase = class {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }
  async handler(page, limit) {
    const posts = await this.postRepository.findAll(page, limit);
    if (!posts) {
      throw new Error("No posts found");
    }
    return posts;
  }
};

// src/http/controllers/post/find-all.ts
var import_zod4 = require("zod");
async function findAll(request, reply) {
  try {
    const postRepository = new PostRepository();
    const findAllUseCase = new FindAllUseCase(postRepository);
    const querySchema = import_zod4.z.object({
      page: import_zod4.z.coerce.number().optional(),
      limit: import_zod4.z.coerce.number().optional()
    });
    const { page = 1, limit = 10 } = querySchema.parse(request.query);
    const posts = await findAllUseCase.handler(page, limit);
    if (!posts) {
      return reply.status(404).send({ error: "No posts found" });
    }
    return reply.status(200).send(posts);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while fetching the posts" });
  }
}

// src/use-cases/post/update-post.ts
var UpdatePostUseCase = class {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }
  async handler(post) {
    const updatedPost = await this.postRepository.update(post);
    if (!updatedPost) {
      throw new Error("Failed to update post");
    }
    return updatedPost;
  }
};

// src/http/controllers/post/update-post.ts
var import_zod5 = require("zod");
async function updateById(request, reply) {
  const paramsSchema = import_zod5.z.object({
    id: import_zod5.z.string().uuid("Invalid post ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  const bodySchema = import_zod5.z.object({
    post_title: import_zod5.z.string().min(1).max(100),
    post_content: import_zod5.z.string().min(1).max(1e3),
    post_description: import_zod5.z.string().min(1).max(500),
    author: import_zod5.z.string().min(1, "Author is required")
  });
  const { post_title, post_content, post_description, author } = bodySchema.parse(request.body);
  try {
    const postRepository = new PostRepository();
    const findByIdUseCase = new FindByIdUseCase(postRepository);
    const existingPost = await findByIdUseCase.handler(id);
    if (!existingPost) {
      return reply.status(404).send({ error: "Post not found" });
    }
    const updatePostUseCase = new UpdatePostUseCase(postRepository);
    const updatedPost = await updatePostUseCase.handler({
      post_id: id,
      post_title,
      post_content,
      post_description,
      author,
      created_at: existingPost.created_at
    });
    return reply.status(200).send(updatedPost);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while updating the post" });
  }
}

// src/http/controllers/post/delete-post.ts
var import_zod6 = require("zod");
async function deletePost(request, reply) {
  const paramsSchema = import_zod6.z.object({
    id: import_zod6.z.string().uuid("Invalid post ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  try {
    const postRepository = new PostRepository();
    const findByIdUseCase = new FindByIdUseCase(postRepository);
    const existingPost = await findByIdUseCase.handler(id);
    if (!existingPost) {
      return reply.status(404).send({ error: "Post not found" });
    }
    await postRepository.delete(id);
    return reply.status(204).send();
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while deleting the post" });
  }
}

// src/use-cases/post/find-post-by-keywords.ts
var FindByKeywordsUseCase = class {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }
  async handler(keywords, page, limit) {
    const posts = await this.postRepository.findByKeywords(keywords, page, limit);
    if (!posts) {
      throw new Error("No posts found");
    }
    return posts;
  }
};

// src/http/controllers/post/find-by-keywords.ts
var import_zod7 = require("zod");
async function findByKeywords(request, reply) {
  const querySchema = import_zod7.z.object({
    keywords: import_zod7.z.string().min(1).max(100),
    page: import_zod7.z.coerce.number().optional(),
    limit: import_zod7.z.coerce.number().optional()
  });
  const { keywords, page = 1, limit = 10 } = querySchema.parse(request.query);
  try {
    const postRepository = new PostRepository();
    const findByKeywordsUseCase = new FindByKeywordsUseCase(postRepository);
    const posts = await findByKeywordsUseCase.handler(keywords, page, limit);
    if (!posts) {
      return reply.status(404).send({ error: "No posts found" });
    }
    return reply.status(200).send(posts);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while fetching the posts" });
  }
}

// src/http/controllers/post/routes.ts
async function postRoutes(app) {
  app.post("/posts", create);
  app.get("/posts/:id", findById);
  app.get("/posts", findAll);
  app.put("/posts/:id", updateById);
  app.delete("/posts/:id", deletePost);
  app.get("/posts/search", findByKeywords);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  postRoutes
});
