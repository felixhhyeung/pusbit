/* eslint-disable import/first */
import dotenv from "dotenv";

const result = dotenv.config();
if (result.error) {
  dotenv.config({ path: ".env.default" });
}

import util from "util";
import mysql from "mysql2";
import app from "./app";
// import SafeMongooseConnection from "./lib/safe-mongoose-connection";
import logger from "./logger";

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

const serve = () => app.listen(PORT, () => {
  logger.info(`🌏 Express server started at http://localhost:${PORT}`);

  if (process.env.NODE_ENV === "development") {
    // This route is only present in development mode
    logger.info(`⚙️  Swagger UI hosted at http://localhost:${PORT}/dev/api-docs`);
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

// Close the Mongoose connection, when receiving SIGINT
process.on("SIGINT", async () => {
  console.log('\n'); /* eslint-disable-line */
  logger.info("Gracefully shutting down");
  logger.info("Closing the MongoDB connection");
  try {
    await dbConnection.destroy();
    logger.info("MySQL connection closed successfully");
  } catch (err) {
    logger.log({
      level: "error",
      message: "Error shutting closing MySQL connection",
      error: err
    });
  }
  process.exit(0);
});

export {
  dbConnection
};
