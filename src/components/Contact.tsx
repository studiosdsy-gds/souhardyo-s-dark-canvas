import { FadeInSection } from "./FadeInSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{ name, email, message }]);

      if (error) throw error;

      toast.success("Message sent successfully! I'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Get In <span className="text-primary">Touch</span>
          </h2>
        </FadeInSection>
        
        <FadeInSection delay={0.2}>
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-card border-border"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-card border-border"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Your Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="bg-card border-border"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-box"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};
