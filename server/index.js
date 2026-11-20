import 'dotenv/config'
import express from 'express'
import { GoogleGenAI } from '@google/genai'

const app = express()
const port = Number(process.env.API_PORT) || 3001
const model = process.env.GEMINI_MODEL || 'gemini-4-hydrogen'
const allowedSubjects = new Set([
  'DBMS',
  'C Programming',
  'Mathematics',
  'Python',
  'Data Structures',
])

app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    configured: Boolean(process.env.GEMINI_API_KEY),
    model,
  })
})

app.post('/api/chat', async (request, response) => {
  const { subject, topic, question, history = [] } = request.body ?? {}
  if (
    !allowedSubjects.has(subject)
    || typeof topic !== 'string'
    || typeof question !== 'string'
    || !question.trim()
    || question.length > 2000
    || !Array.isArray(history)
  ) {
    return response.status(400).json({ error: 'Please provide a valid subject and question.' })
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(503).json({
      error: 'Gemini is not configured. Add GEMINI_API_KEY to the local .env file.',
    })
  }

  const conversation = history
    .slice(-8)
    .filter((message) => (
      message
      && ['student', 'helper'].includes(message.sender)
      && typeof message.text === 'string'
    ))
    .map((message) => (
      `${message.sender === 'student' ? 'Student' : 'PeerBridge AI'}: ${message.text.slice(0, 1200)}`
    ))
    .join('\n')

  const prompt = [
    'You are PeerBridge, a friendly university peer tutor.',
    'Explain concepts clearly with a short step-by-step explanation and a simple example when useful.',
    'Stay focused on the student question, ask a clarifying question if needed, and say when you are unsure.',
    'Do not claim to be a human student or invent sources.',
    `Subject: ${subject}`,
    `Topic: ${topic.slice(0, 200)}`,
    conversation ? `Conversation so far:\n${conversation}` : '',
    `Student question: ${question.trim()}`,
  ].filter(Boolean).join('\n\n')

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const interaction = await ai.interactions.create({
      model,
      input: prompt,
      store: false,
    })
    const reply = interaction.output_text?.trim()
    if (!reply) {
      return response.status(502).json({ error: 'Gemini returned an empty answer. Please try again.' })
    }
    return response.json({ reply, model })
  } catch (error) {
    const status = error?.status === 429 ? 429 : 502
    console.error('Gemini API request failed.', { status: error?.status ?? 'unknown' })
    return response.status(status).json({
      error: status === 429
        ? 'The Gemini free-tier limit was reached. Wait a little and try again.'
        : 'Gemini could not answer right now. Check your API key and try again.',
    })
  }
})

app.listen(port, '127.0.0.1', () => {
  console.log(`PeerBridge AI API listening at http://127.0.0.1:${port}`)
})
