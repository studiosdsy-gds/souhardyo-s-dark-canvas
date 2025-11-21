import { FadeInSection } from "./FadeInSection";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export const InstagramFeed = () => {
  return (
    <section id="instagram" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <FadeInSection>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Follow My <span className="text-primary">Journey</span>
            </h2>
            <p className="text-muted-foreground text-lg">See my latest work and behind-the-scenes content</p>
          </div>
        </FadeInSection>
        
        <FadeInSection delay={0.2}>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-2"
              onClick={() => window.open('https://instagram.com', '_blank')}
            >
              <Instagram className="w-5 h-5" />
              Follow on Instagram
            </Button>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};
