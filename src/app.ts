import bodyParser from "body-parser";
import compression from "compression";
import path from "path";
import express, { Request, Response, NextFunction } from "express";
import routes from "./routes";
import logger from "./logger";
import { errorHandler } from "./middleware/error-middleware";

const app = express();

function logResponseTime(req: Request, res: Response, next: NextFunction) {
  const startHrTime = process.hrtime();

  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
    const message = `${req.method} ${res.statusCode} ${elapsedTimeInMs}ms\t${req.path}`;
    logger.log({
      level: "debug",
      message,
      consoleLoggerOptions: { label: "API" }
    });
  });

  next();
}

app.use(logResponseTime);

app.use(compression() as any);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

app.use((req, res, next) => {
  if (req.url === "/index.html") {
    res.header("Cross-Origin-Opener-Policy", "same-origin, same-origin-allow-popups");
  }

  next();
});

function checkCertificate(req: Request, res: Response, next: any) {
  if (req.path === "/health") return next();

  // dbConnection.query("SELECT AUTHORIZATION_KEY FROM USER WHERE NAME = 'me'", (err, result) => {
  //   if (err) throw err;
  //   logger.info(`result: ${JSON.stringify(result)}`);
  //   // logger.info(`fields: ${JSON.stringify(fields)}`);
  //   const token = req.headers.authorization?.split(" ")[1];
  //   logger.info(`token: ${token}`);
  //   logger.info(`result[0 as keyof typeof result]["AUTHORIZATION_KEY" as keyof typeof result]: ${result[0 as keyof typeof result]["AUTHORIZATION_KEY" as keyof typeof result]}`);
  //   if (result[0 as keyof typeof result]["AUTHORIZATION_KEY" as keyof typeof result] !== token) return res.status(404).end();
  //   return next();
  // });
  return next();
}

app.all("*", checkCertificate);

app.use(routes);

app.use(express.static(`${__dirname}/client`));

app.use(errorHandler);

export default app;
