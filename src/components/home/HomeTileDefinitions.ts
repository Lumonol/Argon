import {
  Users, FileText, ClipboardList, Activity, Calendar, Settings,
  Megaphone, Shield, Crown, AlertCircle, Link2
} from "lucide-react";

export interface TileDefinition {
  key: string;
  label: string;
  description: string;
  icon: typeof Users;
  href?: (workspaceId: string) => string;
  requiresChairman?: boolean;
  isWidget?: boolean;
  defaultSize?: "small" | "medium" | "large" | "widget";
}

export const ALL_TILES: TileDefinition[] = [
  { key: "staff", label: "Staff Management", description: "Directory, profiles, roles", icon: Users, href: (w) => `/workspaces/${w}/staff` },
  { key: "docs", label: "Knowledge Base", description: "Guides and resources", icon: FileText, href: (w) => `/workspaces/${w}/docs` },

  { key: "activity", label: "Activity", description: "Stats and reporting", icon: Activity, href: (w) => `/workspaces/${w}/activity` },
  { key: "sessions", label: "Sessions", description: "Schedule and attendance", icon: Calendar, href: (w) => `/workspaces/${w}/sessions` },

  { key: "messages", label: "Messages", description: "Staff feed & updates", icon: Megaphone, href: (w) => `/workspaces/${w}/messages` },
  { key: "settings", label: "Settings", description: "System configuration", icon: Settings, href: (w) => `/workspaces/${w}/settings`, requiresChairman: true },
  { key: "quick_links", label: "Quick Links", description: "Your saved links", icon: Link2, isWidget: true, defaultSize: "large" },


];

export const DEFAULT_TILE_KEYS = ["staff", "docs", "activity", "sessions", "messages"];
