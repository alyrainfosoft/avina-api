import express from "express";
import cors from "cors";
import http from "http";
import { PORT, DB_HOST, DB_NAME } from "./env.var";
import routes from "../routes/index.route";
import { bodyDecipher } from "../middlewares/req-res-encoder";
import { tokenVerification, tokenVerificationForV4 } from "../middlewares/authenticate";
import routesVersionTwo from "../version-2/routes/index.route";
import routesVersionThree from "../version-3/routes/index.route";
import routesVersionFour from '../version-4/routes/index.route';
import webhookRoute from "../version-4/routes/webhook.route";
import adminRouteForV4 from "../version-4/routes/admin/index.route";
import userRouteForV4 from "../version-4/routes/user/index.route";
const compression = require('compression')
const os = require('os');
const cluster = require('cluster');
const numCPUs = os.cpus().length;

export default async ({ app }: { app: express.Application }) => {
  app.use(express.json({ limit: "200mb", }));
  app.use(compression())
  app.use(express.urlencoded({ limit: "200mb", extended: true }));
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(express.static("public"));
  app.use("/api/webhook", webhookRoute());
  app.use("/images", express.static("images"));
  app.use("/api", [bodyDecipher, tokenVerification], routes());
  app.use("/api/v2", [bodyDecipher, tokenVerification], routesVersionTwo());
  app.use("/api/v3", [bodyDecipher, tokenVerification], routesVersionThree());
  app.use("/api/v4", [bodyDecipher, tokenVerificationForV4], routesVersionFour());
  app.use("/api/v4/admin", [bodyDecipher, tokenVerificationForV4], adminRouteForV4());
  app.use("/api/v4/user", [bodyDecipher, tokenVerificationForV4], userRouteForV4());
  startServer(app);
  // await updateCurrencyRatesViaCronJob();
};

const startServer = (app: express.Application) => {
console.log("-------------------", numCPUs)

  if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart on worker exit
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
  } else {
   let port = PORT.toString();
  app.set("port", port);
  let server = http.createServer(app);
  server.listen(port);
  server.timeout = 450 * 1000;

  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe  ${addr}` : `port-${port}`;
  console.log(
    `🛡️   Server listening on ${bind} 🛡️ HOST : ${DB_HOST} DB : ${DB_NAME} `
  );  
}
 
};

