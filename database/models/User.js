import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  type: String,
});

const User = mongoose.model("User", UserSchema);

export default User;
