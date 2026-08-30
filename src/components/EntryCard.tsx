import React from 'react';
import { Star, MessageSquare, Clock, ArrowUpRight, Trash2, Calendar } from 'lucide-react';
import type { JournalEntry } from '../types';
import { JOURNAL_MODES, MOOD_COLORS } from '../lib/constants';

interface EntryCardProps {
  entry: JournalEntry;
  onOpen: (entry: JournalEntry) => void;
  onResume: (entry: JournalEntry) => void;
  onToggleFavorite: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onOpen,
  onResume,
  onToggleFavorite,
  onDelete,
}) => {
  const modeConfig = JOURNAL_MODES[entry.mode] || JOURNAL_MODES.mindful;
  const moodStyle = MOOD_COLORS[entry.primaryMood] || {
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-200'
  };

  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 hover:shadow-md hover:border-stone-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Mode & Mood Badges + Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Mode badge */}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${modeConfig.badgeBg} ${modeConfig.badgeText} ${modeConfig.badgeBorder}`}>
              {modeConfig.name}
            </span>

            {/* Mood badge */}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${moodStyle.bg} ${moodStyle.text} ${moodStyle.border}`}>
              <span>{entry.moodEmoji || '✨'}</span>
              <span>{entry.primaryMood}</span>
              {entry.moodScore && <span className="opacity-75 font-semibold">({entry.moodScore}/10)</span>}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(entry);
              }}
              title={entry.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
              className={`p-1.5 rounded-full transition-colors ${
                entry.isFavorite ? 'text-amber-500 hover:text-amber-600 bg-amber-50' : 'text-stone-300 hover:text-amber-500'
              }`}
            >
              <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry);
              }}
              title="Delete entry"
              className="p-1.5 text-stone-300 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4
          onClick={() => onOpen(entry)}
          className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-900 transition-colors cursor-pointer line-clamp-2 mb-2"
        >
          {entry.title || 'Untitled Reflection'}
        </h4>

        {/* Summary Snippet */}
        <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 mb-4">
          {entry.summary || (entry.messages?.[0]?.text ? `"${entry.messages[0].text}"` : 'No summary generated yet.')}
        </p>

        {/* Themes tags */}
        {entry.themes && entry.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {entry.themes.slice(0, 3).map((theme) => (
              <span
                key={theme}
                className="text-[10px] bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded-full border border-stone-200/60"
              >
                #{theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Details Button */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{entry.messages?.length || 0} turns</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onResume(entry)}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Continue
          </button>
          <button
            onClick={() => onOpen(entry)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
          >
            <span>Review</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
