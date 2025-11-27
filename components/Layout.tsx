import React, { useState } from 'react';
import { User, PageView } from '../types';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  setCurrentView: (view: PageView) => void;
  onLogout: () => void;
  currentView: PageView;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, setCurrentView, onLogout, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-white selection:text-black">
      
      {/* Navigation - Fixed Top HUD */}
      <header className="fixed top-0 left-0 right-0 z-[9990] bg-background/80 backdrop-blur-sm border-b border-white/10 px-6 py-6 flex justify-between items-center">
        {/* Logo Area */}
        <div className="cursor-pointer group" onClick={() => setCurrentView('HOME')}>
          <h1 className="text-2xl font-bold tracking-tighter uppercase leading-none group-hover:opacity-70 transition-opacity text-white">
            Tregu<span className="text-xs align-top opacity-50">©2024</span>
          </h1>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-widest text-white">
             <button 
               onClick={() => setCurrentView('HOME')} 
               className="hover:underline decoration-1 underline-offset-4"
             >
               Home
             </button>
             
             {currentUser ? (
                <>
                   <button 
                     onClick={() => setCurrentView('DASHBOARD')} 
                     className="hover:underline decoration-1 underline-offset-4"
                   >
                     Dashboard
                   </button>
                   <button 
                     onClick={() => setCurrentView('CREATE_LISTING')} 
                     className="hover:underline decoration-1 underline-offset-4"
                   >
                     Create Listing
                   </button>
                   <button 
                     onClick={handleLogoutClick} 
                     className="text-red-500 hover:text-red-400"
                   >
                     Logout
                   </button>
                </>
             ) : (
                <button 
                  onClick={() => setCurrentView('LOGIN')} 
                  className="hover:underline decoration-1 underline-offset-4"
                >
                  Login / Sign Up
                </button>
             )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-white">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Full Screen Menu Overlay */}
      <div className={`fixed inset-0 bg-background z-[9995] flex flex-col justify-center px-8 transition-transform duration-500 ease-expo ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform duration-300">
          <X size={32} />
        </button>
        
        <nav className="flex flex-col gap-6">
           <NavPacket label="01 / Home" onClick={() => {setCurrentView('HOME'); setIsMenuOpen(false)}} />
           
           {currentUser ? (
             <>
               <NavPacket label="02 / Dashboard" onClick={() => {setCurrentView('DASHBOARD'); setIsMenuOpen(false)}} />
               <NavPacket label="03 / Create Listing" onClick={() => {setCurrentView('CREATE_LISTING'); setIsMenuOpen(false)}} />
               <NavPacket label="04 / Logout" onClick={() => {handleLogoutClick({} as any); setIsMenuOpen(false)}} />
             </>
           ) : (
             <>
               <NavPacket label="02 / Login" onClick={() => {setCurrentView('LOGIN'); setIsMenuOpen(false)}} />
               <NavPacket label="03 / Sign Up" onClick={() => {setCurrentView('REGISTER'); setIsMenuOpen(false)}} />
             </>
           )}
        </nav>
      </div>

      <main className="relative z-10">
        {children}
      </main>

      <footer className="bg-surface border-t border-border py-20 px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h2 className="text-8xl font-bold tracking-tighter text-white/10 uppercase select-none">Tregu</h2>
          </div>
          <div className="flex flex-col gap-4 font-mono text-xs text-secondary uppercase tracking-widest">
            <span>Tirana, Albania</span>
            <span>Est. 2024</span>
            <span>System v1.0.6</span>
          </div>
          <div className="flex flex-col gap-4 font-mono text-xs text-secondary uppercase tracking-widest text-right">
             <a href="#" className="hover:text-white">Legal</a>
             <a href="#" className="hover:text-white">Privacy</a>
             <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavPacket = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button onClick={onClick} className="text-left text-4xl md:text-6xl font-light uppercase tracking-tight hover:pl-4 transition-all duration-300 hover:text-white text-secondary border-b border-white/10 pb-6">
    {label}
  </button>
)

export default Layout;
