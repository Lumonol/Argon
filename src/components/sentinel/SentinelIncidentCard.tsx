import { Eye, MessageSquare, Zap, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SentinelIncident } from "@/hooks/useSentinel";

const categoryIcons: Record<string, React.ReactNode> = {
  avatar: <Eye className="w-4 h-4" />,
  chat: <MessageSquare className="w-4 h-4" />,
  exploit: <Zap className="w-4 h-4" />,
};

const severityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

interface SentinelIncidentCardProps {
  incident: SentinelIncident;
  onResolve?: (incidentId: string, action: "warn" | "kick" | "ban" | "dismiss") => void;
  showActions?: boolean;
}

const SentinelIncidentCard = ({ incident, onResolve, showActions = true }: SentinelIncidentCardProps) => {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="border-border/30 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                {categoryIcons[incident.category]}
                <span className="capitalize">{incident.category}</span>
              </div>
              <Badge variant="outline" className={severityColors[incident.severity]}>
                {incident.severity}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {Math.round(incident.confidence * 100)}% confidence
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(incident.created_at)}
              </span>
            </div>

            <div className="text-sm font-semibold mb-1">
              {incident.roblox_username || `User ${incident.roblox_user_id}`}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {incident.ai_summary}
            </p>

            {incident.recommended_action && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <AlertTriangle className="w-3 h-3" />
                Recommended: <span className="font-medium capitalize">{incident.recommended_action}</span>
              </div>
            )}
          </div>

          {showActions && incident.status === "pending" && onResolve && (
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="default">
                    Approve
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onResolve(incident.id, "warn")}>
                    Warn Player
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onResolve(incident.id, "kick")}>
                    Kick Player
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onResolve(incident.id, "ban")} className="text-red-500">
                    Ban Player
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolve(incident.id, "dismiss")}
              >
                Dismiss
              </Button>
            </div>
          )}

          {incident.status !== "pending" && (
            <Badge
              variant="outline"
              className={
                incident.status === "auto_actioned" ? "text-blue-500" :
                incident.status === "approved" ? "text-green-500" :
                "text-muted-foreground"
              }
            >
              {incident.status === "auto_actioned" ? "Auto" : incident.status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SentinelIncidentCard;
