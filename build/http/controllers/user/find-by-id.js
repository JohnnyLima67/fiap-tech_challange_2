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

// src/http/controllers/user/find-by-id.ts
var find_by_id_exports = {};
__export(find_by_id_exports, {
  findById: () => findById
});
module.exports = __toCommonJS(find_by_id_exports);

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
var import_zod2 = require("zod");
async function findById(request, reply) {
  const paramsSchema = import_zod2.z.object({
    id: import_zod2.z.string().uuid("Invalid user ID format")
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  findById
});
