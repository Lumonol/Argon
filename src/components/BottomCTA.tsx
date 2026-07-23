import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Check } from "lucide-react";
import prismIcon from "@/assets/prism-icon-large.png";
import robloxLogo from "@/assets/roblox-logo.webp";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const BottomCTA = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Green ambient glow at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Logo connection */}
        <ScrollReveal direction="up">
          <div className="flex items-center justify-center gap-6 mb-12">
            {/* Roblox logo */}
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg p-2">
              <img src={robloxLogo} alt="Roblox" className="w-full h-full object-contain" />
            </div>

            {/* Animated dotted connector */}
            <div className="relative flex items-center w-28 h-6 overflow-hidden">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-primary/20" />
              </div>
              <div className="absolute left-0 flex items-center gap-3 animate-connector-dots will-change-transform" style={{ width: '200%' }}>
                {[0, 1].map((i) =>
                <div key={i} className="flex items-center gap-3 w-1/2 justify-evenly">
                    <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                  </div>
                )}
              </div>
            </div>

            {/* Prism logo */}
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg p-3">
              <img src={prismIcon} alt="Hive" className="w-full h-full object-contain" />
            </div>
          </div>
        </ScrollReveal>

        {/* Badge */}
        <ScrollReveal direction="up" delay={80}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Setup takes less than 2 minutes
          </div>
        </ScrollReveal>

        {/* Heading */}
        <ScrollReveal direction="up" delay={120}>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-[1.1]">
            ​Connect Roblox. Unlock the best of your community.    
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Manage your community and configure your Roblox integrations effortlessly in one central dashboard.
          </p>
        </ScrollReveal>

        {/* Buttons */}
        <ScrollReveal direction="up" delay={160}>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-7 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors">

              Start free trial
              <ChevronRight className="w-4 h-4" />
            </Link>
            





          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              Free to get started
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              Cancel anytime
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>);

};

export default BottomCTA;