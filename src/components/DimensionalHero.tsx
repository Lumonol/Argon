import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DimensionalHero = () => {
  const { user, loading } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Prismatic ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "hsl(var(--prism-purple))" }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "hsl(var(--prism-cyan))" }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "hsl(var(--prism-pink))" }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
          <span className="text-gradient-prism">Prism</span>{" "}
          <span className="text-foreground">Space</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Connecting all dimensions of your Roblox community in one powerful platform.
        </p>

        {!loading && user && (
          <Button size="lg" className="group" asChild>
            <Link to="/workspaces">
              <Briefcase className="w-5 h-5 mr-2" />
              Open Workspaces
            </Link>
          </Button>
        )}

        {!loading && !user && (
          <Button size="lg" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default DimensionalHero;
