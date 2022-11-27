import mongoose, { Document } from "mongoose"
import { IUser } from "./User"

const AutoIncrement = require("mongoose-sequence")(mongoose)

interface INote extends Document {
  user: IUser["_id"]
  title: string
  text: string
  completed: boolean
}

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
})

export const Note = mongoose.model<INote>("Note", noteSchema)
