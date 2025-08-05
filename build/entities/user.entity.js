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

// src/entities/user.entity.ts
var user_entity_exports = {};
__export(user_entity_exports, {
  User: () => User
});
module.exports = __toCommonJS(user_entity_exports);
var User = class {
  user_id;
  username;
  password;
  full_name;
  role_id;
  constructor(user_id, username, password, full_name, role_id) {
    this.user_id = user_id;
    this.username = username;
    this.password = password;
    this.full_name = full_name;
    this.role_id = role_id;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  User
});
