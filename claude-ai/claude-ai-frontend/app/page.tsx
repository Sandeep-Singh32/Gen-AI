"use client";

import { useState, useEffect, useRef, FormEvent, useMemo } from "react";
import "./globals.css";

type Message = {
  role: "user" | "model";
  parts: { text: string; projectId: string }[];
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      parts: [
        {
          text: "Hello! I'm your Sandeep's AI. I can create website for you. Please ask me what website to create using html, css and js",
          projectId: "",
        },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const generateContent = async (question: string): Promise<string> => {
    try {
      const response = await fetch("http://localhost:3000/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      if (!response.ok) throw new Error(`API failed: ${response.status}`);
      const data = await response.json();
      return data?.data || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Error:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const question = inputValue.trim();
    setInputValue("");
    setShowWelcome(false);

    // Add user message
    const userMessage: Message = {
      role: "user",
      parts: [{ text: question, projectId: "" }],
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    try {
      let response = await generateContent(question);
      //find the project id inside the <sandeep></sandeep> block
      const projectIdMatch = response.match(/<sandeep>(.*?)<\/sandeep>/);

      const projectId = projectIdMatch ? projectIdMatch[1] : "";

      // If projectId is found, replace the <sandeep> block with an empty string
      if (projectId) {
        response = response
          .replace(/<sandeep>.*?<\/sandeep>/g, "")
          .replace(/4.*/g, "");
      }

      console.log("Project id", projectId);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: response, projectId }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const formatMessage = (text: string) => {
    let formattedText = text.replace(/\n/g, "<br>");
    return formattedText;
  };

  // const interactiveArtifactDiv = useMemo(() => {
  //   if (typeof window === "undefined") return undefined;
  //   const _div = document.getElementsByClassName("interactive-artifact");
  //   return _div;
  // }, [window]);

  // useEffect(() => {
  //   if (
  //     typeof window !== "undefined" &&
  //     interactiveArtifactDiv &&
  //     interactiveArtifactDiv.length > 0
  //   ) {
  //     if (Array.isArray(interactiveArtifactDiv)) {
  //       interactiveArtifactDiv.forEach((div) => {
  //         div.addEventListener("click", (e: any) => {
  //           console.log("here inside of this -->", e.target);
  //           const projectId = e.target.getAttribute("data-project-id");
  //           if (projectId) {
  //             // Open the project in a new tab
  //             window.open(
  //               `file:///Users/sandeepsingh/Documents/projects/gen-ai/claude-ai/claude-backend/${projectId}`,
  //               "_blank"
  //             );
  //           } else {
  //             console.warn("No project ID found in the clicked element.");
  //           }
  //         });
  //       });
  //     } else {
  //       console.log("interactiveArtifactDiv Type --->", interactiveArtifactDiv);
  //     }
  //   }
  // }, [interactiveArtifactDiv]);

  const openArtifact = (projectId: string) => {
    window.open(
      `http://localhost:3000/projects/${projectId}`,
      "_blank"
    );
  };

  return (
    <div className="">
      <header>
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-brain"></i>
          </div>
          <div>
            <div className="logo-text">Sandeep Website Generator</div>
            <div className="tagline">AI Assistant for Generating Website</div>
          </div>
        </div>
      </header>

      <div
        className="chat-container"
        id="chat-container"
        ref={chatContainerRef}
      >
        {showWelcome && (
          <div className="welcome-container">
            <h1 className="welcome-title">
              <i className="fas fa-graduation-cap"></i> Welcome to Website
              Generator
            </h1>
            <p className="welcome-text">
              Ask me anything about Generating Website to even review the
              website and code at the same time
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index}>
            <div
              className={`message ${
                message.role === "user" ? "user-message" : "ai-message"
              }`}
            >
              <div
                className={`avatar ${
                  message.role === "user" ? "user-avatar" : "ai-avatar"
                }`}
              >
                <i
                  className={`fas ${
                    message.role === "user" ? "fa-user" : "fa-robot"
                  }`}
                ></i>
              </div>
              <div className="message-content">
                <div
                  className={`message-bubble ${
                    message.role === "user" ? "user-bubble" : "ai-bubble"
                  }`}
                >
                  {message.parts[0].projectId?.length ? (
                    <>
                      <div
                        className="interactive-artifact"
                        onClick={() => {
                          openArtifact(message.parts[0].projectId);
                        }}
                      >
                        Interactive Artifact
                      </div>
                      <br />
                    </>
                  ) : null}

                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.parts[0].text),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message">
            <div className="avatar ai-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="message-content">
              <div
                className="message-bubble ai-bubble"
                dangerouslySetInnerHTML={{ __html: "Thinking..." }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <form className="input-container" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            id="user-input"
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question. Generate a basic calculator website..."
            autoComplete="off"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            id="send-btn"
            disabled={isLoading || !inputValue.trim()}
          >
            <i className="fas fa-paper-plane"></i> Send
          </button>
        </div>
      </form>
    </div>
  );
}
