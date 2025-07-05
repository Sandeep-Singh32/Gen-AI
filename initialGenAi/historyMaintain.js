import { GoogleGenAI } from "@google/genai";
import { input } from "@inquirer/prompts";
import chalk from "chalk";
const log = console.log;

const GEMINI_API_KEY = "AIzaSyBnAjkyoUB7EUh8u-nFkqAiVxwG8CpETNU";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const chat = ai.chats.create({
  model: "gemini-2.5-flash",
  history: [],
});

async function chattingFunction() {
  const payload = { message: "Ask me anything" };
  const answer = await input(payload);

  const response = await chat.sendMessage({
    message: answer,
  });

  log(chalk.green(response.text));

  chattingFunction();
}

await chattingFunction();
