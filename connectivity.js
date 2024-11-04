import mongoose from "mongoose";
import dbConfig from "./config/dbConfig.js";

const dbConnect = async () => {
  try {
    await mongoose.connect(dbConfig.db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (error) {
    console.log(error.message);
  }
};

export default dbConnect;
