import { Settings, Grid3x3, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const WorkspacesSidebar = ({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange?: (collapsed: boolean) => void }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainNavItems = [
    { name: "UI Builder", href: "/dashboard/moduler", icon: Grid3x3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorTop, setIndicatorTop] = useState<number>(0);
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const initializedRef = useRef(false);

  const recalcIndicator = useCallback(() => {
    const activeItem = mainNavItems.find(item => location.pathname.startsWith(item.href));
    const activeEl = activeItem ? itemRefs.current.get(activeItem.href) : undefined;
    if (activeEl && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const newTop = elRect.top - navRect.top + (elRect.height / 2) - 12;
      if (!initializedRef.current) {
        setIndicatorTop(newTop);
        requestAnimationFrame(() => {
          setIndicatorVisible(true);
          initializedRef.current = true;
        });
      } else {
        setIndicatorTop(newTop);
        setIndicatorVisible(true);
      }
    } else {
      setIndicatorVisible(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const t = setTimeout(recalcIndicator, 20);
    return () => clearTimeout(t);
  }, [recalcIndicator]);

  const renderNav = (showLabels: boolean) => (
    <nav ref={navRef} className="relative flex-1 p-2 space-y-0.5 overflow-y-auto">
      <span
        className={cn(
          "absolute left-0 w-[3px] h-6 rounded-r-full bg-primary z-10",
          indicatorVisible ? "opacity-100 transition-[top] duration-300 ease-in-out" : "opacity-0"
        )}
        style={{ top: indicatorTop }}
      />
      {mainNavItems.map(item => {
        const isActive = location.pathname.startsWith(item.href);
        return (
          <NavLink
            key={item.name}
            to={item.href}
            ref={(el: HTMLAnchorElement | null) => {
              if (el) itemRefs.current.set(item.href, el);
              else itemRefs.current.delete(item.href);
            }}
            onClick={() => {
              if (isMobile) setMobileOpen(false);
            }}
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              isActive ? "text-primary font-semibold" :
              "text-foreground/70 hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
            {showLabels && <span className="truncate flex-1">{item.name}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/40 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1.5">
          {mainNavItems.map(item => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium truncate max-w-[64px]">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside className={cn(
      "fixed left-0 top-14 h-[calc(100vh-56px)] bg-card transition-all duration-300 flex flex-col flex-shrink-0 z-30",
      collapsed ? "w-16" : "w-64"
    )}>
      {renderNav(!collapsed)}
    </aside>
  );
};

export default WorkspacesSidebar;
