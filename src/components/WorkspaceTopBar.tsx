import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkspaceTopBarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const WorkspaceTopBar = ({ collapsed, onToggleCollapsed }: WorkspaceTopBarProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 bg-card border-b border-border">
      {/* Left */}
      <div className="flex-1 flex items-center gap-2">
        <button
          onClick={onToggleCollapsed}
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg flex-shrink-0 min-w-0 max-w-[220px]">
          <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xs font-bold leading-none">A</span>
          </div>
          <span className="text-sm font-semibold truncate">Argon Workspace</span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceTopBar;
