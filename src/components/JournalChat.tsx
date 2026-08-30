import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle, 
  RotateCcw, 
  Lightbulb, 
  Compass, 
  Heart, 
  Feather, 
  HelpCircle, 
  ArrowLeft,
  Loader2,
  Tag,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import type { JournalEntry, JournalMessage, JournalMode } from '../types';
import { JOURNAL_MODES, MOOD_EMOJIS } from '../lib/constants';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';

interface JournalChatProps {
  userId: string;
  initialEntry?: JournalEntry | null;
  initialPrompt?: string | null;
  initialMode?: JournalMode;
  onSaveEntry: (entry: JournalEntry) => Promise<void>;
  onBackToDashboard: () => void;
}

export const JournalChat: React.FC<JournalChatProps> = ({
  userId,
  initialEntry,
  initialPrompt,
  initialMode = 'mindful',
  onSaveEntry,
  onBackToDashboard,
}) => {
  const [mode, setMode] = useState<JournalMode>(initialEntry?.mode || initialMode);
  const [messages, setMessages] = useState<JournalMessage[]>(
    initialEntry?.messages || []
  );
  const [inputText, setInputText] = useState('');
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [entryTitle, setEntryTitle] = useState(initialEntry?.title || '');
  const [contextPrompt, setContextPrompt] = useState(initialPrompt || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    keyTakeaways: string[];
    primaryMood: string;
    moodEmoji: string;
    moodScore: number;
    energyLevel: 'High' | 'Moderate' | 'Low';
    themes: string[];
    reflectionPrompt: string;
  } | null>(initialEntry ? {
    summary: initialEntry.summary,
    keyTakeaways: initialEntry.keyTakeaways,
    primaryMood: initialEntry.primaryMood,
    moodEmoji: initialEntry.moodEmoji,
    moodScore: initialEntry.moodScore,
    energyLevel: initialEntry.energyLevel,
    themes: initialEntry.themes,
    reflectionPrompt: initialEntry.reflectionPrompt || '',
  } : null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentModeConfig = JOURNAL_MODES[mode];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingReply]);

  // If new conversation with an initial prompt, set starter
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleSendMessage(initialPrompt);
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoadingReply || isSummarizing) return;

    setErrorMsg(null);
    const userMsg: JournalMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: 'user',
      text,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoadingReply(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          mode,
          promptContext: contextPrompt || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const botMsg: JournalMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role: 'model',
        text: data.reply,
        timestamp: Date.now()
      };

      setMessages([...updatedMessages, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Failed to receive response from Gemini. Please try again.');
    } finally {
      setIsLoadingReply(false);
    }
  };

  const handleFinishAndSummarize = async () => {
    if (messages.length === 0) {
      setErrorMsg('Please write at least one thought before generating insights.');
      return;
    }

    setIsSummarizing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/summarize-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          mode
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to summarize session');
      }

      const summaryData = await res.json();
      setAnalysisResult(summaryData);
      const titleToUse = entryTitle || summaryData.title || `${currentModeConfig.name} Entry`;
      setEntryTitle(titleToUse);

      // Compute total word count
      const totalWords = messages.reduce((acc, m) => acc + m.text.split(/\s+/).filter(Boolean).length, 0);

      // Construct and save entry to Cloud Firestore
      const entryId = initialEntry?.id || `entry-${Date.now()}`;
      const newEntry: JournalEntry = {
        id: entryId,
        userId,
        title: titleToUse,
        createdAt: initialEntry?.createdAt || Date.now(),
        updatedAt: Date.now(),
        mode,
        messages,
        summary: summaryData.summary || '',
        keyTakeaways: summaryData.keyTakeaways || [],
        primaryMood: summaryData.primaryMood || 'Reflective',
        moodEmoji: summaryData.moodEmoji || MOOD_EMOJIS[summaryData.primaryMood] || '✨',
        moodScore: summaryData.moodScore || 7,
        energyLevel: summaryData.energyLevel || 'Moderate',
        themes: summaryData.themes || [],
        reflectionPrompt: summaryData.reflectionPrompt || '',
        isFavorite: initialEntry?.isFavorite || false,
        wordCount: totalWords
      };

      await onSaveEntry(newEntry);

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.error('Summarize error:', err);
      setErrorMsg(err.message || 'Failed to complete summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const wordCount = messages.reduce(
    (acc, m) => acc + m.text.split(/\s+/).filter(Boolean).length,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${currentModeConfig.badgeBg} ${currentModeConfig.badgeText} ${currentModeConfig.badgeBorder}`}>
                {currentModeConfig.name}
              </span>
              <span className="text-xs text-stone-400">
                {wordCount} words • {messages.length} exchanges
              </span>
            </div>
            <input
              type="text"
              placeholder="Session Title (Auto-generated if left blank)"
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              className="mt-1 font-serif text-lg sm:text-xl font-bold text-stone-900 placeholder:text-stone-300 border-none focus:outline-none focus:ring-0 p-0 w-full bg-transparent"
            />
          </div>
        </div>

        {/* Action Button: Finish & Generate Insights */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="finish-session-btn"
            onClick={handleFinishAndSummarize}
            disabled={messages.length === 0 || isSummarizing || isLoadingReply}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                <span>Synthesizing Insights...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Complete & Sync to Cloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs (only if conversation just started or user wants to switch) */}
      <div className="bg-stone-100/80 p-1 rounded-xl flex items-center gap-1 overflow-x-auto">
        {(Object.keys(JOURNAL_MODES) as JournalMode[]).map((modeKey) => {
          const cfg = JOURNAL_MODES[modeKey];
          const isCurrent = mode === modeKey;
          return (
            <button
              key={modeKey}
              onClick={() => setMode(modeKey)}
              className={`flex-1 min-w-[130px] px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                isCurrent
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <span>{cfg.name}</span>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Conversation Canvas */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-sm min-h-[480px] flex flex-col justify-between overflow-hidden">
        
        {/* Chat History */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[560px]">
          
          {/* Welcome Card if no messages yet */}
          {messages.length === 0 && (
            <div className="text-center py-8 px-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">
                {currentModeConfig.name}
              </h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                {currentModeConfig.description}
              </p>

              {/* Starter Prompts */}
              <div className="text-left">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Recommended Starter Prompts
                </div>
                <div className="space-y-2">
                  {currentModeConfig.starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-amber-50/70 border border-stone-200 hover:border-amber-200 text-xs font-medium text-stone-700 hover:text-amber-900 transition-all flex items-center justify-between group"
                    >
                      <span>"{prompt}"</span>
                      <Sparkles className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-600 transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Multi-turn Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isUser
                      ? 'bg-stone-900 text-white'
                      : 'bg-gradient-to-br from-amber-600 to-stone-900 text-amber-200 shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-700 text-white rounded-tr-xs shadow-xs'
                      : 'bg-stone-100 text-stone-800 rounded-tl-xs border border-stone-200/70'
                  }`}
                >
                  <div className="font-semibold text-[11px] mb-1 opacity-75">
                    {isUser ? 'You' : 'Gemini'}
                  </div>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoadingReply && (
            <div className="flex gap-3 flex-row items-center">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-amber-200 flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-stone-100 border border-stone-200/70 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-stone-500 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Gemini is reflecting...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* AI Analysis Summary Overlay if completed */}
        {analysisResult && (
          <div className="m-4 p-5 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border border-amber-300 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Journal Session Synthesized & Synced!
                </h4>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                Saved to Firestore
              </span>
            </div>

            <p className="text-xs text-stone-700 italic font-serif mb-3">
              "{analysisResult.summary}"
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-md font-semibold text-stone-800 flex items-center gap-1">
                <span>{analysisResult.moodEmoji}</span>
                <span>Mood: {analysisResult.primaryMood} ({analysisResult.moodScore}/10)</span>
              </span>
              <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-md font-semibold text-stone-800">
                Energy: {analysisResult.energyLevel}
              </span>
              {analysisResult.themes.map((t) => (
                <span key={t} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[11px]">
                  #{t}
                </span>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between">
              <p className="text-xs text-stone-500">
                You can continue adding messages or return to your dashboard.
              </p>
              <button
                onClick={onBackToDashboard}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Input Form Bar */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <textarea
              id="journal-input"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Share your thoughts with Gemini (${currentModeConfig.name})... [Shift+Enter for newline]`}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 resize-none transition-all placeholder:text-stone-400"
            />

            <button
              id="send-journal-msg-btn"
              type="submit"
              disabled={!inputText.trim() || isLoadingReply || isSummarizing}
              className="p-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95 shrink-0"
              title="Send thought"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
