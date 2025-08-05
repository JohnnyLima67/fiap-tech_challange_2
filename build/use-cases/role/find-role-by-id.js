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

// src/use-cases/role/find-role-by-id.ts
var find_role_by_id_exports = {};
__export(find_role_by_id_exports, {
  FindByIdUseCase: () => FindByIdUseCase
});
module.exports = __toCommonJS(find_role_by_id_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FindByIdUseCase
});
