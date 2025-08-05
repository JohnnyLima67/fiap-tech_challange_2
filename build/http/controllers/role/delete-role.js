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

// src/http/controllers/role/delete-role.ts
var delete_role_exports = {};
__export(delete_role_exports, {
  deleteRole: () => deleteRole
});
module.exports = __toCommonJS(delete_role_exports);

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

// src/use-cases/role/find-role-by-id.ts
var FindByIdUseCase = class {
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

// src/http/controllers/role/delete-role.ts
var import_zod2 = require("zod");
async function deleteRole(request, reply) {
  const paramsSchema = import_zod2.z.object({
    id: import_zod2.z.string().uuid("Invalid role ID format")
  });
  const { id } = paramsSchema.parse(request.params);
  try {
    const roleRepository = new RoleRepository();
    const findByIdUseCase = new FindByIdUseCase(roleRepository);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteRole
});
