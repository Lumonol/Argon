import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Grid3x3,
  Plus,
  Trash2,
  Pencil,
  MoreHorizontal,
  Loader2,
  FileCode2,
  Send,
  RotateCcw,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ModulerBuilder from "@/components/moduler/ModulerBuilder";
import type { ModulerModule } from "@/components/moduler/ModulerBuilder";
import type { CanvasComponent } from "@/components/moduler/ModulerCanvas";
import type { ModulerFunction } from "@/components/moduler/ModulerBuilder";
import type { FlowNode, FlowEdge } from "@/components/flow/FlowCanvas";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ModuleStatus = "draft" | "pending_review" | "published" | "rejected";

interface WorkspaceModule {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  created_at: string;
  updated_at: string;
  components: CanvasComponent[];
  flowNodes?: FlowNode[];
  flowEdges?: FlowEdge[];
  functions?: ModulerFunction[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const WorkspacesModuler = () => {
  const workspaceId = 'default';
  const { toast } = useToast();

  // Persist modules to localStorage per workspace
  const storageKey = `moduler_modules_${workspaceId}`;

  const [modules, setModulesRaw] = useState<WorkspaceModule[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading] = useState(false);

  const setModules = useCallback((updater: WorkspaceModule[] | ((prev: WorkspaceModule[]) => WorkspaceModule[])) => {
    setModulesRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  // Builder view
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Rename dialog
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  const editingModule = modules.find((m) => m.id === editingModuleId) || null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    setCreating(true);

    const newModule: WorkspaceModule = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: newDesc.trim(),
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      components: [],
    };

    setModules((prev) => [newModule, ...prev]);
    toast({ title: "Module created", description: `"${newModule.name}" has been created. Opening builder...` });
    setNewName("");
    setNewDesc("");
    setCreateOpen(false);
    setCreating(false);
    setEditingModuleId(newModule.id);
  };

  const handleDelete = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Module deleted" });
  };

  const handleRename = () => {
    if (!renameId || !renameName.trim()) return;
    setModules((prev) =>
      prev.map((m) => (m.id === renameId ? { ...m, name: renameName.trim(), updated_at: new Date().toISOString() } : m))
    );
    setRenameId(null);
    setRenameName("");
    toast({ title: "Module renamed" });
  };

  const handleSubmitForReview = (id: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: "pending_review" as ModuleStatus, updated_at: new Date().toISOString() }
          : m
      )
    );
    toast({ title: "Submitted for review", description: "Your module has been sent to an admin for verification." });
  };

  const handleUnpublish = (id: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: "draft" as ModuleStatus, updated_at: new Date().toISOString() }
          : m
      )
    );
    toast({ title: "Module unpublished", description: "Module has been moved back to draft." });
  };

  const handleBuilderSave = (updated: ModulerModule) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === updated.id
          ? {
              ...m,
              components: updated.components,
              flowNodes: updated.flowNodes,
              flowEdges: updated.flowEdges,
              functions: updated.functions,
              updated_at: new Date().toISOString(),
            }
          : m
      )
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Builder view                                                     */
  /* ---------------------------------------------------------------- */

  if (editingModule) {
    return (
      <div className="h-full">
        <ModulerBuilder
          module={{
            id: editingModule.id,
            name: editingModule.name,
            description: editingModule.description,
            status: editingModule.status,
            components: editingModule.components,
            flowNodes: editingModule.flowNodes,
            flowEdges: editingModule.flowEdges,
            functions: editingModule.functions,
          }}
          onBack={() => setEditingModuleId(null)}
          onSave={handleBuilderSave}
        />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  List view                                                        */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Module
        </Button>
      </div>

      {/* Module grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Grid3x3 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No modules yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Create your first custom UI module and add the components you need.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Module
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="group relative rounded-xl border border-border/30 bg-card/50 p-5 hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Grid3x3 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={mod.status === "published" ? "default" : "secondary"}
                    className={cn("text-[10px]", {
                      "bg-amber-500/10 text-amber-500 border-amber-500/20": mod.status === "pending_review",
                      "bg-destructive/10 text-destructive border-destructive/20": mod.status === "rejected",
                    })}
                  >
                    {mod.status === "published" && "Published"}
                    {mod.status === "draft" && "Draft"}
                    {mod.status === "pending_review" && "In Review"}
                    {mod.status === "rejected" && "Rejected"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setRenameId(mod.id); setRenameName(mod.name); }}>
                        <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                      </DropdownMenuItem>
                      {(mod.status === "draft" || mod.status === "rejected") && mod.components.length > 0 && (
                        <DropdownMenuItem onClick={() => handleSubmitForReview(mod.id)}>
                          <Send className="w-3.5 h-3.5 mr-2" /> Submit for Review
                        </DropdownMenuItem>
                      )}
                      {mod.status === "published" && (
                        <DropdownMenuItem onClick={() => handleUnpublish(mod.id)}>
                          <RotateCcw className="w-3.5 h-3.5 mr-2" /> Unpublish
                        </DropdownMenuItem>
                      )}
                      {mod.status === "pending_review" && (
                        <DropdownMenuItem onClick={() => handleUnpublish(mod.id)}>
                          <RotateCcw className="w-3.5 h-3.5 mr-2" /> Cancel Review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDelete(mod.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-1">{mod.name}</h3>
              {mod.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{mod.description}</p>
              )}

              {mod.status === "pending_review" && (
                <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">Awaiting admin verification</span>
                </div>
              )}
              {mod.status === "rejected" && (
                <div className="flex items-center gap-1.5 text-destructive mb-2">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-[10px]">Review rejected — edit and resubmit</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/70">
                  {mod.components.length} component{mod.components.length !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => setEditingModuleId(mod.id)}
                >
                  <FileCode2 className="w-3 h-3" />
                  Open Builder
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Module Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Staff Dashboard, Ticket Form"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this module do?"
                rows={2}
              />
            </div>
            <Button onClick={handleCreate} disabled={!newName.trim() || creating} className="w-full gap-2">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Module
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameId} onOpenChange={(o) => { if (!o) setRenameId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Name</Label>
              <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} />
            </div>
            <Button onClick={handleRename} disabled={!renameName.trim()} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/moduler")({
  component: WorkspacesModuler,
});
