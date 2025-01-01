import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import { usersController } from '../controllers';
import { authenticate } from '../middleware';
import { type User } from '../models';

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

  const { accessToken, refreshToken } = usersController.generateTokens(user._id);
  user.tokens.push(refreshToken);
  await user.save();

  res.status(200).send({ accessToken, refreshToken, _id: user._id });
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    const user = await usersController.verifyRefreshToken(refreshToken);

    res.sendStatus(200);
  } catch (err) {
    res.status(403).send('Invalid Request');
  }
});

router.post('/refresh-token', async (req, res) => {
  const { refreshToken: oldRefreshToken } = req.body;

  if (oldRefreshToken === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    const user = await usersController.verifyRefreshToken(oldRefreshToken);
    const { accessToken, refreshToken: newRefreshToken } = usersController.generateTokens(user._id);

    user.tokens.push(newRefreshToken);
    await user.save();

    res.status(200).send({ accessToken, refreshToken: newRefreshToken, _id: user._id });
  } catch (err) {
    res.status(403).send('Invalid Request');
  }
});

router.put('/', authenticate, upload.single('avatar'), async (req, res) => {
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
