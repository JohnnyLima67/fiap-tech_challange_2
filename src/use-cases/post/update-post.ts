import { PostRepository } from '../../repositories/post.repository';
import { Post } from '../../entities/post.entity';

export class UpdatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async handler(post: Post): Promise<Post> {
    const updatedPost = await this.postRepository.update(post);
    if (!updatedPost) {
      throw new Error('Failed to update post');
    }
    return updatedPost;
  }
}
