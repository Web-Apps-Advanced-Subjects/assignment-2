import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];

  if (token === undefined) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err) {
      res.status(403).send(err.message);
      return;
    }

    // @ts-expect-error "patching" user to the req object
    req.user = user;
    next();
  });
};

export default authenticate;
