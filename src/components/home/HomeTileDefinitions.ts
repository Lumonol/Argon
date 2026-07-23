import {
  Users, FileText, ClipboardList, Activity, Calendar, Settings,
  Megaphone, Shield, Crown, AlertCircle, Link2
} from "lucide-react";

export interface TileDefinition {
  key: string;
  label: string;
  description: string;
  icon: any;
  href?: (workspaceId: string) => string;
  requiresChairman?: boolean;
  isWidget?: boolean;
  defaultSize?: "small" | "medium" | "large" | "widget";
  component?: React.ComponentType<any>;
}

export const ALL_TILES: TileDefinition[] = [
  // These will be dynamically hydrated by HomeTileGrid from active modules
];

export const DEFAULT_TILE_KEYS: string[] = [];
