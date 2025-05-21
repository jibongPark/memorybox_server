import { Schema, model, Document } from "mongoose";
import { encrypt, decrypt } from "../../lib/crypto";

export interface Diary extends Document {
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
    }, {
      toJSON: {
        getters: true,
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret) => {
          ret.id = ret._id;
          delete ret._id;
        }
      },
      timestamps: true
    }
  );
  
  DiarySchema.index({ shared: 1 });
  
  export const DiaryModel = model<Diary>("Diary", DiarySchema);