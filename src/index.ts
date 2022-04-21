import { getRoutes } from "./services/routes";
import { webServices } from "./services/web";

const env = require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static(__dirname, { dotfiles: "allow" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.raw({ limit: "50mb" }));
app.disable("etag"); // No caching
app.use((req: any, res: any, next: any) => {
  res.append("version", process.env.VERSION);
  res.append("Access-Control-Allow-Origin", "*");
  res.append("Access-Control-Allow-Headers", "*");
  next();
});

app.get("/", function (req: any, res: any) {
  res.status(200).json({ "server-name": { version: process.env.VERSION } });
});

const routes = getRoutes();
routes.forEach((route: string) => {
  import("./routes/" + route).then((r: any) => {
    r.default(app);
  });
});

webServices({ app: app, usingHttps: false, httpsDomain: "" });
