import { Request, Response, NextFunction } from "express";
import ApplicationError from "../errors/application-error";
import logger from "../logger";

function applicationErrorHandler(
  err: ApplicationError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(err.stack);
  res.status(err.status || 500);
  res.send({
    err: {
      message: err.message
    }
  });
}

function errorHandler(
  err: Error
): void {
  logger.error(err.stack);
}

export { applicationErrorHandler, errorHandler };
