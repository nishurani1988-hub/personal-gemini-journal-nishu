import React from 'react';
import { Tag, Compass } from 'lucide-react';
import type { JournalEntry } from '../types';

interface ThemeCloudProps {
  entries: JournalEntry[];
  selectedTheme: string | null;
  onSelectTheme: (theme: string | null) => void;
}

export const ThemeCloud: React.FC<ThemeCloudProps> = ({
  entries,
  selectedTheme,
  onSelectTheme,
}) => {
  // Aggregate themes
  const themeCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    (entry.themes || []).forEach((t) => {
      const normalized = t.trim();
      if (normalized) {
        themeCounts[normalized] = (themeCounts[normalized] || 0) + 1;
      }
    });
  });

  const sortedThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  if (sortedThemes.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center text-stone-500">
        <Tag className="w-5 h-5 text-stone-300 mx-auto mb-1.5" />
        <p className="text-xs font-medium">No themes generated yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-stone-700" />
          <h3 className="font-serif text-base font-bold text-stone-900">Key Recurring Themes</h3>
        </div>
        {selectedTheme && (
          <button
            onClick={() => onSelectTheme(null)}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>
      <p className="text-xs text-stone-500 mb-4">
        AI-extracted subject pillars from your reflections. Click a theme to filter entries.
      </p>

      <div className="flex flex-wrap gap-2">
        {sortedThemes.map(([theme, count]) => {
          const isSelected = selectedTheme === theme;
          return (
            <button
              key={theme}
              id={`theme-pill-${theme.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectTheme(isSelected ? null : theme)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-600/30'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/70'
              }`}
            >
              <span>{theme}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-amber-900/40 text-amber-100' : 'bg-stone-200/80 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
