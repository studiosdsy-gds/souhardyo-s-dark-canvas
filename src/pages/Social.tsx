import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Instagram, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import GlobalLoader from "@/components/GlobalLoader";

// --- CONFIGURATION ---
const BEHOLD_URL = "https://feeds.behold.so/JSGvneKoniSGEiPUGEW5";
const YT_API_KEY = "AIzaSyADU-SL3M-2-nZxzkMM48x51UU8GJfNWXE";
const YT_CHANNEL_ID = "UCjSZtRo8kqOEjw3e1BVue1Q";

interface InstaPost {
  id: string;
  mediaUrl: string;
  permalink: string;
  caption?: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}

interface YTVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { high: { url: string } };
    publishedAt: string;
  };
}

export default function Social() {
  const navigate = useNavigate();
  const [instaPosts, setInstaPosts] = useState<InstaPost[]>([]);
  const [ytVideos, setYtVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO: Set Page Title
  useEffect(() => {
    document.title = "Social Feed | Souhardyo Dey";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Instagram (Behold)
        const instaRes = await fetch(BEHOLD_URL);
        const instaData = await instaRes.json();
        
        // Handle object structure (profile -> posts array)
        if (instaData.posts && Array.isArray(instaData.posts)) {
          setInstaPosts(instaData.posts);
        } else if (Array.isArray(instaData)) {
          setInstaPosts(instaData);
        } 

        // 2. Fetch YouTube
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${YT_CHANNEL_ID}&part=snippet,id&order=date&maxResults=6`
        );
        const ytData = await ytRes.json();
        
        if (ytData.items) {
          setYtVideos(ytData.items);
        } else {
           console.error("YouTube Error:", ytData);
        }

      } catch (error) {
        console.error("Error fetching social feeds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <GlobalLoader />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary/30 pt-20 pb-10">
      <div className="fixed top-6 left-6 z-50">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/10 gap-2">
          <ArrowLeft className="w-4 h-4" /> Home
        </Button>
      </div>

      <div className="container mx-auto px-4 space-y-24">
        
        <div className="text-center mb-12">
           <h1 className="text-4xl font-bold mb-4">Social Feed</h1>
           <p className="text-muted-foreground">Updates from my digital life</p>
        </div>

        {/* INSTAGRAM SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <Instagram className="w-8 h-8 text-[#E1306C]" />
            <h2 className="text-3xl font-bold">Instagram</h2>
          </div>
          
          {instaPosts.length === 0 ? (
            <div className="p-8 text-center border border-white/10 rounded-2xl bg-white/5 text-muted-foreground">
              <p>No recent posts found.</p>
              <p className="text-xs mt-2 opacity-50">(Behold feed is active but empty)</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {instaPosts.map((post) => (
                <motion.a
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  key={post.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="aspect-square relative group overflow-hidden rounded-xl bg-white/5 border border-white/10"
                >
                  {post.mediaType === "VIDEO" ? (
                    <video src={post.mediaUrl} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                  ) : (
                    <img src={post.mediaUrl} alt={post.caption || "Instagram Post"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="text-white w-6 h-6" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </section>

        {/* YOUTUBE SECTION */}
        {/* <section>
          <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <Youtube className="w-8 h-8 text-[#FF0000]" />
            <h2 className="text-3xl font-bold">YouTube</h2>
          </div>

          {ytVideos.length === 0 ? (
             <div className="p-8 text-center border border-white/10 rounded-2xl bg-white/5 text-muted-foreground">
               <p>No Videos loaded.</p>
               <p className="text-xs mt-2 opacity-50">(Check API restrictions in Google Cloud Console)</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ytVideos.map((video) => (
                <motion.a
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  key={video.id.videoId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="group block bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all"
                >
                  <div className="aspect-video relative">
                    <img 
                      src={video.snippet.thumbnails.high.url} 
                      alt={video.snippet.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Youtube className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold line-clamp-2 text-white group-hover:text-primary transition-colors">
                      {video.snippet.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(video.snippet.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </section> */}

      </div>
    </div>
  );
}