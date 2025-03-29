import express from "express";
import * as nodemailer from "./nodemailer.js";
import dotenv from "dotenv";
import cors from "cors";
import { adminRouter, blogRouter } from "./routes/index.js";
import "./dbConnect.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.listen(process.env.PORT, () => {
  console.log(
    "server is running on port",
    `http://localhost:${process.env.PORT}`
  );
});

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/blogs", blogRouter);
app.post("/api/v1/upforex/contact-us", async (req, res) => {
  try {
    await nodemailer.sendMail(req.body);
    res.json({ status: true, message: "Mail sent." });
  } catch (error) {
    res.json({ staus: false, message: error.message });
  }
});
app.use((err, req, res, next) => {
  res.status(500).json({
    status: false,
    message: err.message || "An error occurred during file upload.",
    data: null,
  });
});
