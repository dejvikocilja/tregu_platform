import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithFacebook } from '../services/auth';
import { getUserProfile } from '../services/database';
import { User } from '../types';
import { Button, Input, Card } from '../components/DesignSystem';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  initialView: 'LOGIN' | 'REGISTER';
}

const Login: React.FC<LoginProps> = ({ onLogin, initialView }) => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'LOGIN') {
        // Sign in
        const { user } = await signInWithEmail(email, password);
        
        if (user) {
          const profile = await getUserProfile(user.id);
          onLogin({
            id: profile.id,
            email: profile.email,
            name: profile.name || 'User',
            joinedDate: profile.created_at,
            listingCount: profile.listing_count,
            isVerified: profile.is_verified,
            role: profile.role
          });
        }
      } else {
        // Sign up
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { user } = await signUpWithEmail(email, password, name);
        
        if (user) {
          const profile = await getUserProfile(user.id);
          onLogin({
            id: profile.id,
            email: profile.email,
            name: profile.name || 'User',
            joinedDate: profile.created_at,
            listingCount: profile.listing_count,
            isVerified: profile.is_verified,
            role: profile.role
          });
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // OAuth will redirect, so we don't need to do anything else here
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithFacebook();
      // OAuth will redirect
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md p-12 border border-border">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-light uppercase tracking-tight mb-2">
            {view === 'LOGIN' ? 'Authenticate' : 'Initialize'}
          </h2>
          <p className="font-mono text-xs text-secondary uppercase tracking-widest">Tregu Secure Access</p>
        </div>
        
        {error && (
          <div className="bg-red-900/20 text-red-400 p-3 text-xs font-mono border border-red-900/50 mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {view === 'REGISTER' && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
                <UserIcon size={12} className="inline mr-2" />
                Full Name
              </label>
              <Input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                disabled={loading}
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
              <Mail size={12} className="inline mr-2" />
              Email Protocol
            </label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">
              <Lock size={12} className="inline mr-2" />
              Security Key
            </label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <Button className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Processing...
              </>
            ) : (
              view === 'LOGIN' ? 'Enter System' : 'Create Account'
            )}
          </Button>
        </form>

        {/* OAuth Options */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-secondary font-mono tracking-widest">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button 
              onClick={handleGoogleLogin}
              variant="outline"
              disabled={loading}
              type="button"
            >
              Google
            </Button>
            <Button 
              onClick={handleFacebookLogin}
              variant="outline"
              disabled={loading}
              type="button"
            >
              Facebook
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          {view === 'LOGIN' ? (
            <button 
              onClick={() => setView('REGISTER')} 
              className="text-[10px] font-mono uppercase text-secondary hover:text-white tracking-widest"
              disabled={loading}
            >
              Create New Identity
            </button>
          ) : (
            <button 
              onClick={() => setView('LOGIN')} 
              className="text-[10px] font-mono uppercase text-secondary hover:text-white tracking-widest"
              disabled={loading}
            >
              Return to Login
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Login;
