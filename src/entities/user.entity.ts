export class User {
  user_id: string;
  username: string;
  password: string;
  full_name: string;
  role_id: string;

  constructor(
    user_id: string,
    username: string,
    password: string,
    full_name: string,
    role_id: string
  ) {
    this.user_id = user_id;
    this.username = username;
    this.password = password;
    this.full_name = full_name;
    this.role_id = role_id;
  }
}
