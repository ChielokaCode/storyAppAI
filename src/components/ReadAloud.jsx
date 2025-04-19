import React, { useState } from "react";
import OpenAI from "openai";

const ReadAloud = ({ text, user }) => {
  const [loading, setLoading] = useState(false);
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleReadAloud = async () => {
    setLoading(true);
    try {
      const response = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: user === user ? "ballad" : "onyx",
        input: text,
        instructions: "Speak in a cheerful and positive tone.",
        response_format: "mp3",
      });

      //
      const blob = new Blob([await response.arrayBuffer()], {
        type: "audio/mp3",
      });
      console.log(blob);
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };
  return (
    <div>
      <button
        onClick={handleReadAloud}
        className="bg-purple-500 text-white px-3 py-2 rounded-md font-medium hover:bg-purple-800 transition duration-300"
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
            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
            <path
              d="M16.5 12c0-1.77-.73-3.37-1.91-4.5l-1.42 1.42A4.978 4.978 0 0114 12c0 1.47-.64 2.79-1.66 3.68l1.42 1.42A6.978 6.978 0 0016.5 12z"
              fill="currentColor"
            />
            <path
              d="M19.07 4.93l-1.41 1.41C19.64 8.43 21 10.95 21 12s-1.36 3.57-3.34 5.66l1.41 1.41C20.86 16.82 23 13.96 23 12s-2.14-4.82-3.93-7.07z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ReadAloud;
