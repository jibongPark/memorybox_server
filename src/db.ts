import mongoose, { Schema, model } from "mongoose";


const MONGO_URI = "mongodb://localhost:27017/myappdb"

export async function connectDB() {
  await mongoose.connect(MONGO_URI);

  console.log("mongoose state: ", mongoose.connection.readyState)
  return mongoose.connection.readyState; // 1 = connected
}

// interface Friend {
//   friendId: Schema.Types.ObjectId;
//   status: "pending" | "accepted" | "blocked";
//   date: Date;
// }

// interface Invite {
//   token: string;
//   createdAt: Date;
//   expiresAt: Date;
// }

// interface UserDoc {
//   type: "kakao" | "apple";
//   name: string;
//   friends: Friend[];
//   invites: Invite[];
// }

// const FriendSchema = new Schema<Friend>({
//   friendId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
//   status:     { type: String, enum: ["pending","accepted","blocked"], required: true },
//   date:       { type: Date, default: () => new Date() },
// });

// const InviteSchema = new Schema<Invite>({
//   token:      { type: String, required: true, unique: true },
//   createdAt:  { type: Date, default: () => new Date() },
//   expiresAt:  { type: Date, required: true },
// });

// const UserSchema = new Schema<UserDoc>({
//   type:    { type: String, enum: ["kakao","apple"], required: true },
//   name:    { type: String, required: true },
//   friends: { type: [FriendSchema], default: [] },
//   invites: { type: [InviteSchema], default: [] },
// });

// export const User = model<UserDoc>("User", UserSchema);

// interface ScheduleDoc {
//   author:   Schema.Types.ObjectId;
//   startDate: Date;
//   endDate:   Date;
//   title:     string;
//   color:     number;
// }

// const ScheduleSchema = new Schema<ScheduleDoc>({
//   author:    { type: Schema.Types.ObjectId, ref: "User", required: true },
//   startDate: { type: Date, required: true },
//   endDate:   { type: Date, required: true },
//   title:     { type: String, required: true },
//   color:     { type: Number, required: true },
// });

// export const Schedule = model<ScheduleDoc>("Schedule", ScheduleSchema);
