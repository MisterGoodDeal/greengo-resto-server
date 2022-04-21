import {WebService} from '../utils/interfaces';
const env = require("dotenv").config();
const http = require("http");
const https = require("https");
const fs = require("fs");

export const webServices = ({app, usingHttps, httpsDomain}: WebService) => {
  // Starting both http & https servers
  const httpServer = http.createServer(app);
  httpServer.listen(process.env.HTTP_EXPRESS_PORT, () => {
    console.log(`HTTP Server running on port ${process.env.HTTP_EXPRESS_PORT}`);
  });

  if (usingHttps) {
    // Certbot Certifiates
    const privateKey = fs.readFileSync(
      `/etc/letsencrypt/live/${httpsDomain ?? ""}/privkey.pem`,
      "utf8"
    );
    const certificate = fs.readFileSync(
      `/etc/letsencrypt/live/${httpsDomain ?? ""}/cert.pem`,
      "utf8"
    );
    const ca = fs.readFileSync(
      `/etc/letsencrypt/live/${httpsDomain ?? ""}/chain.pem`,
      "utf8"
    );

    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca,
    };
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(process.env.HTTPS_EXPRESS_PORT, () => {
    console.log(`HTTPS Server running on port ${process.env.HTTPS_EXPRESS_PORT}`);
  });
  }  
}