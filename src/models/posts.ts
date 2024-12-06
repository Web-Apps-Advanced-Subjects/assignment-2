import { Schema, Types, model } from 'mongoose';

export interface Post {
  title: string;
  content: string;
  userID: Types.ObjectId;
}

const postSchema = new Schema<Post>({
  title: {
    type: String,
    required: true,
  },
  content: { type: String, required: true },
  userID: {
    type: Schema.ObjectId,
    ref: 'Users',
  },
});

const postModel = model<Post>('Posts', postSchema);

export default postModel;
