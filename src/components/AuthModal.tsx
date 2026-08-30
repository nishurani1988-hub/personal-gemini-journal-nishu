import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithGoogle, signInAsGuest } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState<'google' | 'guest' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading('google');
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Failed to complete Google Sign-In.');
    } finally {
      setLoading(null);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading('guest');
    setError(null);
    try {
      await signInAsGuest();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Guest Sign-In Error:', err);
      setError(err.message || 'Failed to continue as guest.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-stone-900 flex items-center justify-center mx-auto mb-3 text-white shadow-md shadow-amber-900/10">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Personal Gemini Journal
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Sign in to sync your reflections and mood telemetry to your isolated Cloud Firestore database.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            id="google-signin-action"
            onClick={handleGoogleSignIn}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-sm font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            {loading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Sign In with Google</span>
          </button>

          <button
            id="guest-signin-action"
            onClick={handleGuestSignIn}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            {loading === 'guest' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            <span>Continue as Guest Explorer</span>
          </button>
        </div>

        {/* Security & Isolation Promise */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500 justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Strict per-user data isolation enforced by Firestore security rules.</span>
        </div>

      </div>
    </div>
  );
};
