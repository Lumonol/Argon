import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useModeratorCalls, type ModeratorCallTag } from "@/hooks/useModeratorCalls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLOR_OPTIONS = [
  { value: "red", className: "bg-red-500/15 text-red-500 border-red-500/30" },
  { value: "amber", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  { value: "yellow", className: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" },
  { value: "green", className: "bg-green-500/15 text-green-500 border-green-500/30" },
  { value: "blue", className: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  { value: "purple", className: "bg-purple-500/15 text-purple-500 border-purple-500/30" },
  { value: "pink", className: "bg-pink-500/15 text-pink-500 border-pink-500/30" },
  { value: "gray", className: "bg-muted text-muted-foreground border-border/40" },
];

function tagColorClass(color: string) {
  return COLOR_OPTIONS.find((c) => c.value === color)?.className || COLOR_OPTIONS[7].className;
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[110px] text-sm">
        <span className={cn("inline-block w-3 h-3 rounded-full mr-1.5", tagColorClass(value).split(" ")[0])} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COLOR_OPTIONS.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            <div className="flex items-center gap-2">
              <span className={cn("inline-block w-3 h-3 rounded-full", c.className.split(" ")[0])} />
              {c.value.charAt(0).toUpperCase() + c.value.slice(1)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function SettingsCallTagsTab() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { toast } = useToast();
  const calls = useModeratorCalls(workspaceId || "");

  const [tags, setTags] = useState<ModeratorCallTag[]>([]);
  const [loading, setLoading] = useState(true);

  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("gray");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("gray");

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await calls.listTags();
      setTags(res.tags);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load call tags", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const startEdit = (t: ModeratorCallTag) => {
    setEditingId(t.id);
    setEditLabel(t.label);
    setEditColor(t.color);
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    try {
      await calls.createTag(newLabel.trim(), newColor);
      toast({ title: "Tag created" });
      setNewLabel("");
      setNewColor("gray");
      refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editLabel.trim()) return;
    try {
      await calls.updateTag(id, editLabel.trim(), editColor);
      setEditingId(null);
      refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update tag",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await calls.deleteTag(id);
      refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Call Tags</CardTitle>
          <CardDescription>
            Manage the tags that moderators can apply when logging calls in this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 p-4 border border-border/40 rounded-lg bg-card/30">
            <Label className="text-sm">Create New Tag</Label>
            <div className="flex items-center gap-3">
              <Input
                placeholder="e.g. Warning, Ban, Exploiting"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="flex-1"
              />
              <ColorPicker value={newColor} onChange={setNewColor} />
              <Button
                disabled={!newLabel.trim()}
                onClick={handleCreate}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm">Existing Tags</Label>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : tags.length === 0 ? (
              <div className="text-sm text-muted-foreground p-8 text-center border border-dashed border-border/40 rounded-lg">
                No tags configured yet.
              </div>
            ) : (
              <div className="grid gap-2">
                {tags.map((t) => {
                  const isEditing = editingId === t.id;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card/20 transition-colors hover:bg-card/40"
                    >
                      {isEditing ? (
                        <>
                          <Input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="flex-1 h-9"
                          />
                          <ColorPicker value={editColor} onChange={setEditColor} />
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                              onClick={() => handleUpdate(t.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-muted-foreground"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Badge
                            variant="outline"
                            className={cn("text-xs px-2.5 py-1 flex-1 justify-start font-medium", tagColorClass(t.color))}
                          >
                            {t.label}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => startEdit(t)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(t.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
