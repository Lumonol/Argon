import { useState, useEffect, useCallback } from "react";
import { useSentinel } from "@/hooks/useSentinel";
import type { SentinelAction } from "@/hooks/useSentinel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ScrollText } from "lucide-react";

interface SentinelActionLogProps {
  workspaceId: string;
}

const actionColors: Record<string, string> = {
  warn: "bg-yellow-500/10 text-yellow-500",
  kick: "bg-orange-500/10 text-orange-500",
  ban: "bg-red-500/10 text-red-500",
  dismiss: "bg-muted text-muted-foreground",
};

const SentinelActionLog = ({ workspaceId }: SentinelActionLogProps) => {
  const { listActions } = useSentinel(workspaceId);
  const { toast } = useToast();
  const [actions, setActions] = useState<SentinelAction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listActions(page);
      setActions(result.actions);
      setTotal(result.total);
    } catch {
      toast({ title: "Error", description: "Failed to load action log", variant: "destructive" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ScrollText className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm">No actions recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {actions.map((action) => {
          const incident = action.sentinel_incidents;
          return (
            <div
              key={action.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/30 bg-card/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium">
                    {incident?.roblox_username || `User ${incident?.roblox_user_id || "?"}`}
                  </span>
                  <Badge variant="outline" className={actionColors[action.action_type] || ""}>
                    {action.action_type}
                  </Badge>
                  {incident?.category && (
                    <Badge variant="outline" className="text-muted-foreground capitalize">
                      {incident.category}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {incident?.ai_summary || action.notes || "No details"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{formatDate(action.created_at)}</p>
                <p className="text-xs text-muted-foreground">by {action.action_by_username}</p>
              </div>
            </div>
          );
        })}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {Math.ceil(total / 20)}
          </span>
          <Button variant="outline" size="sm" disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default SentinelActionLog;
