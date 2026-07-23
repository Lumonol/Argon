import { Link } from "react-router-dom";
import { Settings, Users, Lock } from "lucide-react";
import showcaseForms from "@/assets/showcase-forms.png";
import showcaseKnowledge from "@/assets/showcase-knowledge-base.png";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const highlights = [
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Customisable",
    description: "Customise forms, documents, and workspaces to fit your brand and needs.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Collaborative",
    description: "Collaborate as a team to review applications, edit documents, and manage workspaces.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Secure Permissions",
    description: "All resources are secured behind your role-based permissions.",
  },
];

const HomeResourcesSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* 2-panel layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-border/30">
          {/* Left: Forms */}
          <ScrollReveal direction="left">
            <Link to="/features/forms" className="group block md:pr-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Forms & Applications
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Create staff applications, forms, and ban appeals and share with your community. Collaborate to approve and deny responses.
              </p>
              <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/50 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                <img
                  src={showcaseForms}
                  alt="Forms and applications dashboard"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </Link>
          </ScrollReveal>

          {/* Right: Knowledge Base */}
          <ScrollReveal direction="right" delay={100}>
            <Link to="/features/knowledge-base" className="group block md:pl-10 mt-10 md:mt-0">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Knowledge Base
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Create role-based permission restricted documents and share with your team. Group documents into workspaces with default permissions.
              </p>
              <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/50 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                <img
                  src={showcaseKnowledge}
                  alt="Knowledge base documentation"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </Link>
          </ScrollReveal>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-border/30" />

        {/* 3 highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {highlights.map((item, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 80}>
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-primary">{item.icon}</span>
                  <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeResourcesSection;
