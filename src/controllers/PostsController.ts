import postModel from '#root/models/posts.js';
import type { Post } from '#root/models/posts.js';
import BaseController from './BaseController.js';

type PostModel = typeof postModel;

class PostsController extends BaseController<Post> {
  constructor() {
    super(postModel);
  }

  async getAllByUserID(userID: Post['userID']): Promise<PostModel[]> {
    return await this.model.find({ userID: userID });
  }
}

const postsController = new PostsController();

export default postsController;
