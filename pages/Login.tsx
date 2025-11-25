import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/auth';
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

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    console.log('🧪 Testing Supabase connection...');
    
    try {
      const { supabase } = await import('../services/supabase');
      
      console.log('✅ Supabase client exists:', !!supabase);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        alert(`Supabase Error: ${error.message}`);
      } else {
        console.log('✅ Supabase query success:', data);
        alert(`✅ Supabase Connected! Found ${data?.length || 0} categories`);
      }
      
      console.log('Environment check:', {
        hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        url: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...'
      });
      
    } catch (err) {
      console.error('❌ Test failed:', err);
      alert(`Test Failed: ${err}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=================================');
    console.log('🔵 FORM SUBMITTED - handleSubmit called!');
    console.log('View:', view);
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Name:', name);
    console.log('=================================');
    
    setError('');
    setLoading(true);

    try {
      if (view === 'LOGIN') {
        console.log('🔵 LOGIN PATH - Attempting login...');
        const result = await signInWithEmail(email, password);
        console.log('✅ Login result:', result);
        
        if (result.user) {
          console.log('🔵 Fetching user profile for:', result.user.id);
          const profile = await getUserProfile(result.user.id);
          console.log('✅ Profile loaded:', profile);
          
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
        console.log('🔵 REGISTER PATH - Starting registration...');
        
        // Validation
        if (!name.trim()) {
          console.log('❌ Name is empty');
          setError('Please enter your name');
          setLoading(false);
          return;
        }

        if (!email.trim() || !email.includes('@')) {
          console.log('❌ Invalid email');
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          console.log('❌ Password too short');
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        console.log('✅ Validation passed');
        console.log('🔵 Calling signUpWithEmail...');
        
        const result = await signUpWithEmail(email, password, name);
        
        console.log('✅ Sign up result:', result);
        console.log('User object:', result.user);
        console.log('Session object:', result.session);
        
        // Check if email confirmation is required
        if (result.user && !result.session) {
          console.log('📧 Email confirmation required');
          setError('');
          setLoading(false);
          alert('✅ Registration successful! Please check your email to confirm your account. Check spam folder if you don\'t see it.');
          setEmail('');
          setPassword('');
          setName('');
          setView('LOGIN');
          return;
        }
        
        // If session exists, user is logged in (email confirmation disabled)
        if (result.user && result.session) {
          console.log('🔵 No email confirmation needed, fetching profile...');
          const profile = await getUserProfile(result.user.id);
          console.log('✅ New profile loaded:', profile);
          
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
      console.error('=================================');
      console.error('❌ AUTHENTICATION ERROR');
      console.error('Error object:', err);
      console.error('Message:', err.message);
      console.error('Code:', err.code);
      console.error('Status:', err.status);
      console.error('=================================');
      
      if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email before logging in. Check your inbox.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message?.includes('User already registered')) {
        setError('This email is already registered. Please login instead.');
      } else {
        setError(err.message || 'Authentication failed. Check console for details.');
      }
    } finally {
      console.log('🔵 Setting loading to false');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // DIRECT BUTTON CLICK HANDLER FOR DEBUGGING
  const handleButtonClick = () => {
    console.log('🔴 BUTTON CLICKED DIRECTLY!');
    console.log('Form values:', { email, password, name, view });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md p-12 border border-border">
        
        {/* Test Button */}
        <button
          onClick={testSupabaseConnection}
          className="w-full mb-4 p-2 bg-blue-500/20 border border-blue-500 text-blue-300 text-xs font-mono uppercase hover:bg-blue-500/30"
          type="button"
        >
          🧪 Test Supabase Connection
        </button>
        
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
                onChange={(e) => {
                  console.log('Name changed:', e.target.value);
                  setName(e.target.value);
                }}
                placeholder="Your name"
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
              onChange={(e) => {
                console.log('Email changed:', e.target.value);
                setEmail(e.target.value);
              }}
              placeholder="your@email.com"
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
              onChange={(e) => {
                console.log('Password changed, length:', e.target.value.length);
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full" 
            disabled={loading}
            onClick={handleButtonClick}
          >
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

          <div className="mt-6">
            <Button 
              onClick={handleGoogleLogin}
              variant="outline"
              disabled={loading}
              type="button"
              className="w-full"
            >
              Continue with Google
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          {view === 'LOGIN' ? (
            <button 
              onClick={() => {
                console.log('Switching to REGISTER view');
                setView('REGISTER');
              }} 
              className="text-[10px] font-mono uppercase text-secondary hover:text-white tracking-widest"
              disabled={loading}
              type="button"
            >
              Create New Identity
            </button>
          ) : (
            <button 
              onClick={() => {
                console.log('Switching to LOGIN view');
                setView('LOGIN');
              }} 
              className="text-[10px] font-mono uppercase text-secondary hover:text-white tracking-widest"
              disabled={loading}
              type="button"
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
