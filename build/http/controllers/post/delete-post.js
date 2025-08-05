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

// src/http/controllers/post/delete-post.ts
var delete_post_exports = {};
__export(delete_post_exports, {
  deletePost: () => deletePost
});
module.exports = __toCommonJS(delete_post_exports);

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

// src/http/controllers/post/delete-post.ts
var import_zod2 = require("zod");
async function deletePost(request, reply) {
  const paramsSchema = import_zod2.z.object({
    id: import_zod2.z.string().uuid("Invalid post ID format")
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deletePost
});
