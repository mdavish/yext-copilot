import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChatHeadlessProvider } from "@yext/chat-headless-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChatHeadlessProvider
      config={{
        apiKey: "ba6154005318329bab057458022b1be2",
        botId: "yext-copilot",
        analyticsConfig: {
          sessionTrackingEnabled: true,
        },
      }}
    >
      <App />
    </ChatHeadlessProvider>
  </React.StrictMode>
);
