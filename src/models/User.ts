import mongoose, { Document, Types } from "mongoose"

export interface IUser extends Document {
  name: string
  password: string
  active: boolean
  roles?: Types.Array<string>
  refreshToken: Types.Array<string>
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: [
    {
      type: String,
      default: "User",
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
})

export const User = mongoose.model<IUser>("User", userSchema)
