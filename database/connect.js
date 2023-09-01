import mongoose from "mongoose";

const connectDB = async (url) => {
  mongoose.connect(url).then("MongoDB connection successful");
};

export default connectDB;
