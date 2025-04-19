import React, { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import { Input } from "@progress/kendo-react-inputs";
import Mic from "./Mic";
import ReadAloud from "./ReadAloud";
import { Button } from "@progress/kendo-react-buttons";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [childPreferences, setChildPreferences] = useState(null);
  const [storyProgress, setStoryProgress] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");

  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  useEffect(() => {
    // Auto-scroll to the latest message
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Add AI greeting on first load
    if (chatHistory.length === 0) {
      setChatHistory([
        {
          role: "assistant",
          content:
            "Hello! 😊 Let's create an interactive story! First, tell me your name.",
        },
      ]);
    }
  }, [chatHistory]);

  const filterContent = (text) => {
    const bannedWords = [
      "violence",
      "death",
      "kill",
      "blood",
      "horror",
      "sex",
      "porn",
      "naked",
    ];

    for (let word of bannedWords) {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        return "Inappropriate word found. Please repeat your answer.";
      }
    }

    return text; // Safe to return
  };

  const detectName = (input) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.startsWith("i am ")) return input.slice(5).trim();
    if (lowerInput.startsWith("my name is ")) return input.slice(11).trim();
    if (lowerInput.startsWith("my names are ")) return input.slice(13).trim();
    if (!input.includes(" ")) return input.trim(); // Assume single word na name
    return null;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setInput("");
    const filteredText = filterContent(input);

    if (
      filteredText === "Inappropriate word found. Please repeat your answer."
    ) {
      setChatHistory([
        ...chatHistory,
        { role: "assistant", content: filteredText },
      ]);
      setLoading(false);
      return;
    }

    let newMessages = [...chatHistory, { role: "user", content: input }];

    if (!studentName) {
      const detectedName = detectName(input);
      if (detectedName) {
        setStudentName(detectedName);
        setChatHistory([
          ...newMessages,
          {
            role: "assistant",
            content: `Hello ${detectedName}, Now tell me your age?`,
          },
        ]);
      } else {
        setChatHistory([
          ...newMessages,
          {
            role: "assistant",
            content: "Please introduce yourself with your name.",
          },
        ]);
      }
    } else if (!studentAge) {
      setStudentAge(input);
      setChatHistory([
        ...newMessages,
        {
          role: "assistant",
          content: "Now tell me your difficulty level (easy, medium, or hard)?",
        },
      ]);
    } else if (!difficultyLevel) {
      setDifficultyLevel(input);
      setChatHistory([
        ...newMessages,
        {
          role: "assistant",
          content: "Great! Let's start your interactive story!",
        },
      ]);
    } else {
      if (!childPreferences) {
        setChildPreferences(input);
        setChatHistory([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Great! Now choose: Do you want a fairy tale, superhero story, space adventure or any other story?",
          },
        ]);
        setLoading(false);
        return;
      }
      //

      let messages = [
        {
          role: "system",
          content: `You are a friendly and creative AI storyteller for children. Generate an engaging and age-appropriate story around 100 words long. Make sure the story is fun, interactive (e.g., include choices or questions), and supports literacy, comprehension, and creative thinking. Tailor the vocabulary, sentence structure, and themes to match a child aged ${studentAge} with a reading level of ${difficultyLevel}. Ensure the content is safe, educational, and inspiring for young readers. After generating the story, prepare short sentence segments suitable for read-along. Each segment should be clear, simple, and easy for the child to repeat. The AI will read these aloud using text-to-speech, then listen to the child reading using speech-to-text. Compare the child spoken version with the original segment, and give kind, encouraging feedback on pronunciation and fluency. Highlight any words the child struggles with and offer support to try again.`,
        },
        ...newMessages,
      ];

      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
        });

        const textResponse =
          completion?.choices?.[0]?.message?.content || "No response from AI";

        setStoryProgress([...storyProgress, textResponse]);
        setChatHistory([
          ...newMessages,
          { role: "assistant", content: textResponse },
        ]);
      } catch (error) {
        console.error("Error:", error);
        setChatHistory([
          ...newMessages,
          {
            role: "assistant",
            content: "Something went wrong. Please try again.",
          },
        ]);
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex-row">
      <div className="flex flex-col h-screen max-w-lg mx-auto border rounded-lg shadow-lg">
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } my-2`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs shadow-md ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {msg.content}
                <ReadAloud text={msg.content} user={msg.role} />
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* User Input Section */}
        <div className="p-4 border-t bg-white flex items-center">
          <Input
            type="text"
            className="flex-1 border rounded-lg p-2 outline-none"
            placeholder="Continue the adventure..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <div className="space-x-1 px-2">
            <Mic setInput={setInput} />
            <Button
              onClick={handleSendMessage}
              themeColor={"info"}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? (
                "..."
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
