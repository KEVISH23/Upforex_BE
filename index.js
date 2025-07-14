import express from "express";
import * as nodemailer from "./nodemailer.js";
import dotenv from "dotenv";
import cors from "cors";
import { adminRouter, blogRouter, categoryRouter,termsRouter} from "./routes/index.js";
import axios from "axios";
import "./dbConnect.js";
import { generateSitemap } from "./sitemapGenerator.js";
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
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/terms", termsRouter);

// app.post("/api/v1/upforex/contact-us", async (req, res) => {
//   try {
//     await nodemailer.sendMail(req.body);
//     res.json({ status: true, message: "Mail sent." });
//   } catch (error) {
//     res.json({ staus: false, message: error.message });
//   }
// });
app.use("/api/v1/upforex/contact-us", async (req, res) => {
  const { recaptchaToken, ...mailData } = req.body;

  try {
    // Step 1: Verify reCAPTCHA token
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    const data = response.data;

    if (
      !data.success ||
      data.score < 0.5 ||
      data.action !== "contact_form_submit"
    ) {
      return res.status(400).json({
        status: false,
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    await nodemailer.sendMail(mailData);

    res.json({ status: true, message: "Mail sent." });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});
app.get("/sitemap.xml", async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});
app.use("/robots.txt", express.static("public/robots.txt"));

app.use((err, req, res, next) => {
  res.status(500).json({
    status: false,
    message: err.message || "An error occurred during file upload.",
    data: null,
  });
});
