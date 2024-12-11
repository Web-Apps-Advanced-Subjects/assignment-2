import express from 'express';
import { Types, type HydratedDocument } from 'mongoose';

import commentsController from '#root/controllers/CommentsController.js';
import authenticateMiddleware from '#root/middleware/auth.js';
import type { Comment } from '#root/models/comments.js';

const router = express.Router();

router.get('/', authenticateMiddleware, async (req, res) => {
  const postID = req.query.postID as unknown as Types.ObjectId | undefined;
  const userID = req.query.postID as unknown as Types.ObjectId | undefined;
  let comments: HydratedDocument<Comment>[];

  if (postID !== undefined) {
    comments = await commentsController.getAllByPostID(postID);
  } else if (userID !== undefined) {
    comments = await commentsController.getAllByUserID(userID);
  } else {
    comments = await commentsController.getAll();
  }

  res.status(200).send(comments);
});

router.get('/count', authenticateMiddleware, async (req, res) => {
  const postID = req.query.postID as unknown as Types.ObjectId | undefined;
  const userID = req.query.postID as unknown as Types.ObjectId | undefined;
  let count: number;

  if (postID === undefined || userID === undefined) {
    res.status(400).send('Missing Arguments');
    return;
  }

  if (postID !== undefined) {
    count = await commentsController.getNumberOfCommentsByPostID(postID);
  } else {
    count = await commentsController.getNumberOfCommentsByPostID(userID);
  }

  res.status(200).json({ count });
});

router.get('/:id', authenticateMiddleware, async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;
  const post = await commentsController.findById(id);

  if (post !== null) {
    res.status(200).send(post);
  } else {
    res.status(404).send('not found');
  }
});

router.post('/', authenticateMiddleware, async (req, res) => {
  const { content, postID } = req.body;

  if (content === undefined || postID === undefined) {
    res.status(400).send('Missing Arguments');
    return;
  }

  // @ts-expect-error "user" was patched to the req object from the auth middleware
  const post = await commentsController.create({ content, postID, userID: req.user._id });

  res.status(201).send(post);
});

router.put('/:id', authenticateMiddleware, async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;
  const postParams = req.body;

  const post = await commentsController.update(id, postParams);

  res.status(200).send(post);
});

router.delete('/:id', authenticateMiddleware, async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;

  const post = await commentsController.delete(id);

  if (post !== null) {
    res.status(200).send(post);
  } else {
    res.status(404).send('not found');
  }
});

export default router;
