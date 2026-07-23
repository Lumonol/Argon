export interface WorkspaceModule {
  key: string;
  label: string;
  description: string;
  requiresPrismPlus: boolean;
  requiresSentinel: boolean;
  requiresFlow: boolean;
  forceDisabled?: boolean;
  submodules?: WorkspaceModule[];
}

export const WORKSPACE_MODULES: WorkspaceModule[] = [
  { 
    key: "staff", 
    label: "Staff Management", 
    description: "View and manage your staff directory, logbook, and roles", 
    requiresPrismPlus: false, 
    requiresSentinel: false, 
    requiresFlow: false,
    submodules: [
      { key: "directory", label: "Staff Directory", description: "Core staff directory and hierarchy", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
      { key: "onboarding", label: "Onboarding & Legal", description: "Automated NDA provisioning and access control", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
      { key: "escrow", label: "Escrow & Smart Payouts", description: "Automated revenue splitting and contractor payments", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false }
    ]
  },
  { key: "messages", label: "Messages", description: "Send and receive workspace messages", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
  { key: "activity", label: "Activity Tracking", description: "Track and log staff activity hours", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
  { key: "assignments", label: "Tasks", description: "Contractor task tracker and agile board", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false, forceDisabled: true },
  { key: "documentation", label: "Knowledge Base", description: "Create guides, SOPs, and documentation for staff", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
  { 
    key: "moderation", 
    label: "Moderation", 
    description: "Manage game moderation and safety", 
    requiresPrismPlus: false, 
    requiresSentinel: false, 
    requiresFlow: false,
    forceDisabled: true,
    submodules: [
      { key: "sentinel", label: "Sentinel", description: "Bot moderation", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
      { key: "calls", label: "Calls", description: "Moderator call log", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
      { key: "bans", label: "Bans", description: "Remote bans", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
      { key: "commands", label: "Commands", description: "Staff command log", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false }
    ]
  },
  { 
    key: "players", 
    label: "Players", 
    description: "Manage player orders, rooms, forms, and promotional offers", 
    requiresPrismPlus: false, 
    requiresSentinel: false, 
    requiresFlow: false,
    submodules: [
      { key: "orders", label: "Orders", description: "Player orders", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
      { key: "rooms", label: "Rooms", description: "Active game rooms", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
      { key: "forms", label: "Forms", description: "Player form responses", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
      { key: "promotions", label: "Promotions", description: "Promotion recommendations", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false }
    ]
  },
  { key: "devops", label: "Dev-Ops & Version Control", description: "GitHub/Rojo integration, auto-deployments, and rollback management", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
  { key: "assets", label: "Advanced Asset Management", description: "Roblox ID caching, tag-based browsing, and CDN integration", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
  { key: "ip_discovery", label: "AI-Driven IP Discovery", description: "Automated DMCA/IP theft detection scanning", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
  { key: "takedown", label: "Takedown Queue & Router", description: "Automated legal takedown notice generation and tracking", requiresPrismPlus: false, requiresSentinel: false, requiresFlow: false },
];

/** All module keys */
export const ALL_MODULE_KEYS = WORKSPACE_MODULES.flatMap(m => m.submodules ? [m.key, ...m.submodules.map(s => s.key)] : [m.key]);

/** Default modules enabled for new workspaces (all of them) */
export const DEFAULT_ENABLED_MODULES = ALL_MODULE_KEYS;
