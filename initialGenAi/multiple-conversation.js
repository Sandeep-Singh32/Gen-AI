import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = "AIzaSyBnAjkyoUB7EUh8u-nFkqAiVxwG8CpETNU";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Hello, I am Sandeep",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Hello Sandeep! It's nice to meet you. How can I help you today?",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Hello, What is my name",
          },
        ],
      },
    ],
  });

  console.log(response.text);
}

main();
