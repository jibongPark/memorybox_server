import { Schema, model, Types, Document } from "mongoose"
import { encrypt, decrypt } from "../../lib/crypto";

export interface Schedule extends Document {
    author: Schema.Types.ObjectId;
    title: string;
    startDate: Date;
    endDate: Date;
    memo: string;
    color: number;
    shared: Schema.Types.ObjectId[];
}

const ScheduleSchema = new Schema<Schedule>(
    {
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
      startDate: {
        type:    Date,
        required:true,
      },
      endDate: {
        type:    Date,
        required:true,
      },
      memo: {
        type:    String,
        set: (v: string) => encrypt(v, 'calendar'),
        get: (v: string) => decrypt(v, 'calendar'),
        default: "",
      },
      color: {
        type:    Number,
        required:true,
      },
      shared: [
        {
          type:    Schema.Types.ObjectId,
          ref:     "User",
        },
      ],
    },
    {
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
    });

    ScheduleSchema.index({ shared: 1 });

export const ScheduleModel = model<Schedule>("Schedule", ScheduleSchema);