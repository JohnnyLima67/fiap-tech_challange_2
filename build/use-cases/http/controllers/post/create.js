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

// src/use-cases/http/controllers/post/create.ts
var create_exports = {};
__export(create_exports, {
  create: () => create
});
module.exports = __toCommonJS(create_exports);

// src/entities/post.entity.ts
var Post = class {
  post_id;
  post_title;
  post_description;
  post_content;
  created_at;
  updated_at;
  constructor(post_id, post_title, post_content, created_at, post_description, updated_at) {
    this.post_id = post_id;
    this.post_title = post_title;
    this.post_description = post_description;
    this.post_content = post_content;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
};

// src/repositories/post.repository.ts
var PostRepository = class {
  async findById(postId) {
    const post = new Post(
      postId,
      "Sample Post Title",
      "This is the content of the sample post.",
      /* @__PURE__ */ new Date(),
      "This is a sample description.",
      /* @__PURE__ */ new Date()
    );
    return post;
  }
  async create(post) {
    post.post_id = Math.floor(Math.random() * 1e3);
    post.created_at = /* @__PURE__ */ new Date();
    post.updated_at = /* @__PURE__ */ new Date();
    return post;
  }
};

// src/use-cases/create-post.ts
var CreatePostUseCase = class {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }
  handler(post) {
    return this.postRepository.create(post);
  }
};

// src/use-cases/http/controllers/post/create.ts
var import_zod = require("zod");
async function create(request, reply) {
  const registerBodySchema = import_zod.z.object({
    post_title: import_zod.z.string().min(1, "Post title is required"),
    post_description: import_zod.z.string().optional(),
    post_content: import_zod.z.string().min(1, "Post content is required")
  });
  const { post_title, post_description, post_content } = registerBodySchema.parse(request.body);
  try {
    const postRepository = new PostRepository();
    const createPostUseCase = new CreatePostUseCase(postRepository);
    await createPostUseCase.handler({
      post_title,
      post_description,
      post_content,
      post_id: 0,
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    });
    return reply.status(201).send({ message: "Post created successfully" });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "An error occurred while creating the post" });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  create
});
