import { db } from "../db";
import { Request, Response } from "express";
import { auth } from "../middleware/auth";
import { returnCode } from "../utils/returnCodes";
const env = require("dotenv").config();

const authentificatedRoute = (app: any) => {
  app.post(
    "/authentificatedRoute",
    auth,
    async function (req: Request, res: Response) {
      // TODO
    }
  );
};

export default authentificatedRoute;
