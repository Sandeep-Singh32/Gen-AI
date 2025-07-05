import { input } from "@inquirer/prompts";
import { GoogleGenAI, Type } from "@google/genai";
const GEMINI_API_KEY = "AIzaSyBnAjkyoUB7EUh8u-nFkqAiVxwG8CpETNU";

// documentation: https://ai.google.dev/gemini-api/docs/function-calling?example=weather

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function calculateSum({ num1, num2 }) {
  return num1 + num2;
}

function isPrime({ num }) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

async function getCryptoPrice({ coin }) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${coin}`
  );
  const data = await response.json();
  return data[0].current_price;
}

const sumDeclaration = {
  name: "calculateSum",
  description: "Calculates the sum of two numbers.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      num1: {
        type: Type.NUMBER,
        description: "It is the first for the addition function eg: 10",
      },
      num2: {
        type: Type.NUMBER,
        description: "It is the second number for the addition function eg: 15",
      },
    },
    required: ["num1", "num2"],
  },
};

const primeDeclaration = {
  name: "isPrime",
  description: "Finds whether a number is prime or not.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      num: {
        type: Type.NUMBER,
        description:
          "This is the number that user enters and asks if it is prime or not. eg. 13",
      },
    },
    required: ["num"],
  },
};

const cryptonDeclaration = {
  name: "getCryptoPrice",
  description: "Fetches the current price of a cryptocurrency in INR.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      coin: {
        type: Type.STRING,
        description:
          "This is the name of the cryptocurrency you want to check the price for. For example, 'bitcoin', 'ethereum', etc.",
      },
    },
    required: ["coin"],
  },
};

const functionType = {
  calculateSum: calculateSum,
  isPrime: isPrime,
  getCryptoPrice: getCryptoPrice,
};

const history = [];

const aiAgent = async (message) => {
  history.push({ role: "user", parts: [{ text: message }] });

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: history,
      config: {
        systemInstruction: `You are a helpful AI assistant.  If user asks for sum of two number then call the calculateSum function with the two numbers as parameters.
        If user asks for prime number then call the isPrime function with the number as parameter. 
        If user asks for crypto price then call the getCryptoPrice function with the coin name as parameter.
        IF user asks for anything else then just respond with the text.
        `,
        tools: [
          {
            functionDeclarations: [
              sumDeclaration,
              primeDeclaration,
              cryptonDeclaration,
            ],
          },
        ],
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const { name, args } = response.functionCalls[0];
      console.log("Result --", { name, args });

      const func = functionType[name];
      const result = await func(args);

      // Send the function response back to the model.
      history.push({
        role: "model",
        parts: [
          {
            functionCall: response.functionCalls[0],
          },
        ],
      });

      // Store the function response in contents
      const functionResponse = {
        name,
        response: {
          result,
        },
      };

      history.push({
        role: "user",
        parts: [
          {
            functionResponse: functionResponse,
          },
        ],
      });
    } else {
      const result = response.text;
      history.push({
        role: "model",
        parts: [{ text: result }],
      });
      console.log(result);
      break;
    }
  }
};

const main = async () => {
  const result = await input({ message: "Ask me anything" });
  await aiAgent(result);
  main();
};

main();
