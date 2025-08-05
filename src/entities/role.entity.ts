export class Role {
  role_id: string;
  role_name: string;
  description?: string;

  constructor(role_id: string, role_name: string, description?: string) {
    this.role_id = role_id;
    this.role_name = role_name;
    this.description = description;
  }
}
