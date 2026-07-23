import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";
import { useSentinel, SentinelIncident } from "@/hooks/useSentinel";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SentinelWidgetProps {
  workspaceId: string;
}

const severityConfig = {
  critical: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle },
  high: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle },
  medium: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: AlertTriangle },
  low: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Info },
};

const SentinelWidget = ({ workspaceId }: SentinelWidgetProps) => {
  const { listIncidents } = useSentinel(workspaceId);
  const [incidents, setIncidents] = useState<SentinelIncident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await listIncidents({ status: "pending" });
        setIncidents(data.incidents.slice(0, 5));
        setTotal(data.total);
      } catch {
        // Sentinel may not be set up
      }
      setLoading(false);
    };

    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [listIncidents]);

  const severityCounts = incidents.reduce(
    (acc, i) => {
      acc[i.severity] = (acc[i.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          Sentinel Queue
        </h3>
        {total > 0 && (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {total} pending
          </Badge>
        )}
      </div>

      <CardContent className="px-4 pb-3 pt-1 flex-1 overflow-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : total === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2">
            <Shield className="w-8 h-8 text-green-500/40" />
            <p className="text-xs text-muted-foreground">Queue is clear</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Severity summary */}
            <div className="flex gap-1.5 flex-wrap">
              {(["critical", "high", "medium", "low"] as const).map((sev) =>
                severityCounts[sev] ? (
                  <Badge
                    key={sev}
                    variant="outline"
                    className={cn("text-[10px] h-5 px-1.5 gap-1", severityConfig[sev].color)}
                  >
                    {severityCounts[sev]} {sev}
                  </Badge>
                ) : null
              )}
            </div>

            {/* Recent incidents */}
            <div className="space-y-1">
              {incidents.map((incident) => {
                const config = severityConfig[incident.severity];
                const SevIcon = config.icon;
                return (
                  <div
                    key={incident.id}
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <SevIcon className={cn("w-3.5 h-3.5 flex-shrink-0", config.color.split(" ")[1])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">
                        {incident.roblox_username || `User ${incident.roblox_user_id}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{incident.ai_summary}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <Badge variant="outline" className="text-[9px] h-4 px-1">
                        {incident.category}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground mt-0.5">{timeAgo(incident.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {total > 5 && (
              <Link
                to={`/workspaces/${workspaceId}/sentinel`}
                className="block text-center text-[11px] text-primary hover:underline pt-1"
              >
                View all {total} incidents
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentinelWidget;
