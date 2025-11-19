import express from "express";
import cors from "cors";
import http from "http";
import { PORT, DB_HOST, DB_NAME } from "./env.var";
import { bodyDecipher } from "../middlewares/req-res-encoder";
import {  tokenVerificationForV4 } from "../middlewares/authenticate";
import routesVersionFour from '../version-one/routes/index.route';
import webhookRoute from "../version-one/routes/webhook.route";
import adminRouteForV4 from "../version-one/routes/admin/index.route";
import userRouteForV4 from "../version-one/routes/user/index.route";
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
  app.use("/api/v1", [bodyDecipher, tokenVerificationForV4], routesVersionFour());
  app.use("/api/v1/admin", [bodyDecipher, tokenVerificationForV4], adminRouteForV4());
  app.use("/api/v1/user", [bodyDecipher, tokenVerificationForV4], userRouteForV4());
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

