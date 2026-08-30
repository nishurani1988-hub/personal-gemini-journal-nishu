import type { JournalMode } from '../types';

export interface ModeConfig {
  id: JournalMode;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  starterPrompts: string[];
}

export const JOURNAL_MODES: Record<JournalMode, ModeConfig> = {
  mindful: {
    id: 'mindful',
    name: 'Mindful Reflection',
    tagline: 'Deep Inward Check-in',
    description: 'Explore feelings, unpack internal dialogue, and find grounding and emotional resonance.',
    iconName: 'Sparkles',
    accentColor: 'amber',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    starterPrompts: [
      "What is occupying the most mental bandwidth in my head right now?",
      "How did I react to an unexpected challenge today, and what did that reveal about me?",
      "What is something I need to forgive myself for or let go of today?",
      "Where in my body am I holding tension, and what thought is tied to it?"
    ]
  },
  brainstorm: {
    id: 'brainstorm',
    name: 'Creative Brainstorming',
    tagline: 'Idea Sandbox & Expansion',
    description: 'Flesh out nascent concepts, connect non-obvious dots, and break creative blocks.',
    iconName: 'Lightbulb',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-800',
    starterPrompts: [
      "I have a rough idea for a new project/initiative. Help me pressure-test it from 3 angles.",
      "If there were zero resource constraints, how would I revolutionize my current workflow?",
      "What is an unsolved problem I encountered this week that deserves a creative solution?",
      "Help me combine two completely unrelated domains I enjoy into a unique prototype."
    ]
  },
  clarity: {
    id: 'clarity',
    name: 'Clarity & Priorities',
    tagline: 'Cognitive De-cluttering',
    description: 'Cut through overwhelm, organize priorities, and turn ambiguity into 3 concrete actions.',
    iconName: 'Compass',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-800',
    starterPrompts: [
      "I feel pulled in five directions. Help me identify the single highest-leverage task for today.",
      "I am dreading a specific decision. Walk me through clarifying my core criteria.",
      "Help me break down a daunting multi-week goal into 3 realistic micro-steps for this afternoon.",
      "What tasks am I doing out of habit that provide almost zero real value?"
    ]
  },
  gratitude: {
    id: 'gratitude',
    name: 'Gratitude & Savoring',
    tagline: 'Heart-Centered Grounding',
    description: 'Savor small moments, acknowledge supportive people, and nurture emotional resilience.',
    iconName: 'Heart',
    accentColor: 'rose',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-800',
    starterPrompts: [
      "Who is someone whose presence made my week noticeably better, and why?",
      "What is a tiny sensory pleasure or comfort I enjoyed today (a cup of tea, sunlight, music)?",
      "What is a past obstacle that I am now genuinely grateful I had to overcome?",
      "What is a personal strength I often take for granted that supported me recently?"
    ]
  },
  freeform: {
    id: 'freeform',
    name: 'Freeform Stream',
    tagline: 'Unfiltered Thought Flow',
    description: 'Write without constraints. Gemini will mirror, organize, and highlight hidden gems.',
    iconName: 'Feather',
    accentColor: 'stone',
    badgeBg: 'bg-stone-100',
    badgeBorder: 'border-stone-200',
    badgeText: 'text-stone-800',
    starterPrompts: [
      "Here is everything swirling through my mind without any filter right now...",
      "I noticed a curious pattern in human behavior today...",
      "A question I have been wrestling with all morning is...",
      "Let's reflect on the trajectory of this month so far."
    ]
  }
};

export const MOOD_EMOJIS: Record<string, string> = {
  Inspired: '✨',
  Grateful: '🙏',
  Calm: '🍃',
  Reflective: '🧠',
  Energized: '⚡',
  Optimistic: '🌅',
  Focused: '🎯',
  Anxious: '🌧️',
  Fatigued: '☕',
  Overwhelmed: '🌀',
  Melancholic: '🌊',
  Content: '🌸'
};

export const MOOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Inspired: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Grateful: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  Calm: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  Reflective: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Energized: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Optimistic: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Focused: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Anxious: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  Fatigued: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' },
  Overwhelmed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Melancholic: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Content: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
};

export const SAMPLE_STARTER_ENTRIES = (userId: string) => [
  {
    id: 'entry-demo-1',
    userId,
    title: 'APAC Ideathon Strategy & Creative Breakthrough',
    createdAt: Date.now() - 86400000 * 1.5,
    updatedAt: Date.now() - 86400000 * 1.5,
    mode: 'brainstorm' as JournalMode,
    wordCount: 342,
    primaryMood: 'Inspired',
    moodEmoji: '✨',
    moodScore: 9,
    energyLevel: 'High' as const,
    themes: ['Gen AI Academy', 'Innovation', 'Creativity', 'Ideathon'],
    summary: 'Explored architectural patterns for multi-turn AI journaling and emotional telemetry. Clarified the unique value of structured mood synthesis and secure user isolation in Firestore.',
    keyTakeaways: [
      'Focus the user experience around intuitive prompt archetypes to eliminate blank page paralysis',
      'The Mood & Reflection Insights engine provides genuine longitudinal value beyond one-off chats',
      'Prioritize privacy-first Firestore rules so users feel 100% safe being vulnerable'
    ],
    reflectionPrompt: 'How can you translate this creative momentum into a tangible step for tomorrow?',
    messages: [
      {
        id: 'msg-1',
        role: 'user' as const,
        text: 'I want to brainstorm how AI can transform daily journaling from a passive chore into an active, empathetic thinking partner.',
        timestamp: Date.now() - 86400000 * 1.5
      },
      {
        id: 'msg-2',
        role: 'model' as const,
        text: "That's a powerful inquiry. Most journaling apps are blank text boxes that invite cognitive friction. An AI partner can act as a gentle Socratic mirror—asking the exact question you didn't know you needed to answer, while unobtrusively distilling your emotional patterns over time. What specific friction point in your own journaling would you want eliminated first?",
        timestamp: Date.now() - 86400000 * 1.5 + 4000
      }
    ],
    isFavorite: true
  },
  {
    id: 'entry-demo-2',
    userId,
    title: 'Finding Stillness Amidst High-Speed Sprints',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    mode: 'mindful' as JournalMode,
    wordCount: 280,
    primaryMood: 'Calm',
    moodEmoji: '🍃',
    moodScore: 8,
    energyLevel: 'Moderate' as const,
    themes: ['Mindfulness', 'Work-Life Balance', 'Self-Compassion'],
    summary: 'Reflected on managing cognitive load during intense development cycles. Practiced intentional breathing and identified boundaries for evening decompression.',
    keyTakeaways: [
      'Productivity without stillness leads to diminished creative intuition',
      'A 10-minute walk without phone notifications acts as a mental reset button',
      'Accepting partial progress today makes tomorrow much more sustainable'
    ],
    reflectionPrompt: 'What boundary can you set this evening to protect your calm?',
    messages: [
      {
        id: 'msg-3',
        role: 'user' as const,
        text: 'Felt a bit drained from consecutive meetings today, but taking a mindful pause helped me regain perspective.',
        timestamp: Date.now() - 86400000 * 3
      },
      {
        id: 'msg-4',
        role: 'model' as const,
        text: "Recognizing that drain before it turns into chronic exhaustion is a remarkable victory of self-awareness. Notice how your body feels right now when you grant yourself permission to simply be, rather than produce. What is one small ritual you can enjoy tonight purely for your own rest?",
        timestamp: Date.now() - 86400000 * 3 + 5000
      }
    ],
    isFavorite: false
  }
];
