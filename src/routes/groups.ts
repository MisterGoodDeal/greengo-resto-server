import { db } from "../db";
import { Request, Response } from "express";
import { returnCode } from "../utils/returnCodes";
import { JWTProps, MySQLResponse } from "../utils/interfaces";
import { images } from "../helpers/images.helpers";
import { auth } from "../middleware/auth";
import { groupReturnCode } from "../utils/groups/returnCodes";
import { generateGroupKey } from "../utils/groups/utils";
import {
  Group,
  GroupInfo,
  UserGroupAssociation,
} from "../utils/groups/interfaces";
import { User } from "../utils/user/interfaces";
import { Place } from "../utils/places/interfaces";

const env = require("dotenv").config();

const groups = (app: any) => {
  // Get GroupInfo
  app.get(
    "/group/info/:group_id",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;

      const { group_id } = req.params;
      const group: Group[] = await db.queryParams(
        "SELECT * FROM LunchGroups WHERE id = ?",
        [group_id]
      );
      if (group.length === 0) {
        res
          .status(groupReturnCode.groupNotFound.code)
          .json(groupReturnCode.groupNotFound.payload);
      } else {
        const assoc: UserGroupAssociation[] = await db.queryParams(
          "SELECT * FROM UsersLauchGroupsAssoc WHERE fk_user = ? AND fk_lunch_group = ?",
          [user.id, group_id]
        );
        if (assoc.length === 0) {
          res
            .status(groupReturnCode.notInGroup.code)
            .json(groupReturnCode.notInGroup.payload);
        } else {
          const finalGroup: GroupInfo = {
            group: group[0],
            users: [],
            last_places: [],
          };

          // Get all users from the group
          const users: User[] = await db.queryParams(
            "SELECT * FROM Users WHERE id IN (SELECT fk_user FROM UsersLauchGroupsAssoc WHERE fk_lunch_group = ?)",
            [group_id]
          );
          users.map((u) => {
            finalGroup.users.push({
              firstname: u.firstname,
              lastname: u.lastname,
              profile_picture: u.profile_picture,
            });
          });

          // Get 5 last places from the group
          const places: Place[] = await db.queryParams(
            "SELECT * FROM LunchPlaces WHERE id IN (SELECT id FROM LunchPlaces WHERE fk_lunch_group = ?) ORDER BY created_at DESC LIMIT 5",
            [group_id]
          );
          places.map((p) => {
            finalGroup.last_places.push({
              name: p.name,
              country_speciality: p.country_speciality,
              rating: p.rating,
              price_range: p.price_range,
              image: p.image,
              can_bring_reusable_content: p.can_bring_reusable_content,
            });
          });

          res.status(200).json(finalGroup);
        }
      }
    }
  );

  // Create a new group
  app.post("/group/create", auth, async function (req: Request, res: Response) {
    // @ts-ignore
    const user: JWTProps = req.user;
    const { name, image } = req.body;
    if (!name || !image) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else {
      const imgurImg = await images.upload(image);
      const group: MySQLResponse = await db.queryParams(
        "INSERT INTO LunchGroups (name, image, fk_user, group_key) VALUES (?, ?, ?, ?)",
        [name, imgurImg.data.link, user.id, generateGroupKey()]
      );
      if (group.affectedRows > 0) {
        const newGroup = await db.queryParams(
          "SELECT * FROM LunchGroups WHERE id = ?",
          [group.insertId]
        );
        // join the created group
        const userGroupAssociation: MySQLResponse = await db.queryParams(
          "INSERT INTO UsersLauchGroupsAssoc (fk_user, fk_lunch_group) VALUES (?, ?)",
          [user.id, newGroup[0].id]
        );
        if (userGroupAssociation.affectedRows > 0) {
          res.status(200).json(newGroup[0]);
        } else {
          res
            .status(returnCode.unknownUser.code)
            .json(returnCode.unknownUser.payload);
        }
      } else {
        res
          .status(returnCode.internalError.code)
          .json(returnCode.internalError.payload);
      }
    }
  });

  // Join a group
  app.post(
    "/group/join/:group_key",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;

      const { group_key } = req.params;
      const group: Group[] = await db.queryParams(
        "SELECT * FROM LunchGroups WHERE group_key = ?",
        [group_key]
      );
      if (group.length === 0) {
        res
          .status(groupReturnCode.groupNotFound.code)
          .json(groupReturnCode.groupNotFound.payload);
      } else {
        const assoc: UserGroupAssociation[] = await db.queryParams(
          "SELECT * FROM UsersLauchGroupsAssoc WHERE fk_user = ?",
          [user.id]
        );
        if (assoc.length > 0) {
          res
            .status(groupReturnCode.alreadyInGroup.code)
            .json(groupReturnCode.alreadyInGroup.payload);
        } else {
          const assocResult: MySQLResponse = await db.queryParams(
            "INSERT INTO UsersLauchGroupsAssoc (fk_user, fk_lunch_group) VALUES (?, ?)",
            [user.id, group[0].id]
          );
          if (assocResult.affectedRows > 0) {
            res.status(200).json(group);
          } else {
            res
              .status(returnCode.internalError.code)
              .json(returnCode.internalError.payload);
          }
        }
      }
    }
  );

  // Leave a group
  app.delete(
    "/group/leave/:group_id",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user = req.user;

      const { group_id } = req.params;
      const assoc: UserGroupAssociation[] = await db.queryParams(
        "SELECT * FROM UsersLauchGroupsAssoc WHERE fk_user = ? AND fk_lunch_group = ?",
        [user.id, group_id]
      );
      if (assoc.length === 0) {
        res
          .status(groupReturnCode.notInGroup.code)
          .json(groupReturnCode.notInGroup.payload);
      } else {
        const assocResult: MySQLResponse = await db.queryParams(
          "DELETE FROM UsersLauchGroupsAssoc WHERE fk_user = ? AND fk_lunch_group = ?",
          [user.id, group_id]
        );
        if (assocResult.affectedRows > 0) {
          res
            .status(groupReturnCode.groupLeaved.code)
            .json(groupReturnCode.groupLeaved.payload);
        } else {
          res
            .status(returnCode.internalError.code)
            .json(returnCode.internalError.payload);
        }
      }
    }
  );

  // Get group by group_key
  app.get("/group/:group_id", async function (req: Request, res: Response) {
    // @ts-ignore
    const user = req.user;
    const { group_id } = req.params;
    const group: Group[] = await db.queryParams(
      "SELECT * FROM LunchGroups WHERE group_key = ?",
      [group_id]
    );
    if (group.length === 0) {
      res
        .status(groupReturnCode.groupNotFound.code)
        .json(groupReturnCode.groupNotFound.payload);
    } else {
      res.status(200).json(group[0]);
    }
  });

  // Delete a group
  app.delete(
    "/group/delete/:group_id",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user = req.user;

      const { group_id } = req.params;
      const group: Group[] = await db.queryParams(
        "SELECT * FROM LunchGroups WHERE id = ?",
        [group_id]
      );

      if (group.length === 0 || group[0].fk_user !== user.id) {
        res
          .status(groupReturnCode.groupNotFound.code)
          .json(groupReturnCode.groupNotFound.payload);
      } else {
        const assocResult: MySQLResponse = await db.queryParams(
          "DELETE FROM UsersLauchGroupsAssoc WHERE fk_lunch_group = ?",
          [group_id]
        );
        const groupResult: MySQLResponse = await db.queryParams(
          "DELETE FROM LunchGroups WHERE id = ?",
          [group_id]
        );
        if (assocResult.affectedRows > 0 && groupResult.affectedRows > 0) {
          res
            .status(groupReturnCode.groupDeleted.code)
            .json(groupReturnCode.groupDeleted.payload);
        } else {
          res
            .status(returnCode.internalError.code)
            .json(returnCode.internalError.payload);
        }
      }
    }
  );
};

export default groups;
