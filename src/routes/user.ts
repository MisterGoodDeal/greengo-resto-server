import { db } from "../db";
import { Request, Response } from "express";
import { User } from "../utils/user/interfaces";
import { userReturnCode } from "../utils/user/returnCodes";
import { returnCode } from "../utils/returnCodes";
import { generateToken } from "../utils/jwt";
import { MySQLResponse } from "../utils/interfaces";
import { pwdUtils } from "../utils/password";
import { images } from "../helpers/images.helpers";
import { auth } from "../middleware/auth";

const env = require("dotenv").config();

const user = (app: any) => {
  // Edit the user
  app.put("/user/edit", auth, async function (req: Request, res: Response) {
    const partialUser: Partial<User> = req.body;
    // @ts-ignore
    const { id } = req.user;

    const user: User[] = await db.queryParams(
      "SELECT * FROM Users WHERE id = ?",
      [id]
    );
    res.status(200).json({ query: userQueryBuilder(partialUser) });
    // if (user.length === 0) {
    //   const user: User = await db.queryParams(
    //     "UPDATE Users SET ? WHERE id = ?",
    //     [partialUser, id]
    //   );
    //   res.status(200).json(user);
    // } else {
    //   res
    //     .status(returnCode.unknownUser.code)
    //     .json(returnCode.unknownUser.payload);
    // }
  });
};

const userQueryBuilder = (user: Partial<User>) => {
  const query = Object.keys(user)
    .map(
      (key) =>
        `${key} = ${
          // @ts-ignore
          typeof user[key] === "string" ? `'${user[key]}'` : user[key]
        }`
    )
    .join(", ");
  return query;
};

export default user;
