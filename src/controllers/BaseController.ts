import { Model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(): Promise<HydratedDocument<T>[]> {
    return await this.model.find();
  }

  async getById(id: unknown): Promise<HydratedDocument<T> | null> {
    return await this.model.findById(id);
  }

  async create(datum: T): Promise<HydratedDocument<T> | null> {
    return await this.model.create(datum);
  }

  async delete(id: unknown): Promise<HydratedDocument<T> | null> {
    return await this.model.findByIdAndDelete(id);
  }
}

export default BaseController;
