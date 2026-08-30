import React from 'react';
import { Sparkles, ArrowRight, RefreshCw, Compass, Lightbulb, Heart, BookOpen } from 'lucide-react';
import type { PersonalizedPrompt, JournalMode, MoodInsightReport } from '../types';
import { JOURNAL_MODES } from '../lib/constants';

interface PersonalizedPromptsCardProps {
  insights: MoodInsightReport | null;
  isLoadingInsights: boolean;
  onRefreshInsights: () => void;
  onSelectPrompt: (prompt: string, mode: JournalMode) => void;
  entriesCount: number;
}

export const PersonalizedPromptsCard: React.FC<PersonalizedPromptsCardProps> = ({
  insights,
  isLoadingInsights,
  onRefreshInsights,
  onSelectPrompt,
  entriesCount,
}) => {
  const fallbackPrompts: PersonalizedPrompt[] = [
    {
      id: 'fallback-1',
      prompt: "What is one bold idea or hypothesis you have been hesitant to share or test, and what is the real risk?",
      theme: "Courage & Innovation",
      mode: "brainstorm",
      reasoning: "Encourages creative confidence and psychological safety."
    },
    {
      id: 'fallback-2',
      prompt: "Looking back at the past few days, where did your energy flow most naturally vs. where did you feel drained?",
      theme: "Energy Management",
      mode: "mindful",
      reasoning: "Builds self-awareness of cognitive and emotional capacity."
    },
    {
      id: 'fallback-3',
      prompt: "What is one small, uncelebrated win from today that brought you a momentary sense of pride or peace?",
      theme: "Daily Gratitude",
      mode: "gratitude",
      reasoning: "Grounds the nervous system through positive savoring."
    }
  ];

  const prompts = insights?.personalizedPrompts?.length ? insights.personalizedPrompts : fallbackPrompts;

  return (
    <div className="bg-gradient-to-br from-amber-50/90 via-stone-50 to-amber-100/30 border border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Background aesthetic glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Personalized Reflection Prompts
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            {insights?.growthAdvice 
              ? insights.growthAdvice 
              : "AI-generated reflection prompts tailored to your recent themes and emotional velocity."}
          </p>
        </div>

        <button
          id="refresh-prompts-btn"
          onClick={onRefreshInsights}
          disabled={isLoadingInsights || entriesCount === 0}
          title="Regenerate prompts with Gemini"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsights ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
          <span className="hidden sm:inline">{isLoadingInsights ? 'Analyzing...' : 'Refresh AI Prompts'}</span>
        </button>
      </div>

      {/* Prompts list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {prompts.map((item) => {
          const modeConfig = JOURNAL_MODES[item.mode] || JOURNAL_MODES.mindful;
          return (
            <div
              key={item.id}
              className="bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400/80 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${modeConfig.badgeBg} ${modeConfig.badgeText} ${modeConfig.badgeBorder}`}>
                    {modeConfig.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium truncate max-w-[100px]">
                    {item.theme}
                  </span>
                </div>

                <p className="text-xs font-medium text-stone-800 leading-relaxed font-serif text-stone-900 group-hover:text-amber-950 transition-colors line-clamp-3">
                  "{item.prompt}"
                </p>

                {item.reasoning && (
                  <p className="text-[11px] text-stone-400 mt-2 italic line-clamp-2">
                    💡 {item.reasoning}
                  </p>
                )}
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex justify-end">
                <button
                  id={`use-prompt-${item.id}`}
                  onClick={() => onSelectPrompt(item.prompt, item.mode)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Journal on this</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
