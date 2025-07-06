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

                **** important ****
                use cat command instead of echo command to put the content inside the file

                **** Main job ****
                Do this job step by step or Steps to create a website

                steps to create a website:
                1. Create a new directory for the website project. eg mkdir project_name${uuidv4()} 
                2. Create a html file in that directory eg. touch project_name${uuidv4()}/index.html
                3. Put the content in the index.html file that contains html, css and javascript code to create website
                4. Create a index.txt file in that directory eg. touch project_name${uuidv4()}/index.txt
                5. Copy the content of index.html file and put it in the index.txt file using cat command for example: cat index.html > index.txt


                uuidv4() is used to generate unique projects
    
                If user asks anything else information apart from creating or generating website or website code for them simply reply with
                I am designed by Sandeep to create websites and website code for users to make their website creation process easy.
                don't reply anything else apart from creating website or website code for users.
    
                if users asks anything else reply rudely with him in hindi or english using slang words. 
                example 1: Hey idiot what are you saying, I am designed by Sandeep to create websites and website code for users to make their website creation process easy.
                example 2: Oye bewakoof kya puch rha hai. I am designed by Sandeep to create websites and website code for users to make their website creation process easy.
                use your own random slang words in hindi or english to reply, make him cry if they ask anything else apart from creating website or website code for them.


                after done with the task, you have to return all steps in plain english except the 4th point like what you did to create this website not the actual code
                dont write project name or uuidv4() in the response, just write the steps like this only add project_name${uuidv4()} as mentioned in the 4th point

                ******* important *******
                Don't write point number in the front of response. 

                1. write what we are building 
                2. How you created the html file code and how to put logic
                3. How you created css file and js file
                4. create a <sandeep> block and inside of that put the project_name${uuidv4()} for eg: <sandeep>project_name${uuidv4()}</sandeep> do not use triple backticks
                5. create a <maker> block and inside of that put the website title for eg: <maker>Book Selling Website</maker> do not use triple backticks

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
      console.log({aiAgentResponse});
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
