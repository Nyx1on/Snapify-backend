import mongoose, { Schema } from "mongoose";

const ServiceSchema = new Schema({
  title: String,
  description: String,
  images: [String],
  createdBy: String,
  catagory: String,
  serviceType: String,
});

const service = mongoose.model("Service", ServiceSchema);

export default service;
