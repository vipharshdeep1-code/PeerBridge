# PeerBridge

A React + Vite peer-learning prototype with an optional Gemini AI study buddy.

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and add a Gemini API key:

   ```env
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-4-hydrogen
   API_PORT=3001
   ```

   Create a key in [Google AI Studio](https://aistudio.google.com/apikey). Keep it in `.env`; never add it to React/browser code or commit it.
4. Start both the Vite app and local AI API with `npm run dev`.
5. Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

Without a key, the app still runs and clearly labels its local, subject-specific demo answers. Gemini free-tier access and quotas depend on the selected model and Google account; review the [Gemini API pricing and terms](https://ai.google.dev/gemini-api/docs/pricing) before use. Do not send sensitive information in prompts.

## Checks

- `npm run build`
- `npm run lint`
