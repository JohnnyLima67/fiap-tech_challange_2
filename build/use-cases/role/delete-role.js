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

// src/use-cases/role/delete-role.ts
var delete_role_exports = {};
__export(delete_role_exports, {
  DeleteRoleUseCase: () => DeleteRoleUseCase
});
module.exports = __toCommonJS(delete_role_exports);
var DeleteRoleUseCase = class {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }
  async handler(roleId) {
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new Error("Role not found");
    }
    await this.roleRepository.delete(roleId);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DeleteRoleUseCase
});
