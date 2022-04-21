import { db } from "../db";
import { Res, returnCode } from "../utils/returnCodes";
const env = require("dotenv").config();

const route = (app: any) => {
  app.post("/route", async function (req: any, res: Res) {
    // TODO
  });
};

export default route;
