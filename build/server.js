"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

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

// src/app.ts
var import_fastify = __toESM(require("fastify"));

// src/lib/´pg/db.ts
var import_pg = require("pg");
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
async function postRoutes(app2) {
  app2.post("/posts", create);
  app2.get("/posts/:id", findById);
  app2.get("/posts", findAll);
  app2.put("/posts/:id", updateById);
  app2.delete("/posts/:id", deletePost);
  app2.get("/posts/search", findByKeywords);
}

// src/repositories/role.repository.ts
var RoleRepository = class {
  async create({ role_name, description }) {
    const role = await database.clientInstance?.query(
      'INSERT INTO "role" (role_name, description) VALUES ($1, $2) RETURNING *',
      [role_name, description]
    );
    return role?.rows[0];
  }
  async findById(roleId) {
    const role = await database.clientInstance?.query('SELECT * FROM "role" WHERE role_id = $1', [
      roleId
    ]);
    return role?.rows[0];
  }
  async update({ role_id, role_name, description }) {
    const role = await database.clientInstance?.query(
      'UPDATE "role" SET role_name = $1, description = $2 WHERE role_id = $3 RETURNING *',
      [role_name, description, role_id]
    );
    return role?.rows[0];
  }
  async delete(roleId) {
    await database.clientInstance?.query('DELETE FROM "role" WHERE role_id = $1', [roleId]);
  }
};

// src/use-cases/role/create-role.ts
var CreateRoleUseCase = class {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }
  async handler(role) {
    const createdRole = await this.roleRepository.create(role);
    if (!createdRole) {
      throw new Error("Failed to create role");
    }
    return createdRole;
  }
};

// src/http/controllers/role/create.ts
var import_zod8 = require("zod");
async function create2(request, reply) {
  const registerBodySchema = import_zod8.z.object({
    role_name: import_zod8.z.string().min(1).max(50),
    description: import_zod8.z.string().max(200).optional()
  });
  const { role_name, description } = registerBodySchema.parse(request.body);
  try {
    const roleRepository = new RoleRepository();
    const createRoleUseCase = new CreateRoleUseCase(roleRepository);
    await createRoleUseCase.handler({
      role_name,
      description,
      role_id: ""
    });
    return reply.status(201).send({ message: "Role created successfully" });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while creating the role" });
  }
}

// src/use-cases/role/update-role.ts
var UpdateRoleUseCase = class {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }
  async handler(role) {
    const updatedRole = await this.roleRepository.update(role);
    if (!updatedRole) {
      throw new Error("Failed to update role");
    }
    return updatedRole;
  }
};

// src/use-cases/role/find-role-by-id.ts
var FindByIdUseCase2 = class {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }
  async handler(roleId) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }
    return role;
  }
};

// src/http/controllers/role/update-role.ts
var import_zod9 = require("zod");
async function updateById2(request, reply) {
  const paramsSchema = import_zod9.z.object({
    id: import_zod9.z.string().uuid("Invalid role ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  const bodySchema = import_zod9.z.object({
    role_name: import_zod9.z.string().min(1).max(50),
    description: import_zod9.z.string().max(200).optional()
  });
  const { role_name, description } = bodySchema.parse(request.body);
  try {
    const roleRepository = new RoleRepository();
    const findByIdUseCase = new FindByIdUseCase2(roleRepository);
    const existingRole = await findByIdUseCase.handler(id);
    if (!existingRole) {
      return reply.status(404).send({ error: "Role not found" });
    }
    const updateRoleUseCase = new UpdateRoleUseCase(roleRepository);
    const updatedRole = await updateRoleUseCase.handler({
      role_id: id,
      role_name,
      description
    });
    return reply.status(200).send(updatedRole);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while updating the role" });
  }
}

// src/http/controllers/role/delete-role.ts
var import_zod10 = require("zod");
async function deleteRole(request, reply) {
  const paramsSchema = import_zod10.z.object({
    id: import_zod10.z.string().uuid("Invalid role ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  try {
    const roleRepository = new RoleRepository();
    const findByIdUseCase = new FindByIdUseCase2(roleRepository);
    const existingRole = await findByIdUseCase.handler(id);
    if (!existingRole) {
      return reply.status(404).send({ error: "Role not found" });
    }
    await roleRepository.delete(id);
    return reply.status(204).send();
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while deleting the role" });
  }
}

// src/http/controllers/role/routes.ts
async function roleRoutes(app2) {
  app2.post("/roles", create2);
  app2.put("/roles/:id", updateById2);
  app2.delete("/roles/:id", deleteRole);
}

// src/repositories/user.repository.ts
var UserRepository = class {
  async create({ username, password, full_name, role_id }) {
    const user = await database.clientInstance?.query(
      'INSERT INTO "app_user" (username, password, full_name, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, password, full_name, role_id]
    );
    return user?.rows[0];
  }
  async findById(userId) {
    const user = await database.clientInstance?.query(
      'SELECT * FROM "app_user" WHERE user_id = $1',
      [userId]
    );
    return user?.rows[0];
  }
  async findByUsername(username) {
    const user = await database.clientInstance?.query(
      'SELECT * FROM "app_user" WHERE username ILIKE $1',
      [username]
    );
    return user?.rows[0];
  }
  async findAll(page, limit) {
    const offset = (page - 1) * limit;
    const users = await database.clientInstance?.query(
      'SELECT * FROM "app_user" LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return users?.rows || [];
  }
  async update({
    user_id,
    username,
    password,
    full_name,
    role_id
  }) {
    const user = await database.clientInstance?.query(
      'UPDATE "app_user" SET username = $1, password = $2, full_name = $3, role_id = $4 WHERE user_id = $5 RETURNING *',
      [username, password, full_name, role_id, user_id]
    );
    return user?.rows[0];
  }
  async delete(userId) {
    await database.clientInstance?.query('DELETE FROM "app_user" WHERE user_id = $1', [userId]);
  }
};

// src/use-cases/user/create-user.ts
var CreateUserUseCase = class {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async handler(user) {
    const createdUser = await this.userRepository.create(user);
    if (!createdUser) {
      throw new Error("Failed to create user");
    }
    return createdUser;
  }
};

// src/http/controllers/user/create.ts
var import_zod11 = require("zod");
var import_bcryptjs = __toESM(require("bcryptjs"));
async function create3(request, reply) {
  const registerBodySchema = import_zod11.z.object({
    username: import_zod11.z.string().min(1).max(50),
    password: import_zod11.z.string().min(6),
    full_name: import_zod11.z.string().max(100),
    role_id: import_zod11.z.string().uuid()
  });
  const { username, password, full_name, role_id } = registerBodySchema.parse(request.body);
  const hashedPassword = await import_bcryptjs.default.hash(password, 8);
  const userWithHashedPassword = {
    user_id: "",
    username,
    password: hashedPassword,
    full_name,
    role_id
  };
  try {
    const userRepository = new UserRepository();
    const createUserUseCase = new CreateUserUseCase(userRepository);
    await createUserUseCase.handler(userWithHashedPassword);
    return reply.status(201).send({ username, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while creating the user" });
  }
}

// src/use-cases/user/find-user-by-id.ts
var FindByIdUseCase3 = class {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async handler(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
};

// src/http/controllers/user/find-by-id.ts
var import_zod12 = require("zod");
async function findById2(request, reply) {
  const paramsSchema = import_zod12.z.object({
    id: import_zod12.z.string().uuid("Invalid user ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase3(userRepository);
    const user = await findByIdUseCase.handler(id);
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }
    return reply.status(200).send(user);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while fetching the user" });
  }
}

// src/use-cases/user/find-all-users.ts
var FindAllUseCase2 = class {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async handler(page, limit) {
    const users = await this.userRepository.findAll(page, limit);
    if (!users) {
      throw new Error("No users found");
    }
    return users;
  }
};

// src/http/controllers/user/find-all.ts
var import_zod13 = require("zod");
async function findAll2(request, reply) {
  try {
    const userRepository = new UserRepository();
    const findAllUseCase = new FindAllUseCase2(userRepository);
    const querySchema = import_zod13.z.object({
      page: import_zod13.z.coerce.number().optional(),
      limit: import_zod13.z.coerce.number().optional()
    });
    const { page = 1, limit = 10 } = querySchema.parse(request.query);
    const users = await findAllUseCase.handler(page, limit);
    if (!users) {
      return reply.status(404).send({ error: "No users found" });
    }
    return reply.status(200).send(users);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while fetching the users" });
  }
}

// src/use-cases/user/update-user.ts
var UpdateUserUseCase = class {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async handler(user) {
    const updatedUser = await this.userRepository.update(user);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }
    return updatedUser;
  }
};

// src/http/controllers/user/update-user.ts
var import_zod14 = require("zod");
async function updateById3(request, reply) {
  const paramsSchema = import_zod14.z.object({
    id: import_zod14.z.string().uuid("Invalid user ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  const bodySchema = import_zod14.z.object({
    username: import_zod14.z.string().min(1).max(50),
    password: import_zod14.z.string().min(6),
    full_name: import_zod14.z.string().max(100),
    role_id: import_zod14.z.string().uuid()
  });
  const { username, password, full_name, role_id } = bodySchema.parse(request.body);
  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase3(userRepository);
    const existingUser = await findByIdUseCase.handler(id);
    if (!existingUser) {
      return reply.status(404).send({ error: "User not found" });
    }
    const updateUserUseCase = new UpdateUserUseCase(userRepository);
    const updatedUser = await updateUserUseCase.handler({
      user_id: id,
      username,
      password,
      full_name,
      role_id
    });
    return reply.status(200).send(updatedUser);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while updating the user" });
  }
}

// src/http/controllers/user/delete-user.ts
var import_zod15 = require("zod");
async function deleteUser(request, reply) {
  const paramsSchema = import_zod15.z.object({
    id: import_zod15.z.string().uuid("Invalid user ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase3(userRepository);
    const existingUser = await findByIdUseCase.handler(id);
    if (!existingUser) {
      return reply.status(404).send({ error: "User not found" });
    }
    await userRepository.delete(id);
    return reply.status(204).send();
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while deleting the user" });
  }
}

// src/use-cases/user/find-user-by-username.ts
var FindByUsernameUseCase = class {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async handler(username) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error("No users found");
    }
    return user;
  }
};

// src/http/controllers/user/find-by-username.ts
var import_zod16 = require("zod");
async function findByUsername(request, reply) {
  const querySchema = import_zod16.z.object({
    username: import_zod16.z.string().min(1).max(50)
  });
  const { username } = querySchema.parse(request.query);
  try {
    const userRepository = new UserRepository();
    const findByUsernameUseCase = new FindByUsernameUseCase(userRepository);
    const users = await findByUsernameUseCase.handler(username);
    if (!users) {
      return reply.status(404).send({ error: "No users found" });
    }
    return reply.status(200).send(users);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while fetching the users" });
  }
}

// src/use-cases/user/signin.ts
var SignInUseCase = class {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async handler(username) {
    const foundUser = await this.userRepository.findByUsername(username);
    if (!foundUser) {
      throw new Error("User not found");
    }
    return foundUser;
  }
};

// src/http/controllers/user/signin.ts
var import_zod17 = require("zod");
var import_bcryptjs2 = __toESM(require("bcryptjs"));
async function signin(request, reply) {
  const registerBodySchema = import_zod17.z.object({
    username: import_zod17.z.string().min(1).max(50),
    password: import_zod17.z.string().min(6)
  });
  const { username, password } = registerBodySchema.parse(request.body);
  const signInUseCase = new SignInUseCase(new UserRepository());
  const user = await signInUseCase.handler(username);
  const isPasswordValid = await import_bcryptjs2.default.compare(password, user.password);
  if (!isPasswordValid) {
    return reply.status(401).send({ error: "Invalid username or password" });
  }
  const token = await reply.jwtSign({ username });
  return reply.status(200).send({ token, user: { username: user.username, full_name: user.full_name } });
}

// src/http/controllers/user/routes.ts
async function userRoutes(app2) {
  app2.post("/users", create3);
  app2.get("/users/:id", findById2);
  app2.get("/users", findAll2);
  app2.put("/users/:id", updateById3);
  app2.delete("/users/:id", deleteUser);
  app2.get("/users/search", findByUsername);
  app2.post("/users/signin", signin);
}

// src/app.ts
var import_jwt = __toESM(require("@fastify/jwt"));

// src/http/middleware/jwt-validate.ts
async function validateJwt(request, reply) {
  try {
    const routeFreelist = [
      "POST-/users",
      "POST-/users/signin",
      "POST-/roles",
      "PUT-/roles/:id",
      "DELETE-/roles/:id",
      "GET-/posts",
      "GET-/posts/:id",
      "GET-/posts/search"
    ];
    const route = request.routeOptions.url;
    const method = request.method;
    if (routeFreelist.includes(`${method}-${route}`)) return;
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(import_jwt.default, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: "10m"
  }
});
app.addHook("onRequest", validateJwt);
app.register(postRoutes);
app.register(roleRoutes);
app.register(userRoutes);

// src/server.ts
app.listen({
  host: "0.0.0.0",
  port: env.PORT
}).then(() => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
