// importanto as configurações do express
import express from "express";
// importando biblioteca cors para lidar com requisições entre origens diferentes
import cors from "cors";
// importando a biblioteca do Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";
// importando a biblioteca para lidar com variáveis de ambiente
import "dotenv/config.js";
// importando a biblioteca para lidar com o sistema de arquivos
import fs from "fs";
// importando o Prisma Client para interagir com o banco de dados
import { PrismaClient } from "@prisma/client";

try {
  // criando uma instância do express
  const app = express();
  // criando uma instância do Prisma Client para manipular o banco de dados
  // https://console.neon.tech/app/projects/quiet-union-77601480/branches/br-damp-king-ad4h1ax4/tables
  const prisma = new PrismaClient();

  // definindo a porta de escuta do servidor
  const port = process.env.PORT || 80;

  // lendo o arquivo CSV com todas as palavras de 5 letras
  const all5Words = fs.readFileSync("../all5.csv", "utf-8");

  // função para obter a palavra do dia com base na data atual
  let startDate; // January 1, 2024
  async function getWordOfTheDay() {
    const randomDay = Math.floor(Math.random() * 30);
    startDate = new Date(2021, 0, randomDay);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const wordsArray = all5Words
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length === 5);

    let newWordOfTheDay = wordsArray[diffDays % wordsArray.length];
    const checkIfExists = await checkGemini(newWordOfTheDay);
    if (!checkIfExists) {
      newWordOfTheDay = await getWordOfTheDay();
    }
    return newWordOfTheDay;
  }

  // obtendo a palavra do dia
  // const wordToday = await getWordOfTheDay();
  const wordToday = "amigo";

  // aplicando o middleware cors para permitir requisições de qualquer origem
  app.use(cors());

  // aplicando o middleware express.json para lidar com requisições JSON
  // necessário para pegar o body das requisições POST
  app.use(express.json());

  // Rota para criar bug report
  // http://localhost:8080/bugReport
  // https://workshop-oct-2025.onrender.com/bugReport
  app.post("/bugReport", async (req, res) => {
    const { name, description } = req.body;
    const bug = await prisma.bugReport.create({
      data: { name, description },
    });
    res.json(bug);
  });

  // Rota para listar todos os bugs
  // http://localhost:8080/bug
  // https://workshop-oct-2025.onrender.com/bug
  app.get("/bug", async (_, res) => {
    const bugs = await prisma.bugReport.findMany();
    res.json(bugs);
  });

  // Rota para saber se o servidor está ligado
  // http://localhost:8080/
  // https://workshop-oct-2025.onrender.com/
  app.get("/", (_, res) => {
    res.send(`Hello World!`);
  });

  app.get("/p", (_, res) => {
    res.send(`p`);
  });

  // Rota para saber a palavra do dia
  // http://localhost:8080/today
  // https://workshop-oct-2025.onrender.com/today
  app.get("/today", (_, res) => {
    res.send(wordToday);
  });

  // Rota para listar todas as palavras de 5 letras
  // http://localhost:8080/all
  // https://workshop-oct-2025.onrender.com/all
  app.get("/all", (_, res) => {
    res.send(all5Words);
  });

  // Rota para tentar adivinhar a palavra do dia
  // http://localhost:8080/guess?word=mesma
  // https://workshop-oct-2025.onrender.com/guess?word=mesma
  app.get("/guess", async (req, res) => {
    let { word } = req.query;
    if (!word || typeof word !== "string" || word.length !== 5) {
      return res.status(400).send("Missing or invalid 'word' query parameter");
    }

    word = word.toLowerCase();

    const checkIfExists = await checkGemini(word);
    if (!checkIfExists) {
      return res.status(400).send("A palavra não existe em português");
    }

    const existing = await prisma.wordAttempt
      .findUnique({
        where: { word },
      })
      .catch(() => null);

    let attempt;
    // Verifica se já existe um registro para a palavra ou adiciona uma nova ocorrência
    if (existing) {
      attempt = await prisma.wordAttempt.update({
        where: { word },
        data: { attempts: { increment: 1 } },
      });
    } else {
      attempt = await prisma.wordAttempt.create({
        data: { word },
      });
    }

    const answerLetters = wordToday.toLowerCase().split("");
    const guessLetters = word.split("");

    const result = new Array(5).fill("absent");
    // Lógica de verificar quais letras estão corretas e presentes
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === answerLetters[i]) {
        result[i] = "correct";
        answerLetters[i] = "";
        guessLetters[i] = "";
      } else if (guessLetters[i] && answerLetters.includes(guessLetters[i])) {
        result[i] = "present";
        const answerIndex = answerLetters.indexOf(guessLetters[i]);
        answerLetters[answerIndex] = "";
      }
    }
    res.send({
      correct: result.every((letter) => letter === "correct"),
      result,
      attempt,
    });
  });

  // http://localhost:8080/ia?word=teste
  // https://workshop-oct-2025.onrender.com/ia?word=teste
  app.get("/ia", async (req, res) => {
    const { word } = req.query;
    if (!word || typeof word !== "string") {
      return res.status(400).send("Missing or invalid 'word' query parameter");
    }
    try {
      const result = await checkGemini(word);
      res.send({
        word,
        exists: result,
      });
    } catch (error) {
      res.send({ message: "error", error });
    }
  });

  async function checkGemini(word) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `Responda apenas TRUE ou FALSE.Essa palavra existe em portugues? '${word}'`;
    const result = await model.generateContent(prompt);
    return result.response.text() === "TRUE";
  }

  app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
  });
} catch (error) {
  console.log(error);
}
