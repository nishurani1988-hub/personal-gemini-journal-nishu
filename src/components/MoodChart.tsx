import React from 'react';
import { TrendingUp, Activity, Sparkles } from 'lucide-react';
import type { JournalEntry } from '../types';
import { MOOD_EMOJIS } from '../lib/constants';

interface MoodChartProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

export const MoodChart: React.FC<MoodChartProps> = ({ entries, onSelectEntry }) => {
  // Sort entries chronological for graph
  const chronological = [...entries]
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-7); // Last 7 entries

  if (chronological.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center text-stone-500">
        <Activity className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-sm font-medium">No mood history yet</p>
        <p className="text-xs text-stone-400 mt-1">Start a journal entry to begin tracking your emotional cadence.</p>
      </div>
    );
  }

  const averageScore = Math.round(
    (chronological.reduce((acc, curr) => acc + (curr.moodScore || 5), 0) / chronological.length) * 10
  ) / 10;

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-stone-900">Weekly Mood & Energy Arc</h3>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>AI Mood Score</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Trajectory of emotional wellness across your latest {chronological.length} reflections
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-stone-900 font-serif">
            {averageScore}<span className="text-xs text-stone-400 font-sans font-normal">/10</span>
          </div>
          <div className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
            Avg Score
          </div>
        </div>
      </div>

      {/* SVG Timeline Chart */}
      <div className="relative pt-6 pb-2">
        <div className="h-44 sm:h-48 w-full flex items-end justify-between gap-2 sm:gap-3 px-1 border-b border-stone-200">
          {chronological.map((entry, idx) => {
            const score = entry.moodScore || 5;
            const heightPercent = Math.max(15, (score / 10) * 100);
            const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, {
              weekday: 'short',
              day: 'numeric',
            });
            const emoji = entry.moodEmoji || MOOD_EMOJIS[entry.primaryMood] || '✨';

            const energyColor = 
              entry.energyLevel === 'High' ? 'bg-amber-500' :
              entry.energyLevel === 'Low' ? 'bg-stone-400' : 'bg-emerald-500';

            return (
              <div
                key={entry.id || idx}
                onClick={() => onSelectEntry && onSelectEntry(entry)}
                className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end relative"
                title={`${entry.title} - Score: ${score}/10 (${entry.primaryMood})`}
              >
                {/* Floating tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-stone-900 text-white text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg flex items-center gap-1.5">
                  <span>{emoji}</span>
                  <span className="font-semibold">{entry.primaryMood}</span>
                  <span className="text-stone-300">({score}/10)</span>
                </div>

                {/* Score Pill */}
                <div className="mb-2 text-xs font-bold text-stone-700 group-hover:text-amber-600 transition-colors flex items-center gap-1">
                  <span>{emoji}</span>
                  <span className="hidden sm:inline">{score}</span>
                </div>

                {/* Animated Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[42px] bg-gradient-to-t from-stone-200 via-amber-200 to-amber-400 group-hover:to-amber-500 rounded-t-lg transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${energyColor}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Dates */}
        <div className="flex justify-between items-center text-[11px] text-stone-500 mt-2 px-1 font-medium">
          {chronological.map((entry, idx) => (
            <div key={entry.id || idx} className="flex-1 text-center truncate px-0.5">
              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'numeric',
                day: 'numeric'
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Energy Legend */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Energy:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Energy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Moderate / Balanced
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400" /> Rest / Low Energy
          </span>
        </div>
        <span className="text-stone-400 text-[11px]">Click any bar to review session</span>
      </div>
    </div>
  );
};
