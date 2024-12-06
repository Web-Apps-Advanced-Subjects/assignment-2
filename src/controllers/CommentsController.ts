import commentModel from '#root/models/comments.js';
import type { Comment } from '#root/models/comments.js';
import BaseController from './BaseController.js';

type CommentModel = typeof commentModel;

class CommentsController extends BaseController<Comment> {
  declare model: CommentModel;
  constructor() {
    super(commentModel);
  }

  async getAllByPostID(postID: Comment['postID']): Promise<Comment[]> {
    return await this.model.find().byPostID(postID);
  }
}

const commentsController = new CommentsController();

export default commentsController;
