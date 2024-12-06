import postModel from '#root/models/posts.js';
import type { Post } from '#root/models/posts.js';
import type { HydratedDocument } from 'mongoose';
import BaseController from './BaseController.js';

type PostModel = typeof postModel;

class PostsController extends BaseController<Post> {
  declare model: PostModel;

  constructor() {
    super(postModel);
  }

  async getAllByUserID(userID: Post['userID']): Promise<HydratedDocument<Post>[]> {
    return await this.model.find().byUserID(userID);
  }
}

const postsController = new PostsController();

export default postsController;
