import express from 'express';
import { Types } from 'mongoose';

import { likesController } from '../controllers';
import { authenticate } from '../middleware';

const router = express.Router();

router.get('/:postID', authenticate, async (req, res) => {
  const postID = req.params.postID as unknown as Types.ObjectId;
  // @ts-expect-error "user" was patched to the req object from the auth middleware
  const userID = req.user._id;
  const like = await likesController.findById({ userID, postID });

  res.status(200).json({ liked: like !== null });
});

router.post('/:postID', authenticate, async (req, res) => {
  const postID = req.params.postID as unknown as Types.ObjectId;
  // @ts-expect-error "user" was patched to the req object from the auth middleware
  const userID = req.user._id;

  if ((await likesController.findById({ userID, postID })) !== null) {
    res.status(409).send('Post Already Liked');
    return;
  }

  const like = await likesController.create({ _id: { userID, postID } });

  res.status(201).send(like);
});

router.delete('/:postID', authenticate, async (req, res) => {
  const postID = req.params.postID as unknown as Types.ObjectId;
  // @ts-expect-error "user" was patched to the req object from the auth middleware
  const userID = req.user._id;
  const like = await likesController.delete({ userID, postID });

  if (like !== null) {
    res.status(200).send(like);
  } else {
    res.status(404).send('Not Found');
  }
});

export default router;
