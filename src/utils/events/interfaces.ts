import { Place } from "../places/interfaces";
import { User } from "../user/interfaces";

export interface EventDb {
  id: number;
  creator: number;
  group: number;
  place: number;
  date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export interface FormattedEvent {
  id: number;
  creator: Partial<User>;
  place: Partial<Place>;
  date: Date;
  participants: Partial<User>[];
  created_at: Date;
  updated_at: Date;
}

export interface EventInsert {
  group: number;
  place: number;
  date: Date;
}

export interface EventDelete {
  id: number;
}

export interface EventJoinAndLeave {
  id: number;
}

export interface EventNotificationPayload {
  creator: Partial<User>;
  place: Partial<Place>;
  date: Date;
}
