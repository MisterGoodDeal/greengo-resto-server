import { db } from "../db";
import { Request, Response } from "express";
import { User } from "../utils/user/interfaces";
import { userReturnCode } from "../utils/user/returnCodes";
import { returnCode } from "../utils/returnCodes";
import { generateToken } from "../utils/jwt";
import { MySQLResponse } from "../utils/interfaces";
import { pwdUtils } from "../utils/password";
import { images } from "../helpers/images.helpers";

const env = require("dotenv").config();

const enrollment = (app: any) => {
  app.post("/user/register", async function (req: Request, res: Response) {
    const {
      firstname,
      lastname,
      email,
      password,
      profile_picture,
      oauth_service,
      oauth_service_id,
    } = req.body;
    if (!firstname || !lastname || !email || !password) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else if (oauth_service && oauth_service_id) {
      const userOAuth: User[] = await db.queryParams(
        "SELECT * FROM Users WHERE oauth_service = ? AND oauth_service_id = ? OR email = ?",
        [oauth_service, oauth_service_id, email]
      );
      if (userOAuth.length > 0) {
        res
          .status(userReturnCode.userAlreadyExists.code)
          .json(userReturnCode.userAlreadyExists.payload);
      } else {
        const user: User = await registerUser(
          firstname,
          lastname,
          email,
          password,
          profile_picture,
          oauth_service,
          oauth_service_id
        );
        res.status(200).json(user);
      }
    } else {
      const user: User[] = await db.queryParams(
        "SELECT * FROM Users WHERE email = ?",
        [email]
      );
      if (user.length > 0) {
        res
          .status(userReturnCode.userAlreadyExists.code)
          .json(userReturnCode.userAlreadyExists.payload);
      } else {
        const user: User = await registerUser(
          firstname,
          lastname,
          email,
          password,
          profile_picture,
          null,
          null
        );
        // Fetch the user from the database
        const userFetched: User[] = await db.queryParams(
          "SELECT * FROM Users WHERE id = ?",
          [user.id]
        );
        res.status(200).json(userFetched[0]);
      }
    }
  });

  app.post("/user/login", async function (req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else {
      const user: User[] = await db.queryParams(
        "SELECT * FROM Users WHERE email = ? AND oauth_service IS NULL AND oauth_service_id IS NULL",
        [email]
      );
      if (user.length === 1) {
        const isPasswordValid: boolean = await pwdUtils.verify(
          password,
          user[0].password
        );
        if (isPasswordValid) {
          const token: string = generateToken({
            id: user[0].id,
            email: user[0].email,
            firstname: user[0].firstname,
            lastname: user[0].lastname,
            profile_picture: user[0].profile_picture,
          });
          // Update token and date
          const lastLoginDate = new Date();
          await db.queryParams(
            "UPDATE Users SET token = ?, updated_at = ? WHERE id = ?",
            [token, lastLoginDate, user[0].id]
          );

          // Check if user is in a group
          const group: any = await db.queryParams(
            "SELECT * FROM UsersLauchGroupsAssoc WHERE fk_user = ?",
            [user[0].id]
          );
          if (group.length > 0) {
            user[0].hasGroup = true;
          } else {
            user[0].hasGroup = false;
          }

          user[0].token = token;
          user[0].updated_at = lastLoginDate;
          user[0].password = "redacted";
          res.status(200).json(user[0]);
        } else {
          res
            .status(userReturnCode.wrongPassword.code)
            .json(userReturnCode.wrongPassword.payload);
        }
      } else {
        res
          .status(userReturnCode.unknownUser.code)
          .json(userReturnCode.unknownUser.payload);
      }
    }
  });

  app.post("/user/login/oauth", async function (req: Request, res: Response) {
    const { oauth_service, oauth_service_id } = req.body;
    if (!oauth_service || !oauth_service_id) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else {
      const user: User[] = await db.queryParams(
        "SELECT * FROM Users WHERE oauth_service = ? AND oauth_service_id = ?",
        [oauth_service, oauth_service_id]
      );
      if (user.length === 1) {
        const token: string = generateToken({
          id: user[0].id,
          email: user[0].email,
          firstname: user[0].firstname,
          lastname: user[0].lastname,
          profile_picture: user[0].profile_picture,
        });
        await db.queryParams("UPDATE Users SET token = ? WHERE id = ?", [
          token,
          user[0].id,
        ]);
        user[0].token = token;
        user[0].password = "redacted";
        res.status(200).json(user[0]);
      } else {
        res
          .status(userReturnCode.unknownUser.code)
          .json(userReturnCode.unknownUser.payload);
      }
    }
  });

  const registerUser = async (
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    profile_picture: string,
    oauth_service: string | null,
    oauth_service_id: string | null
  ) => {
    const hashedPassword = await pwdUtils.hash(password);
    const imgurImage = profile_picture
      ? await images.upload(profile_picture)
      : { data: { link: "" } };
    const userOAuth: MySQLResponse = await db.queryParams(
      "INSERT INTO Users (firstname, lastname, email, password, profile_picture, oauth_service, oauth_service_id, token) VALUES (?, ?, ?, ?, ?, ?, ?, '')",
      [
        firstname,
        lastname,
        email,
        hashedPassword,
        imgurImage.data.link,
        oauth_service,
        oauth_service_id,
      ]
    );

    const token = generateToken({
      id: userOAuth.insertId,
      firstname,
      lastname,
      email,
      profile_picture,
    });

    const updateUser: MySQLResponse = await db.queryParams(
      "UPDATE Users SET token = ? WHERE id = ?",
      [token, userOAuth.insertId]
    );

    const users: User[] = await db.queryParams(
      "SELECT * FROM Users WHERE id = ?",
      [userOAuth.insertId]
    );
    return users[0];
  };
};

export default enrollment;
