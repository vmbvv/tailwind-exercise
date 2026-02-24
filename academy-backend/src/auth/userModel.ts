import { Document, model, Schema } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

export const Users = model<IUserDocument>("users", UserSchema);
