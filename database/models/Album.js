import mongoose, { Schema } from "mongoose";

const AlbumSchema = new Schema({
  title: String,
  description: String,
  images: [String],
  createdBy: String,
  genre: String,
  price: String,
});

const Album = mongoose.model("Album", AlbumSchema);

export default Album;
