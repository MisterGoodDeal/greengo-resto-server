import { User } from "../user/interfaces";

export interface Place {
  id: number;
  name: string;
  country_speciality: string;
  lat: number;
  lng: number;
  rating: number;
  user_rated: number[];
  price_range: number;
  can_bring_reusable_contents: boolean;
  image: string;
  url: string | null;
  fk_lunch_group: number;
  fk_user: number;
  created_at: string;
}

export interface StuffedPlace extends Place {
  comments: Partial<Comment> & Partial<User>[];
}

export interface Comment {
  id: number;
  comment: string;
  fk_user: number;
  fk_lunch_place: number;
  created_at: string;
}

export interface Favorite {
  id: number;
  fk_user: number;
  fk_lunch_place: number;
}

export interface Speciality {
  id: number;
  fr: string;
  en: string;
}
