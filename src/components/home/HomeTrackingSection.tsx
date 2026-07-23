import { Link } from "react-router-dom";
import { Trophy, CalendarOff, BarChart3 } from "lucide-react";
import showcaseActivity from "@/assets/showcase-activity.png";
import showcaseLogbook from "@/assets/showcase-staff-logbook.png";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const highlights = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Contribution Grid",
    description: "A GitHub-style heatmap shows activity patterns at a glance — spot trends and gaps instantly.",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Leaderboards",
    description: "See how staff stack up against each other with ranked leaderboards based on total activity.",
  },
  {
    icon: <CalendarOff className="w-5 h-5" />,
    title: "Time-Off Management",
    description: "Staff can request time off directly. Managers approve, deny, or review — all tracked in one place.",
  },
];

const HomeTrackingSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* 2-panel layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-border/30">
          {/* Left: Activity Tracking */}
          <ScrollReveal direction="left">
            <Link to="/features/activity-tracking" className="group block md:pr-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Activity Tracking
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Gain full insight into your team's activity, see contribution grids, weekly charts, and leaderboards.
              </p>
              <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/50 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                <img
                  src={showcaseActivity}
                  alt="Activity tracking dashboard"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </Link>
          </ScrollReveal>

          {/* Right: Logbook */}
          <ScrollReveal direction="right" delay={100}>
            <Link to="/features/logbook" className="group block md:pl-10 mt-10 md:mt-0">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Logbook
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                Keep a centralised record of staff actions, session notes, warnings, and moderation events.
              </p>
              <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/50 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                <img
                  src={showcaseLogbook}
                  alt="Logbook interface"
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

export default HomeTrackingSection;
