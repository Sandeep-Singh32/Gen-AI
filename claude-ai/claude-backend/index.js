import express, { Router } from "express";
import { config } from "./config.js";
import { generateContent } from "./agent.js";
import cors from "cors";

const router = Router();
const application = express();

application.use(express.json());
application.use(express.urlencoded({ extended: true }));

application.use(cors({ origin: "*" }));

application.use(
  "/projects",
  express.static(
    "/Users/sandeepsingh/Documents/projects/gen-ai/claude-ai/claude-backend",
    { index: "index.html" }
    
  )
);

application.use(router);

router.get("/", (req, res) => {
  return res.json({
    message: "Hello from Sandeep's Claude AI Agent",
  });
});

router.post("/generate-content", async (req, res) => {
  try {
    const { body } = req;
    const response = await generateContent(body.message);
    return res.json({
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(500).json({ error: `Error: ${error.message}` });
  }
});

function bootstrap() {
  const port = config.PORT || 5000;

  const appData = application.listen(port, () => {
    console.log(`Sandeep's Claude AI Agent is running on port ${port}`);
  });

  appData.timeout = 300000;
}

bootstrap();
