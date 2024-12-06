import { Schema, Types, model } from 'mongoose';
import type { Model, HydratedDocument, QueryWithHelpers } from 'mongoose';

export interface Post {
  title: string;
  content: string;
  userID: Types.ObjectId;
}

interface PostQueryHelpers {
  byUserID(
    userID: Post['userID'],
  ): QueryWithHelpers<HydratedDocument<Post>[], HydratedDocument<Post>, PostQueryHelpers>;
}

type PostModelType = Model<Post, PostQueryHelpers>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const postSchema = new Schema<Post, PostModelType, {}, PostQueryHelpers>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userID: { type: Schema.ObjectId, ref: 'users' },
});

postSchema.query.byUserID = function byUserID(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: QueryWithHelpers<any, HydratedDocument<Post>, PostQueryHelpers>,
  userID: Post['userID'],
) {
  return this.find({ userID });
};

export default model<Post, PostModelType>('posts', postSchema);
