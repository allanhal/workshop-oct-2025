import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config.js";
import fs from "fs";

const app = express();
const port = process.env.PORT || 8080;

const all5Words = fs.readFileSync("../all5.csv", "utf-8");

const wordToday = "mesmo";

app.use(cors());

// http://localhost:8080/
app.get("/", (_, res) => {
  res.send(`Hello World!`);
});

// http://localhost:8080/all
app.get("/all", (_, res) => {
  res.send(all5Words);
});

// http://localhost:8080/guess?word=aaaaa
app.get("/guess", (req, res) => {
  const { word } = req.query;
  if (!word || typeof word !== "string" || word.length !== 5) {
    return res.status(400).send("Missing or invalid 'word' query parameter");
  }

  const answerLetters = wordToday.toLowerCase().split("");
  const guessLetters = word.toLowerCase().split("");

  const result = new Array(5).fill("absent");
  // First pass: mark correct letters
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = "correct";
      answerLetters[i] = "";
      guessLetters[i] = "";
    }
  }
  // Second pass: mark present letters
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] && answerLetters.includes(guessLetters[i])) {
      result[i] = "present";
      const answerIndex = answerLetters.indexOf(guessLetters[i]);
      answerLetters[answerIndex] = "";
    }
  }
  res.send({ correct: result.every((letter) => letter === "correct"), result });
});

// http://localhost:8080/exist?word=teste
app.get("/valid", async (req, res) => {
  const { word } = req.query;
  if (!word || typeof word !== "string") {
    return res.status(400).send("Missing or invalid 'word' query parameter");
  }
  try {
    res.send({
      word,
      exists: all5Words.includes(word.toLowerCase()),
      valid: all5Words.includes(word.toLowerCase()),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing words");
  }
});

// http://localhost:8080/ia?word=teste
app.get("/ia", (req, res) => {
  const { word } = req.query;
  if (!word || typeof word !== "string") {
    return res.status(400).send("Missing or invalid 'word' query parameter");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
  const prompt = `Responda apenas TRUE ou FALSE.Essa palavra existe em portugues? '${word}'`;
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
