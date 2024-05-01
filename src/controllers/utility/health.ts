import { Request, RequestHandler } from 'express';
import Joi from 'joi';
import requestMiddleware from '../../middleware/request-middleware';

export const addBookSchema = Joi.object().keys({
  name: Joi.string().required(),
  author: Joi.string().required()
});

interface AddReqBody {
  name: string;
  author: string;
}

const health: RequestHandler = async (req: Request<{}, {}, AddReqBody>, res) => {

  res.send({
    result: 'OK',
  });
};

export default requestMiddleware(health);
