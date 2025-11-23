import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Listing, Category } from '../types';
import { CATEGORIES } from '../constants';
import { getListings } from '../services/storage';
import ListingCard from '../components/ListingCard';
import { SectionHeader, Button, Input, Select } from '../components/DesignSystem';
import { Search, ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HomeProps {
  onNavigate: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Të gjitha');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Loading sequence
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Animate loader exit
  useEffect(() => {
    if (!isLoading && loaderRef.current) {
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          setHasEntered(true);
        }
      });
    }
  }, [isLoading]);

  // Main scroll animation
  useEffect(() => {
    if (!hasEntered) return;
    
    setListings(getListings());
    
    const ctx = gsap.context(() => {
      if (videoRef.current && containerRef.current && heroContentRef.current) {
        
        // Create main timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=200%",
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
              // Scrub video based on scroll
              if (videoRef.current && !isNaN(videoRef.current.duration)) {
                const videoTime = self.progress * videoRef.current.duration;
                videoRef.current.currentTime = videoTime;
              }
            }
          }
        });

        // Phase 1: Scale and fade main title
        tl.to(".hero-main-title", {
          scale: 1.2,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
        }, 0);

        // Phase 2: Fade in subtitle
        tl.fromTo(".hero-subtitle", 
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.3 },
          0.2
        );

        // Phase 3: Fade subtitle and show CTA
        tl.to(".hero-subtitle", {
          opacity: 0,
          y: -50,
          duration: 0.3
        }, 0.5);

        tl.fromTo(".hero-cta",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.3 },
          0.6
        );

        // Phase 4: Final fade to content
        tl.to(heroContentRef.current, {
          opacity: 0,
          duration: 0.2
        }, 0.85);

        // Video opacity changes
        tl.to(videoRef.current, {
          opacity: 0.3,
          duration: 0.2
        }, 0.85);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [hasEntered]);

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Të gjitha' || l.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, selectedCategory]);

  return (
    <>
      {/* LOADING SCREEN */}
      {(!hasEntered) && (
        <div 
          ref={loaderRef}
          className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center"
        >
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter text-white">
              Tregu
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="w-64 h-[2px] bg-border overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            />
          </div>

          {/* Loading Text */}
          <div className="mt-6 font-mono text-xs text-secondary uppercase tracking-widest">
            {isLoading ? 'Initializing System...' : 'Ready'}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="bg-background min-h-screen">
        
        {/* CINEMATIC HERO */}
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
          
          {/* Background Video */}
          <video 
            ref={videoRef}
            muted 
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_30fps.mp4"
          />
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Grain Texture */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 backgroundRepeat: 'repeat'
               }}
          />
          
          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-60" />

          {/* Content Layers */}
          <div ref={heroContentRef} className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
            
            {/* Main Title */}
            <div className="hero-main-title text-center">
              <h1 className="text-[15vw] md:text-[12vw] leading-none font-bold uppercase tracking-tighter text-white mb-4"
                  style={{ 
                    textShadow: '0 0 80px rgba(0,0,0,0.8)',
                    WebkitTextStroke: '2px rgba(255,255,255,0.1)'
                  }}>
                Tregu
              </h1>
              <p className="font-mono text-sm md:text-base text-white/70 uppercase tracking-[0.3em]">
                The Future of Commerce
              </p>
            </div>

            {/* Subtitle Message */}
            <div className="hero-subtitle opacity-0 absolute text-center max-w-3xl px-6">
              <h2 className="text-4xl md:text-7xl font-light uppercase tracking-tight text-white mb-6 leading-tight">
                Where Albania<br/>
                <span className="text-white/50">Buys & Sells</span>
              </h2>
              <div className="w-24 h-[1px] bg-white/30 mx-auto" />
            </div>

            {/* CTA Section */}
            <div className="hero-cta opacity-0 absolute text-center max-w-2xl px-6">
              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                Access thousands of verified listings.<br/>
                Automobiles. Real Estate. Electronics.
              </p>
              <button 
                onClick={() => {
                  document.querySelector('#listings-section')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="group px-12 py-5 bg-white text-black font-bold uppercase text-sm tracking-widest hover:bg-white/90 transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                Enter Platform
                <ArrowDown className="group-hover:translate-y-1 transition-transform" size={18} />
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              <span className="text-xs font-mono text-white/50 uppercase tracking-widest">Scroll</span>
              <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden">
                <div className="absolute w-full h-8 bg-white/60 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* LISTINGS SECTION */}
        <div id="listings-section" className="relative z-30 bg-background border-t border-white/10 min-h-screen">
          
          {/* Category Marquee */}
          <div className="border-b border-white/10 overflow-hidden whitespace-nowrap py-4 bg-surface">
            <div className="inline-block animate-marquee">
              {[...CATEGORIES, ...CATEGORIES].map((cat, idx) => (
                <span key={idx} className="text-xs font-mono uppercase tracking-widest text-secondary mx-8">
                  /// {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-24">
            
            {/* Filter Section */}
            <div className="mb-24">
              <SectionHeader title="Inventory" subtitle={`Displaying ${filteredListings.length} units`} />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Search Query</label>
                  <div className="relative">
                    <Search className="absolute left-0 top-4 text-secondary" size={16} />
                    <Input 
                      className="pl-8"
                      placeholder="KEYWORDS..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Department</label>
                  <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="Të gjitha">ALL SECTORS</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <Button onClick={() => {}} variant="outline" className="w-full md:w-auto">
                    Advanced Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Listing Grid */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                {filteredListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} onClick={onNavigate} />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-white/20 p-20 text-center">
                <p className="font-mono text-secondary">NO DATA FOUND</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </>
  );
};

export default Home;
