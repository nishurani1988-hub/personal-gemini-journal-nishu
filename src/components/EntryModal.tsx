import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  MessageSquare,
  Bot,
  User,
  Heart,
  HelpCircle,
  Activity
} from 'lucide-react';
import type { JournalEntry } from '../types';
import { JOURNAL_MODES, MOOD_COLORS } from '../lib/constants';
import Markdown from 'react-markdown';

interface EntryModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
  onResume: (entry: JournalEntry) => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({ entry, onClose, onResume }) => {
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const modeConfig = JOURNAL_MODES[entry.mode] || JOURNAL_MODES.mindful;
  const moodStyle = MOOD_COLORS[entry.primaryMood] || {
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-200'
  };

  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopyMarkdown = () => {
    const md = `# ${entry.title}
*Date: ${formattedDate}*
*Mode: ${modeConfig.name}*
*Mood: ${entry.primaryMood} (${entry.moodScore || 5}/10, Energy: ${entry.energyLevel})*

## Executive Summary
${entry.summary}

## Key Takeaways
${entry.keyTakeaways?.map((t) => `- ${t}`).join('\n') || 'None'}

## Reflection Prompt
${entry.reflectionPrompt || 'None'}

---
## Full Transcript
${entry.messages.map((m) => `### ${m.role === 'user' ? 'User' : 'Gemini'}:\n${m.text}`).join('\n\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const md = `# ${entry.title}
*Date: ${formattedDate}*
*Mode: ${modeConfig.name}*
*Mood: ${entry.primaryMood} (${entry.moodScore || 5}/10, Energy: ${entry.energyLevel})*

## Executive Summary
${entry.summary}

## Key Takeaways
${entry.keyTakeaways?.map((t) => `- ${t}`).join('\n') || 'None'}

---
## Conversation
${entry.messages.map((m) => `**${m.role === 'user' ? 'You' : 'Gemini'}**: ${m.text}`).join('\n\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/80 bg-stone-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${modeConfig.badgeBg} ${modeConfig.badgeText} ${modeConfig.badgeBorder}`}>
                {modeConfig.name}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${moodStyle.bg} ${moodStyle.text} ${moodStyle.border}`}>
                <span>{entry.moodEmoji || '✨'}</span>
                <span>{entry.primaryMood}</span>
                {entry.moodScore && <span className="font-bold">({entry.moodScore}/10)</span>}
              </span>
              <span className="text-xs text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-md font-medium">
                Energy: {entry.energyLevel}
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {entry.title}
            </h2>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{entry.wordCount || 0} words</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Executive Summary Card */}
          {entry.summary && (
            <div className="bg-gradient-to-br from-amber-50/90 to-stone-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif text-sm font-bold text-stone-900 uppercase tracking-wider">
                  AI Reflection Synthesis
                </h3>
              </div>
              <p className="text-sm text-stone-800 leading-relaxed font-serif italic">
                "{entry.summary}"
              </p>
            </div>
          )}

          {/* Key Takeaways */}
          {entry.keyTakeaways && entry.keyTakeaways.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Insights & Action Takeaways
              </h3>
              <ul className="space-y-2">
                {entry.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Forward-Looking Reflection Prompt */}
          {entry.reflectionPrompt && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-start gap-3">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Next Step Question</div>
                <div className="text-xs sm:text-sm font-medium text-stone-800 mt-0.5">
                  {entry.reflectionPrompt}
                </div>
              </div>
            </div>
          )}

          {/* Themes list */}
          {entry.themes && entry.themes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-500 font-semibold">Themes:</span>
              {entry.themes.map((t) => (
                <span
                  key={t}
                  className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-medium border border-stone-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Full Conversation History */}
          <div className="pt-4 border-t border-stone-200">
            <h3 className="font-serif text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-stone-700" />
              Full Session Transcript ({entry.messages?.length || 0} messages)
            </h3>

            <div className="space-y-4">
              {entry.messages?.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                        isUser
                          ? 'bg-stone-900 text-white'
                          : 'bg-gradient-to-br from-amber-600 to-stone-800 text-amber-200'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-amber-600 text-white rounded-tr-xs'
                          : 'bg-stone-100 text-stone-800 rounded-tl-xs border border-stone-200/80'
                      }`}
                    >
                      <div className="font-semibold text-[11px] mb-1 opacity-80">
                        {isUser ? 'You' : 'Gemini Companion'}
                      </div>
                      <div className={isUser ? 'text-white' : 'prose prose-sm prose-stone max-w-none'}>
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <div className="markdown-body">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export .md</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onResume(entry);
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              Resume Session
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
