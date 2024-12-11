import type { HydratedDocument } from 'mongoose';

import BaseController from './BaseController.js';

import userModel from '#root/models/users.js';
import type { User } from '#root/models/users.js';

type UserModel = typeof userModel;

class UsersController extends BaseController<User> {
  declare model: UserModel;

  constructor() {
    super(userModel);
  }

  async findOneByUsername(username: User['username']): Promise<HydratedDocument<User> | null> {
    return await this.model.find().byUsername(username);
  }
}

const usersController = new UsersController();

export default usersController;
