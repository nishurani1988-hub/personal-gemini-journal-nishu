import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Flame, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Star, 
  Heart,
  Lightbulb,
  Compass,
  Zap,
  Smile,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import type { JournalEntry, MoodInsightReport, JournalMode, UserProfile } from '../types';
import { JOURNAL_MODES, MOOD_EMOJIS } from '../lib/constants';
import { MoodChart } from './MoodChart';
import { ThemeCloud } from './ThemeCloud';
import { PersonalizedPromptsCard } from './PersonalizedPromptsCard';
import { EntryCard } from './EntryCard';

interface DashboardProps {
  user: UserProfile | null;
  entries: JournalEntry[];
  insights: MoodInsightReport | null;
  isLoadingInsights: boolean;
  onRefreshInsights: () => void;
  onStartNewEntry: (prompt?: string, mode?: JournalMode) => void;
  onOpenEntryModal: (entry: JournalEntry) => void;
  onResumeEntry: (entry: JournalEntry) => void;
  onToggleFavorite: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  onOpenAuth: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  entries,
  insights,
  isLoadingInsights,
  onRefreshInsights,
  onStartNewEntry,
  onOpenEntryModal,
  onResumeEntry,
  onToggleFavorite,
  onDeleteEntry,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);
  const [selectedModeFilter, setSelectedModeFilter] = useState<JournalMode | null>(null);
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Compute stats
  const totalEntries = entries.length;
  const totalWords = useMemo(() => {
    return entries.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
  }, [entries]);

  // Compute journaling streak (consecutive days)
  const streakDays = useMemo(() => {
    if (entries.length === 0) return 0;
    const dates = Array.from(new Set(
      entries.map((e) => new Date(e.createdAt).toDateString())
    )).map((d) => new Date(d).getTime()).sort((a, b) => b - a);

    let streak = 1;
    const oneDayMs = 86400000;
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = dates[i] - dates[i + 1];
      if (diff <= oneDayMs * 1.5) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [entries]);

  // Dominant Mood
  const dominantMood = useMemo(() => {
    if (entries.length === 0) return 'Reflective';
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.primaryMood) counts[e.primaryMood] = (counts[e.primaryMood] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Reflective';
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = entry.title.toLowerCase().includes(query);
        const inSummary = (entry.summary || '').toLowerCase().includes(query);
        const inThemes = (entry.themes || []).some((t) => t.toLowerCase().includes(query));
        if (!inTitle && !inSummary && !inThemes) return false;
      }

      // Mood filter
      if (selectedMoodFilter && entry.primaryMood !== selectedMoodFilter) {
        return false;
      }

      // Mode filter
      if (selectedModeFilter && entry.mode !== selectedModeFilter) {
        return false;
      }

      // Theme filter
      if (selectedThemeFilter && !(entry.themes || []).includes(selectedThemeFilter)) {
        return false;
      }

      // Favorites only
      if (onlyFavorites && !entry.isFavorite) {
        return false;
      }

      return true;
    });
  }, [entries, searchQuery, selectedMoodFilter, selectedModeFilter, selectedThemeFilter, onlyFavorites]);

  const activeFiltersCount = 
    (selectedMoodFilter ? 1 : 0) + 
    (selectedModeFilter ? 1 : 0) + 
    (selectedThemeFilter ? 1 : 0) + 
    (onlyFavorites ? 1 : 0) + 
    (searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedMoodFilter(null);
    setSelectedModeFilter(null);
    setSelectedThemeFilter(null);
    setOnlyFavorites(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Hero Welcome & Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-br from-white via-amber-50/40 to-stone-100/60 border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Thinking & Reflection Space</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Ready to unpack your thoughts? Engage in a multi-turn conversation with Gemini or review your weekly emotional insights below.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            id="hero-new-journal-btn"
            onClick={() => onStartNewEntry()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Start New Reflection</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Streak */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">Journal Streak</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-0.5">
              {streakDays} <span className="text-xs font-sans font-normal text-stone-400">days</span>
            </div>
          </div>
        </div>

        {/* Total Entries */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">Total Entries</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-0.5">
              {totalEntries}
            </div>
          </div>
        </div>

        {/* Dominant Mood */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 text-xl">
            {MOOD_EMOJIS[dominantMood] || '✨'}
          </div>
          <div className="truncate">
            <div className="text-xs text-stone-500 font-medium">Dominant Mood</div>
            <div className="text-xl font-bold font-serif text-stone-900 mt-0.5 truncate">
              {dominantMood}
            </div>
          </div>
        </div>

        {/* Total Words */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">Total Words</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-0.5">
              {totalWords.toLocaleString()}
            </div>
          </div>
        </div>

      </div>

      {/* Feature Section: Mood & Reflection Insights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Mood & Reflection Insights
            </h2>
          </div>
          <button
            onClick={onRefreshInsights}
            disabled={isLoadingInsights || totalEntries === 0}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsights ? 'animate-spin' : ''}`} />
            <span>{isLoadingInsights ? 'Analyzing...' : 'Re-calculate Insights'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 7-Day / Weekly Mood Arc */}
          <div className="lg:col-span-2">
            <MoodChart entries={entries} onSelectEntry={onOpenEntryModal} />
          </div>

          {/* Key Themes Cloud */}
          <div>
            <ThemeCloud
              entries={entries}
              selectedTheme={selectedThemeFilter}
              onSelectTheme={setSelectedThemeFilter}
            />
          </div>
        </div>

        {/* Personalized Reflection Prompts */}
        <PersonalizedPromptsCard
          insights={insights}
          isLoadingInsights={isLoadingInsights}
          onRefreshInsights={onRefreshInsights}
          onSelectPrompt={(prompt, mode) => onStartNewEntry(prompt, mode)}
          entriesCount={totalEntries}
        />
      </section>

      {/* Journal Entries List & Explorer */}
      <section className="space-y-5 pt-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Recent Journal Entries ({filteredEntries.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Review past conversations, summaries, and action takeaways
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reflections or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`p-2.5 rounded-xl border transition-all ${
                onlyFavorites
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
              }`}
              title={onlyFavorites ? 'Show all entries' : 'Filter favorites only'}
            >
              <Star className={`w-4 h-4 ${onlyFavorites ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
            Filter by Mode:
          </span>

          <button
            onClick={() => setSelectedModeFilter(null)}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              selectedModeFilter === null
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            All Modes
          </button>

          {(Object.keys(JOURNAL_MODES) as JournalMode[]).map((modeKey) => {
            const cfg = JOURNAL_MODES[modeKey];
            const isSelected = selectedModeFilter === modeKey;
            return (
              <button
                key={modeKey}
                onClick={() => setSelectedModeFilter(isSelected ? null : modeKey)}
                className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cfg.name}
              </button>
            );
          })}

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-amber-700 hover:text-amber-900 font-semibold underline shrink-0 ml-2"
            >
              Reset ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Entries Grid */}
        {filteredEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onOpen={onOpenEntryModal}
                onResume={onResumeEntry}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteEntry}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {activeFiltersCount > 0 ? 'No matching journal entries found' : 'No reflections yet'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {activeFiltersCount > 0
                  ? 'Try adjusting your search criteria or clearing active filters.'
                  : 'Begin your first conversation with Gemini to unlock automated takeaways and mood insights.'}
              </p>
            </div>
            {activeFiltersCount > 0 ? (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={() => onStartNewEntry()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Start Your First Reflection</span>
              </button>
            )}
          </div>
        )}

      </section>

    </div>
  );
};
