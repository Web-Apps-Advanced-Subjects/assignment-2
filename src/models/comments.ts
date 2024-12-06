import { Schema, Types, model } from 'mongoose';

export interface Comment {
  comment: string;
  userID: Types.ObjectId;
  postID: Types.ObjectId;
}

const commentSchema = new Schema<Comment>({
  comment: {
    type: String,
    required: true,
  },
  userID: {
    type: Schema.ObjectId,
    ref: 'Users',
  },
  postID: {
    type: Schema.ObjectId,
    ref: 'Posts',
  },
});

const commentModel = model<Comment>('Comments', commentSchema);

export default commentModel;
