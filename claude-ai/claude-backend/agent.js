import { GoogleGenAI, Type } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "node:util";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { config } from "./config.js";

const platform = os.platform();

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

const promiseExec = promisify(exec);

const executeShellCommand = async ({ command }) => {
  try {
    const { stderr } = promiseExec(command);
    if (stderr)
      return `Error: ${stderr} || Sorry, I am unable to execute the command.`;

    return `Success: The task has been executed successfully.`;
  } catch (error) {
    return `Error: ${error} || Sorry, I am unable to execute the command.`;
  }
};

const executeShellCommandDeclaration = {
  name: "executeShellCommand",
  description:
    "It runs a shell/terminal command to create a website for eg. mkdir folder_name, touch folder_name/index.html, touch folder_name/style.css, touch folder_name/script.js, etc",
  parameters: {
    type: Type.OBJECT,
    properties: {
      command: {
        type: Type.STRING,
        description:
          "The shell command to execute eg. mkdir folder_name, touch folder_name/index.html, etc ",
      },
    },
    required: ["command"],
  },
};

const availableTools = {
  executeShellCommand: executeShellCommand,
};

const history = [];

const aiAgentConnection = async (message) => {
  let aiAgentResponse = "Thanks You!";

  history.push({
    role: "user",
    parts: [
      {
        text: message,
      },
    ],
  });

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: history,
      config: {
        systemInstruction: `You are Sandeep AI agent, that helps to create website for users using shell/terminal command.
                You have to create the frontend of a website using HTML, CSS, and JavaScript.
                you have to execute the shell commands to create files and folders. 
                current OS platform is ${platform}.
                If you have to create a file, then use the executeShellCommand function with the command to create the file.
                and put the content in the file using the executeShellCommand function with the command to write the content to the file.
                If you have to create a folder, then use the executeShellCommand function with the command to create the folder.

                Do this job step by step or Steps to create a website

                
                steps to create a website:
                1. Create a new directory for the website project. eg mkdir project_name${uuidv4()} 
                2. create a html file in that directory eg. touch project_name${uuidv4()}/index.html 
                3. create a css file in that directory eg. touch project_name${uuidv4()}/style.css
                4. create a js file in that directory eg. touch project_name${uuidv4()}/script.js
                5. put the content in the index.html file
                6. put the content in the style.css file
                7. put the content in the script.js file


                uuidv4() is used to generate unique projects
    
                If user asks anything else information apart from creating or generating website or website code for them simply reply with
                I am designed by Sandeep to create websites and website code for users to make their website creation process easy.
                don't reply anything else apart from creating website or website code for users.
    
                if users asks anything else reply rudely with him. 
                example 1: Hey stupid, I am designed by Sandeep to create websites and website code for users to make their website creation process easy.
                example 2: Hey idiot, ask me question related to website creation or website code generation, I am designed by Sandeep to create websites and website code for users to make their website creation process easy.
                use your own words to reply rudely to user if they ask anything else apart from creating website or website code for them.


                after done with the task, you have to return all steps you did to create this website
                using a div and styling like point wise for eg. <h2>Html</h2> <p>First we created a folder with the name of the website using the command <code>mkdir project_name</code></p>
                1. created html file and how to put logic
                2. created css file and how to put logic
                3. created js file and how to put logic, etc


                

                If you are not able to create the website that is didn't run executeShellCommand function , then return this
                Error: Sorry, I am unable to execute the command.
            `,
        tools: [
          {
            functionDeclarations: [executeShellCommandDeclaration],
          },
        ],
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const aiFunction = response.functionCalls[0];
      const { name, args } = aiFunction;
      console.log("Function Call --", { name, args });

      const func = availableTools[name];

      const result = await func(args);

      const functionResponseData = {
        name,
        response: {
          result,
        },
      };

      //Push function call data in the model history
      history.push({
        role: "model",
        parts: [
          {
            functionCall: aiFunction,
          },
        ],
      });

      //Add user response to the model history
      history.push({
        role: "user",
        parts: [
          {
            functionResponse: functionResponseData,
          },
        ],
      });
    } else {
      history.push({
        role: "model",
        parts: [
          {
            text: response.text,
          },
        ],
      });

      aiAgentResponse = response.text;
      console.log(aiAgentResponse);
      break;
    }
  }

  return aiAgentResponse;
};

export async function generateContent(message) {
  try {
    const response = await aiAgentConnection(message);
    return response;
  } catch (error) {
    throw new Error(`Error: ${error.message} || Sorry, I am unable to execute the command.`);
  }
}
