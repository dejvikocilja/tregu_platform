import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ListingDetail from './pages/ListingDetail';
import { User, PageView } from './types';
import { onAuthStateChange, signOut } from './services/auth';
import { getUserProfile } from './services/database';

const App = () => {
  const [currentView, setCurrentView] = useState<PageView>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (session?.user) {
        // User logged in
        try {
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
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        // User logged out
        setCurrentUser(null);
      }
      
      setIsLoadingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  // Show loading while checking auth
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-xs text-secondary uppercase tracking-widest">Authenticating...</p>
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
