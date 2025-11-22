import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Ghost, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import GlobalLoader from "@/components/GlobalLoader";

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  featured: boolean;
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO: Set Page Title
  useEffect(() => {
    document.title = "Game Projects | Souhardyo Dey";
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, category, image, description, featured')
          .eq('featured', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <GlobalLoader />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary/30 pt-20 pb-10">
      
      {/* Nav */}
      <div className="fixed top-6 left-6 z-50">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/10 gap-2">
          <ArrowLeft className="w-4 h-4" /> Home
        </Button>
      </div>

      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mb-16 text-center">
           <div className="flex items-center justify-center gap-3 mb-4">
             <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
               <Gamepad2 className="w-8 h-8 text-primary" />
             </div>
           </div>
           <h1 className="text-4xl md:text-5xl font-bold">Game Projects</h1>
           <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
             A collection of immersive games, interactive experiences, and software development.
           </p>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6 animate-bounce-slow">
                <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
                <Ghost className="w-24 h-24 text-orange-400 relative z-10" strokeWidth={1.2} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Featured Projects Yet</h3>
            <p className="text-muted-foreground max-w-md">
              I'm currently brewing something magical in the lab. Check back soon for updates!
            </p>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/project/${project.id}`)}
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
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}