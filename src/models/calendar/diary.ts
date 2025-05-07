import { Schema, model } from "mongoose";
import { encrypt, decrypt } from "../../lib/crypto";

interface Diary {
    author: Schema.Types.ObjectId;
    date: Date;
    content: string;
    shared: Schema.Types.ObjectId[];
}

const DiarySchema = new Schema<Diary>(
    {
      author: {
        type:    Schema.Types.ObjectId,
        ref:     "User",
        required:true,
      },
      date: {
        type:    Date,
        required:true,
      },
      content: {
        type:    String,
        set: (v: string) => encrypt(v, 'calendar'),
        get: (v: string) => decrypt(v, 'calendar'),
        default: "",
      },
      shared: [
        {
          type:    Schema.Types.ObjectId,
          ref:     "User",
        },
      ],
    }
  );
  
  DiarySchema.index({ shared: 1 });
  
  export const DiaryModel = model<Diary>("Diary", DiarySchema);