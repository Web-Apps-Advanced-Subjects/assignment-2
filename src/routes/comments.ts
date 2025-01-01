import express from 'express';
import { Types, type HydratedDocument } from 'mongoose';

import { commentsController } from '../controllers';
import { authenticate } from '../middleware';
import { type Comment } from '../models';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const postID = req.query.postID as unknown as Types.ObjectId | undefined;
  const userID = req.query.userID as unknown as Types.ObjectId | undefined;
  let comments: HydratedDocument<Comment>[];

  if (postID !== undefined) {
    comments = await commentsController.getAllByPostID(postID);
  } else if (userID !== undefined) {
    comments = await commentsController.getAllByUserID(userID);
  } else {
    comments = await commentsController.getAll();
  }

  res.status(200).json({comments});
});

router.get('/count', authenticate, async (req, res) => {
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
    count = await commentsController.getNumberOfCommentsByUserID(userID);
  }

  res.status(200).json({ count });
});

router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;
  const post = await commentsController.findById(id);

  if (post !== null) {
    res.status(200).send(post);
  } else {
    res.status(404).send('not found');
  }
});

router.post('/', authenticate, async (req, res) => {
  const { content, postID } = req.body;

  if (content === undefined || postID === undefined) {
    res.status(400).send('Missing Arguments');
    return;
  }

  // @ts-expect-error "user" was patched to the req object from the auth middleware
  const comment = await commentsController.create({ content, postID, userID: req.user._id });

  res.status(201).send(comment);
});

router.put('/:id', authenticate, async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;
  const { content } = req.body;

  const commentParams: Partial<Comment> = {};

  if (content !== undefined) {
    commentParams['content'] = content;
  }

  const comment = await commentsController.update(id, commentParams);

  res.status(200).send(comment);
});

router.delete('/:id', authenticate, async (req, res) => {
  const id = req.params.id as unknown as Types.ObjectId;

  const post = await commentsController.delete(id);

  if (post !== null) {
    res.status(200).send(post);
  } else {
    res.status(404).send('not found');
  }
});

export default router;
