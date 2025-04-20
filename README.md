# storyAppAI

## Table of Contents

- [Overview](#overview)
- [Video Demo](#video-demo)
- [App Screenshots](#app-screenshots)
- [AI Integration](#ai-integration)
- [Installation](#installation)
- [License](#license)

## Overview
Story App AI Chatbot is a fun and educational web app that helps young children improve their reading skills using the power of artificial intelligence. The app tells short, interactive stories, then encourages kids to read aloud. It listens to how they read, checks their pronunciation and fluency, and gives them gentle, helpful feedback.

The goal of this app is to make reading more enjoyable and less scary for children who are still learning, while also helping them build confidence, creativity, and better comprehension

## Video DEMO
[![Story APP AI Chatbot](https://img.youtube.com/vi/oCgB1_n-XeI/hqdefault.jpg)](https://youtu.be/oCgB1_n-XeI)

## App Screenshots
![Screenshot (129)](https://github.com/user-attachments/assets/3fae6feb-abd5-4fe6-9019-af59f755d9da)
![Screenshot (130)](https://github.com/user-attachments/assets/732e9ebb-a7cf-4073-bc6f-441b7fce8b0b)
![Screenshot (131)](https://github.com/user-attachments/assets/0e15488c-9cf2-4d97-b054-5104c1af8ecc)

## AI Integration
Chatbot:

```js
const completion = await client.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
        });
```
Mic (Speach-to-text):

```js
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
```

Read Aloud (Text-to-Speach):
```js
const response = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: user === user ? "ballad" : "onyx",
        input: text,
        instructions: "Speak in a cheerful and positive tone.",
        response_format: "mp3",
      });
```

## Installation

Provide step-by-step instructions on how to install the project. For example:

```bash
git clone https://github.com/ChielokaCode/storyAppAI.git
cd storyAppAI
npm install
npm run start
```

## Licence
[MIT Licence](https://github.com/ChielokaCode/storyAppAI/blob/main/LICENSE) is added to Repo
