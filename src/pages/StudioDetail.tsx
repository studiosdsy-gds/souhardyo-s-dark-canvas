import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ExternalLink, 
  Users, 
  Zap, 
  Calendar, 
  PlayCircle, 
  Instagram, 
  Youtube,
  Gamepad2,
  Music,
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../integrations/supabase/client";
import GlobalLoader from "@/components/GlobalLoader";

// --- Types ---
interface TeamMember {
  name: string;
  role: string;
  insta_url?: string;
  yt_url?: string;
}

interface StudioData {
  slug: string;
  name: string;
  role: string;
  logo_url: string;
  hero_image_url: string;
  description_short: string;
  description_long: string;
  website_url: string;
  video_url: string | null;
  team_members: TeamMember[];
  upcoming_projects: { title: string; desc: string }[];
  tech_stack: string[];
}

interface StudioContent {
  id: string;
  studio_slug: string;
  type: 'Game' | 'Music';
  title: string;
  description: string;
  images: string[];
  audio_url?: string;
  external_link?: string;
}

// --- Helper: Format Time ---
const formatTime = (seconds: number) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function StudioDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState<StudioData | null>(null);
  const [contentList, setContentList] = useState<StudioContent[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [selectedContent, setSelectedContent] = useState<StudioContent | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      try {
        // 1. Fetch Studio Info
        const { data: studioData, error: studioError } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from('studios' as any) 
          .select('*')
          .eq('slug', id)
          .single();

        if (studioError) throw studioError;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData(studioData as any);

        // 2. Fetch Studio Content (Games/Music)
        const { data: contentData, error: contentError } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from('studio_content' as any)
          .select('*')
          .eq('studio_slug', id)
          .order('created_at', { ascending: false });

        if (contentError) console.error("Content Error:", contentError);
        if (contentData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setContentList(contentData as any[]);
        }

      } catch (error) {
        console.error("Fetch Error:", error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setErrorMsg((error as any).message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // --- HANDLERS ---

  const openModal = (item: StudioContent) => {
    setSelectedContent(item);
    setCurrentImgIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const closeModal = () => {
    setSelectedContent(null);
    setIsPlaying(false);
  };

  const nextContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedContent) return;
    const idx = contentList.findIndex(c => c.id === selectedContent.id);
    const nextIdx = (idx + 1) % contentList.length;
    openModal(contentList[nextIdx]);
  };

  const prevContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedContent) return;
    const idx = contentList.findIndex(c => c.id === selectedContent.id);
    const prevIdx = (idx - 1 + contentList.length) % contentList.length;
    openModal(contentList[prevIdx]);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedContent) return;
    setCurrentImgIndex((prev) => (prev + 1) % selectedContent.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedContent) return;
    setCurrentImgIndex((prev) => (prev - 1 + selectedContent.images.length) % selectedContent.images.length);
  };

  // --- AUDIO CONTROLS ---
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // --- RENDER ---

  if (loading) return <GlobalLoader />;

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error Loading Data</h1>
        <p className="text-muted-foreground max-w-md">{errorMsg || "Studio not found"}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  const isGameStudio = data.role.toLowerCase().includes('game');
  const sectionTitle = isGameStudio ? "Games" : "Discography";
  const SectionIcon = isGameStudio ? Gamepad2 : Music;

  // Calculate progress percentage for the main track
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${data.hero_image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[#0a0a0a]" />
        
        <div className="absolute top-6 left-0 w-full px-4 md:px-10 z-20 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 gap-2 relative z-30"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto flex flex-col md:flex-row items-center md:items-end gap-8"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 bg-black/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex-shrink-0 flex items-center justify-center">
              <img src={data.logo_url} alt={data.name} className="w-full h-full object-contain" />
            </div>
            
            <div className="mb-2 text-center md:text-left w-full md:w-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-2">{data.name}</h1>
              <p className="text-primary text-xl tracking-wider uppercase font-medium">{data.role}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* About */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary" /> About The Studio
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {data.description_long}
              </p>
            </section>

            {/* Dynamic Content Section (Games or Music) */}
            <section>
               <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <SectionIcon className="w-6 h-6 text-primary" /> {sectionTitle}
              </h2>
              
              {contentList.length === 0 ? (
                <p className="text-muted-foreground">No content released yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contentList.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -5 }}
                      onClick={() => openModal(item)}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all group"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={item.images[0]} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Type Badge */}
                        <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs uppercase font-bold border border-white/10">
                          {item.type}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Video Showcase */}
            {data.video_url && (
              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <PlayCircle className="w-6 h-6 text-primary" /> Featured Showcase
                </h2>
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                   <iframe 
                    width="100%" 
                    height="100%" 
                    src={data.video_url} 
                    title="Video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            )}
          </div>

          {/* --- RIGHT COLUMN (Sidebar) --- */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 sticky top-6">
              <div>
                <h3 className="text-primary uppercase tracking-widest text-sm font-bold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Team
                </h3>
                <ul className="space-y-3">
                  {data.team_members?.map((member, i) => (
                    <li key={i} className="flex flex-col border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{member.name}</span>
                        <div className="flex gap-2">
                          {member.insta_url && (
                            <a href={member.insta_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-full bg-white/5 hover:bg-purple-600/20 text-purple-400 transition-colors">
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {member.yt_url && (
                            <a href={member.yt_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-full bg-white/5 hover:bg-red-600/20 text-red-500 transition-colors">
                              <Youtube className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm">{member.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="h-[1px] bg-white/10" />

              <div>
                <h3 className="text-primary uppercase tracking-widest text-sm font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Upcoming
                </h3>
                <ul className="space-y-3">
                  {data.upcoming_projects?.map((proj, i) => (
                    <li key={i}>
                      <span className="text-white font-medium block">{proj.title}</span>
                      <span className="text-muted-foreground text-xs">{proj.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-[1px] bg-white/10" />

              <div>
                 <h3 className="text-primary uppercase tracking-widest text-sm font-bold mb-4">Tech Stack</h3>
                 <div className="flex flex-wrap gap-2">
                   {data.tech_stack?.map((tech) => (
                     <span key={tech} className="px-3 py-1 rounded-full bg-white/10 text-xs text-white border border-white/5">
                       {tech}
                     </span>
                   ))}
                 </div>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white glow-box mt-4"
                onClick={() => window.open(data.website_url, '_blank')}
              >
                Visit Website <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 text-center text-sm text-muted-foreground bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} DSY Studio. All rights reserved.</p>
        </div>
      </footer>

      {/* --- MODAL OVERLAY --- */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
            onClick={closeModal}
          >
            {/* Nav Arrows (Outside) */}
            <button 
              onClick={prevContent}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden md:flex"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <button 
              onClick={nextContent}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden md:flex"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Content Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-red-500/80 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col h-full">
                
                {/* TOP: Image Carousel */}
                <div className="relative h-[40vh] md:h-[50vh] bg-black flex-shrink-0 group">
                  <img 
                    src={selectedContent.images[currentImgIndex]} 
                    alt={selectedContent.title} 
                    className="w-full h-full object-contain" 
                  />
                  
                  {/* Carousel Arrows (Only if multiple images) */}
                  {selectedContent.images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-primary text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-primary text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedContent.images.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-primary w-4' : 'bg-white/50'}`} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* BOTTOM: Details & Controls */}
                <div className="p-6 md:p-8 flex flex-col flex-grow bg-[#111]">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedContent.title}</h2>
                      <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-xs uppercase tracking-wider text-primary">
                        {selectedContent.type}
                      </span>
                    </div>
                    
                    {/* Dynamic Action Button */}
                    {selectedContent.type === 'Game' && selectedContent.external_link && (
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-white gap-2"
                        onClick={() => window.open(selectedContent.external_link, '_blank')}
                      >
                        See More <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="prose prose-invert max-w-none text-muted-foreground overflow-y-auto pr-2 custom-scrollbar mb-4">
                    <p>{selectedContent.description}</p>
                  </div>

                  {/* MUSIC PLAYER CONTROLS */}
                  {selectedContent.type === 'Music' && selectedContent.audio_url && (
                    <div className="mt-auto pt-6 border-t border-white/10">
                      <audio 
                        ref={audioRef} 
                        src={selectedContent.audio_url} 
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                      />
                      
                      {/* Custom Progress Bar */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
                        
                        {/* Interactive Progress Slider Container */}
                        <div className="relative flex-1 h-1.5 group cursor-pointer">
                          {/* Gray Track */}
                          <div className="absolute inset-0 bg-white/20 rounded-full" />
                          
                          {/* Purple Filled Track */}
                          <div 
                            className="absolute top-0 left-0 h-full bg-primary rounded-full pointer-events-none"
                            style={{ width: `${progressPercent}%` }}
                          />
                          
                          {/* White Thumb (Visible) */}
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-lg pointer-events-none"
                            style={{ left: `${progressPercent}%`, marginLeft: '-6px' }}
                          />

                          {/* Invisible Input for Interaction */}
                          <input 
                            type="range" 
                            min="0" 
                            max={duration || 0} 
                            value={currentTime} 
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                        </div>

                        <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={toggleAudio}
                            className="p-3 rounded-full bg-primary hover:bg-primary/80 text-white transition-all shadow-lg hover:scale-105"
                          >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 pl-1" />}
                          </button>
                          <div>
                            <p className="text-sm font-bold text-white">Now Playing</p>
                            <p className="text-xs text-muted-foreground">Audio Track</p>
                          </div>
                        </div>

                        {/* Volume Slider */}
                        <div className="flex items-center gap-2">
                          <button onClick={toggleMute} className="text-muted-foreground hover:text-white transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}