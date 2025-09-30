import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const port = process.env.PORT || 8080;

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const all5Words = fs.readFileSync("../all5.csv", "utf-8");

function getWordOfTheDay() {
  const startDate = new Date(2022, 0, 1); // January 1, 2024
  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const wordsArray = all5Words
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length === 5);

  return wordsArray[diffDays % wordsArray.length];
}

const wordToday = getWordOfTheDay();

app.use(cors());

// Demo user (in real case use DB)
const user = {
  id: 1,
  username: "allan",
  password: await bcrypt.hash("123456", 10), // hashed password
};

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== user.username) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

// Middleware to check token
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
}

// Protected route
app.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.username}`, user: req.user });
});

// http://localhost:8080/
// https://workshop-oct-2025.onrender.com/
app.get("/", (_, res) => {
  res.send(`Hello World!`);
});

// http://localhost:8080/today
// https://workshop-oct-2025.onrender.com/today
app.get("/today", (_, res) => {
  res.send(wordToday);
});

// http://localhost:8080/all
// https://workshop-oct-2025.onrender.com/all
app.get("/all", (_, res) => {
  res.send(all5Words);
});

// http://localhost:8080/guess?word=mesma
// https://workshop-oct-2025.onrender.com/guess?word=mesma
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
// https://workshop-oct-2025.onrender.com/exist?word=teste
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
// https://workshop-oct-2025.onrender.com/ia?word=teste
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
