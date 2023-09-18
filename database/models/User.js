import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  type: String,
});

const User = mongoose.model("User", UserSchema);

export default User;
