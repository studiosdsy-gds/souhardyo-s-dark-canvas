import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, Image as ImageIcon, ArrowLeft, ExternalLink, Palette, Camera, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GlobalLoader from "@/components/GlobalLoader";

// --- CONFIGURATION ---
const SKETCHFAB_USER = "DSY Studio"; 

// Define the allowed categories explicitly to satisfy the linter
type FilterType = "All" | "Digital Art" | "Photography";

interface SketchfabModel {
  uid: string;
  name: string;
  thumbnails: { images: { url: string; width: number }[] };
  viewerUrl: string;
}

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  description: string;
  category: string; 
}

export default function Art() {
  const navigate = useNavigate();
  const [models, setModels] = useState<SketchfabModel[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // FILTER STATE using the specific type
  const [filter, setFilter] = useState<FilterType>("All");

  // SEO
  useEffect(() => {
    document.title = "Art & Photography | Souhardyo Dey";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Sketchfab
        const skfbRes = await fetch(
          `https://api.sketchfab.com/v3/search?type=models&user=${SKETCHFAB_USER}&sort_by=-publishedAt`
        );
        const skfbData = await skfbRes.json();
        if (skfbData.results) setModels(skfbData.results);

        // 2. Fetch Supabase Gallery
        // We removed the 'unused' eslint comment here to fix the warning
        const { data: galleryData, error } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from('art_gallery' as any) 
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && galleryData) {
          setGallery(galleryData as unknown as GalleryItem[]);
        }

      } catch (error) {
        console.error("Error fetching art data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <GlobalLoader />;

  // Filter Logic
  const filteredGallery = filter === "All" 
    ? gallery 
    : gallery.filter(item => item.category === filter);

  const showSketchfab = filter === "All" || filter === "Digital Art";

  const isEmpty = models.length === 0 && gallery.length === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary/30 pt-20 pb-10">
      <div className="fixed top-6 left-6 z-50">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/10 gap-2">
          <ArrowLeft className="w-4 h-4" /> Home
        </Button>
      </div>

      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mb-12 text-center">
           <div className="flex items-center justify-center gap-3 mb-4">
             <div className="p-3 rounded-xl bg-[#1CAAD9]/10 border border-[#1CAAD9]/20">
               <Palette className="w-8 h-8 text-[#1CAAD9]" />
             </div>
           </div>
           <h1 className="text-4xl md:text-5xl font-bold">Gallery</h1>
           <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
             A curated collection of my creative works and photography.
           </p>
        </div>

        {/* --- FILTER BAR --- */}
        <div className="flex justify-center gap-4 mb-16">
          {[
            { name: "All", icon: Layers },
            { name: "Digital Art", icon: ImageIcon },
            { name: "Photography", icon: Camera }
          ].map((cat) => (
            <button
              key={cat.name}
              // FIX: Cast to FilterType instead of 'any'
              onClick={() => setFilter(cat.name as FilterType)}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all
                ${filter === cat.name 
                  ? "bg-white text-black shadow-lg scale-105" 
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"}
              `}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6 animate-bounce-slow">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                <Palette className="w-24 h-24 text-blue-400 relative z-10" strokeWidth={1.2} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">The Canvas is Blank</h3>
            <p className="text-muted-foreground max-w-md">
              Upload images to Supabase to populate this gallery.
            </p>
          </div>
        ) : (
          <div className="space-y-24">
            
            {/* SUPABASE GALLERY GRID */}
            {filteredGallery.length > 0 && (
              <section>
                 {filter !== "All" && (
                    <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                      {filter === "Photography" ? <Camera className="w-6 h-6 text-primary" /> : <ImageIcon className="w-6 h-6 text-primary" />}
                      <h2 className="text-2xl font-bold">{filter}</h2>
                    </div>
                 )}

                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                  {filteredGallery.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="break-inside-avoid bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all group"
                    >
                      <img src={item.image_url} alt={item.title} className="w-full h-auto" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                           <h3 className="font-bold text-lg text-white">{item.title}</h3>
                           <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/10 rounded-full text-muted-foreground">
                             {item.category}
                           </span>
                        </div>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* SKETCHFAB SECTION */}
            {showSketchfab && models.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4 mt-12">
                  <Box className="w-6 h-6 text-[#1CAAD9]" />
                  <h2 className="text-2xl font-bold">3D Models</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {models.map((model) => {
                    const thumb = model.thumbnails.images.sort((a, b) => b.width - a.width)[0]?.url;
                    return (
                      <motion.a
                        href={model.viewerUrl}
                        target="_blank"
                        rel="noreferrer"
                        key={model.uid}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-[4/3] bg-black rounded-xl overflow-hidden border border-white/10"
                      >
                        <img src={thumb} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                          <h3 className="font-bold text-white translate-y-4 group-hover:translate-y-0 transition-transform">{model.name}</h3>
                          <div className="flex items-center gap-2 text-primary text-sm mt-2 translate-y-4 group-hover:translate-y-0 transition-transform delay-75">
                            View 3D Model <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}