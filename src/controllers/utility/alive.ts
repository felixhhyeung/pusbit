import { RequestHandler } from "express";
import dayjs from "dayjs";
import requestMiddleware from "../../middleware/request-middleware";
// import Book from "../../models/Book";
import { dbConnection } from "../../server";
import logger from "../../logger";

const alive: RequestHandler = async (req, res, next) => {
  // const books = await Book.find();
  dbConnection.query(`UPDATE CONFIG SET VALUE = '${dayjs().unix()}' WHERE NAME = 'LAST_ALIVE'`, (err, result) => {
    if (err) throw err;
    logger.info(`result: ${JSON.stringify(result)}`);
    // result.;
  });
  res.send({
    result: "OK"
  });
};

export default requestMiddleware(alive);
