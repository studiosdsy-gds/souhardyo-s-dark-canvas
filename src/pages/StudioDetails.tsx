import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Users, Zap, Layers, Calendar, PlayCircle, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../integrations/supabase/client";
import GlobalLoader from "@/components/GlobalLoader";

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
  gallery_images: string[];
}

export default function StudioDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudio() {
      if (!id) return;
      
      try {
        const { data: studioData, error } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from('studios' as any) 
          .select('*')
          .eq('slug', id)
          .single();

        if (error) {
            console.error("Supabase Error:", error);
            setErrorMsg(error.message);
            return;
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData(studioData as any);
      } catch (error) {
        console.error("Fetch Error:", error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setErrorMsg((error as any).message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchStudio();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <GlobalLoader />;
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error Loading Data</h1>
        <p className="text-muted-foreground max-w-md">{errorMsg}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
      <h1 className="text-2xl font-bold">Studio Not Found</h1>
      <p className="text-muted-foreground">No data found for slug: "{id}"</p>
      <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${data.hero_image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[#0a0a0a]" />
        
        {/* Navigation Header */}
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
            {/* LOGO BOX */}
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
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary" /> About The Studio
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {data.description_long}
              </p>
            </section>

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

            <section>
               <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Layers className="w-6 h-6 text-primary" /> Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.gallery_images?.map((img, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-white/5"
                  >
                    <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
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
                            <a 
                              href={member.insta_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1.5 rounded-full bg-white/5 hover:bg-purple-600/20 text-purple-400 transition-colors"
                              title="Instagram"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {member.yt_url && (
                            <a 
                              href={member.yt_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1.5 rounded-full bg-white/5 hover:bg-red-600/20 text-red-500 transition-colors"
                              title="YouTube"
                            >
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
    </div>
  );
}