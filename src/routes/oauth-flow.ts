import express from "express";
import * as Oauth2Service from "../controllers/oauth2";

const router = express.Router();

router.get("/authorize", Oauth2Service.authorize);
// router.post("/token", Oauth2Service.token);
// router.get("/authenticate", Oauth2Service.authenticate, Oauth2Service.test);

export default router;
