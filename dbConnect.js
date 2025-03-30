import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
mongoose
  .connect(process.env.DBURL)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("Error in connecting DB ", err));
