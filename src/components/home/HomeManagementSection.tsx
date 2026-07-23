import { Link } from "react-router-dom";
import { LayoutDashboard, Users, ShieldBan } from "lucide-react";
import showcaseHome from "@/assets/showcase-home.png";
import showcaseStaff from "@/assets/showcase-staff.png";
import showcaseModeration from "@/assets/showcase-moderation.png";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const cards = [
  {
    image: showcaseHome,
    caption: "An advanced workspace dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    href: "/features/workspace-dashboard",
  },
  {
    image: showcaseStaff,
    caption: "Staff directory & management",
    icon: <Users className="w-4 h-4" />,
    href: "/features/staff-management",
  },
  {
    image: showcaseModeration,
    caption: "Remote in-game moderation",
    icon: <ShieldBan className="w-4 h-4" />,
    href: "/features/moderation",
  },
];

const HomeManagementSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 mb-10 md:mb-16">
          <ScrollReveal direction="left">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground max-w-md leading-[1.1]">
              Built for Teams of All Sizes
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={100}>
            <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
              Manage your workspace, organise your staff, and moderate your game — all from one unified platform.
            </p>
          </ScrollReveal>
        </div>

        {/* 3-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <ScrollReveal key={card.href} direction="up" delay={i * 100}>
              <Link to={card.href} className="group block">
                <div className="rounded-2xl overflow-hidden border border-border/30 bg-card/50 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                  <img
                    src={card.image}
                    alt={card.caption}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-2 mt-4 text-muted-foreground group-hover:text-foreground transition-colors">
                  <span className="text-primary">{card.icon}</span>
                  <span className="text-sm">{card.caption}</span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeManagementSection;
