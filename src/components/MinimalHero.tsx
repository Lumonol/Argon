import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";

const ROTATING_TERMS = [
  { abbr: "ERP", label: "enterprise resource planning" },
  { abbr: "CRM", label: "community relationship management" },
  { abbr: "SaaS", label: "software as a service" },
  { abbr: "API", label: "application programming interface" },
];

const MinimalHero = () => {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_TERMS.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex items-center bg-background overflow-hidden pt-28 pb-10 md:pt-36 md:pb-12">
      {/* Green ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px] bg-primary" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] bg-primary" />
      </div>

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Large heading */}
          <ScrollReveal direction="left" duration={700}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              The <span className="text-primary">all-in-one</span> platform for Roblox{" "}
              <span
                className="inline-block transition-all duration-300 text-primary"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
              >
                {ROTATING_TERMS[index].abbr}
              </span>
            </h1>
          </ScrollReveal>

          {/* Right — Description + CTA */}
          <ScrollReveal direction="right" delay={150} duration={700}>
            <div className="flex flex-col gap-6">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                <span className="text-primary font-semibold">Hive </span> is the platform for innovating Roblox
                communities — build custom workflows, manage your data seamlessly, and extend functionality with powerful modules.
              </p>

              <div>
                {!user ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 text-foreground hover:bg-primary/10 px-12 py-6 text-base shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
                    asChild
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 text-foreground hover:bg-primary/10 px-12 py-6 text-base shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
                    asChild
                  >
                    <Link to="/workspaces">Open Workspaces</Link>
                  </Button>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default MinimalHero;
