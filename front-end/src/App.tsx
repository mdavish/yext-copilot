import { useState, useEffect, useRef } from "react";
import CommandPalette from "./components/CommandPalette";
import Textarea from "react-expanding-textarea";
import { cn } from "./lib/utils";
import { FaArrowLeft } from "react-icons/fa";
import { BsSendFill } from "react-icons/bs";
import { useChatState, useChatActions } from "@yext/chat-headless-react";
import littleDavish from "../public/littleDavish.jpg";
import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ReactMarkdown from "react-markdown";

function App() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [input, setInput] = useState("");

  const messages = useChatState((s) => s.conversation.messages);
  const isLoading = useChatState((s) => s.conversation.isLoading);

  const canSend = !isLoading && input.length > 0;

  const chat = useChatActions();

  // In reality, this would be set dynamically in the app
  // This is strictly for demo purposes
  useEffect(() => {
    chat.setContext({
      username: "Max Davish",
      businessId: "3472542",
      useremail: "davish9@gmail.com",
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "k" && e.metaKey) {
        setShowCommandPalette(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomDifRev = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (bottomDifRev.current) {
      bottomDifRev.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="h-screen bg-slate-50 w-full text-4xl flex flex-row overflow-x-hidden">
      <CommandPalette
        onCopilotQuery={(query) => {
          chat.getNextMessage(query);
          setShowCopilot(true);
          setShowCommandPalette(false);
          if (textareaRef.current) {
            textareaRef.current.focus();
            console.log("Focused");
          } else {
            throw new Error("Input ref is null");
          }
        }}
        show={showCommandPalette}
        onSelect={(item) => console.log(item)}
        onClose={() => setShowCommandPalette(false)}
        items={[
          {
            name: "Account Settings",
            href: "#",
          },
        ]}
      />
      <div className="w-full h-full flex relative">
        <button
          onClick={() => setShowCommandPalette(true)}
          className="text-5xl mx-auto mt-[35vh] p-5 rounded-xl text-slate-300 bg-white hover:bg-slate-50 border border-slate-300 shadow-lg hover:shadow-xl w-fit h-fit focus:outline-none"
        >
          ⌘ + K
        </button>
        <button
          onClick={() => setShowCopilot(!showCopilot)}
          className={cn(
            "absolute z-20 h-fit w-fit top-10 -right-4  flex rounded-full border p-1.5 focus:outline-none transition-all duration-200 ease-in-out",
            // Rotate the arrow 180 degrees if the copilot is hidden
            showCopilot
              ? "rotate-180 text-slate-400 bg-white hover:bg-slate-50 border-slate-400"
              : "transform right-4 bg-indigo-700 text-white hover:bg-indigo-800 border-white"
          )}
        >
          <FaArrowLeft className=" my-auto mx-auto w-3 h-3" />
        </button>
      </div>
      <div
        className={cn(
          "h-full border-l rounded-l-3xl shadow-lg border-slate-200 flex flex-col relative transition-all duration-200 ease-in-out justify-end bg-white overflow-hidden",
          showCopilot ? "w-1/3 max-w-md shrink-0" : "w-0 overflow-hidden"
        )}
      >
        <div className="h-full flex flex-col justify-end overflow-y-auto">
          <div className="max-h-full flex flex-col divide-y border-t text-base overflow-y-auto">
            {messages.map((message, index) => (
              <motion.div
                key={`message-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={cn(
                  "text-base py-3 px-4 flex flex-row gap-x-3",
                  message.source === "USER" ? "bg-white" : "bg-slate-100"
                )}
              >
                {message.source === "USER" ? (
                  <img
                    className="w-8 h-8 rounded-lg shrink-0"
                    src={littleDavish}
                    alt="Davish"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-indigo-700 shrink-0 flex">
                    <FaRobot className="text-white my-auto mx-auto w-4 h-4" />
                  </div>
                )}
                <ReactMarkdown
                  className="text-sm text-slate-900 prose-sm"
                  // Not sure why this is necessary, but it is
                  components={{
                    a: ({ ...props }) => (
                      <a {...props} className="text-blue-600 hover:underline" />
                    ),
                    ul: ({ ...props }) => (
                      <ul
                        style={{
                          display: "block",
                          listStyleType: "disc",
                          paddingInlineStart: "20px",
                        }}
                        {...props}
                      />
                    ),
                    ol: ({ ...props }) => (
                      <ul
                        style={{
                          display: "block",
                          listStyleType: "decimal",
                          paddingInlineStart: "20px",
                        }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </motion.div>
            ))}
            <div ref={bottomDifRev} />
          </div>
        </div>
        <div className="mt-auto p-4">
          <div className="relative flex flex-col h-full w-full">
            <Textarea
              autoFocus={true}
              ref={textareaRef}
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  chat.getNextMessage(input).then(() => {
                    textareaRef.current?.focus();
                  });
                  setInput("");
                }
              }}
              placeholder="Ask copilot anything..."
              className="resize-none text-sm py-3 pl-3 pr-10  text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-0 focus:shadow-lg focus:border-slate-300 w-full border border-slate-200 transition-colors transition-shadow duration-200 ease-in-out"
            />
            <button
              onClick={() => {
                chat.getNextMessage(input).then(() => {
                  textareaRef.current?.focus();
                });
                setInput("");
              }}
              disabled={!canSend}
              className={cn(
                "flex top-1/2 -translate-y-1/2 absolute z-10 p-2 rounded-md right-2 transition-all duration-200 ease-in-out my-auto",
                canSend ? "bg-indigo-600 hover:bg-indigo-700" : "bg-none"
              )}
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="my-auto w-4 h-4 animate-spin text-slate-600" />
              ) : (
                <BsSendFill
                  className={cn(
                    "my-auto w-4 h-4",
                    canSend ? "text-white" : "text-slate-300"
                  )}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
