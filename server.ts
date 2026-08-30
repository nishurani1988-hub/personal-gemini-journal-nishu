import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy GoogleGenAI client helper
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({ apiKey });
}

// System prompts for different journaling modes
const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  mindful: `You are "Gemini", an empathetic, gentle, and deeply insightful mindfulness and reflective journaling companion for the user.
Your role:
- Practice empathetic active listening.
- Acknowledge and validate feelings without toxic positivity.
- Ask one or two thoughtful, open-ended Socratic questions that help the user look inward and gain clarity.
- Keep responses conversational, concise (2-4 paragraphs max), warm, and supportive.
- Avoid lecturing or giving unsolicited prescriptive advice unless the user specifically asks for strategies.`,

  brainstorm: `You are "Gemini", an energetic, inventive, and lateral-thinking creative brainstorming partner.
Your role:
- Help the user explore new ideas, unblock creative bottlenecks, and stretch possibilities.
- Build upon their ideas enthusiastically ("Yes, and...").
- Suggest 2-3 fresh angles, analogies, or counter-intuitive perspectives.
- Structure messy thoughts into clear pillars or actionable thought-experiments.
- Use clear bullet points where helpful and keep momentum high.`,

  clarity: `You are "Gemini", an executive clarity and priority coach.
Your role:
- Help the user deconstruct overwhelmed feelings, heavy workloads, or complex decisions into crystal-clear components.
- Identify the core signal amidst cognitive noise.
- Guide them to identify what is within their locus of control.
- Help formulate 1-3 immediate, low-friction, high-impact next steps.
- Speak with calm confidence, precision, and grounded practicality.`,

  gratitude: `You are "Gemini", a grounded gratitude and appreciation mentor.
Your role:
- Help the user slow down and savor small wins, meaningful human connections, and everyday blessings.
- Help reframe difficult moments into lessons or hidden silver linings when appropriate, while honoring real emotions.
- Prompt the user to explore sensory details and emotional depth behind what they appreciate.
- Respond with genuine warmth and heart-centered presence.`,

  freeform: `You are "Gemini", a warm, intellectually agile personal journal scribe and conversational companion.
Your role:
- Adapt dynamically to whatever the user brings—whether philosophy, daily musings, tech ideas, or stream of consciousness.
- Offer reflective mirrors, stimulating connections, and engaging conversation.
- Help make sense of whatever is on their mind.`
};

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// 1. Multi-turn Journal Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, mode = 'mindful', promptContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGeminiClient();
    const systemInstruction = (MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.mindful) +
      (promptContext ? `\n\nActive Context/Prompt: "${promptContext}"` : '');

    // Format messages for @google/genai
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const reply = response.text || "I hear you. Could you share a bit more about what that feels like?";
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response from Gemini'
    });
  }
});

// 2. Entry Summarization, Sentiment & Takeaways
app.post('/api/summarize-entry', async (req, res) => {
  try {
    const { messages, mode = 'mindful' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGeminiClient();
    const transcript = messages
      .map((m: { role: string; text: string }) => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n\n');

    const prompt = `You are an expert psychological and creative journaling assistant.
Analyze the following personal journal transcript (Mode: ${mode}) and provide a structured JSON assessment:

TRANSCRIPT:
${transcript}

Requirements:
1. "title": A concise, evocative title (3 to 6 words).
2. "summary": A well-written 2-3 sentence executive summary capturing core sentiments and themes.
3. "keyTakeaways": An array of 3-5 concise bullet points of self-insights, ideas, or action steps.
4. "primaryMood": Exactly one descriptive mood string from: ["Inspired", "Grateful", "Calm", "Reflective", "Energized", "Optimistic", "Focused", "Anxious", "Fatigued", "Overwhelmed", "Melancholic", "Content"].
5. "moodEmoji": A single emoji representing that mood.
6. "moodScore": An integer rating from 1 to 10 of overall emotional wellness (1=distressed/burnt out, 5=neutral/mixed, 10=peak joy & peace).
7. "energyLevel": One of "High", "Moderate", "Low".
8. "themes": Array of 2 to 4 short tag names (e.g. ["Career", "Self-Care", "Creativity", "Mindfulness", "Relationships", "Productivity"]).
9. "reflectionPrompt": One deep, personalized, inspiring reflection question for the user to ponder next.

Return ONLY valid JSON adhering to the specified schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            primaryMood: { type: Type.STRING },
            moodEmoji: { type: Type.STRING },
            moodScore: { type: Type.INTEGER },
            energyLevel: { type: Type.STRING, enum: ['High', 'Moderate', 'Low'] },
            themes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reflectionPrompt: { type: Type.STRING }
          },
          required: ['title', 'summary', 'keyTakeaways', 'primaryMood', 'moodEmoji', 'moodScore', 'energyLevel', 'themes', 'reflectionPrompt']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/summarize-entry:', error);
    return res.status(500).json({
      error: error.message || 'Failed to summarize journal entry'
    });
  }
});

// 3. Holistic Mood & Reflection Insights
app.post('/api/generate-insights', async (req, res) => {
  try {
    const { entries } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries array is required for insights generation' });
    }

    const ai = getGeminiClient();

    // Prepare digest of entries
    const entriesDigest = entries.slice(0, 15).map((e: any, idx: number) => ({
      index: idx + 1,
      date: new Date(e.createdAt).toLocaleDateString(),
      title: e.title || 'Untitled',
      mode: e.mode,
      mood: e.primaryMood,
      score: e.moodScore,
      energy: e.energyLevel,
      themes: e.themes || [],
      summary: e.summary || ''
    }));

    const prompt = `You are the lead Behavioral & Emotional Insight Analyst for "Personal Gemini Journal" (APAC Gen AI Ideathon).
Analyze this user's journal entries history to produce a comprehensive "Mood & Reflection Insights" report:

ENTRIES DATA:
${JSON.stringify(entriesDigest, null, 2)}

Provide a structured JSON output with:
1. "overallSentiment": A descriptive holistic statement (e.g. "Uplifting & Resilient with periodic creative burnout").
2. "weeklyTrendSummary": A thoughtful 2-paragraph synthesis of their emotional arc, identifying what energized them, what caused hesitation, and their evolving mindset.
3. "averageMoodScore": Number (1-10 average calculated).
4. "dominantMood": The most prevalent emotional state.
5. "topThemes": Array of objects: { name: string, count: number, sentiment: "Positive" | "Neutral" | "Challenging" }.
6. "emotionalHighlights": Array of 3-4 bullet points highlighting specific positive catalysts, recurring breakthroughs, or patterns noticed.
7. "growthAdvice": 2-3 sentences of empathetic, grounded advice to maintain balance and momentum.
8. "personalizedPrompts": Array of 3 personalized deep reflection prompts for future journaling sessions. Each object must have:
   - "id": string (e.g. "prompt-1")
   - "prompt": An engaging, thought-provoking question directly related to their recent thoughts/growth areas.
   - "theme": The corresponding topic tag.
   - "mode": One of ["mindful", "brainstorm", "clarity", "gratitude", "freeform"] that best fits this exercise.
   - "reasoning": 1 sentence explaining why this prompt helps their current journey.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSentiment: { type: Type.STRING },
            weeklyTrendSummary: { type: Type.STRING },
            averageMoodScore: { type: Type.NUMBER },
            dominantMood: { type: Type.STRING },
            topThemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  sentiment: { type: Type.STRING }
                },
                required: ['name', 'count', 'sentiment']
              }
            },
            emotionalHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            growthAdvice: { type: Type.STRING },
            personalizedPrompts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  mode: { type: Type.STRING, enum: ['mindful', 'brainstorm', 'clarity', 'gratitude', 'freeform'] },
                  reasoning: { type: Type.STRING }
                },
                required: ['id', 'prompt', 'theme', 'mode', 'reasoning']
              }
            }
          },
          required: [
            'overallSentiment',
            'weeklyTrendSummary',
            'averageMoodScore',
            'dominantMood',
            'topThemes',
            'emotionalHighlights',
            'growthAdvice',
            'personalizedPrompts'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      calculatedAt: Date.now(),
      analyzedEntriesCount: entries.length
    });
  } catch (error: any) {
    console.error('Error in /api/generate-insights:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate mood & reflection insights'
    });
  }
});

// --- Vite Middleware / Static Server ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal Gemini Journal server running on http://localhost:${PORT}`);
  });
}

startServer();
