export interface NotificationDb {
  id: number;
  token: string;
  platform: "ios" | "android";
  user: number;
}
