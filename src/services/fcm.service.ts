import * as admin from "firebase-admin";
import { db } from "../db";
import { NotificationDb } from "../utils/notifications/interfaces";

export interface FirebaseNotification {
  tokens: string[];
  notification: {
    title: string;
    body: string;
    extra?: string;
  };
}

const sendFirebaseNotification = (
  tokens: string[],
  notification: {
    title: string;
    body: string;
    extra?: string;
  }
): void => {
  const stringNotificationPayload = toStringRecord(notification);
  tokens.forEach((token) => {
    try {
      console.log("Sending notification to:", token);

      admin.messaging().sendToDevice(
        token,
        {
          notification: {
            title: stringNotificationPayload.title,
            body: stringNotificationPayload.body,
            sound: "default",
          },
          data: stringNotificationPayload,
        },
        {
          priority: "high",
          timeToLive: 60 * 60 * 24,
        }
      );
    } catch (error: any) {
      // ADD THIS ERROR TO MONGODB
      console.log(error);
    }
  });
};

const toStringRecord = (obj: Record<string, any>): Record<string, string> => {
  return Object.entries(obj).reduce(
    (prev, curr) => ({ ...prev, [curr[0]]: curr[1].toString() }),
    {}
  );
};

const getUsersTokens = async (id: number): Promise<string[]> => {
  const tokensDb: NotificationDb[] = await db.queryParams(
    "SELECT * FROM Notifications WHERE user = ?",
    [id]
  );
  return tokensDb.map((t) => t.token);
};

export const notification = {
  send: sendFirebaseNotification,
  getTokens: getUsersTokens,
};
