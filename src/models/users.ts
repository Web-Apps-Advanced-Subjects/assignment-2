import { Schema, model } from 'mongoose';
import type { Model, HydratedDocument, QueryWithHelpers } from 'mongoose';

export interface User {
  username: string;
  password: string;
  email: string;
}

interface UserQueryHelpers {
  byUsername(
    username: User['username'],
  ): QueryWithHelpers<HydratedDocument<User> | null, HydratedDocument<User>, UserQueryHelpers>;
}

type UserModelType = Model<User, UserQueryHelpers>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const UserSchema = new Schema<User, UserModelType, {}, UserQueryHelpers>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

UserSchema.query.byUsername = function byUsername(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: QueryWithHelpers<any, HydratedDocument<User>, UserQueryHelpers>,
  username: User['username'],
) {
  return this.findOne({ username });
};

export default model<User, UserModelType>('users', UserSchema);
