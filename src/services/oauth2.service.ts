import OAuth2Server, { Request, Response } from "oauth2-server";
import { OAuth, OAuthClient, Users } from "models";

const server = new OAuth2Server({
  model: OAuth // See https://github.com/oauthjs/node-oauth2-server for specification
});

const authorize = async (req: Request, res: Response) => {
  const request = new Request(req);
  const response = new Response(res);
  return server
    .authorize(request, response, {
      authenticateHandler: {
        handle: async () => {
          // Present in Flow 1 and Flow 2 ('client_id' is a required for /oauth/authorize
          const { clientId } = req.query || {};
          if (!clientId) throw new Error("Client ID not found");
          const client = await OAuthClient.findOne({ clientId });
          if (!client) throw new Error("Client not found");
          // Only present in Flow 2 (authentication screen)
          const { userId } = req.auth || {};

          // At this point, if there's no 'userId' attached to the client or the request doesn't originate from an authentication screen, then do not bind this authorization code to any user, just the client
          if (!client.userId && !userId) return {}; // falsy value
          const user = null;
          if (!user) throw new Error("User not found");
          return { _id: user._id };
        }
      }
    })
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log("err", err);
      res.status(err.code || 500).json(err instanceof Error ? { error: err.message } : err);
    });
};

const token = (req: Request, res: Response) => {
  const request = new Request(req);
  const response = new Response(res);
  return server
    .token(request, response, { alwaysIssueNewRefreshToken: false })
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log("err", err);
      res.status(err.code || 500).json(err instanceof Error ? { error: err.message } : err);
    });
};

const authenticate = (req: Request, res: Response, next: Function) => {
  const request = new Request(req);
  const response = new Response(res);
  return server
    .authenticate(request, response)
    .then(data => {
      req.auth = { userId: data?.user?.id, sessionType: "oauth2" };
      next();
    })
    .catch(err => {
      console.log("err", err);
      res.status(err.code || 500).json(err instanceof Error ? { error: err.message } : err);
    });
};

const test = async (req: Request, res: Response) => {
  const { userId } = req.auth || {};
  if (!userId) throw new Error("User not found");
  const user = null;
  if (!user) throw new Error("User not found");
  res.json({ _id: user._id, username: user.username });
};

export {
  server, authorize, token, authenticate, test
};
