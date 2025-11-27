import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ListingDetail from './pages/ListingDetail';
import { User, PageView } from './types';
import { onAuthStateChange, signOut, getCurrentSession } from './services/auth';
import { getUserProfile, upsertUserProfile } from './services/database';

const App = () => {
  const [currentView, setCurrentView] = useState<PageView>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        // Check for existing session first
        const session = await getCurrentSession();
        
        if (session?.user && mounted) {
          console.log('👤 Found existing session, loading profile...');
          await loadUserProfile(session.user.id);
        }
        
        if (mounted) {
          setIsLoadingAuth(false);
          console.log('✅ Auth initialization complete');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setIsLoadingAuth(false);
        }
      }
    };

    // Initialize auth immediately
    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔐 Auth state changed:', event);

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        console.log('👋 User logged out');
        setCurrentUser(null);
      }
    });

    // Safety timeout - if auth check takes too long, show the app anyway
    const timeout = setTimeout(() => {
      if (mounted && isLoadingAuth) {
        console.warn('⚠️ Auth check timeout, proceeding without auth');
        setIsLoadingAuth(false);
      }
    }, 5000); // 5 seconds max

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('👤 Loading user profile...');
      const profile = await getUserProfile(userId);
      
      setCurrentUser({
        id: profile.id,
        email: profile.email,
        name: profile.name || 'User',
        joinedDate: profile.created_at,
        listingCount: profile.listing_count,
        isVerified: profile.is_verified,
        role: profile.role
      });
      console.log('✅ User profile loaded successfully');
    } catch (error) {
      console.log('📝 Profile not found, attempting to create...');
      
      // Try to get user email from auth
      const session = await getCurrentSession();
      if (session?.user?.email) {
        try {
          await upsertUserProfile(session.user.id, {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || 'User',
            free_listing_used: false,
            listing_count: 0,
            is_verified: !!session.user.email_confirmed_at,
            role: 'user'
          });
          
          const profile = await getUserProfile(session.user.id);
          setCurrentUser({
            id: profile.id,
            email: profile.email,
            name: profile.name || 'User',
            joinedDate: profile.created_at,
            listingCount: profile.listing_count,
            isVerified: profile.is_verified,
            role: profile.role
          });
          console.log('✅ New user profile created');
        } catch (createError) {
          console.error('❌ Failed to create profile:', createError);
        }
      }
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setCurrentView('HOME');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show auth loading ONLY during initial check
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-xs text-secondary uppercase tracking-widest">Authenticating...</p>
          <p className="font-mono text-[8px] text-secondary/50 mt-2">Connecting to database...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return <Home onNavigate={(id) => { setDetailId(id); setCurrentView('LISTING_DETAIL'); }} />;
      
      case 'CREATE_LISTING':
        if (!currentUser) return <Login onLogin={handleLogin} initialView="LOGIN" />;
        return (
          <CreateListing 
            currentUser={currentUser} 
            onSuccess={() => setCurrentView('DASHBOARD')} 
            onUpdateUser={setCurrentUser}
          />
        );
      
      case 'DASHBOARD':
        if (!currentUser) return <Login onLogin={handleLogin} initialView="LOGIN" />;
        return <Dashboard currentUser={currentUser} />;
      
      case 'LOGIN':
        return <Login onLogin={handleLogin} initialView="LOGIN" />;
        
      case 'REGISTER':
        return <Login onLogin={handleLogin} initialView="REGISTER" />;
        
      case 'LISTING_DETAIL':
        if (!detailId) {
          setCurrentView('HOME');
          return null;
        }
        return (
          <ListingDetail 
            listingId={detailId}
            onBack={() => setCurrentView('HOME')}
            currentUser={currentUser}
          />
        );
        
      case 'ADMIN':
        return (
          <div className="max-w-4xl mx-auto py-40 px-6 text-center">
            <h2 className="text-4xl font-light uppercase mb-4">Admin Protocol</h2>
            <p className="font-mono text-secondary text-sm">Restricted Access.</p>
          </div> 
        );

      default:
        return <Home onNavigate={(id) => { setDetailId(id); setCurrentView('LISTING_DETAIL'); }} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      setCurrentView={setCurrentView} 
      onLogout={handleLogout}
      currentView={currentView}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
