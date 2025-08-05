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

// src/use-cases/post/update-post.ts
var update_post_exports = {};
__export(update_post_exports, {
  UpdatePostUseCase: () => UpdatePostUseCase
});
module.exports = __toCommonJS(update_post_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UpdatePostUseCase
});
