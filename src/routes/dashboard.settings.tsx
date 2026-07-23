import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Settings, LayoutGrid, Shield, Building, Tag, Paintbrush, FileText, CreditCard, Gamepad2, PhoneCall, Bot, Code, DoorOpen, Activity, LinkIcon, Home, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { id: "workspace", label: "Workspace", description: "General settings", icon: Home },
  { id: "customisation", label: "Customisation", description: "Appearance & branding", icon: Paintbrush },
  { id: "departments", label: "Departments", description: "Team structure", icon: Building },
  { id: "labels", label: "Labels", description: "Tags for staff", icon: Tag },
  { id: "call-tags", label: "Call Tags", description: "Moderator call tags", icon: PhoneCall },
  { id: "roles", label: "Roles", description: "Permissions & access", icon: Shield },
  { id: "modules", label: "Modules", description: "Enable features", icon: LayoutGrid },
];

const SettingsSidebarContent = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) => {
  return (
    <>
      <div className="p-3">
        <span className="text-sm font-medium text-muted-foreground">Settings</span>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {SETTINGS_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground")}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className={cn("text-sm font-medium", isActive && "text-primary")}>{tab.label}</p>
                <p className="text-xs text-muted-foreground">{tab.description}</p>
              </div>
            </button>
          );
        })}
      </nav>
    </>
  );
};

const WorkspacesSettings = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState("workspace");
  const { toast } = useToast();
  const [workspaceName, setWorkspaceName] = useState("Argon Workspace");
  const [enabledModules, setEnabledModules] = useState<string[]>(["moduler"]);

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your Argon workspace settings have been saved successfully." });
  };

  const toggleModule = (modId: string) => {
    setEnabledModules(prev => prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border bg-card/50 flex-shrink-0 overflow-y-auto hidden md:block">
        <SettingsSidebarContent activeTab={activeSettingsTab} setActiveTab={setActiveSettingsTab} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {SETTINGS_TABS.find(t => t.id === activeSettingsTab)?.label}
            </h1>
          </div>

          {activeSettingsTab === "workspace" && (
            <Card>
              <CardHeader>
                <CardTitle>Workspace Overview</CardTitle>
                <CardDescription>Manage the basic settings of your Argon workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workspace Name</Label>
                  <Input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} />
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeSettingsTab === "modules" && (
            <Card>
              <CardHeader>
                <CardTitle>Modules</CardTitle>
                <CardDescription>Enable or disable features within your Argon system.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { id: "moduler", name: "UI Builder", desc: "Build custom interfaces" },
                  { id: "staff", name: "Staff Management", desc: "Manage your team" },
                  { id: "activity", name: "Activity Tracking", desc: "Track usage logs" }
                ].map(mod => (
                  <div key={mod.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                    <div>
                      <h4 className="font-semibold text-foreground">{mod.name}</h4>
                      <p className="text-sm text-muted-foreground">{mod.desc}</p>
                    </div>
                    <Switch checked={enabledModules.includes(mod.id)} onCheckedChange={() => toggleModule(mod.id)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSettingsTab !== "workspace" && activeSettingsTab !== "modules" && (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground mb-4">This settings panel is a template for the Argon modular system.</p>
                <Button variant="outline" onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/settings")({
  component: WorkspacesSettings,
});
