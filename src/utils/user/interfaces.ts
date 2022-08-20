export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  profile_picture: string;
  oauth_service?: string;
  oauth_service_id?: string;
  token: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  hasGroup?: boolean;
}
