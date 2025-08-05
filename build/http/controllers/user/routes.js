"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/http/controllers/user/routes.ts
var routes_exports = {};
__export(routes_exports, {
  userRoutes: () => userRoutes
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
var import_zod2 = require("zod");
var import_bcryptjs = __toESM(require("bcryptjs"));
async function create(request, reply) {
  const registerBodySchema = import_zod2.z.object({
    username: import_zod2.z.string().min(1).max(50),
    password: import_zod2.z.string().min(6),
    full_name: import_zod2.z.string().max(100),
    role_id: import_zod2.z.string().uuid()
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
var FindByIdUseCase = class {
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
var import_zod3 = require("zod");
async function findById(request, reply) {
  const paramsSchema = import_zod3.z.object({
    id: import_zod3.z.string().uuid("Invalid user ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase(userRepository);
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
var FindAllUseCase = class {
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
var import_zod4 = require("zod");
async function findAll(request, reply) {
  try {
    const userRepository = new UserRepository();
    const findAllUseCase = new FindAllUseCase(userRepository);
    const querySchema = import_zod4.z.object({
      page: import_zod4.z.coerce.number().optional(),
      limit: import_zod4.z.coerce.number().optional()
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
var import_zod5 = require("zod");
async function updateById(request, reply) {
  const paramsSchema = import_zod5.z.object({
    id: import_zod5.z.string().uuid("Invalid user ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  const bodySchema = import_zod5.z.object({
    username: import_zod5.z.string().min(1).max(50),
    password: import_zod5.z.string().min(6),
    full_name: import_zod5.z.string().max(100),
    role_id: import_zod5.z.string().uuid()
  });
  const { username, password, full_name, role_id } = bodySchema.parse(request.body);
  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase(userRepository);
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
var import_zod6 = require("zod");
async function deleteUser(request, reply) {
  const paramsSchema = import_zod6.z.object({
    id: import_zod6.z.string().uuid("Invalid user ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  try {
    const userRepository = new UserRepository();
    const findByIdUseCase = new FindByIdUseCase(userRepository);
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
var import_zod7 = require("zod");
async function findByUsername(request, reply) {
  const querySchema = import_zod7.z.object({
    username: import_zod7.z.string().min(1).max(50)
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
var import_zod8 = require("zod");
var import_bcryptjs2 = __toESM(require("bcryptjs"));
async function signin(request, reply) {
  const registerBodySchema = import_zod8.z.object({
    username: import_zod8.z.string().min(1).max(50),
    password: import_zod8.z.string().min(6)
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
async function userRoutes(app) {
  app.post("/users", create);
  app.get("/users/:id", findById);
  app.get("/users", findAll);
  app.put("/users/:id", updateById);
  app.delete("/users/:id", deleteUser);
  app.get("/users/search", findByUsername);
  app.post("/users/signin", signin);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userRoutes
});
