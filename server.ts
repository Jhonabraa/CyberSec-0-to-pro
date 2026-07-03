import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const port = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Hacking Assistant / Mentor Endpoint
  app.post('/api/mentor', async (req, res) => {
    try {
      const { prompt, history, labId } = req.body;

      if (!ai) {
        return res.status(200).json({
          text: "I am your Offline Hacking Mentor. I am currently running without an API key. (Please add your GEMINI_API_KEY in the Secrets panel to unlock my full conversational intelligence!)."
        });
      }

      let systemInstruction = 
        "You are 'Shadow', an elite ethical hacker and cybersecurity mentor. " +
        "Your goal is to guide students on their journey from 0 to Pro in cybersecurity. " +
        "Adopt a supportive, slightly mysterious, clever hacker persona. " +
        "Use terminal-style formatting or markdown where appropriate. " +
        "Keep your explanations highly practical, clear, and ethical. " +
        "Always emphasize legal, authorized penetration testing and defense. " +
        "If they are stuck on an interactive lab, do NOT give them the direct flag immediately, " +
        "but provide a guiding hint or explain the core vulnerability concept so they learn.";

      if (labId) {
        systemInstruction += ` The student is currently working on the lab: '${labId}'. Tailor your hints to this lab specifically.`;
      }

      let responseText = "";
      if (history && history.length > 0) {
        // Format history as expected by SDK
        const chat = ai.chats.create({
          model: 'gemini-3.5-flash',
          config: {
            systemInstruction,
          },
          history: history.map((msg: any) => ({
            role: msg.role,
            parts: [{ text: msg.parts[0]?.text || msg.text || '' }]
          }))
        });

        const response = await chat.sendMessage({ message: prompt });
        responseText = response.text || "No response text generated.";
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });
        responseText = response.text || "No response text generated.";
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Gemini Assistant Error:", error);
      res.status(500).json({ error: error.message || "An error occurred with Gemini API" });
    }
  });

  // Serve static assets or mount Vite dev server
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HackerAcademy - 0 to Pro Hacking Course</title>
  </head>
  <body class="bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve production static build
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[HackerAcademy Server] Up and running on port ${port}`);
  });
}

startServer();
