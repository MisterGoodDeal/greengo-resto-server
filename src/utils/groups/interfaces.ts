import { User } from "../user/interfaces";

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
  fk_lunch_group: number;
}

export interface MultipleUserGroupAssociation {
  id: number;
  fk_user: number;
  fk_lunch_group: number;
  created_at: Date;
}

export interface GroupInfo {
  group: Partial<Group> & { creator: Partial<User> };
  users: {
    firstname: string;
    lastname: string;
    profile_picture: string;
  }[];
  last_places: {
    name: string;
    country_speciality: string;
    rating: number;
    price_range: number;
    image: string;
    lat: number;
    lng: number;
    can_bring_reusable_contents: boolean;
    creator: Partial<User>;
    created_at: string;
  }[];
  random_image: string;
}
