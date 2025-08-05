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

// src/use-cases/user/find-all-users.ts
var find_all_users_exports = {};
__export(find_all_users_exports, {
  FindAllUseCase: () => FindAllUseCase
});
module.exports = __toCommonJS(find_all_users_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FindAllUseCase
});
