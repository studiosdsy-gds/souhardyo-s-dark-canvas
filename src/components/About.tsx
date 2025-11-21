import { FadeInSection } from "./FadeInSection";

export const About = () => {
  return (
    <section id="about" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
            About <span className="text-primary">Me</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              I'm a passionate Game Developer and Technical Artist with expertise in creating 
              stunning 3D environments and visual effects. My work focuses on pushing the boundaries 
              of real-time rendering and creating immersive gaming experiences.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              With a strong foundation in both artistic design and technical implementation, 
              I bridge the gap between creative vision and technical execution. I specialize in 
              PBR materials, particle systems, shader development, and optimizing visual fidelity 
              for real-time applications.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {['3D Modeling', 'VFX & Particles', 'Shaders', 'Game Engines'].map((skill) => (
                <div 
                  key={skill}
                  className="bg-background p-4 rounded-lg border border-border text-center hover:border-primary transition-colors"
                >
                  <p className="font-medium">{skill}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};
