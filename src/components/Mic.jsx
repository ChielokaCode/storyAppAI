import React, { useEffect, useState } from "react";
import RecordRTC from "recordrtc";
import { Button } from "@progress/kendo-react-buttons";
import OpenAI from "openai";

const hasGetUserMedia = !!(
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);

const Mic = ({ setInput }) => {
  const [blobFile, setBlobFile] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const captureUserMedia = (callback) => {
    var params = { audio: true, video: false };

    navigator.getUserMedia(params, callback, (error) => {
      alert(JSON.stringify(error));
    });
  };

  useEffect(() => {
    if (!hasGetUserMedia) {
      alert(
        "Your browser cannot stream from your webcam. Please switch to Chrome or Firefox."
      );
      return;
    }
    requestUserMedia();
  }, []);

  const requestUserMedia = () => {
    captureUserMedia((stream) => {
      setStream(stream);
    });
  };

  const startRecord = () => {
    setLoading(true);
    if (stream) {
      const newRecorder = new RecordRTC(stream, {
        type: "audio",
      });
      newRecorder.startRecording();
      setRecorder(newRecorder);
    }
    setIsPlaying(true);
  };

  const stopRecord = async () => {
    setLoading(false);
    if (recorder) {
      recorder.stopRecording(() => {
        console.log(recorder.getBlob());
        convertWebMtoWav(recorder.getBlob()).then((wavBlob) => {
          setBlobFile(wavBlob);
          aiResponse(wavBlob);
          console.log("Converted WAV Blob:", wavBlob);
          //   aiResponse();
        });
      });
    }
    setIsPlaying(false);
  };

  //function to convert webm to wav - Start
  const convertWebMtoWav = async (webmBlob) => {
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.AudioContext)();

    return audioContext.decodeAudioData(arrayBuffer).then((decodedData) => {
      return encodeWAV(decodedData);
    });
  };

  // Function to encode WAV
  const encodeWAV = (audioBuffer) => {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    // WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + audioBuffer.length * numOfChan * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChan, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, audioBuffer.length * numOfChan * 2, true);

    // PCM Data
    const offset = 44;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const channelData = audioBuffer.getChannelData(i);
      for (let j = 0; j < channelData.length; j++) {
        view.setInt16(offset + j * 2, channelData[j] * 0x7fff, true);
      }
    }

    return new Blob([view], { type: "audio/wav" });
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  //function to convert webm to wav - End

  //AI
  const aiResponse = async (blobFile) => {
    if (!blobFile) {
      console.error("No audio file provided.");
      return;
    }

    setAiText(""); // Clear previous response

    // Convert blob to Base64 for OpenAI API
    const base64str = await convertBlobToBase64(blobFile);
    console.log(base64str);

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-audio-preview",
        modalities: ["text", "audio"],
        audio: { voice: "alloy", format: "wav" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe this audio 100% accurately. Return only the exact words spoken",
              },
              {
                type: "input_audio",
                input_audio: { data: base64str, format: "wav" },
              },
            ],
          },
        ],
        store: true,
      });

      const textResponse =
        completion?.choices?.[0]?.message?.audio?.transcript ||
        "No transcription available";
      setAiText(textResponse);
      setInput(textResponse);
      setLoading(false);
      console.log("AI Transcription:", textResponse);
    } catch (error) {
      setLoading(false);
      console.error("Error calling OpenAI:", error);
      setAiText("Error processing the audio.");
    }
  };

  // Function to convert Blob to Base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result.split(",")[1]); // Remove metadata prefix
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <>
      <Button
        onClick={!isPlaying ? startRecord : stopRecord}
        className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition duration-300"
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
            <circle cx="12" cy="12" r="6" fill="currentColor" />
            <rect x="10" y="18" width="4" height="3" fill="currentColor" />
            <rect x="9" y="21" width="6" height="2" fill="currentColor" />
          </svg>
        )}
      </Button>
    </>
  );
};

export default Mic;
