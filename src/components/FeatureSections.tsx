import { ChevronRight, Shield, FileText, Users, Activity, Settings, UserCheck, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import showcaseHome from "@/assets/showcase-home.png";
import showcaseKnowledge from "@/assets/showcase-knowledge.png";
import showcaseForms from "@/assets/showcase-forms.png";
import showcaseModeration from "@/assets/showcase-moderation.png";
import showcaseSettings from "@/assets/showcase-settings.png";
import showcaseActivity from "@/assets/showcase-activity.png";
import showcaseStaff from "@/assets/showcase-staff.png";
import showcaseSessions from "@/assets/showcase-sessions.png";

interface ShowcaseCard {
  image: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const cards: ShowcaseCard[] = [
  { image: showcaseHome, label: "An advanced workspace dashboard", icon: <Shield className="w-4 h-4" />, href: "/features/workspace-dashboard" },
  { image: showcaseKnowledge, label: "Knowledge base & training docs", icon: <FileText className="w-4 h-4" />, href: "/features/knowledge-base" },
  { image: showcaseForms, label: "Custom forms & ban appeals", icon: <Users className="w-4 h-4" />, href: "/features/forms" },
  { image: showcaseModeration, label: "Remote in-game moderation", icon: <Activity className="w-4 h-4" />, href: "/features/moderation" },
  { image: showcaseSettings, label: "Roles, permissions & configuration", icon: <Settings className="w-4 h-4" />, href: "/features/roles-permissions" },
  { image: showcaseActivity, label: "Activity tracking & analytics", icon: <Activity className="w-4 h-4" />, href: "/features/activity-tracking" },
  { image: showcaseStaff, label: "Staff directory & management", icon: <UserCheck className="w-4 h-4" />, href: "/features/staff-management" },
  { image: showcaseSessions, label: "Training sessions & attendance", icon: <Calendar className="w-4 h-4" />, href: "/features/sessions" },
];

// Duplicate cards for seamless infinite loop
const scrollCards = [...cards, ...cards];

const FeatureSections = () => {
  return (
    <section className="py-8 px-4 bg-background overflow-x-clip">
      <div className="relative py-4 -my-4">
        <div
          className="flex gap-4 md:gap-6 animate-scroll-x hover:[animation-play-state:paused]"
          style={{ width: "max-content" }}
        >
          {scrollCards.map((card, i) => (
            <Link
              to={card.href}
              key={i}
              className="relative flex-shrink-0 w-[340px] sm:w-[480px] md:w-[600px] lg:w-[720px] rounded-2xl overflow-hidden border border-border/30 bg-card/50 group transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] hover:scale-[1.02]"
            >
              <div className="overflow-hidden">
                <img
                  src={card.image}
                  alt={card.label}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-xl rounded-full px-4 py-2 text-sm text-foreground border border-border/30">
                  <span className="text-primary">{card.icon}</span>
                  {card.label}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSections;
