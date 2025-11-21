import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Globe, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GlobalLoader from "@/components/GlobalLoader";

interface ProjectFull {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  full_description: string;
  technologies: string[] | null;
  github_link: string | null;
  live_link: string | null;
  created_at: string;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error("Error loading project:", error);
        toast.error("Could not load project details");
        navigate('/'); 
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, navigate]);

  if (loading) {
    return <GlobalLoader />;
  }

  if (!project) return null;

  // Define variants for simple fade-in (no scrolling)
  const fadeVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary/30">
      
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 gap-2 rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20 md:py-28">
        
        {/* Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeVariant}
          className="space-y-4 mb-12"
        >
          <div className="flex items-center gap-2">
             <span className="h-[2px] w-8 bg-primary inline-block"></span>
             <span className="text-primary font-semibold tracking-wider uppercase text-sm">{project.category}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">{project.title}</h1>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-16 bg-gray-900"
        >
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Left Column: Full Description */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeVariant}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6 text-lg text-muted-foreground leading-relaxed"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p>{project.description}</p>
            {project.full_description && (
              <div className="prose prose-invert max-w-none">
                {/* Renders newlines properly if it's plain text */}
                {project.full_description.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Meta Data */}
          <motion.div 
             initial="hidden"
             animate="visible"
             variants={fadeVariant}
             transition={{ delay: 0.3 }}
             className="space-y-8"
          >
            {/* Tech Stack */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                  <Layers className="w-5 h-5 text-primary" /> Technologies
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-primary-foreground border border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
               <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                  <Calendar className="w-5 h-5 text-primary" /> Release Date
                </div>
                <p className="text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Links */}
            <div className="space-y-3">
              {project.live_link && (
                <a href={project.live_link} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 gap-2">
                    <Globe className="w-4 h-4" /> Visit Live Site
                  </Button>
                </a>
              )}
              {project.github_link && (
                <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white h-12 gap-2">
                    <Github className="w-4 h-4" /> View Code
                  </Button>
                </a>
              )}
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}