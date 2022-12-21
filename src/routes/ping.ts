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

const ping = (app: any) => {
  app.get("/ping", async function (req: Request, res: Response) {
    res.status(200).json({ message: "pong" });
  });
};

export default ping;
