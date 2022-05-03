export interface Group {
  id: number;
  name: string;
  image: string;
  fk_user: number;
  group_key: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface UserGroupAssociation {
  id: number;
  fk_user: number;
  fk_group: number;
}
