import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import usersController from '#root/controllers/UsersController.js';
import authenticateMiddleware from '#root/middleware/auth.js';
import type { User } from '#root/models/users.js';

const asyncUnlink = promisify(fs.unlink);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/avatars/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
const upload = multer({ storage: storage });
const router = express.Router();

router.post('/register', upload.single('avatar'), async (req, res) => {
  const { username, password, email } = req.body;
  const file = req.file;

  if (
    username === undefined ||
    password === undefined ||
    email === undefined ||
    file === undefined
  ) {
    if (file !== undefined) {
      await asyncUnlink(file.path);
    }

    res.status(400).send('Missing Arguments');
    return;
  }

  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
    await asyncUnlink(file.path);

    res.status(400).send('File Type Unsupported');
    return;
  }

  try {
    let user = await usersController.findOneByUsername(username);

    if (user !== null) {
      await asyncUnlink(file.path);

      res.status(409).send('Username Taken');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatar = file.path.replaceAll(path.sep, path.posix.sep);
    user = await usersController.create({
      username,
      password: hashedPassword,
      email,
      avatar,
      tokens: [],
    });

    res.status(201).send(user);
  } catch (err) {
    await asyncUnlink(file.path);

    throw err;
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === undefined || password === undefined) {
    res.status(400).send('Missing Arguments');
    return;
  }

  const user = await usersController.findOneByUsername(username);

  if (user === null) {
    res.status(401).json({ error: 'Authentication failed' });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    res.status(401).json({ error: 'Authentication failed' });
    return;
  }

  const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION as string,
  });
  const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION as string,
  });

  user.tokens.push(refreshToken);
  await user.save();

  res.status(200).send({ accessToken, refreshToken });
});

router.post('/refresh-token', async (req, res) => {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];

  if (token === undefined) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string, async (err, userInfo) => {
    if (err) {
      res.sendStatus(403).send(err.message);
      return;
    }

    // @ts-expect-error no proper way to type inference to userInfo returned inside the cb
    const userID = userInfo._id;

    try {
      const user = await usersController.findById(userID);

      if (user === null) {
        res.status(403).send('Invalid Request');
        return;
      }

      if (!user.tokens.includes(token)) {
        user.tokens = []; // invalidate user tokens
        await user.save();

        res.status(403).send('Invalid Request');
        return;
      }

      const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: process.env.JWT_TOKEN_EXPIRATION as string,
      });
      const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: process.env.JWT_TOKEN_EXPIRATION as string,
      });

      user.tokens[user.tokens.indexOf(token)] = refreshToken;

      await user.save();

      res.status(200).send({ accessToken, refreshToken });
    } catch (err) {
      res.status(500).send(err);
    }
  });
});

router.post('/logout', async (req, res) => {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];

  if (token === undefined) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string, async (err, userInfo) => {
    if (err) {
      res.sendStatus(403).send(err.message);
      return;
    }

    // @ts-expect-error no proper way to type inference to userInfo returned inside the cb
    const userID = userInfo._id;

    try {
      const user = await usersController.findById(userID);

      if (user === null) {
        res.status(403).send('Invalid Request');
        return;
      }

      if (!user.tokens.includes(token)) {
        user.tokens = []; // invalidate user tokens
        await user.save();

        res.status(403).send('Invalid Request');
        return;
      }

      user.tokens.splice(user.tokens.indexOf(token), 1);
      await user.save();

      res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err);
    }
  });
});

router.put('/', authenticateMiddleware, upload.single('avatar'), async (req, res) => {
  const { username } = req.body;
  const file = req.file;
  // @ts-expect-error "user" was patched to the req object from the auth middleware
  const userID = req.user._id;
  const params: Partial<User> = {};

  if (username === undefined && file === undefined) {
    res.status(400).send('Missing Arguments');
    return;
  }

  if (username !== undefined) {
    params['username'] = username;
  }

  if (file !== undefined) {
    params['avatar'] = file.path.replaceAll(path.sep, path.posix.sep);
  }

  const user = await usersController.update(userID, params);

  res.status(200).send(user);
});

export default router;
