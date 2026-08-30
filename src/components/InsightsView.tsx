import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  RefreshCw, 
  ArrowRight, 
  Tag, 
  Heart, 
  Lightbulb, 
  Compass, 
  Zap, 
  Calendar, 
  ShieldCheck,
  Smile,
  AlertCircle
} from 'lucide-react';
import type { JournalEntry, MoodInsightReport, JournalMode } from '../types';
import { JOURNAL_MODES, MOOD_EMOJIS } from '../lib/constants';

interface InsightsViewProps {
  entries: JournalEntry[];
  insights: MoodInsightReport | null;
  isLoadingInsights: boolean;
  onRefreshInsights: () => void;
  onSelectPrompt: (prompt: string, mode: JournalMode) => void;
  onStartNewEntry: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  entries,
  insights,
  isLoadingInsights,
  onRefreshInsights,
  onSelectPrompt,
  onStartNewEntry,
}) => {
  // Compute analytics
  const totalEntries = entries.length;
  const moodDistribution: Record<string, number> = {};
  const energyDistribution: Record<string, number> = { High: 0, Moderate: 0, Low: 0 };
  let totalScore = 0;

  entries.forEach((e) => {
    if (e.primaryMood) {
      moodDistribution[e.primaryMood] = (moodDistribution[e.primaryMood] || 0) + 1;
    }
    if (e.energyLevel) {
      energyDistribution[e.energyLevel] = (energyDistribution[e.energyLevel] || 0) + 1;
    }
    totalScore += e.moodScore || 5;
  });

  const avgMood = totalEntries > 0 ? (totalScore / totalEntries).toFixed(1) : '7.0';
  const dominantMood = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Reflective';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      
      {/* Top Banner & Headline */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Original Feature • Mood & Reflection Insights</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-amber-50 mb-2">
              Emotional Velocity & Mindset Analytics
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Gemini analyzes your multi-turn journaling entries, extracting longitudinal patterns, emotional triggers, and actionable reflection prompts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="insights-refresh-btn"
              onClick={onRefreshInsights}
              disabled={isLoadingInsights || totalEntries === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingInsights ? 'animate-spin' : ''}`} />
              <span>{isLoadingInsights ? 'Analyzing Telemetry...' : 'Synthesize Insights'}</span>
            </button>
          </div>
        </div>

        {/* Quick telemetry metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div>
            <div className="text-xs text-amber-200/80 font-medium">Reflections Analyzed</div>
            <div className="text-2xl font-bold font-serif text-white mt-0.5">{totalEntries}</div>
          </div>
          <div>
            <div className="text-xs text-amber-200/80 font-medium">Avg Emotional Score</div>
            <div className="text-2xl font-bold font-serif text-white mt-0.5">
              {avgMood}<span className="text-xs text-amber-200/60 font-sans">/10</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-amber-200/80 font-medium">Dominant Mindset</div>
            <div className="text-xl font-bold font-serif text-white mt-0.5 flex items-center gap-1.5 truncate">
              <span>{MOOD_EMOJIS[dominantMood] || '✨'}</span>
              <span>{dominantMood}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-amber-200/80 font-medium">Data Security</div>
            <div className="text-xs font-semibold text-emerald-300 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Isolated Firestore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Insights Narrative */}
      {insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Weekly Synthesis & Growth Advice (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Holistic Weekly Synthesis Card */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Weekly Trajectory & Sentiment Synthesis
                </h3>
              </div>
              
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 mb-4 text-xs sm:text-sm font-semibold text-amber-900">
                ✨ {insights.overallSentiment}
              </div>

              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 prose prose-stone max-w-none">
                <p className="whitespace-pre-line">{insights.weeklyTrendSummary}</p>
              </div>

              {insights.growthAdvice && (
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-start gap-3 bg-stone-50/80 rounded-xl p-4">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Mindset & Wellness Recommendation
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1">
                      {insights.growthAdvice}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Emotional Highlights & Catalysts */}
            {insights.emotionalHighlights && insights.emotionalHighlights.length > 0 && (
              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Key Catalysts & Recurring Breakthroughs
                </h3>
                <ul className="space-y-2.5">
                  {insights.emotionalHighlights.map((hl, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                      <span className="text-amber-600 font-bold font-serif text-sm">0{idx + 1}</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personalized Prompts for the week */}
            <div className="bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 border border-amber-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-700" />
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Forward-Looking Action Prompts
                  </h3>
                </div>
                <span className="text-xs text-amber-800 font-medium">Click to begin session</span>
              </div>

              <div className="space-y-3">
                {insights.personalizedPrompts.map((p) => {
                  const modeCfg = JOURNAL_MODES[p.mode] || JOURNAL_MODES.mindful;
                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-stone-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${modeCfg.badgeBg} ${modeCfg.badgeText} ${modeCfg.badgeBorder}`}>
                            {modeCfg.name}
                          </span>
                          <span className="text-[11px] text-stone-400 font-medium">#{p.theme}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-stone-800 font-serif">
                          "{p.prompt}"
                        </p>
                        {p.reasoning && (
                          <p className="text-[11px] text-stone-500 italic">{p.reasoning}</p>
                        )}
                      </div>

                      <button
                        onClick={() => onSelectPrompt(p.prompt, p.mode)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shrink-0 active:scale-95"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Breakdown Charts & Themes (1 col) */}
          <div className="space-y-6">
            
            {/* Themes Breakdown */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-stone-700" />
                Dominant Thematic Pillars
              </h3>
              <div className="space-y-2.5">
                {insights.topThemes?.map((theme) => {
                  const sentimentColor =
                    theme.sentiment === 'Positive' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                    theme.sentiment === 'Challenging' ? 'text-amber-800 bg-amber-50 border-amber-200' :
                    'text-stone-700 bg-stone-100 border-stone-200';

                  return (
                    <div key={theme.name} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                      <div>
                        <div className="text-xs font-bold text-stone-800">{theme.name}</div>
                        <div className="text-[10px] text-stone-400">{theme.count} journal references</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${sentimentColor}`}>
                        {theme.sentiment}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Energy Distribution */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Energy Levels
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-stone-700 mb-1">
                    <span>High Energy</span>
                    <span>{energyDistribution.High} entries</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${totalEntries ? (energyDistribution.High / totalEntries) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-stone-700 mb-1">
                    <span>Moderate / Balanced</span>
                    <span>{energyDistribution.Moderate} entries</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${totalEntries ? (energyDistribution.Moderate / totalEntries) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-stone-700 mb-1">
                    <span>Rest / Low Energy</span>
                    <span>{energyDistribution.Low} entries</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-stone-400 h-2 rounded-full"
                      style={{ width: `${totalEntries ? (energyDistribution.Low / totalEntries) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Cloud Architecture Note */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-xs text-stone-600">
              <div className="font-bold text-stone-800 flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Strict Data Isolation
              </div>
              <p className="leading-relaxed text-stone-500">
                Your journal entries and mood telemetry are strictly isolated under your authenticated Firebase user ID in Cloud Firestore. No external party or other user can read or query your data.
              </p>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Generate Your First Mood & Reflection Report
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Click the button below to have Gemini analyze your recent journal conversations, detect emotional trends, and produce personalized reflection exercises.
          </p>
          <button
            onClick={onRefreshInsights}
            disabled={isLoadingInsights || totalEntries === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoadingInsights ? 'Synthesizing...' : 'Generate Insights Now'}</span>
          </button>
        </div>
      )}

    </div>
  );
};
