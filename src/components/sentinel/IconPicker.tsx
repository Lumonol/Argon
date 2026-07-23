import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import {
  Shield, ShieldAlert, ShieldCheck, ShieldOff, ShieldQuestion,
  Eye, EyeOff, Search as SearchIcon, Scan, ScanLine,
  AlertTriangle, AlertCircle, AlertOctagon, CircleAlert,
  Ban, Skull, SkullIcon, Flame, Fire,
  Target, Crosshair, Focus,
  Activity, Gauge, TrendingUp, TrendingDown, BarChart3,
  Clock, Timer, TimerOff, Hourglass, CalendarClock,
  Users, UserX, UserCheck, UserMinus, UserPlus,
  Bell, BellOff, BellRing,
  Lock, LockOpen, Unlock, KeyRound, Key,
  Radio, Radar, Wifi, WifiOff, Signal,
  Megaphone, Volume2, VolumeX,
  MessageSquare, MessageCircle, MessagesSquare, MessageSquareWarning,
  Zap, ZapOff, Bolt,
  Siren, Ambulance,
  Bug, BugOff,
  Camera, CameraOff, Video, VideoOff,
  Globe, GlobeLock, Earth,
  Fingerprint, ScanFace,
  FileWarning, FileX, FileSearch,
  Hash, AtSign,
  Bot, BotOff,
  Sword, Axe,
  Gamepad2, Joystick,
  Heart, HeartOff, HeartCrack,
  Star, StarOff,
  Sun, Moon,
  Angry, Frown, Meh,
  HandMetal, Hand,
  Eraser, Trash2,
  PencilOff, Pencil,
  CircleSlash, XCircle, XOctagon,
  LogIn, LogOut,
  Map, MapPin,
  Monitor, MonitorOff,
  Power, PowerOff,
  RotateCcw, RefreshCw,
  Send, SendHorizonal,
  Settings, SlidersHorizontal,
  Sparkles, Wand2,
  Tag, Tags,
  Terminal, Code,
  ThumbsDown, ThumbsUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

export interface IconOption {
  value: string;
  label: string;
  Icon: LucideIcon;
  tags: string[];
}

export const ALL_ICONS: IconOption[] = [
  // Security & Protection
  { value: "shield", label: "Shield", Icon: Shield, tags: ["security", "protection", "guard"] },
  { value: "shield-alert", label: "Shield Alert", Icon: ShieldAlert, tags: ["security", "warning", "alert"] },
  { value: "shield-check", label: "Shield Check", Icon: ShieldCheck, tags: ["security", "verified", "safe"] },
  { value: "shield-off", label: "Shield Off", Icon: ShieldOff, tags: ["security", "disabled", "unprotected"] },
  { value: "shield-question", label: "Shield Question", Icon: ShieldQuestion, tags: ["security", "unknown", "suspicious"] },
  { value: "lock", label: "Lock", Icon: Lock, tags: ["security", "locked", "restricted"] },
  { value: "lock-open", label: "Lock Open", Icon: LockOpen, tags: ["security", "unlocked", "access"] },
  { value: "unlock", label: "Unlock", Icon: Unlock, tags: ["security", "open", "access"] },
  { value: "key-round", label: "Key", Icon: KeyRound, tags: ["security", "access", "authentication"] },
  { value: "key", label: "Key Alt", Icon: Key, tags: ["security", "access", "authentication"] },
  { value: "fingerprint", label: "Fingerprint", Icon: Fingerprint, tags: ["identity", "biometric", "authentication"] },
  { value: "scan-face", label: "Face Scan", Icon: ScanFace, tags: ["identity", "recognition", "biometric"] },

  // Alerts & Warnings
  { value: "alert-triangle", label: "Warning", Icon: AlertTriangle, tags: ["alert", "warning", "caution"] },
  { value: "alert-circle", label: "Alert Circle", Icon: AlertCircle, tags: ["alert", "warning", "info"] },
  { value: "alert-octagon", label: "Alert Octagon", Icon: AlertOctagon, tags: ["alert", "stop", "danger"] },
  { value: "circle-alert", label: "Circle Alert", Icon: CircleAlert, tags: ["alert", "warning", "attention"] },
  { value: "triangle-alert", label: "Triangle Alert", Icon: TriangleAlert, tags: ["alert", "warning", "danger"] },
  { value: "siren", label: "Siren", Icon: Siren, tags: ["alert", "emergency", "alarm"] },
  { value: "bell", label: "Bell", Icon: Bell, tags: ["notification", "alert", "alarm"] },
  { value: "bell-ring", label: "Bell Ring", Icon: BellRing, tags: ["notification", "alert", "ringing"] },
  { value: "bell-off", label: "Bell Off", Icon: BellOff, tags: ["notification", "muted", "silent"] },

  // Moderation & Enforcement
  { value: "ban", label: "Ban", Icon: Ban, tags: ["block", "restrict", "prohibit", "moderation"] },
  { value: "skull", label: "Skull", Icon: Skull, tags: ["danger", "death", "toxic"] },
  { value: "circle-slash", label: "Blocked", Icon: CircleSlash, tags: ["block", "restrict", "denied"] },
  { value: "x-circle", label: "X Circle", Icon: XCircle, tags: ["cancel", "close", "deny", "reject"] },
  { value: "x-octagon", label: "X Octagon", Icon: XOctagon, tags: ["stop", "halt", "block"] },
  { value: "thumbs-down", label: "Thumbs Down", Icon: ThumbsDown, tags: ["reject", "dislike", "negative"] },
  { value: "thumbs-up", label: "Thumbs Up", Icon: ThumbsUp, tags: ["approve", "like", "positive"] },
  { value: "trash", label: "Trash", Icon: Trash2, tags: ["delete", "remove", "discard"] },
  { value: "eraser", label: "Eraser", Icon: Eraser, tags: ["clear", "remove", "clean"] },

  // Detection & Scanning
  { value: "eye", label: "Eye", Icon: Eye, tags: ["view", "watch", "monitor", "detection", "avatar"] },
  { value: "eye-off", label: "Eye Off", Icon: EyeOff, tags: ["hidden", "invisible", "blind"] },
  { value: "search", label: "Search", Icon: SearchIcon, tags: ["find", "look", "detect"] },
  { value: "scan", label: "Scan", Icon: Scan, tags: ["detect", "analyze", "inspect"] },
  { value: "scan-line", label: "Scan Line", Icon: ScanLine, tags: ["detect", "analyze", "read"] },
  { value: "crosshair", label: "Crosshair", Icon: Crosshair, tags: ["target", "aim", "focus"] },
  { value: "target", label: "Target", Icon: Target, tags: ["aim", "goal", "focus"] },
  { value: "focus", label: "Focus", Icon: Focus, tags: ["center", "attention", "concentrate"] },
  { value: "radar", label: "Radar", Icon: Radar, tags: ["detect", "scan", "monitor"] },

  // Communication & Chat
  { value: "message-square", label: "Message", Icon: MessageSquare, tags: ["chat", "message", "text", "communication"] },
  { value: "message-circle", label: "Message Circle", Icon: MessageCircle, tags: ["chat", "bubble", "talk"] },
  { value: "messages-square", label: "Messages", Icon: MessagesSquare, tags: ["chat", "conversation", "multiple"] },
  { value: "message-warning", label: "Message Warning", Icon: MessageSquareWarning, tags: ["chat", "warning", "toxic", "flagged"] },
  { value: "megaphone", label: "Megaphone", Icon: Megaphone, tags: ["announce", "broadcast", "speaker"] },
  { value: "volume", label: "Volume", Icon: Volume2, tags: ["sound", "audio", "noise"] },
  { value: "volume-x", label: "Volume X", Icon: VolumeX, tags: ["mute", "silent", "quiet"] },
  { value: "send", label: "Send", Icon: Send, tags: ["message", "submit", "dispatch"] },

  // Danger & Threat
  { value: "flame", label: "Flame", Icon: Flame, tags: ["fire", "hot", "danger", "toxic"] },
  { value: "zap", label: "Zap", Icon: Zap, tags: ["lightning", "power", "electric", "exploit", "speed"] },
  { value: "zap-off", label: "Zap Off", Icon: ZapOff, tags: ["disabled", "power off"] },
  { value: "sword", label: "Sword", Icon: Sword, tags: ["weapon", "attack", "combat", "fighting"] },
  { value: "axe", label: "Axe", Icon: Axe, tags: ["weapon", "tool", "chop"] },
  { value: "angry", label: "Angry", Icon: Angry, tags: ["emotion", "mad", "rage", "toxic"] },
  { value: "frown", label: "Frown", Icon: Frown, tags: ["sad", "unhappy", "negative"] },

  // Status & Monitoring
  { value: "activity", label: "Activity", Icon: Activity, tags: ["pulse", "health", "monitor", "status"] },
  { value: "gauge", label: "Gauge", Icon: Gauge, tags: ["speed", "meter", "performance"] },
  { value: "trending-up", label: "Trending Up", Icon: TrendingUp, tags: ["increase", "growth", "rising"] },
  { value: "trending-down", label: "Trending Down", Icon: TrendingDown, tags: ["decrease", "falling", "decline"] },
  { value: "bar-chart", label: "Bar Chart", Icon: BarChart3, tags: ["stats", "analytics", "data"] },
  { value: "radio", label: "Radio", Icon: Radio, tags: ["broadcast", "signal", "live"] },
  { value: "signal", label: "Signal", Icon: Signal, tags: ["connection", "strength", "network"] },
  { value: "wifi", label: "Wifi", Icon: Wifi, tags: ["network", "connection", "internet"] },
  { value: "wifi-off", label: "Wifi Off", Icon: WifiOff, tags: ["disconnected", "offline", "no network"] },

  // Time
  { value: "clock", label: "Clock", Icon: Clock, tags: ["time", "wait", "duration", "afk"] },
  { value: "timer", label: "Timer", Icon: Timer, tags: ["countdown", "time", "stopwatch"] },
  { value: "timer-off", label: "Timer Off", Icon: TimerOff, tags: ["expired", "timeout", "stopped"] },
  { value: "hourglass", label: "Hourglass", Icon: Hourglass, tags: ["waiting", "loading", "patience"] },

  // Users & People
  { value: "users", label: "Users", Icon: Users, tags: ["group", "people", "team", "players"] },
  { value: "user-x", label: "User X", Icon: UserX, tags: ["remove", "block", "banned", "kicked"] },
  { value: "user-check", label: "User Check", Icon: UserCheck, tags: ["verified", "approved", "trusted"] },
  { value: "user-minus", label: "User Minus", Icon: UserMinus, tags: ["remove", "leave", "subtract"] },
  { value: "user-plus", label: "User Plus", Icon: UserPlus, tags: ["add", "join", "new player"] },

  // Gaming
  { value: "gamepad", label: "Gamepad", Icon: Gamepad2, tags: ["game", "controller", "play", "gaming"] },
  { value: "joystick", label: "Joystick", Icon: Joystick, tags: ["game", "controller", "arcade"] },
  { value: "star", label: "Star", Icon: Star, tags: ["favorite", "rating", "important"] },
  { value: "star-off", label: "Star Off", Icon: StarOff, tags: ["unfavorite", "remove rating"] },
  { value: "sparkles", label: "Sparkles", Icon: Sparkles, tags: ["magic", "special", "new", "ai"] },
  { value: "wand", label: "Wand", Icon: Wand2, tags: ["magic", "auto", "transform"] },
  { value: "heart", label: "Heart", Icon: Heart, tags: ["love", "health", "favorite"] },
  { value: "heart-crack", label: "Heart Crack", Icon: HeartCrack, tags: ["broken", "damage", "hurt"] },

  // Tech & System
  { value: "bug", label: "Bug", Icon: Bug, tags: ["error", "glitch", "exploit", "hack"] },
  { value: "bug-off", label: "Bug Off", Icon: BugOff, tags: ["fixed", "resolved", "no bugs"] },
  { value: "bot", label: "Bot", Icon: Bot, tags: ["automated", "ai", "robot"] },
  { value: "bot-off", label: "Bot Off", Icon: BotOff, tags: ["disabled", "manual", "no automation"] },
  { value: "terminal", label: "Terminal", Icon: Terminal, tags: ["code", "command", "console", "hack"] },
  { value: "code", label: "Code", Icon: Code, tags: ["programming", "script", "hack", "exploit"] },
  { value: "settings", label: "Settings", Icon: Settings, tags: ["config", "gear", "options"] },
  { value: "sliders", label: "Sliders", Icon: SlidersHorizontal, tags: ["adjust", "configure", "tune"] },
  { value: "monitor", label: "Monitor", Icon: Monitor, tags: ["screen", "display", "watch"] },
  { value: "monitor-off", label: "Monitor Off", Icon: MonitorOff, tags: ["offline", "disabled"] },
  { value: "power", label: "Power", Icon: Power, tags: ["on", "off", "toggle", "energy"] },
  { value: "power-off", label: "Power Off", Icon: PowerOff, tags: ["shutdown", "disable", "off"] },

  // Media & Camera
  { value: "camera", label: "Camera", Icon: Camera, tags: ["photo", "capture", "screenshot"] },
  { value: "camera-off", label: "Camera Off", Icon: CameraOff, tags: ["no photo", "privacy"] },
  { value: "video", label: "Video", Icon: Video, tags: ["recording", "film", "stream"] },
  { value: "video-off", label: "Video Off", Icon: VideoOff, tags: ["no recording", "privacy"] },

  // Navigation & Misc
  { value: "globe", label: "Globe", Icon: Globe, tags: ["world", "internet", "web", "global"] },
  { value: "globe-lock", label: "Globe Lock", Icon: GlobeLock, tags: ["security", "vpn", "private"] },
  { value: "map", label: "Map", Icon: Map, tags: ["location", "navigate", "territory"] },
  { value: "map-pin", label: "Map Pin", Icon: MapPin, tags: ["location", "place", "marker"] },
  { value: "log-in", label: "Log In", Icon: LogIn, tags: ["join", "enter", "signin"] },
  { value: "log-out", label: "Log Out", Icon: LogOut, tags: ["leave", "exit", "signout"] },
  { value: "hash", label: "Hash", Icon: Hash, tags: ["number", "tag", "channel"] },
  { value: "at-sign", label: "At Sign", Icon: AtSign, tags: ["mention", "email", "contact"] },
  { value: "tag", label: "Tag", Icon: Tag, tags: ["label", "category", "metadata"] },
  { value: "tags", label: "Tags", Icon: Tags, tags: ["labels", "categories", "multiple"] },
  { value: "file-warning", label: "File Warning", Icon: FileWarning, tags: ["document", "alert", "issue"] },
  { value: "file-x", label: "File X", Icon: FileX, tags: ["document", "remove", "delete"] },
  { value: "file-search", label: "File Search", Icon: FileSearch, tags: ["document", "find", "inspect"] },
  { value: "sun", label: "Sun", Icon: Sun, tags: ["light", "day", "bright"] },
  { value: "moon", label: "Moon", Icon: Moon, tags: ["dark", "night", "sleep"] },
  { value: "refresh", label: "Refresh", Icon: RefreshCw, tags: ["reload", "update", "sync"] },
  { value: "hand", label: "Hand", Icon: Hand, tags: ["stop", "wave", "gesture"] },
  { value: "pencil", label: "Pencil", Icon: Pencil, tags: ["edit", "write", "modify"] },
  { value: "pencil-off", label: "Pencil Off", Icon: PencilOff, tags: ["no edit", "readonly", "locked"] },
];

export function getIconByValue(value: string): LucideIcon {
  return ALL_ICONS.find((i) => i.value === value)?.Icon ?? Shield;
}

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSelect: (value: string) => void;
}

export function IconPicker({ open, onOpenChange, value, onSelect }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_ICONS;
    const q = search.toLowerCase();
    return ALL_ICONS.filter(
      (icon) =>
        icon.label.toLowerCase().includes(q) ||
        icon.value.toLowerCase().includes(q) ||
        icon.tags.some((t) => t.includes(q))
    );
  }, [search]);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSearch(""); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Choose an icon</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-7 gap-1 max-h-[280px] overflow-y-auto py-1">
          {filtered.map(({ value: v, label, Icon }) => (
            <button
              key={v}
              title={label}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-accent",
                value === v && "bg-primary/10 text-primary ring-1 ring-primary/30"
              )}
              onClick={() => { onSelect(v); onOpenChange(false); setSearch(""); }}
            >
              <Icon className="w-4.5 h-4.5" />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-7 text-sm text-muted-foreground text-center py-6">No icons found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
