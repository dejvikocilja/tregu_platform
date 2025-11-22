import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Listing, Category, ListingType } from '../types';
import { CATEGORIES } from '../constants';
import { getListings } from '../services/storage';
import ListingCard from '../components/ListingCard';
import { SectionHeader, Button, Input, Select } from '../components/DesignSystem';
import { Search, ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface HomeProps {
  onNavigate: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Të gjitha');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setListings(getListings());
    
    const ctx = gsap.context(() => {
        if (videoRef.current && containerRef.current) {
            
            // Pin the hero section for a long scroll duration
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top top",
                end: "+=300%", // 3x viewport height scroll distance
                pin: true,
                scrub: 1, // smooth scrubbing
                onUpdate: (self) => {
                    // Map scroll progress (0 to 1) to video duration
                    if (videoRef.current && !isNaN(videoRef.current.duration)) {
                         const videoTime = self.progress * videoRef.current.duration;
                         videoRef.current.currentTime = videoTime;
                    }
                }
            });

            // Animate Text In/Out based on scroll phases
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=300%",
                    scrub: 1,
                }
            });

            // Phase 1: Main Title stays, then fades
            tl.to(".hero-title", { opacity: 1, duration: 0.1 }) // ensure visible
              .to(".hero-title", { scale: 1.1, letterSpacing: "0.1em", opacity: 0, duration: 0.3 }, 0.2);

            // Phase 2: Secondary Message Reveal
            tl.fromTo(".hero-message", 
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3 }, 
                0.4
            );
            
            // Phase 3: Fade out everything for content
            tl.to(".hero-overlay", { backgroundColor: "#050505", opacity: 1, duration: 0.2 }, 0.8);
        }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Të gjitha' || l.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, selectedCategory]);

  return (
    <div className="bg-background min-h-screen">
      
      {/* 1. SCROLL CONTROLLED HERO CONTAINER */}
      <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
        
        {/* Background Video */}
        <video 
            ref={videoRef}
            muted 
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            // Using a tech/industrial style video. 
            // Note: Ensure the server allows range requests for smooth scrubbing, 
            // otherwise it might be jumpy. Pexels usually works okay.
            src="https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_25fps.mp4"
        />
        
        {/* Grain Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        
        {/* Content Overlay Layers */}
        <div ref={textRef} className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
            
            {/* Initial Title */}
            <h1 className="hero-title text-[12vw] leading-none font-bold uppercase tracking-tighter text-white mix-blend-difference text-center select-none">
                Tregu
            </h1>
            
            {/* Secondary Message (Hidden initially) */}
            <div className="hero-message opacity-0 absolute text-center max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-light uppercase tracking-widest text-white mb-8">
                    System <span className="text-secondary">Online</span>
                </h2>
                <p className="font-mono text-sm text-secondary tracking-widest uppercase border-l-2 border-white pl-4 text-left">
                    Access the future of commerce.<br/>
                    Buy. Sell. Dominate.
                </p>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
                <ArrowDown size={24} />
            </div>
        </div>

        {/* Final transition overlay */}
        <div className="hero-overlay absolute inset-0 bg-[#050505] opacity-0 pointer-events-none z-20"></div>
      </div>

      {/* 2. MAIN CONTENT FEED */}
      <div ref={feedRef} className="relative z-30 bg-background border-t border-white/10 min-h-screen">
        
        {/* Marquee / Category Strip */}
        <div className="border-b border-white/10 overflow-hidden whitespace-nowrap py-4 bg-surface">
            <div className="animate-marquee inline-block">
                {CATEGORIES.map(cat => (
                    <span key={cat} className="text-xs font-mono uppercase tracking-widest text-secondary mx-8">
                        /// {cat}
                    </span>
                ))}
                {CATEGORIES.map(cat => (
                    <span key={cat + 'dup'} className="text-xs font-mono uppercase tracking-widest text-secondary mx-8">
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

            {/* Listing Grid - Brutalist */}
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
  );
};

export default Home;