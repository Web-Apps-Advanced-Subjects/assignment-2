import express from 'express';
import { Types } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import postsController from '#root/controllers/PostsController.js';
import authenticateMiddleware from '#root/middleware/auth.js';
import type { Post } from '#root/models/posts.js';
import commentsController from '#root/controllers/CommentsController.js';
import likesController from '#root/controllers/LikesController.js';

const asyncUnlink = promisify(fs.unlink);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/media/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
const upload = multer({ storage: storage });
const router = express.Router();

router.get('/', authenticateMiddleware, async (req, res) => {
  const userID = req.query.userID as unknown as Types.ObjectId | undefined;

  if (userID !== undefined) {
    const posts = await postsController.getAllByUserID(userID);

    res.status(200).send(posts);
  } else {
    const posts = await postsController.getAll();

    res.status(200).send(posts);
  }
});

router.get('/:id', authenticateMiddleware, async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;
  const post = await postsController.findById(id);

  if (post !== null) {
    res.status(200).send(post);
  } else {
    res.status(404).send('Not Found');
  }
});

router.post('/', authenticateMiddleware, upload.single('media'), async (req, res) => {
  const { title, content } = req.body;
  // @ts-expect-error "user" was patched to the req object from the auth middleware
  const userID = req.user._id;
  const file = req.file;

  if (title === undefined) {
    if (file !== undefined) {
      await asyncUnlink(file.path);
    }

    res.status(400).send('Missing Arguments');
    return;
  }

  const media = file?.path.replaceAll(path.sep, path.posix.sep);

  try {
    const post = await postsController.create({ title, content, media, userID });

    res.status(201).send(post);
  } catch (err) {
    if (file !== undefined) {
      await asyncUnlink(file.path);
    }

    throw err;
  }
});

router.put('/:id', authenticateMiddleware, upload.single('media'), async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;
  const { title, content } = req.body;
  const file = req.file;

  const postParams: Partial<Post> = {};

  if (title !== undefined) {
    postParams['title'] = title;
  }
  if (content !== undefined) {
    postParams['content'] = content;
  }
  if (file !== undefined) {
    postParams['media'] = file.path.replaceAll(path.sep, path.posix.sep);
  }

  try {
    const post = await postsController.update(id, postParams);

    res.status(200).send(post);
  } catch (err) {
    if (file !== undefined) {
      await asyncUnlink(file.path);
    }

    throw err;
  }
});

router.delete('/:id', authenticateMiddleware, async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;

  const post = await postsController.findById(id);

  if (post !== null) {
    await commentsController.deleteByPostID(id);
    await likesController.deleteByPostID(id);
    await postsController.delete(id);

    if (post.media !== undefined) {
      await asyncUnlink(post.media);
    }

    res.status(200).send(post);
  } else {
    res.status(404).send('Not Found');
  }
});

export default router;
