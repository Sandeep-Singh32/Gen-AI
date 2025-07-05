import { GoogleGenAI } from "@google/genai";
import { input } from "@inquirer/prompts";
import chalk from "chalk";
const log = console.log;

const GEMINI_API_KEY = "AIzaSyBnAjkyoUB7EUh8u-nFkqAiVxwG8CpETNU";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const history = [];

async function chattingWithLLM(question) {
  history.push({
    role: "user",
    parts: [{ text: question }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: history,
    config: {
      systemInstruction: `You are a helpful assistant that provides information on data structures and algorithms. Answer questions clearly and concisely.
        Answer in a way that is easy to understand for someone learning about data structures and algorithms. Only give answer related to DSA only and not outside of it.
        If the question is not related to data structures and algorithms, politely inform the user that you can only assist with DSA-related queries.`,
    },
  });

  history.push({
    role: "model",
    parts: [{ text: response.text }],
  });
  log(chalk.green(response.text));
}

async function main() {
  const payload = { message: "Ask me anything" };

  const answer = await input(history.length == 0 ? payload : { message: "" });
  await chattingWithLLM(answer);

  main();
}

main();
