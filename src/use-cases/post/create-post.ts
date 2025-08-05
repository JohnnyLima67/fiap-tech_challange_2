import { PostRepository } from '../../repositories/post.repository';
import { Post } from '../../entities/post.entity';

export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async handler(post: Post): Promise<Post> {
    const createdPost = await this.postRepository.create(post);
    if (!createdPost) {
      throw new Error('Failed to create post');
    }
    return createdPost;
  }
}
