import { useState, useEffect, useCallback, useRef } from "react";
import { useSentinel } from "@/hooks/useSentinel";
import type { SentinelIncident } from "@/hooks/useSentinel";
import SentinelIncidentCard from "./SentinelIncidentCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Inbox, RefreshCw } from "lucide-react";

interface SentinelQueueProps {
  workspaceId: string;
}

const SentinelQueue = ({ workspaceId }: SentinelQueueProps) => {
  const { listIncidents, resolveIncident } = useSentinel(workspaceId);
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<SentinelIncident[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const listIncidentsRef = useRef(listIncidents);
  listIncidentsRef.current = listIncidents;

  const fetchIncidents = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setFetchError(null);
    try {
      const result = await listIncidentsRef.current({
        status: "pending",
        category: categoryFilter === "all" ? undefined : categoryFilter,
        page,
      });
      setIncidents(result.incidents);
      setTotal(result.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[SentinelQueue] Failed to fetch incidents:", msg);
      setFetchError(msg);
      if (!isRefresh) {
        toast({ title: "Error", description: "Failed to load incidents", variant: "destructive" });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, categoryFilter, toast]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchIncidents(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleResolve = async (incidentId: string, action: "warn" | "kick" | "ban" | "dismiss") => {
    try {
      await resolveIncident(incidentId, action);
      toast({ title: "Success", description: `Incident ${action === "dismiss" ? "dismissed" : `resolved with ${action}`}` });
      fetchIncidents(true);
    } catch {
      toast({ title: "Error", description: "Failed to resolve incident", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} pending incident{total !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchIncidents(true)}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="avatar">Avatar</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="exploit">Exploit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {fetchError && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          Failed to fetch queue: {fetchError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No pending incidents</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <SentinelIncidentCard
              key={incident.id}
              incident={incident}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(page + 1) * 20 >= total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default SentinelQueue;
