import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInAnonymously 
} from 'firebase/auth';
import { 
  auth, 
  logOut, 
  getJournalEntries, 
  saveJournalEntry, 
  deleteJournalEntry, 
  toggleFavoriteEntry,
  saveUserInsights,
  getUserInsights 
} from './lib/firebase';
import { SAMPLE_STARTER_ENTRIES } from './lib/constants';
import type { JournalEntry, MoodInsightReport, JournalMode, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { JournalChat } from './components/JournalChat';
import { InsightsView } from './components/InsightsView';
import { EntryModal } from './components/EntryModal';
import { AuthModal } from './components/AuthModal';
import { Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-entry' | 'insights'>('dashboard');
  
  // Journal entries state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  // Insights state
  const [insights, setInsights] = useState<MoodInsightReport | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Active chat session parameters
  const [chatInitialEntry, setChatInitialEntry] = useState<JournalEntry | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
  const [chatInitialMode, setChatInitialMode] = useState<JournalMode>('mindful');

  // Modals state
  const [selectedEntryForModal, setSelectedEntryForModal] = useState<JournalEntry | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 1. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });
      } else {
        // Automatically start guest session so app is immediately usable
        try {
          const guest = await signInAnonymously(auth);
          setUser({
            uid: guest.user.uid,
            email: null,
            displayName: 'Guest Explorer',
            photoURL: null,
          });
        } catch (err) {
          console.warn('Anonymous sign-in skipped:', err);
          setUser(null);
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch User's Firestore Entries & Insights when user ID changes
  useEffect(() => {
    if (!user?.uid) return;

    let isMounted = true;

    const fetchUserData = async () => {
      setIsLoadingEntries(true);
      try {
        let userEntries = await getJournalEntries(user.uid);
        
        // If first-time user with 0 entries, bootstrap with starter entries to demonstrate full capabilities
        if (userEntries.length === 0) {
          const defaultStarters = SAMPLE_STARTER_ENTRIES(user.uid);
          for (const starter of defaultStarters) {
            await saveJournalEntry(user.uid, starter);
          }
          userEntries = defaultStarters;
        }

        if (isMounted) {
          setEntries(userEntries);
        }

        // Fetch cached insights
        const cachedInsights = await getUserInsights(user.uid);
        if (isMounted && cachedInsights) {
          setInsights(cachedInsights);
        } else if (userEntries.length > 0) {
          // Generate initial insights synthesis
          generateInsights(userEntries, user.uid);
        }
      } catch (error) {
        console.error('Error loading Firestore entries:', error);
      } finally {
        if (isMounted) {
          setIsLoadingEntries(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // 3. Trigger Insights Generation with Gemini
  const generateInsights = async (currentEntries: JournalEntry[], uid: string) => {
    if (!uid || currentEntries.length === 0 || isLoadingInsights) return;
    setIsLoadingInsights(true);

    try {
      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: currentEntries })
      });

      if (res.ok) {
        const reportData = await res.json();
        setInsights(reportData);
        await saveUserInsights(uid, reportData);
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // 4. Handlers
  const handleSaveEntry = async (entry: JournalEntry) => {
    if (!user?.uid) return;
    
    // Save to Firestore
    await saveJournalEntry(user.uid, entry);

    // Update local state
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== entry.id);
      return [entry, ...filtered];
    });

    // Re-generate insights in background
    setTimeout(() => {
      if (user?.uid) {
        generateInsights([entry, ...entries.filter((e) => e.id !== entry.id)], user.uid);
      }
    }, 1000);
  };

  const handleDeleteEntry = async (entry: JournalEntry) => {
    if (!user?.uid) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${entry.title}"?`);
    if (!confirmDelete) return;

    try {
      await deleteJournalEntry(user.uid, entry.id);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      if (selectedEntryForModal?.id === entry.id) {
        setSelectedEntryForModal(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleFavorite = async (entry: JournalEntry) => {
    if (!user?.uid) return;
    const updatedStatus = !entry.isFavorite;
    try {
      await toggleFavoriteEntry(user.uid, entry.id, entry.isFavorite || false);
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, isFavorite: updatedStatus } : e))
      );
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  const handleStartNewEntry = (prompt?: string, mode?: JournalMode) => {
    setChatInitialEntry(null);
    setChatInitialPrompt(prompt || null);
    setChatInitialMode(mode || 'mindful');
    setActiveTab('new-entry');
  };

  const handleResumeEntry = (entry: JournalEntry) => {
    setChatInitialEntry(entry);
    setChatInitialPrompt(null);
    setChatInitialMode(entry.mode || 'mindful');
    setActiveTab('new-entry');
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setUser(null);
      setEntries([]);
      setInsights(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md animate-pulse">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
          <h2 className="font-serif text-lg font-bold text-stone-900">Personal Gemini Journal</h2>
          <p className="text-xs text-stone-500 flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Connecting to secure session...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        totalEntries={entries.length}
      />

      {/* Main Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            entries={entries}
            insights={insights}
            isLoadingInsights={isLoadingInsights}
            onRefreshInsights={() => user?.uid && generateInsights(entries, user.uid)}
            onStartNewEntry={handleStartNewEntry}
            onOpenEntryModal={(entry) => setSelectedEntryForModal(entry)}
            onResumeEntry={handleResumeEntry}
            onToggleFavorite={handleToggleFavorite}
            onDeleteEntry={handleDeleteEntry}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'new-entry' && (
          <JournalChat
            userId={user?.uid || 'guest'}
            initialEntry={chatInitialEntry}
            initialPrompt={chatInitialPrompt}
            initialMode={chatInitialMode}
            onSaveEntry={handleSaveEntry}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            entries={entries}
            insights={insights}
            isLoadingInsights={isLoadingInsights}
            onRefreshInsights={() => user?.uid && generateInsights(entries, user.uid)}
            onSelectPrompt={(prompt, mode) => handleStartNewEntry(prompt, mode)}
            onStartNewEntry={() => handleStartNewEntry()}
          />
        )}
      </main>

      {/* Entry Full Transcript & Summary Modal */}
      <EntryModal
        entry={selectedEntryForModal}
        onClose={() => setSelectedEntryForModal(null)}
        onResume={handleResumeEntry}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-stone-700">
            <span>Personal Gemini Journal</span>
            <span>•</span>
            <span className="text-amber-800">Gen AI Academy APAC Ideathon</span>
          </div>
          <div className="text-stone-400 text-[11px]">
            Powered by Google Gemini 2.5 Flash & Firebase Cloud Firestore
          </div>
        </div>
      </footer>

    </div>
  );
}
