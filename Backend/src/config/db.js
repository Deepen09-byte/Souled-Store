import mongoose from "mongoose";
import { config } from "./config.js";
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
const connectDB = async () => {
  await mongoose.connect(config.MONGO_URI);
  console.log("MongoDB connected");
};

export default connectDB;