import { Schema, model } from 'mongoose';

export interface User {
  username: string;
  password: string;
  email: string;
}

const userSchema = new Schema<User>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

const userModel = model<User>('Users', userSchema);

export default userModel;
