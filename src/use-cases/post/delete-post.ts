import { PostRepository } from '../../repositories/post.repository';
import { Post } from '../../entities/post.entity';

export class DeletePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async handler(postId: number): Promise<void> {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new Error('Post not found');
    }
    await this.postRepository.delete(postId);
  }
}
