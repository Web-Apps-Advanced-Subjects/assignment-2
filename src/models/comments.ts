import { Schema, Types, model } from 'mongoose';
import type { Model, HydratedDocument, QueryWithHelpers } from 'mongoose';

export interface Comment {
  comment: string;
  userID: Types.ObjectId;
  postID: Types.ObjectId;
}

interface CommentQueryHelpers {
  byPostID(
    postID: Comment['postID'],
  ): QueryWithHelpers<HydratedDocument<Comment>[], HydratedDocument<Comment>, CommentQueryHelpers>;
}

type CommentModelType = Model<Comment, CommentQueryHelpers>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const commentSchema = new Schema<Comment, CommentModelType, {}, CommentQueryHelpers>({
  comment: { type: String, required: true },
  userID: { type: Schema.ObjectId, ref: 'users' },
  postID: { type: Schema.ObjectId, ref: 'posts' },
});

commentSchema.query.byPostID = function byUsername(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: QueryWithHelpers<any, HydratedDocument<Comment>, CommentQueryHelpers>,
  postID: Comment['postID'],
) {
  return this.find({ postID });
};

export default model<Comment, CommentModelType>('comments', commentSchema);
