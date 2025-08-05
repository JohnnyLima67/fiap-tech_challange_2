export class Post {
  post_id: string;
  post_title: string;
  post_description?: string;
  post_content: string;
  author: string;
  created_at: Date;
  updated_at?: Date;

  constructor(
    post_id: string,
    post_title: string,
    post_content: string,
    author: string,
    created_at: Date,
    post_description?: string,
    updated_at?: Date
  ) {
    this.post_id = post_id;
    this.post_title = post_title;
    this.post_description = post_description;
    this.post_content = post_content;
    this.author = author;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
