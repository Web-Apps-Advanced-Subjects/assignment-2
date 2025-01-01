import type { HydratedDocument } from 'mongoose';

import BaseController from './BaseController';

import { postModel, type Post } from '../models';

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
