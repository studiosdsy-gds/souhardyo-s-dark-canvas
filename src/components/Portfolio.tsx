import { FadeInSection } from "./FadeInSection";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";

const projects = [
  {
    id: 1,
    title: "Character Model",
    category: "3D Art",
    image: portfolio1,
  },
  {
    id: 2,
    title: "VFX System",
    category: "Particle Effects",
    image: portfolio2,
  },
  {
    id: 3,
    title: "Sci-Fi Environment",
    category: "Environment Art",
    image: portfolio3,
  },
  {
    id: 4,
    title: "Destruction FX",
    category: "Visual Effects",
    image: portfolio4,
  },
];

export const Portfolio = () => {
  return (
    <section id="portfolio" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            My <span className="text-primary">Work</span>
          </h2>
        </FadeInSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <FadeInSection key={project.id} delay={index * 0.1}>
              <div className="group relative overflow-hidden rounded-lg border border-border hover:border-primary transition-all duration-300 glow-box">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6">
                    <p className="text-sm text-primary mb-1">{project.category}</p>
                    <h3 className="text-2xl font-bold">{project.title}</h3>
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};
