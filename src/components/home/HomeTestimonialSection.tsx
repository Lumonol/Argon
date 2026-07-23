import { ScrollReveal } from "@/hooks/useScrollAnimation";
import reviewAvatar from "@/assets/review-epictitan100.png";

const HomeTestimonialSection = () => {
  return (
    <section className="py-10 md:py-14 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="max-w-3xl">
            <p className="text-lg md:text-2xl font-semibold leading-relaxed text-foreground">
              <span className="text-muted-foreground">{"\u201C"}</span>
              Hive has been{" "}
              <span className="text-primary">a game-changer</span> for our
              Roblox community. As an HRM provider tailored specifically for
              Roblox groups, the platform delivers exactly what community leaders
              and staff teams need without unnecessary complexity. The system is
              affordable, dependable, and consistently performs at a high
              standard, even as our operations scale.
              <span className="text-muted-foreground">{"\u201D"}</span>
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={150}>
          <div className="flex items-center gap-3 mt-6">
            <img
              src={reviewAvatar}
              alt="EpicTitan100"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                EpicTitan100,{" "}
                <span className="text-muted-foreground font-normal">
                  Chairman
                </span>
              </p>
              <p className="text-sm text-muted-foreground">London Airways</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HomeTestimonialSection;
