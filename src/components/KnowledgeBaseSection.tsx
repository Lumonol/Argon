import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import showcaseKB from "@/assets/showcase-knowledge-base.png";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const KnowledgeBaseSection = () => {
  return (
    <section className="py-12 md:py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 mb-8 md:mb-14">
          <ScrollReveal direction="left">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground max-w-lg leading-[1.1]">
              Knowledge Base
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={100}>
            <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
              Centralise guides, training materials, and important documents for your entire team to access.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal direction="up" delay={150}>
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border/30 bg-card/50 mb-8 md:mb-12">
            <img
              src={showcaseKB}
              alt="Knowledge Base overview"
              className="w-full h-auto object-cover object-top"
              loading="lazy"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200}>
          <div className="text-center">
            <Link to="/features/knowledge-base" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              Explore more <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default KnowledgeBaseSection;
