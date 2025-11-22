import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { User, PageView } from './types';
import { getCurrentUser, logoutUserMock } from './services/storage';

const App = () => {
  const [currentView, setCurrentView] = useState<PageView>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    logoutUserMock();
    setCurrentUser(null);
    setCurrentView('HOME');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return <Home onNavigate={(id) => { console.log('Nav to', id); setDetailId(id); setCurrentView('LISTING_DETAIL'); }} />;
      
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
        // Placeholder for detail view
        return (
            <div className="max-w-4xl mx-auto py-40 px-6 text-center">
                <h2 className="text-4xl font-light uppercase mb-4">Signal Received: {detailId}</h2>
                <p className="font-mono text-secondary text-sm">Details classified.</p>
                <button onClick={() => setCurrentView('HOME')} className="mt-8 font-mono text-xs uppercase border-b border-white pb-1">Return</button>
            </div>
        );
        
      case 'ADMIN':
          return (
             <div className="max-w-4xl mx-auto py-40 px-6 text-center">
                <h2 className="text-4xl font-light uppercase mb-4">Admin Protocol</h2>
                <p className="font-mono text-secondary text-sm">Restricted Access.</p>
            </div> 
          );

      default:
        return <Home onNavigate={() => {}} />;
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