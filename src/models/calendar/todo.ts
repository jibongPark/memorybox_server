import { Schema, model, Document } from "mongoose";
import { encrypt, decrypt } from "../../lib/crypto";

interface Todo extends Document {
    author: Schema.Types.ObjectId;
    title: string;
    endDate: Date;
    memo: string;
    isDone: boolean;
    color: number;
    shared: Schema.Types.ObjectId[];
}

const TodoSchema = new Schema<Todo>({
    author: {
    type:    Schema.Types.ObjectId,
    ref:     "User",
    required:true,
    },
    title: {
    type:    String,
    set: (v: string) => encrypt(v, 'calendar'),
    get: (v: string) => decrypt(v, 'calendar'),
    required:true,
    },
    memo: {
    type:    String,
    set: (v: string) => encrypt(v, 'calendar'),
    get: (v: string) => decrypt(v, 'calendar'),
    default: "",
    },
    endDate: {
    type:    Date,
    required:true,
    },
    isDone: {
    type:    Boolean,
    default: false,
    },
    color: {
    type:    Number,
    required:true,
    },
    shared: [
    {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    ],
});
  
TodoSchema.index({ shared: 1 });

export const TodoModel = model<Todo>("Todo", TodoSchema);