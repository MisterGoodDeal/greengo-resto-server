import { db } from "../db";
import { Request, Response } from "express";
import { returnCode } from "../utils/returnCodes";
import { eventsReturnCodes } from "../utils/events/returnCodes";
import { JWTProps, MySQLResponse } from "../utils/interfaces";
import { auth } from "../middleware/auth";
import {
  EventDb,
  EventDelete,
  EventInsert,
  EventJoinAndLeave,
  EventNotificationPayload,
  FormattedEvent,
} from "../utils/events/interfaces";
import { User } from "../utils/user/interfaces";
import { Place } from "../utils/places/interfaces";
import { notification } from "../services/fcm.service";

const env = require("dotenv").config();

const events = (app: any) => {
  // Create an event
  app.post("/event", auth, async (req: Request, res: Response) => {
    const { group, place, date } = req.body as EventInsert;

    // @ts-ignore
    const user: JWTProps = req.user;
    if (!group || !place || !date) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else {
      try {
        const response: MySQLResponse = await db.queryParams(
          "INSERT INTO `LunchEvents` (`creator`, `group`, `place`, `date`) VALUES (?, ?, ?, ?);",
          [user.id, group, place, date]
        );
        if (response.affectedRows === 1) {
          // Join the event
          const joinResponse: MySQLResponse = await db.queryParams(
            "INSERT INTO EventsUsersAssoc (user, event) VALUES (?, ?)",
            [user.id, response.insertId]
          );
          if (joinResponse.affectedRows === 1) {
            // Get all users assoc of the group
            const usersGroupsAssoc: { fk_user: number }[] =
              await db.queryParams(
                "SELECT * FROM UsersLauchGroupsAssoc WHERE fk_lunch_group = ?",
                [group]
              );
            // Get the place
            const placeDb: Place[] = await db.queryParams(
              "SELECT * FROM LunchPlaces WHERE id = ?",
              [place]
            );
            usersGroupsAssoc.forEach(async (assoc) => {
              const notificationsDb = await notification.getTokens(
                assoc.fk_user
              );
              notificationsDb.map((ndb) => {
                const eventNotification = generateEventNotification({
                  lang: ndb.lang,
                  firstname: user.firstname,
                  restaurantName: placeDb[0].name,
                  date,
                });
                notification.send([ndb.token], {
                  title: eventNotification.title,
                  body: eventNotification.body,
                  extra: JSON.stringify({
                    type: "new_event",
                    creator: {
                      id: user.id,
                      firstname: user.firstname,
                      lastname: user.lastname,
                    },
                    place: {
                      id: placeDb[0].id,
                      name: placeDb[0].name,
                      image: placeDb[0].image,
                    },
                    date: new Date(date),
                  }),
                });
              });
            });

            res
              .status(eventsReturnCodes.created.code)
              .json(eventsReturnCodes.created.payload);
          } else {
            res
              .status(eventsReturnCodes.joinFailed.code)
              .json([eventsReturnCodes.joinFailed.payload, joinResponse]);
          }
        } else {
          res
            .status(eventsReturnCodes.createdFailed.code)
            .json([eventsReturnCodes.createdFailed.payload, response]);
        }
      } catch (error) {
        console.log(error);
        res.status(returnCode.internalError.code).json(error);
      }
    }
  });

  // Delete the event
  app.delete("/event", auth, async (req: Request, res: Response) => {
    const { id } = req.body as EventDelete;
    // @ts-ignore
    const user: JWTProps = req.user;
    if (!id) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else {
      try {
        // Delete assocs
        const assocResponse: MySQLResponse = await db.queryParams(
          "DELETE FROM EventsUsersAssoc WHERE event = ?",
          [id]
        );
        const response: MySQLResponse = await db.queryParams(
          "DELETE FROM LunchEvents WHERE id = ? AND creator = ?",
          [id, user.id]
        );
        if (assocResponse.affectedRows > 0 && response.affectedRows === 1) {
          res
            .sendStatus(eventsReturnCodes.deleteSuccess.code)
            .json(eventsReturnCodes.deleteSuccess.payload);
        } else {
          res
            .status(eventsReturnCodes.deleteFailed.code)
            .json([eventsReturnCodes.deleteFailed.payload, response]);
        }
      } catch (error) {
        console.log(error);
        res.status(returnCode.internalError.code).json(error);
      }
    }
  });

  // Join the event
  app.post("/event/join", auth, async (req: Request, res: Response) => {
    const { id } = req.body as EventJoinAndLeave;
    // @ts-ignore
    const user: JWTProps = req.user;
    if (!id) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else {
      try {
        const response: MySQLResponse = await db.queryParams(
          "INSERT INTO EventsUsersAssoc (user, event) VALUES (?, ?)",
          [user.id, id]
        );
        if (response.affectedRows === 1) {
          res
            .sendStatus(eventsReturnCodes.joinSuccess.code)
            .json(eventsReturnCodes.joinSuccess.payload);
        } else {
          res
            .status(eventsReturnCodes.joinFailed.code)
            .json([eventsReturnCodes.joinFailed.payload, response]);
        }
      } catch (error) {
        console.log(error);
        res.status(returnCode.internalError.code).json(error);
      }
    }
  });

  // Leave the event
  app.post("/event/leave", auth, async (req: Request, res: Response) => {
    const { id } = req.body as EventJoinAndLeave;
    // @ts-ignore
    const user: JWTProps = req.user;
    if (!id) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else {
      try {
        const response: MySQLResponse = await db.queryParams(
          "DELETE FROM EventsUsersAssoc WHERE user = ? AND event = ?",
          [user.id, id]
        );
        if (response.affectedRows === 1) {
          res
            .sendStatus(eventsReturnCodes.leaveSuccess.code)
            .json(eventsReturnCodes.leaveSuccess.payload);
        } else {
          res
            .status(eventsReturnCodes.leaveFailed.code)
            .json([eventsReturnCodes.leaveFailed.payload, response]);
        }
      } catch (error) {
        console.log(error);
        res.status(returnCode.internalError.code).json(error);
      }
    }
  });

  // Get all events
  app.get("/events", auth, async (req: Request, res: Response) => {
    // @ts-ignore
    const user: JWTProps = req.user;
    try {
      const response: EventDb[] = await db.queryParams(
        "SELECT * FROM LunchEvents WHERE group IN (SELECT `fk_lunch_group` FROM UsersLauchGroupsAssoc WHERE fk_user = ?) WHERE LunchEvents.deleted_at IS NOT NULL",
        [user.id]
      );
      const formattedEvents: FormattedEvent[] = [];
      for (const event of response) {
        const users: User[] = await db.queryParams(
          "SELECT * FROM Users WHERE id IN (SELECT user FROM EventsUsersAssoc WHERE event = ?)",
          [event.id]
        );
        const place: Place = await db.queryParams(
          "SELECT * FROM LunchPlaces WHERE id = ?",
          [event.place]
        );

        const formattedUsers: Partial<User>[] = [];
        const groupCreator: User = formattedUsers.find(
          (user) => user.id === event.creator
        ) as User;
        for (const user of users) {
          formattedUsers.push({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            profile_picture: user.profile_picture,
          });
        }

        formattedEvents.push({
          id: event.id,
          creator: {
            id: groupCreator.id,
            firstname: groupCreator.firstname,
            lastname: groupCreator.lastname,
            profile_picture: groupCreator.profile_picture,
          },
          place: {
            id: place.id,
            name: place.name,
            image: place.image,
          },
          date: event.date,
          participants: formattedUsers,
          created_at: event.created_at,
          updated_at: event.updated_at,
        });
      }
      res.status(200).json(formattedEvents);
    } catch (error) {
      console.log(error);
      res.status(returnCode.internalError.code).json(error);
    }
  });
};

const generateEventNotification = (params: {
  lang: string;
  firstname: string;
  restaurantName: string;
  date: Date;
}) => {
  switch (params.lang) {
    case "fr":
      return {
        title: `${params.firstname} vous invite à un événement 🍽️`,
        body: `${params.firstname} vous invite à le rejoindre chez « ${
          params.restaurantName
        } » le ${new Date(params.date).toLocaleString("fr-FR")}`,
      };
    case "en":
      return {
        title: `${params.firstname} invites you to an event 🍽️`,
        body: `${params.firstname} invites you to join him at « ${
          params.restaurantName
        } » on ${new Date(params.date).toLocaleString("en-US")}`,
      };
    default:
      return {
        title: `${params.firstname} invites you to an event 🍽️`,
        body: `${params.firstname} invites you to join him at « ${
          params.restaurantName
        } » on ${new Date(params.date).toLocaleString("en-US")}`,
      };
  }
};

export default events;
