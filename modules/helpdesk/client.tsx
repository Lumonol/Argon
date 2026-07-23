import { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';
import { StatWidget } from "@/sdk/ui";
import type { ModuleSettingsSchema, ModuleTile, ModuleWidget } from "@/sdk/ui";

export const tiles: ModuleTile[] = [
  {
    id: "helpdesk",
    label: "Helpdesk",
    description: "Support and tickets system",
    icon: Ticket,
    href: "/dashboard/m/helpdesk"
  }
];

export const widgets: ModuleWidget[] = [
  {
    id: "helpdesk_stats",
    label: "Helpdesk Stats",
    description: "Quick ticket stats",
    icon: Ticket,
    defaultSize: "widget",
    component: ({ tileEditing, tileSize }) => {
      const [stats, setStats] = useState<any>(null);
      useEffect(() => {
        fetch('/api/m/helpdesk/stats').then(r => r.json()).then(setStats).catch(() => {});
      }, []);
      
      return (
        <StatWidget
          title="Helpdesk Overview"
          icon={<Ticket className="w-full h-full" />}
          value={stats ? stats.openTickets : "..."}
          description="Open Tickets"
          actionLabel="View Queue"
          onAction={() => console.log('View Queue clicked')}
          tileEditing={tileEditing}
          tileSize={tileSize}
        />
      );
    }
  }
];

export const settings: ModuleSettingsSchema = [
  { 
    id: "support_email", 
    type: "string", 
    label: "Support Email", 
    description: "The email address where tickets will be forwarded.",
    default: "support@argon.local" 
  },
  { 
    id: "enable_live_chat", 
    type: "boolean", 
    label: "Enable Live Chat", 
    description: "Allow users to initiate real-time chat with support agents.",
    default: false 
  },
  { 
    id: "ticket_priority", 
    type: "select", 
    label: "Default Ticket Priority", 
    description: "The default priority assigned to incoming tickets.",
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" }
    ],
    default: "medium" 
  }
];

export default function HelpdeskModule({ module, activeSubmodule, UI }: { module: any, activeSubmodule?: string, UI: any }) {
  const { Card, CardContent, CardHeader, CardTitle } = UI;
  const { Loader2, Ticket, Book, CheckCircle2, Bell } = UI.Icons;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/m/helpdesk/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to fetch helpdesk stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render submodule content
  if (activeSubmodule === 'tickets') {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <Ticket className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resolvedTickets || 0}</div>
              <p className="text-xs text-muted-foreground">Historically resolved</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">List of recent tickets would appear here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeSubmodule === 'knowledgebase') {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
              <Book className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.articles || 0}</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Article Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">List of KB articles would appear here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default module landing view
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Helpdesk Overview</CardTitle>
          <Ticket className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.openTickets || 0} Open Tickets</div>
          <p className="text-xs text-muted-foreground mt-2">Select a submodule from the sidebar to view more details.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Test API</CardTitle>
          <Bell className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Send a test notification to the Argon drawer.</p>
          <button 
            onClick={() => UI.notify({ 
              title: "Test from Helpdesk", 
              description: "This is a notification sent using the new UI API!",
              color: "bg-blue-500/10 border-blue-500/20 text-blue-500"
            })}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Send Notification
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
