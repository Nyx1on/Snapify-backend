import mongoose, { Schema } from "mongoose";

const AlbumSchema = new Schema({
  title: String,
  images: [String],
  createdBy: String,
  story: String,
  prompt: String,
});

const Album = mongoose.model("Album", AlbumSchema);

export default Album;
