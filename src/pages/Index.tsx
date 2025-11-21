import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  animate, 
  AnimationPlaybackControls,
  useScroll,
  useMotionValueEvent
} from "framer-motion";
import { 
  ArrowRight, 
  Code2, 
  Cuboid, 
  Layers, 
  Wand2, 
  Ghost,
  Instagram,
  Youtube,
  Github,
  Heart,   
  Box,     
  Palette, 
  ExternalLink,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import logoImg from '@/assets/your-logo.png';
import { supabase } from "@/integrations/supabase/client"; 
import GlobalLoader from "@/components/GlobalLoader";
// --- IMPORT EMAILJS ---
import emailjs from '@emailjs/browser';

// --- Types ---
interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  featured: boolean;
}

// --- Data Constants ---
const STUDIOS_CARDS = [
  {
    id: 'dsy',
    name: 'DSY Studio',
    role: 'Game Development Studio',
    logo: '/DSY_white.png', 
  },
  {
    id: 'xero',
    name: 'Xero Theory',
    role: 'Music & Sound Studio',
    logo: '/xt_white.png', 
  }
];

// --- Social Links Configuration ---
const SOCIAL_LINKS = [
  {
    id: 'insta-personal',
    platform: 'Instagram',
    title: '@_souhardyo', 
    url: 'https://instagram.com/_souhardyo',
    icon: Instagram,
    color: 'text-[#E1306C]' 
  },
  {
    id: 'insta-studio',
    platform: 'DSY Studio Insta',
    title: '@dsystudio_', 
    url: 'https://instagram.com/dsystudio_',
    icon: Instagram,
    color: 'text-[#E1306C]'
  },
  {
    id: 'yt-dev',
    platform: 'YouTube',
    title: 'DSY Studio', 
    url: 'https://www.youtube.com/@studiodsy',
    icon: Youtube,
    color: 'text-[#FF0000]' 
  },
  {
    id: 'yt-art',
    platform: 'YouTube',
    title: 'Souhardyo Dey', 
    url: 'https://www.youtube.com/@SouhardyoDey',
    icon: Youtube,
    color: 'text-[#FF0000]'
  },
  {
    id: 'patreon',
    platform: 'Patreon',
    title: 'Support My Work',
    url: 'https://www.patreon.com/cw/DSYStudio',
    icon: Heart, 
    color: 'text-[#F96854]' 
  },
  {
    id: 'sketchfab',
    platform: 'Sketchfab',
    title: 'My 3D Models',
    url: 'https://sketchfab.com/studiodsy',
    icon: Box, 
    color: 'text-[#1CAAD9]' 
  },
  {
    id: 'artstation',
    platform: 'ArtStation',
    title: 'Portfolio',
    url: 'https://www.artstation.com/studiodsy',
    icon: Palette, 
    color: 'text-[#13AFF0]' 
  },
  {
    id: 'github',
    platform: 'GitHub',
    title: 'Syd25',
    url: 'https://github.com/Syd25-legend',
    icon: Github,
    color: 'text-white' 
  }
];

// --- Global State for Session Logic ---
let isInitialLoad = true;

// --- Helper Component: Draggable Orbit ---
interface DraggableOrbitProps {
  radius: number;
  duration: number;
  initialAngle?: number;
  reverse?: boolean;
  icon: React.ElementType;
  color?: string;
}

const DraggableOrbit = ({ 
  radius, 
  duration, 
  initialAngle = 0, 
  reverse = false,
  icon: Icon,
  color = "text-primary"
}: DraggableOrbitProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const angle = useMotionValue(initialAngle);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const x = useTransform(angle, (a) => radius * Math.cos((a * Math.PI) / 180));
  const y = useTransform(angle, (a) => radius * Math.sin((a * Math.PI) / 180));

  const startAnimation = useCallback(() => {
    const currentAngle = angle.get();
    const targetAngle = reverse ? currentAngle - 360 : currentAngle + 360;
    
    animationRef.current = animate(angle, targetAngle, {
      duration: duration,
      ease: "linear",
      repeat: Infinity,
    });
  }, [angle, duration, reverse]); 

  useEffect(() => {
    startAnimation();
    return () => animationRef.current?.stop();
  }, [startAnimation]); 

  const handlePointerDown = (e: React.PointerEvent) => {
    animationRef.current?.stop();
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const thetaDegrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    angle.set(thetaDegrees);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
    startAnimation();
  };

  return (
    <>
      <div 
        ref={containerRef}
        className="absolute rounded-full border border-white/10 pointer-events-none"
        style={{ width: radius * 2, height: radius * 2 }}
      />
      <motion.div
        className="absolute flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
        style={{ x, y }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={`bg-[#0a0a0a] p-3 rounded-xl border border-primary/30 glow-box hover:border-primary transition-colors ${isDragging ? 'scale-110 border-primary' : ''}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </motion.div>
    </>
  );
};

// --- Shared Components ---
const SectionHeading = ({ children, subtitle }: { children: React.ReactNode; subtitle: string }) => (
  <div className="text-center mb-16">
    <span 
      className="text-primary font-semibold tracking-wider uppercase text-sm block"
    >
      {subtitle}
    </span>
    <h2 
      className="text-3xl md:text-5xl font-bold mt-2 text-white"
    >
      {children}
    </h2>
  </div>
);

// --- Smart Header Component ---
interface SmartHeaderProps {
  scrollContainerRef: React.RefObject<HTMLElement>;
}

const SmartHeader = ({ scrollContainerRef }: SmartHeaderProps) => {
  const { scrollY } = useScroll({ container: scrollContainerRef });
  
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }

    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center pointer-events-none pr-2"
    >
      <div className="w-full pointer-events-auto relative">
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            (scrolled && !hidden)
              ? "bg-black/80 backdrop-blur-md border-b border-white/10 shadow-2xl" 
              : "bg-transparent border-transparent"
          }`}
        />
        <div className="container relative z-10 mx-auto px-4 flex items-center justify-between pr-10 py-4">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => scrollToSection('hero')}
          >
            <div className={`
              w-10 h-10 md:w-9 md:h-9 bg-white rounded-lg flex items-center justify-center glow-box transition-transform duration-300
              ${scrolled ? 'scale-90' : 'scale-100'}
            `}>
              <img 
                src={logoImg} 
                alt="Logo" 
                className="w-5 h-5 md:w-10 md:h-10 object-contain" 
              />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 pl-5">
            {['Work', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group py-2"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          <Button 
            variant="outline" 
            className="border-primary/50 text-primary hover:bg-primary/10 hidden sm:flex"
            onClick={() => scrollToSection('contact')}
          >
            <span className="text-white">Contact</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

// --- Main Component ---

export default function Index() {
  const navigate = useNavigate();
  const routerNavType = useNavigationType(); 
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- EMAILJS CONFIGURATION ---
  // Replace these with your actual keys from EmailJS Dashboard
  const SERVICE_ID = "service_91z7bip";
  const TEMPLATE_ID = "template_lyneuwr";
  const PUBLIC_KEY = "KNrnGILkw5jrZ3WzR";

  const formRef = useRef<HTMLFormElement>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // --- SMART SCROLL & ANIMATION LOGIC ---
  useLayoutEffect(() => {
    if (isInitialLoad) {
      isInitialLoad = false; 

      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const isBrowserReload = navEntry?.type === 'reload';

      if (isBrowserReload) {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
        setShouldAnimate(true);
        sessionStorage.setItem("hasSeenIntro", "true");
        return; 
      }

      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
      if (!hasSeenIntro) {
          setShouldAnimate(true);
          sessionStorage.setItem("hasSeenIntro", "true");
      } else {
          setShouldAnimate(false);
      }
      return;
    }

    if (routerNavType === 'POP') {
      setShouldAnimate(false);
      const savedPosition = sessionStorage.getItem("indexScrollPos");
      if (savedPosition && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = parseInt(savedPosition, 10);
      }
    } else {
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      setShouldAnimate(false);
    }

  }, [routerNavType]);

  const handleNavigate = (path: string) => {
    if (scrollContainerRef.current) {
      sessionStorage.setItem("indexScrollPos", scrollContainerRef.current.scrollTop.toString());
    }
    navigate(path);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, category, image, description, featured')
          .eq('featured', true)
          .limit(4);

        if (error) throw error;
        if (data) setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error("Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // --- UPDATED EMAIL SENDING LOGIC ---
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    if (!formRef.current) return;

    // Check if keys are still placeholders
    // if (SERVICE_ID === "service_91z7bip") {
    //   toast.error("EmailJS not configured! Please check the code.");
    //   setSending(false);
    //   return;
    // }

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, {
        publicKey: PUBLIC_KEY,
      })
      .then(
        () => {
          toast.success("Message sent successfully!");
          setContactForm({ name: "", email: "", message: "" });
        },
        (error) => {
          console.error('FAILED...', error.text);
          toast.error("Failed to send message. Please try again.");
        },
      )
      .finally(() => {
        setSending(false);
      });
  };

  const heroVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const initialProp = shouldAnimate ? "hidden" : "visible";

  return (
    <div className="h-screen w-full bg-background text-foreground font-sans selection:bg-primary/30 overflow-hidden relative">
      
      <style>{`
        #scroll-container::-webkit-scrollbar { width: 8px; height: 8px; background-color: transparent; }
        #scroll-container::-webkit-scrollbar-track { background-color: rgba(10, 10, 10, 0.3); border-radius: 4px; }
        #scroll-container::-webkit-scrollbar-thumb { background-color: #4c1d95; border-radius: 4px; border: 1px solid rgba(124, 58, 237, 0.1); }
        #scroll-container::-webkit-scrollbar-thumb:hover { background-color: #7c3aed; box-shadow: 0 0 10px rgba(124, 58, 237, 0.5); }
        #scroll-container::-webkit-scrollbar-corner { background: transparent; }
      `}</style>

      <SmartHeader scrollContainerRef={scrollContainerRef} />

      <div 
        ref={scrollContainerRef} 
        className="h-full w-full overflow-y-auto overflow-x-hidden"
        id="scroll-container"
      >
        <div className="fixed inset-0 z-[-1]">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15) 0%, rgba(10, 10, 10, 1) 70%)'
            }}
          />
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>

        <main>
          {/* HERO SECTION */}
          <section id="hero" className="min-h-screen flex flex-col justify-center pt-10 pb-24 relative overflow-hidden pl-7">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10 ">
              <motion.div
                variants={heroVariant}
                initial={initialProp}
                animate="visible"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-[2px] w-8 bg-primary inline-block"></span>
                  <span className="text-primary font-semibold tracking-wider uppercase text-sm">
                    Souhardyo Dey | Game Developer <span className="lowercase"> and </span> VFX & CGI Artist
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white">
                  Crafting Immersive <br className="hidden md:block"/>
                  <span className="text-primary glow-text">3D Worlds</span> & <span className="text-primary glow-text">VFX.</span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                  I'm a Game Developer and VFX & CGI Artist with expertise in creating 
                  stunning 3D environments and visual effects.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 h-14 text-base glow-box group"
                    onClick={() => {
                      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore Projects 
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="ghost"
                    className="text-white hover:bg-white/10 rounded-full h-14 px-8"
                    onClick={() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    More About Me
                  </Button>
                </div>
              </motion.div>

              {/* Orbit Animation */}
              <motion.div 
                variants={{
                   hidden: { opacity: 0, scale: 0.9 },
                   visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.2 } }
                }}
                initial={initialProp}
                animate="visible"
                className="relative h-[650px] hidden lg:flex items-center justify-center"
              >
                <div className="absolute w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10 w-32 h-32 bg-gradient-to-tr from-primary to-purple-900 rounded-2xl flex items-center justify-center glow-box rotate-12 hover:rotate-0 transition-all duration-500">
                  <Cuboid className="w-12 h-12 text-white" />
                </div>
                <DraggableOrbit radius={130} duration={20} initialAngle={0} icon={Wand2} />
                <DraggableOrbit radius={190} duration={35} initialAngle={120} reverse={true} icon={Layers} />
                <DraggableOrbit radius={260} duration={45} initialAngle={240} icon={Code2} />
              </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent z-20 pointer-events-none" />
          </section>

          {/* ABOUT SECTION */}
          <section id="about" className="py-2 relative">
            <div className="container mx-auto px-4 relative z-10">
              <SectionHeading subtitle="My Journey">
                About <span className="text-primary">Me</span>
              </SectionHeading>

              <div className="max-w-4xl mx-auto text-center mb-16 space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  I'm a Game Developer and VFX & CGI Artist with expertise in creating 
                  stunning 3D environments and visual effects. My work focuses on making worlds from my imagination and 
                  creating games based on those worlds. 
                </p>
                <p>
                  I specialize in 3D modelling, animation, shading and environment creation. In addition to these, I like to vibe code and 
                  use AI to create things which are complex and takes a lot of time 
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {STUDIOS_CARDS.map((studio, idx) => (
                  <div
                    key={studio.id}
                    onClick={() => handleNavigate(`/studio/${studio.id}`)}
                    className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between text-left"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="h-16 w-auto mb-6 flex items-center justify-start">
                        <img src={studio.logo} alt={studio.name} className="h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{studio.name}</h3>
                      <p className="text-sm text-primary font-medium uppercase tracking-wider mb-4">{studio.role}</p>
                    </div>
                    <div className="relative z-10 mt-4 flex items-center text-sm text-muted-foreground group-hover:text-white transition-colors">
                      View Full Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* WORK SECTION (SEAMLESS BLEND APPLIED) */}
          <section id="work" className="py-32 relative">
            {/* Seamless Gradient Blend: Transparent Top -> Dark Middle -> Transparent Bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-transparent pointer-events-none z-0" />

            <div className="container mx-auto px-4 relative z-10">
              <SectionHeading subtitle="Portfolio">
               My  <span className="text-primary">Works</span>
              </SectionHeading>

              {projectsLoading ? (
                <div className="h-60 relative">
                   <GlobalLoader />
                </div>
              ) : projects.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative mb-6 animate-bounce-slow">
                       <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
                       <Ghost className="w-24 h-24 text-orange-400 relative z-10" strokeWidth={1.2} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Featured Works Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      I'm currently brewing something magical in the lab. Check back soon for updates!
                    </p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      onClick={() => handleNavigate(`/project/${project.id}`)}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] hover:border-primary/50 transition-all duration-500 cursor-pointer"
                    >
                      <div className="aspect-video overflow-hidden bg-gray-900">
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <span className="text-primary text-sm font-medium tracking-wider uppercase mb-2 block">
                          {project.category}
                        </span>
                        <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CONTACT SECTION (SEAMLESS BLEND APPLIED) */}
          <section id="contact" className="py-32 relative">
             {/* Subtle Bottom Gradient to Ground the Footer */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0" />

            <div className="container mx-auto px-4 relative z-10">
              <SectionHeading subtitle="Contact">
                Get In <span className="text-primary">Touch</span>
              </SectionHeading>

              <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                
                {/* LEFT COLUMN: Social Links */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      Connect With Me
                    </h3>
                    <p className="text-muted-foreground">
                      Follow my journey, check out my 3D assets, or support my work on these platforms.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SOCIAL_LINKS.map((link) => (
                      <a 
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-xl transition-all duration-300 group"
                      >
                        <div className={`p-3 rounded-lg bg-[#0a0a0a] border border-white/5 group-hover:border-white/20 transition-colors`}>
                          <link.icon className={`w-6 h-6 ${link.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5 font-medium uppercase tracking-wider">
                            {link.platform}
                          </p>
                          <p className="text-sm font-bold text-white group-hover:text-primary truncate transition-colors">
                            {link.title}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* RIGHT COLUMN: Contact Form - ATTACHED REF HERE */}
                <div className="relative">
                   <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Send a Message</h3>
                    </div>
                    
                    <form ref={formRef} onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Name</label>
                        <Input
                          name="user_name" // Added Name Attribute
                          placeholder="Your Name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          required
                          className="bg-white/5 border-white/10 focus:border-primary/50 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                        <Input
                          name="user_email" // Added Name Attribute
                          type="email"
                          placeholder="Your Email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          required
                          className="bg-white/5 border-white/10 focus:border-primary/50 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-muted-foreground ml-1">Message</label>
                        <Textarea
                          name="message" // Added Name Attribute
                          placeholder="How can I help you?"
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          required
                          rows={5}
                          className="bg-white/5 border-white/10 focus:border-primary/50 resize-none rounded-xl"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg glow-box rounded-xl mt-2"
                        disabled={sending}
                      >
                        {sending ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </div>
                  {/* Decorative element behind form */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
                </div>

              </div>
            </div>
          </section>

          <footer className="py-8 border-t border-white/5 text-center text-sm text-muted-foreground relative z-10">
            <div className="container mx-auto px-4">
              <p>© {new Date().getFullYear()} Souhardyo Dey. All Rights Reserved</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}