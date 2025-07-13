"use client";

import { useState, useEffect, useRef, FormEvent, useMemo } from "react";
import "./globals.css";

type Message = {
  id: string;
  role: "user" | "model";
  parts: { text: string; projectId: string; projectName: string }[];
  timestamp: Date;
  isStreaming?: boolean;
};

type ConversationHistory = {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
};

const API_BASE_URL = "https://sandeep-website-generator.onrender.com";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      parts: [
        {
          text: "Hello! I'm Sandeep's AI Assistant. I can help you create websites, answer questions, and assist with various tasks. What would you like to build today?",
          projectId: "",
          projectName: "",
        },
      ],
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [showArtifact, setShowArtifact] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>("default");
  const [showSidebar, setShowSidebar] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Enhanced welcome prompts
  const welcomePrompts = [
    "Create a modern portfolio website",
    "Build a landing page for a startup",
    "Design a restaurant menu website",
    "Create a blog layout",
    "Build a calculator app",
    "Design a todo list application"
  ];

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Load conversation history
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const generateContent = async (question: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      if (!response.ok) throw new Error(`API failed: ${response.status}`);
      const data = await response.json();
      return data?.data || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Error:", error);
      setIsStreaming(false);
      setStreamingMessage('');
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
      id: `user-${Date.now()}`,
      role: "user",
      parts: [{ text: question, projectId: "", projectName: "" }],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    try {
      let response = await generateContent(question);
      
      // Extract project info
      const projectIdMatch = response.match(/<sandeep>(.*?)<\/sandeep>/);
      const projectId = projectIdMatch ? projectIdMatch[1] : "";

      const projectNameMatch = response.match(/<maker>(.*?)<\/maker>/);
      const projectName = projectNameMatch ? projectNameMatch[1] : "";

      // Clean response
      if (projectId) {
        response = response
          .replace(/<sandeep>.*?<\/sandeep>/g, "")
          .replace(/4.*/g, "");
      }
      if (projectName) {
        response = response
          .replace(/<maker>.*?<\/maker>/g, "")
          .replace(/4.*/g, "");
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "model",
        parts: [{ text: response, projectId, projectName }],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // Save conversation
      saveConversation();
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = () => {
    const conversation: ConversationHistory = {
      id: currentConversationId,
      title: messages[1]?.parts[0]?.text?.substring(0, 50) + "..." || "New Conversation",
      messages: messages,
      lastUpdated: new Date(),
    };
    
    const updatedConversations = conversations.filter(c => c.id !== currentConversationId);
    updatedConversations.unshift(conversation);
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const startNewConversation = () => {
    setCurrentConversationId(`conv-${Date.now()}`);
    setMessages([{
      id: "welcome",
      role: "model",
      parts: [{
        text: "Hello! I'm Sandeep's AI Assistant. I can help you create websites, answer questions, and assist with various tasks. What would you like to build today?",
        projectId: "",
        projectName: "",
      }],
      timestamp: new Date(),
    }]);
    setShowWelcome(true);
    setShowArtifact(false);
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setShowWelcome(false);
      setShowSidebar(false);
    }
  };

  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, streamingMessage]);

  const formatMessage = (text: string) => {
    // Enhanced message formatting with markdown-like support
    let formattedText = text
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
    
    return formattedText;
  };

  const openArtifact = (projectId: string) => {
    setProjectId(projectId);
    setCurrentTab(0);
    setShowArtifact(true);
  };

  const closeArtifact = () => {
    setProjectId("");
    setShowArtifact(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    setShowWelcome(false);
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewConversation}>
            <i className="fas fa-plus"></i> New Chat
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
        
        <div className="conversation-list">
          <h3>Recent Conversations</h3>
          {conversations.map((conv) => (
            <div key={conv.id} className="conversation-item">
              <div 
                className="conversation-title"
                onClick={() => loadConversation(conv.id)}
              >
                <i className="fas fa-message"></i>
                {conv.title}
              </div>
              <button 
                className="delete-btn"
                onClick={() => deleteConversation(conv.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="enhanced-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="logo">
              <div className="logo-icon">
                <i className="fas fa-brain"></i>
              </div>
              <div>
                <div className="logo-text">Sandeep AI</div>
                <div className="tagline">Advanced AI Assistant</div>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="status-indicator">
              <div className={`status-dot ${isLoading ? 'loading' : 'ready'}`}></div>
              <span>{isLoading ? 'Thinking...' : 'Ready'}</span>
            </div>
          </div>
        </header>

        <div className="chat-layout">
          <div className="chat-section">
            <div className="chat-container" ref={chatContainerRef}>
              {showWelcome && (
                <div className="welcome-container">
                  <div className="welcome-header">
                    <h1 className="welcome-title">
                      <i className="fas fa-sparkles"></i> Welcome to Sandeep AI
                    </h1>
                    <p className="welcome-description">
                      Your intelligent assistant for web development, coding, and creative projects
                    </p>
                  </div>
                  
                  <div className="welcome-prompts">
                    <h3>Try these prompts:</h3>
                    <div className="prompt-grid">
                      {welcomePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          className="prompt-card"
                          onClick={() => handlePromptClick(prompt)}
                        >
                          <i className="fas fa-lightbulb"></i>
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={message.id} className="message-wrapper">
                  <div className={`message ${message.role === "user" ? "user-message" : "ai-message"}`}>
                    <div className={`avatar ${message.role === "user" ? "user-avatar" : "ai-avatar"}`}>
                      <i className={`fas ${message.role === "user" ? "fa-user" : "fa-robot"}`}></i>
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {message.role === "user" ? "You" : "Sandeep AI"}
                        </span>
                        <span className="message-time">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className={`message-bubble ${message.role === "user" ? "user-bubble" : "ai-bubble"}`}>
                        {message.parts[0].projectId?.length ? (
                          <div className="artifact-container">
                            {message.parts[0].projectName && (
                              <div className="project-name">
                                <i className="fas fa-code"></i>
                                {message.parts[0].projectName}
                              </div>
                            )}
                            <button
                              className="artifact-button"
                              onClick={() => openArtifact(message.parts[0].projectId)}
                            >
                              <i className="fas fa-external-link-alt"></i>
                              View Interactive Artifact
                            </button>
                          </div>
                        ) : null}

                        <div
                          className="message-text"
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
                <div className="message-wrapper">
                  <div className="message ai-message">
                    <div className="avatar ai-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="message-content">
                      <div className="message-bubble ai-bubble">
                        <div className="typing-indicator">
                          <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          {isStreaming && streamingMessage ? (
                            <div 
                              className="streaming-text"
                              dangerouslySetInnerHTML={{
                                __html: formatMessage(streamingMessage),
                              }}
                            ></div>
                          ) : (
                            <span>Thinking...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form className="enhanced-input-container" onSubmit={handleSubmit}>
              <div className="input-wrapper">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything... Create a website, solve a problem, or start a conversation"
                  disabled={isLoading}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="input-actions">
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="send-button"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Artifact Preview */}
          {showArtifact && projectId && (
            <div className="artifact-panel">
              <div className="artifact-header">
                <div className="artifact-tabs">
                  <button
                    className={`tab ${currentTab === 0 ? "active" : ""}`}
                    onClick={() => setCurrentTab(0)}
                  >
                    <i className="fas fa-eye"></i> Preview
                  </button>
                  <button
                    className={`tab ${currentTab === 1 ? "active" : ""}`}
                    onClick={() => setCurrentTab(1)}
                  >
                    <i className="fas fa-code"></i> Code
                  </button>
                </div>
                <button className="close-artifact" onClick={closeArtifact}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="artifact-content">
                {currentTab === 0 ? (
                  <iframe
                    src={`${API_BASE_URL}/projects/${projectId}`}
                    title="Website Preview"
                    className="artifact-iframe"
                  />
                ) : (
                  <iframe
                    src={`${API_BASE_URL}/projects/${projectId}/index.txt`}
                    title="Code View"
                    className="artifact-iframe code-view"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}