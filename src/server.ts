/* eslint-disable import/first */
import dotenv from "dotenv";

import fs from "fs";

const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: ".env.default" });
}

import util from "util";
import mysql from "mysql2";
// import SafeMongooseConnection from "./lib/safe-mongoose-connection";

import https from "https";
import http from "http";
import logger from "./logger";
import app from "./app";
import { errorHandler } from "./middleware/error-middleware";
import ApplicationError from "./errors/application-error";

const PORT = process.env.PORT || 3000;

let debugCallback;
if (process.env.NODE_ENV === "development") {
  debugCallback = (collectionName: string, method: string, query: any, doc: string): void => {
    const message = `${collectionName}.${method}(${util.inspect(query, { colors: true, depth: null })})`;
    logger.log({
      level: "verbose",
      message,
      consoleLoggerOptions: { label: "MONGO" }
    });
  };
}

// const safeMongooseConnection = new SafeMongooseConnection({
//   mongoUrl: process.env.MONGO_URL ?? "",
//   debugCallback,
//   onStartConnection: mongoUrl => logger.info(`Connecting to MongoDB at ${mongoUrl}`),
//   onConnectionError: (error, mongoUrl) => logger.log({
//     level: "error",
//     message: `Could not connect to MongoDB at ${mongoUrl}`,
//     error
//   }),
//   onConnectionRetry: mongoUrl => logger.info(`Retrying to MongoDB at ${mongoUrl}`)
// });

// create a new MySQL connection
logger.info(`dbConnection(): ${JSON.stringify({
  host: process.env.DB_URL,
  port: Number(process.env.DB_PORT),
  user: "root",
  password: "[secret]",
  database: "moon"
})}`);
const dbConnection = mysql.createConnection({
  host: process.env.DB_URL,
  port: Number(process.env.DB_PORT),
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "moon"
});

const privateKey = fs.readFileSync("certs/privkey.pem", "utf8");
const certificate = fs.readFileSync("certs/fullchain.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

const serve = () => https.createServer(credentials, app).listen(PORT, () => {
  logger.info(`🌏 Express server (https) started at http://localhost:${PORT}`);

  if (process.env.NODE_ENV === "development") {
    // // This route is only present in development mode
    // logger.info(`⚙️  Swagger UI hosted at http://localhost:${PORT}/dev/api-docs`);
  }
});

// connect to the MySQL database
dbConnection.connect(error => {
  if (error) {
    logger.error("Error connecting to MySQL database:", error);
  } else {
    logger.info("Connected to MySQL database!");
    serve();
  }
});

process.on("uncaughtException", err => errorHandler(err));

// Close the Mongoose connection, when receiving SIGINT
process.on("SIGINT", async () => {
  console.log('\n'); /* eslint-disable-line */
  logger.info("Gracefully shutting down");
  // logger.info("Closing the MySQL connection");
  // try {
  //   await dbConnection.destroy();
  //   logger.info("MySQL connection closed successfully");
  // } catch (err) {
  //   logger.log({
  //     level: "error",
  //     message: "Error shutting closing MySQL connection",
  //     error: err
  //   });
  // }
  process.exit(0);
});

export {
  dbConnection
};
