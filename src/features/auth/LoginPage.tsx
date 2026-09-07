import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { isFirebaseConfigured } from '../../services/firebase';
import { Zap, ShieldCheck, Mail, Lock, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInDemo, signInWithEmail, signUpWithEmail, signInWithGoogle, isLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;

    try {
      if (isRegister) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    try {
      await signInDemo();
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 font-black text-white text-xl shadow-lg shadow-sky-500/20 mb-1">
            H
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Hentamo Apps
          </h1>
          <p className="text-xs text-slate-400">
            Personal Project Management & Developer Command Center
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 space-y-5 border-slate-800/90 shadow-2xl">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Sign-In (Recommended for solo local dev) */}
          <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Zap size={14} /> Solo Developer Mode
              </span>
              <span className="text-[10px] font-mono text-slate-400">Instant Access</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch directly as Nijas Moideen with a clean workspace ready for your projects.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full mt-1 font-semibold"
              onClick={handleDemoSignIn}
              isLoading={isLoading}
              leftIcon={<Zap size={14} />}
            >
              Launch Developer Workspace
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#111827] px-3 text-[11px] font-mono uppercase text-slate-500 shrink-0">
              Or Firebase Auth
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Email Address"
              type="email"
              placeholder="developer@hentamo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              leftIcon={<Mail size={15} />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              leftIcon={<Lock size={15} />}
            />

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full"
              isLoading={isLoading}
            >
              {isRegister ? 'Create Account' : 'Sign In with Email'}
            </Button>
          </form>

          {/* Google Sign In */}
          {isFirebaseConfigured && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={signInWithGoogle}
              isLoading={isLoading}
            >
              Sign In with Google
            </Button>
          )}

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : 'Need to create an account? Register'}
            </button>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 font-mono">
          Single-User Personal Workspace &bull; Dark-First UI &bull; Offline Ready
        </div>
      </div>
    </div>
  );
};
