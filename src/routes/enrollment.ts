import { db } from "../db";
import { Request, Response } from "express";
import { User } from "../utils/user/interfaces";
import { userReturnCode } from "../utils/user/returnCodes";
import { returnCode } from "../utils/returnCodes";
import { generateToken } from "../utils/jwt";
import { ImgurAPIResponse, MySQLResponse } from "../utils/interfaces";
import { pwdUtils } from "../utils/password";
import { ImgurClient } from "imgur";

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
    if (!firstname || !lastname || !email || !password || !profile_picture) {
      res
        .status(returnCode.missingParameters.code)
        .json(returnCode.missingParameters.payload);
    } else if (oauth_service && oauth_service_id) {
      const userOAuth: User[] = await db.queryParams(
        "SELECT * FROM Users WHERE oauth_service = ? AND oauth_service_id = ? AND email = ?",
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
        res.status(200).json(user);
      }
    }
  });
};

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
  const imgurImage = await uploadImage(profile_picture);
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

const uploadImage = async (image: string) => {
  // https://www.npmjs.com/package/imgur
  const client = new ImgurClient({ clientId: process.env.IMGUR_CLIENT_ID });

  // @ts-ignore
  const response: ImgurAPIResponse = await client.upload({
    image: image.replace(/^data:image\/[a-z]+;base64,/, ""),
    type: "base64",
  });

  console.log(response.data.link);
  return response;
};

export default enrollment;
