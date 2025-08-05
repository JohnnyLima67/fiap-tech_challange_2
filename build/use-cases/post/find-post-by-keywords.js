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

// src/use-cases/post/find-post-by-keywords.ts
var find_post_by_keywords_exports = {};
__export(find_post_by_keywords_exports, {
  FindByKeywordsUseCase: () => FindByKeywordsUseCase
});
module.exports = __toCommonJS(find_post_by_keywords_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FindByKeywordsUseCase
});
