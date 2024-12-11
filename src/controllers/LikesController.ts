import BaseController from './BaseController.js';

import likeModel from '#root/models/likes.js';
import type { Like } from '#root/models/likes.js';
import type { DeleteMany } from '#root/types/mongooseUtils.js';

type LikeModel = typeof likeModel;

class LikesController extends BaseController<Like> {
  declare model: LikeModel;

  constructor() {
    super(likeModel);
  }

  async deleteByPostID(postID: Like['_id']['postID']): Promise<DeleteMany> {
    return await this.model.find({ '_id.postID': postID }).deleteMany();
  }
}

const likesController = new LikesController();

export default likesController;
