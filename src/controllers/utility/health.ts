import { Request, RequestHandler } from "express";
import Joi from "joi";
import requestMiddleware from "../../middleware/request-middleware";
import { dbConnection } from "../../server";
import logger from "../../logger";

export const addBookSchema = Joi.object().keys({
  name: Joi.string().required(),
  author: Joi.string().required()
});

interface AddReqBody {
  name: string;
  author: string;
}

const health: RequestHandler = async (req: Request<{}, {}, AddReqBody>, res, next) => {
  dbConnection.query("SELECT * FROM USER", (err, result) => {
    if (err) return next(err);
    logger.info(`result: ${JSON.stringify(result)}`);
    // result.;
    return res.send("OK");
  });
};

export default requestMiddleware(health);
