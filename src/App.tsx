import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Heart, Sparkles, Stars, Gift, Calendar, ArrowRight, Music, Volume2, VolumeX, ChevronDown, Upload, X, Camera, Image as ImageIcon, Wand2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";

// --- Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// --- Types ---
interface Photo {
  id: string;
  url: string;
}

// --- Components ---

const WishGenerator = () => {
  const [wish, setWish] = useState<string>("Click the wand to generate a unique wish...");
  const [isLoading, setIsLoading] = useState(false);

  const generateWish = async () => {
    setIsLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate a deeply romantic, creative, and warm birthday wish for my girlfriend Ritashree. Use poetic language and keep it under 60 words. No hashtags.",
        config: {
          systemInstruction: "You are a romantic poet writing a birthday tribute for a soulmate named Ritashree.",
        }
      });
      setWish(response.text || "You are the light of my life. Happy Birthday!");
    } catch (error) {
      console.error("Error generating wish:", error);
      setWish("Every day with you is a gift. Happy Birthday, my love!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="flex flex-col items-center text-center space-y-6">
      <div className="p-3 rounded-full bg-rose-500/20 text-rose-400">
        <Wand2 size={24} />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-serif italic">Poetic Wishes</h3>
        <p className="text-white/40 text-sm">Let the stars write a message for you.</p>
      </div>
      
      <div className="min-h-[100px] flex items-center justify-center italic text-lg text-white/90 px-4">
        {isLoading ? (
          <Loader2 className="animate-spin text-rose-400" size={32} />
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={wish}
          >
            "{wish}"
          </motion.p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={generateWish}
        disabled={isLoading}
        className="px-6 py-3 rounded-full bg-rose-500 text-white font-medium flex items-center gap-2 hover:bg-rose-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Consulting the Stars..." : "Generate New Wish"}
      </motion.button>
    </GlassCard>
  );
};

const LiquidBackground = ({ mouseX, mouseY }: { mouseX: number, mouseY: number }) => {
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  return (
    <div className="liquid-bg">
      {/* Interactive Blobs */}
      <motion.div 
        style={{ 
          x: useTransform(springX, [0, 1], [-100, 100]),
          y: useTransform(springY, [0, 1], [-100, 100])
        }}
        className="interactive-blob w-[600px] h-[600px] bg-rose-900/40 -top-20 -left-20" 
      />
      <motion.div 
        style={{ 
          x: useTransform(springX, [0, 1], [100, -100]),
          y: useTransform(springY, [0, 1], [100, -100])
        }}
        className="interactive-blob w-[500px] h-[500px] bg-orange-900/30 top-1/4 -right-20" 
      />
      <motion.div 
        style={{ 
          x: useTransform(springX, [0, 1], [-50, 50]),
          y: useTransform(springY, [0, 1], [-50, 50])
        }}
        className="interactive-blob w-[700px] h-[700px] bg-purple-900/20 bottom-0 left-1/3" 
      />
      
      {/* Static Blobs for depth */}
      <div className="blob w-[400px] h-[400px] bg-pink-900/30 top-1/2 left-1/4" style={{ animationDelay: '-15s' }} />
    </div>
  );
};

const PhotoSlideshow = ({ photos, onUpload }: { photos: Photo[], onUpload: (files: FileList) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + photos.length) % photos.length);
  };

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [photos.length, currentIndex]);

  return (
    <div className="space-y-6">
      <motion.div 
        animate={{ 
          aspectRatio: aspectRatio ? `${aspectRatio}` : '4/5',
          maxHeight: '70vh'
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="slideshow-container glass-morphism relative group overflow-hidden mx-auto"
        style={{ 
          width: aspectRatio ? `min(100%, calc(70vh * ${aspectRatio}))` : '100%'
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {photos.length > 0 ? (
            <motion.img
              key={photos[currentIndex].id}
              src={photos[currentIndex].url}
              custom={direction}
              initial={{ opacity: 0, scale: 1.1, x: direction > 0 ? '100%' : '-100%' }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: direction > 0 ? '-100%' : '100%' }}
              transition={{ 
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 }
              }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                setAspectRatio(img.naturalWidth / img.naturalHeight);
              }}
              className="slideshow-image w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 space-y-4">
              <ImageIcon size={48} strokeWidth={1} />
              <p className="text-sm uppercase tracking-widest">No photos uploaded yet</p>
            </div>
          )}
        </AnimatePresence>
        
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button 
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronDown className="rotate-90" size={20} />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronDown className="-rotate-90" size={20} />
            </button>
          </>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Progress Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-rose-500 w-6' : 'bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="upload-zone flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer group">
          <Upload className="text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Add Your Memories</span>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files && onUpload(e.target.files)} 
          />
        </label>
        <div className="glass-morphism p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-rose-500/20 text-rose-400">
              <Camera size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">{photos.length} Photos</p>
              <p className="text-xs text-white/40">Our journey together</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => paginate(-1)}
              className="text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors"
            >
              Prev
            </button>
            <button 
              onClick={() => paginate(1)}
              className="text-xs uppercase tracking-widest font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`glass-morphism rounded-[32px] p-8 md:p-12 ${className}`}
  >
    {children}
  </motion.div>
);

const FloatingHeart: React.FC<{ delay?: number, x?: string }> = ({ delay = 0, x = "50%" }) => (
  <motion.div
    initial={{ y: "110vh", opacity: 0, scale: 0.5 }}
    animate={{ 
      y: "-10vh", 
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 1, 0.5],
      x: [x, `calc(${x} + 20px)`, `calc(${x} - 20px)`, x]
    }}
    transition={{ 
      duration: 15, 
      repeat: Infinity, 
      delay,
      ease: "linear"
    }}
    className="fixed pointer-events-none z-0 text-rose-500/20"
  >
    <Heart size={24} fill="currentColor" />
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([
    { id: 'r1', url: '/Ritashree_web/photos/1.jpg' },
    { id: 'r2', url: '/Ritashree_web/photos/2.png' },
    { id: 'r3', url: '/Ritashree_web/photos/3.png' },
    { id: 'r4', url: '/Ritashree_web/photos/4.png' },
    { id: 'r5', url: '/Ritashree_web/photos/5.png' },
    { id: 'r6', url: '/Ritashree_web/photos/6.png' },
    { id: 'r7', url: '/Ritashree_web/photos/7.png' },
    { id: 'r8', url: '/Ritashree_web/photos/8.png' },
    { id: 'r9', url: '/Ritashree_web/photos/9.png' },
    { id: 'r10', url: '/Ritashree_web/photos/10.png' },
    { id: 'r11', url: '/Ritashree_web/photos/11.png' },
    { id: 'r12', url: '/Ritashree_web/photos/12.png' },
    { id: 'r13', url: '/Ritashree_web/photos/13.png' },
    { id: 'r14', url: '/Ritashree_web/photos/14.png' },
    { id: 'r15', url: '/Ritashree_web/photos/15.png' },
    { id: 'r16', url: '/Ritashree_web/photos/16.png' },
    { id: 'r17', url: '/Ritashree_web/photos/17.png' },
    { id: 'r18', url: '/Ritashree_web/photos/18.png' },
    { id: 'r19', url: '/Ritashree_web/photos/19.png' },
    { id: 'r20', url: '/Ritashree_web/photos/20.png' },
    { id: 'r21', url: '/Ritashree_web/photos/21.png' },
    { id: 'r22', url: '/Ritashree_web/photos/22.png' },
    { id: 'r23', url: '/Ritashree_web/photos/23.png' },
    { id: 'r24', url: '/Ritashree_web/photos/24.png' },
    { id: 'r25', url: '/Ritashree_web/photos/25.png' },
    { id: 'r26', url: '/Ritashree_web/photos/26.png' },
    { id: 'r27', url: '/Ritashree_web/photos/27.png' },
    { id: 'r29', url: '/Ritashree_web/photos/29.png' },
    { id: 'r30', url: '/Ritashree_web/photos/30.png' },
    { id: 'r31', url: '/Ritashree_web/photos/31.png' },
    { id: 'r32', url: '/Ritashree_web/photos/32.png' },
    { id: 'r33', url: '/Ritashree_web/photos/33.png' },
    { id: 'r34', url: '/Ritashree_web/photos/34.png' },
    { id: 'r35', url: '/Ritashree_web/photos/35.png' },
    { id: 'r36', url: '/Ritashree_web/photos/36.png' },
    { id: 'r37', url: '/Ritashree_web/photos/37.png' },
    { id: 'r38', url: '/Ritashree_web/photos/38.png' },
    { id: 'r39', url: '/Ritashree_web/photos/39.png' },
    { id: 'r40', url: '/Ritashree_web/photos/40.png' },
    { id: 'r41', url: '/Ritashree_web/photos/41.png' },
    { id: 'r42', url: '/Ritashree_web/photos/42.jpg' },
    { id: 'r43', url: '/Ritashree_web/photos/43.jpg' },
    { id: 'r44', url: '/Ritashree_web/photos/44.jpg' },
    { id: 'r45', url: '/Ritashree_web/photos/45.jpg' },
    { id: 'r46', url: '/Ritashree_web/photos/46.jpg' },
    { id: 'r47', url: '/Ritashree_web/photos/47.jpg' },
    { id: 'r48', url: '/Ritashree_web/photos/48.jpg' },
    { id: 'r49', url: '/Ritashree_web/photos/49.png' },
    { id: 'r50', url: '/Ritashree_web/photos/50.jpeg' },
    { id: 'r51', url: '/Ritashree_web/photos/51.jpeg' },
  ]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const scrollMsgOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleUpload = (files: FileList) => {
    const newPhotos = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const triggerCelebration = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen font-sans selection:bg-rose-500/30 overflow-x-hidden">
      <LiquidBackground mouseX={mousePos.x} mouseY={mousePos.y} />
      
      {/* Interactive Cursor Glow */}
      <div 
        className="cursor-glow hidden md:block"
        style={{ 
          left: `${mousePos.x * 100}%`, 
          top: `${mousePos.y * 100}%` 
        }}
      />

      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
      />
      
      {/* Floating Hearts */}
      {[...Array(12)].map((_, i) => (
        <FloatingHeart key={i} delay={i * 2} x={`${(i * 10) % 100}%`} />
      ))}

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <motion.div 
          style={{ opacity, scale }}
          className="text-center z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs uppercase tracking-[0.2em] text-rose-300"
          >
            <Stars size={14} className="text-rose-400" />
            <span>A Symphony for Your Soul</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-serif text-7xl md:text-9xl lg:text-[12rem] leading-[0.85] tracking-tighter text-glow"
          >
            Happy <br />
            <span className="italic text-rose-500 underline decoration-rose-500/20 underline-offset-8">Birthday</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-6 font-serif italic text-4xl md:text-6xl lg:text-7xl text-white drop-shadow-lg"
          >
            Ritashree Ghosh
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-8 text-lg md:text-xl text-white/60 font-light max-w-lg mx-auto leading-relaxed"
          >
            To the woman who paints my world in colors I never knew existed. 
            Rito, today isn't just a date; it's a celebration of the magic you bring to my life.
          </motion.p>
        </motion.div>

        <motion.div 
          style={{ opacity: scrollMsgOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll to explore our world</span>
          <ChevronDown size={20} className="animate-bounce" />
        </motion.div>
      </section>

      {/* Content Sections */}
      <main className="max-w-6xl mx-auto px-6 space-y-32 pb-32">
        
        {/* The Letter Section */}
        <section id="letter" className="relative">
          <GlassCard className="relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 text-rose-400">
                  <Heart size={20} fill="currentColor" />
                  <span className="text-sm uppercase tracking-widest font-semibold">A Message for You</span>
                </div>
                <h2 className="font-serif text-4xl md:text-6xl leading-tight">
                  My Favorite <br />
                  <span className="italic">Work of Art</span>
                </h2>
                <p className="text-white/70 leading-relaxed text-lg">
                  In a universe of billions, my heart found its home in you. You are the gentle rhythm in my pulse and the wild spark in my dreams. Every laugh we share is a song I want to play on repeat forever.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLetterOpen(!isLetterOpen)}
                  className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium transition-colors hover:bg-rose-100"
                >
                  {isLetterOpen ? "Close Letter" : "Unfold My Heart"}
                  <ArrowRight size={18} />
                </motion.button>
              </div>
              
              <div className="flex-1 relative aspect-square w-full max-w-sm">
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                >
                  <img 
                    src="Ritashree_web/photos/28.png" 
                    alt="Ritashree" 
                    className="w-full h-full object-cover object-top opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {isLetterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-12 pt-12 border-t border-white/10 overflow-hidden"
                >
                  <div className="font-serif text-2xl md:text-3xl text-white/90 leading-relaxed space-y-6 italic">
                    <p>To my beautiful Rito,</p>
                    <p>
                      Watching you grow, dream, and conquer the world is my greatest privilege. You possess a strength that is quiet yet unbreakable, and a kindness that heals everything it touches.
                    </p>
                    <p>
                      On your birthday, I wish for you the very things you give to others: boundless joy, unwavering peace, and a love that feels like coming home. You deserve a galaxy of stars, but I hope my heart is enough for now.
                    </p>
                    <p className="text-rose-400">Happy Birthday, Rito. Forever and always.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </section>

        {/* Photo Slideshow Section */}
        <section id="gallery" className="space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] uppercase tracking-widest font-bold">
              Gallery of Us
            </div>
            <h2 className="font-serif text-4xl md:text-6xl italic">Captured Moments</h2>
            <p className="text-white/40 max-w-md mx-auto">Upload our favorite photos to see them dance in the light.</p>
            <p className="text-white/60 max-w-md mx-auto">Slideshow, don't scroll away!</p>
          </div>
          <PhotoSlideshow photos={photos} onUpload={handleUpload} />
        </section>

        {/* Interactive Surprise Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WishGenerator />
          
          <GlassCard className="flex flex-col justify-between h-full group">
            <div className="space-y-4">
              <Gift className="text-rose-400 group-hover:rotate-12 transition-transform" size={32} />
              <h3 className="text-2xl font-serif italic">A Spark of Magic</h3>
              <p className="text-white/60">A celebration isn't complete without a little bit of stardust.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={triggerCelebration}
              className="mt-8 w-full py-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 font-medium hover:bg-rose-500/20 transition-all shadow-lg shadow-rose-500/5"
            >
              Release the Magic
            </motion.button>
          </GlassCard>
        </section>

        {/* Quote Section */}
        <section className="py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto relative z-10"
          >
            <Sparkles className="mx-auto text-rose-400 mb-8 animate-pulse" size={40} />
            <h2 className="font-serif text-4xl md:text-6xl italic leading-tight text-glow">
              "You are the poem I never knew how to write, and this life is the story I've always wanted to tell."
            </h2>
          </motion.div>
          {/* Decorative element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-rose-500/5 blur-[120px] rounded-full -z-10" />
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="font-serif text-2xl italic mb-2">Eternal Bloom • Ritashree</h4>
            <p className="text-white/40 text-sm">A digital tribute to the most beautiful soul, Ritashree Ghosh.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              onClick={toggleAudio}
              className={`p-3 rounded-full border transition-all ${!isMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/10 text-white/60'}`}
            >
              <Music size={20} />
            </motion.button>
            <div className="h-8 w-[1px] bg-white/10" />
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Happy Birthday 2026</p>
          </div>
        </div>
      </footer>

      {/* Audio Toggle Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleAudio}
          className={`p-4 rounded-full glass-morphism shadow-2xl transition-all ${!isMuted ? 'text-rose-400 border-rose-500/30' : 'text-white/80'}`}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </motion.button>
      </div>
    </div>
  );
}
