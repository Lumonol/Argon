import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Terminal, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COMMAND_CATEGORIES = [
  {
    name: "Everyone (0)",
    color: "bg-zinc-500",
    commands: ["getadmin", "changelog", "donate", "cape", "rejoin", "clean"],
  },
  {
    name: "Moderator (1)",
    color: "bg-blue-500",
    commands: [
      "respawn", "res", "kick", "unadmin", "admins", "ingameadmins", "chatlogs", "logs", "bans", "pm", "m", 
      "slock", "unslock", "h", "tp", "to", "bring", "team", "info", "hat", "joinlogs", "gamepassinfo", "iteminfo", 
      "pbans", "shutdownlogs", "jump", "sit", "view", "unview", "speed", "ws", "refresh", "ref", "god", "ungod", 
      "ff", "unff", "music", "play", "volume", "pitch", "vol", "stopsound", "reverbs", "countdown", "tools", "give", 
      "startergear", "time", "removetools", "clear", "clr", "joinserver", "privateservers", "name", "unname", 
      "change", "heal", "setmaxhealth", "sethealth", "jumpheight", "light", "removelight", "fly", "unfly", 
      "trellobans", "viewtools"
    ],
  },
  {
    name: "Admin (2)",
    color: "bg-green-500",
    commands: [
      "ban", "unban", "sm", "mod", "shutdown", "gear", "pbanid", "unpban", "unpbanid", "pban", "btools", "f3x", 
      "createserver", "deleteserver", "toreserved"
    ],
  },
  {
    name: "Super Admin (3)",
    color: "bg-orange-500",
    commands: ["uncape", "promptpurchase", "place", "insert", "crash"],
  },
  {
    name: "Game Creator (4)",
    color: "bg-red-500",
    commands: ["superadmin", "debuglogs", "addlog", "smtest", "awardcape", "segway", "debugstats"],
  },
];

interface RunCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RunCommandDialog({ open, onOpenChange }: RunCommandDialogProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return COMMAND_CATEGORIES;
    const query = search.toLowerCase();
    
    return COMMAND_CATEGORIES.map(category => ({
      ...category,
      commands: category.commands.filter(cmd => cmd.toLowerCase().includes(query))
    })).filter(category => category.commands.length > 0);
  }, [search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden flex flex-col h-[80vh]">
        <DialogHeader className="p-4 border-b border-border bg-card/50">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Terminal className="w-5 h-5 text-pink-500" />
            Virtual Server Management
          </DialogTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background/30">
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Terminal className="w-12 h-12 mb-3 opacity-20" />
              <p>No commands found matching "{search}"</p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-1 z-10">
                  <div className={`w-2 h-2 rounded-full ${category.color}`} />
                  <h3 className="font-semibold text-sm text-foreground">{category.name}</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground">
                    {category.commands.length}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {category.commands.map((cmd) => (
                    <button
                      key={cmd}
                      className="flex items-center justify-between text-left px-3 py-2 rounded-md bg-card border border-border/50 hover:bg-card/80 hover:border-border transition-colors group"
                      onClick={() => {
                        // In a real implementation this would execute the command
                      }}
                    >
                      <span className="text-xs font-medium font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        {cmd}
                      </span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
