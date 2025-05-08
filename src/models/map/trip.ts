import { Schema, model, Document } from "mongoose";

export interface TripImage {
    filename: string;
    order: number;
}

interface Trip extends Document {
    author: Schema.Types.ObjectId;
    images: TripImage[];
    thumbImage: string;
    startDate: Date;
    endDate: Date;
    memo: string;
    sigunguCode: number;
    centerX: number;
    centerY: number;
}

const TripImageSchema = new Schema<TripImage>(
    {
      filename: { type: String, required: true },
      order: { type: Number, required: true },
    },
    { _id: false }
);


const TripSchema = new Schema<Trip>(
    {
    author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    images: { type: [TripImageSchema], defulat: []},
    thumbImage: { type: String , required: true},
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    memo: { type: String },
    sigunguCode: { type: Number, required: true },
    centerX: { type: Number, required: true },
    centerY: { type: Number, required: true },
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

export const TripModel = model<Trip>('Trip', TripSchema);