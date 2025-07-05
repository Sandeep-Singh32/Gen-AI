import { input } from "@inquirer/prompts";
import { GoogleGenAI, Type } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "node:util";
import os from 'os'

const GEMINI_API_KEY = "AIzaSyBnAjkyoUB7EUh8u-nFkqAiVxwG8CpETNU";
const platform = os.platform();
// documentation: https://ai.google.dev/gemini-api/docs/function-calling?example=weather

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

//make any function promise
const executeCommand = promisify(exec);

// Find a tool that executes shell command and run it
async function executeShellCommand({ command }) {
  try {
    const { stdout, stderr } = await executeCommand(command);
    if (stderr) {
      return `Error: ${stderr}`;
    }

    return `Success: ${stdout} || Task Completed Successfully`;
  } catch (error) {
    return `Error: ${error}`;
  }
}

const executeShellCommandDeclaration = {
  name: "executeShellCommand",
  description:
    "Executes a shell command and returns the output. Whatever command you want to run, just pass it as a string. Command type can be anything like 'mkdir file', 'touch index.html', 'ls', 'pwd', 'echo Hello World' etc.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      command: {
        type: Type.STRING,
        description:
          "This is the single shell command you want to execute. For example, mkdir new_folder, touch new_folder/file.html, ls, pwd, echo Hello World etc.",
      },
    },
    required: ["command"],
  },
};

const availableTools = {
  executeShellCommand: executeShellCommand,
};

const history = [];

const aiAgent = async (message) => {
  history.push({ role: "user", parts: [{ text: message }] });

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: history,
      config: {
        systemInstruction: `You are a website builder expert. You have to create the frontend of a website using HTML, CSS, and JavaScript.
        you have to execute the shell commands to create files and folders. 
        current OS platform is ${platform}.
        If you have to create a file, then use the executeShellCommand function with the command to create the file.
        and put the content in the file using the executeShellCommand function with the command to write the content to the file.
        If you have to create a folder, then use the executeShellCommand function with the command to create the folder.

        Do this job step by step.
        1. If user asks for any website
        2. give them command one by one
        3. use available tools to execute the command


        Now you can start building the website.
        1. create a folder with the name of the website eg. mkdir calculator
        2. create an index.html file in the folder eg. touch calculator/index.html
        3. create a style.css file in the folder
        4. create a script.js file in the folder
        5. put the content in the index.html file
        6. put the content in the style.css file
        7. put the content in the script.js file


        you have to provide the shell/terminal command to user, they will run and execute it
        `,
        tools: [
          {
            functionDeclarations: [executeShellCommandDeclaration],
          },
        ],
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const { name, args } = response.functionCalls[0];
      console.log("Result --", { name, args });

      const func = availableTools[name];
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
  console.log("I am a cursor-ai agent. I can help you build websites step by step.");
  const result = await input({ message: "Ask me anything" });
  await aiAgent(result);
  main();
};

main();
