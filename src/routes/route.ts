import { db } from "../db";
import { Request, Response } from "express";
import { returnCode } from "../utils/returnCodes";
const env = require("dotenv").config();

const route = (app: any) => {
  app.post("/route", async function (req: Request, res: Response) {
    // TODO
  });
};

export default route;
