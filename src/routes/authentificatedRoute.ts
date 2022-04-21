import { db } from "../db";
import { auth } from "../middleware/auth";
import { Res, returnCode } from "../utils/returnCodes";
const env = require("dotenv").config();

const authentificatedRoute = (app: any) => {
  app.post("/authentificatedRoute", auth, async function (req: any, res: Res) {
    // TODO
  });
};

export default authentificatedRoute;
