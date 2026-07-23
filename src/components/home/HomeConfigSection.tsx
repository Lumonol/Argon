import { Link } from "react-router-dom";
import { Settings, Calendar, Shield } from "lucide-react";
import showcaseSettings from "@/assets/showcase-settings.png";
import showcaseSessions from "@/assets/showcase-sessions.png";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const highlights = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Role Hierarchy",
    description: "Define a clear chain of command with ranked roles — from trainees to leadership.",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Recurring Sessions",
    description: "Set up repeating schedules for weekly trainings, stand-ups, or any recurring event.",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Granular Permissions",
    description: "Control exactly who can view, edit, or manage each feature with fine-grained toggles.",
  },
];

const HomeConfigSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* 2-panel layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-border/30">
          {/* Left: Roles & Permissions */}
          <ScrollReveal direction="left">
            <Link to="/features/roles-permissions" className="group block md:pr-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Roles & Permissions
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Fine-grained access control with role hierarchies, permission toggles, and workspace-wide configuration.
              </p>
              <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/50 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                <img
                  src={showcaseSettings}
                  alt="Roles and permissions configuration"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </Link>
          </ScrollReveal>

          {/* Right: Training Sessions */}
          <ScrollReveal direction="right" delay={100}>
            <Link to="/features/sessions" className="group block md:pl-10 mt-10 md:mt-0">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Training Sessions
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Schedule, manage, and track training sessions with built-in attendance logging and session announcements.
              </p>
              <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/50 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                <img
                  src={showcaseSessions}
                  alt="Training sessions and attendance"
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

export default HomeConfigSection;
