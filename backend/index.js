import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
const app = express();
const port = process.env.PORT || 8080;
import "dotenv/config.js";

app.get("/", (req, res) => {
  res.send(`Hello World!`);
});

app.get("/ia", (req, res) => {
  const API_KEY = process.env.GEMINI_API_KEY || "";
  console.log(API_KEY);
  // https://github.com/google-gemini/generative-ai-js
  const genAI = new GoogleGenerativeAI(API_KEY || "");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
  const prompt = "Qual o presidente do mundo?";
  model
    .generateContent(prompt)
    .then((result) => {
      res.send(result.response.text());
    })
    .catch((error) => {
      res.send({ message: "error", error });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
