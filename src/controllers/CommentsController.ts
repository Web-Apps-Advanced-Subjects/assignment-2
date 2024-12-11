import type { HydratedDocument } from 'mongoose';

import BaseController from './BaseController.js';

import commentModel from '#root/models/comments.js';
import type { Comment } from '#root/models/comments.js';
import type { DeleteMany } from '#root/types/mongooseUtils.js';

type CommentModel = typeof commentModel;

class CommentsController extends BaseController<Comment> {
  declare model: CommentModel;
  constructor() {
    super(commentModel);
  }

  async getAllByPostID(postID: Comment['postID']): Promise<HydratedDocument<Comment>[]> {
    return await this.model.find().byPostID(postID);
  }

  async getAllByUserID(userID: Comment['userID']): Promise<HydratedDocument<Comment>[]> {
    return await this.model.find().byUserID(userID);
  }

  async getNumberOfCommentsByPostID(postID: Comment['postID']): Promise<number> {
    return await this.model.find().byPostID(postID).countDocuments();
  }

  async getNumberOfCommentsByUserID(userID: Comment['userID']): Promise<number> {
    return await this.model.find().byUserID(userID).countDocuments();
  }

  async deleteByPostID(postID: Comment['postID']): Promise<DeleteMany> {
    return await this.model.find().byPostID(postID).deleteMany();
  }
}

const commentsController = new CommentsController();

export default commentsController;
