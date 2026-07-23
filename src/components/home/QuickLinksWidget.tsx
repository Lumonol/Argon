import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Check, Trash2, ExternalLink, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuickLinks, QuickLink } from "@/hooks/useQuickLinks";

interface QuickLinksWidgetProps {
  userId: string;
  workspaceId: string;
  tileEditing: boolean;
}

const QuickLinksWidget = ({ userId, workspaceId, tileEditing }: QuickLinksWidgetProps) => {
  const { links, addLink, removeLink, updateLink } = useQuickLinks(userId, workspaceId);
  const [widgetEditing, setWidgetEditing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const openAdd = () => {
    setTitle("");
    setUrl("");
    setShowAddDialog(true);
  };

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) return;
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
    addLink(title.trim(), finalUrl);
    setShowAddDialog(false);
  };

  const openEdit = (link: QuickLink) => {
    setEditingLink(link);
    setTitle(link.title);
    setUrl(link.url);
  };

  const handleUpdate = () => {
    if (!editingLink || !title.trim() || !url.trim()) return;
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
    updateLink(editingLink.id, title.trim(), finalUrl);
    setEditingLink(null);
  };

  const getFavicon = (linkUrl: string) => {
    try {
      const u = new URL(linkUrl);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-sm font-semibold text-foreground">Quick links</h3>
        {!tileEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
            onClick={() => setWidgetEditing(!widgetEditing)}
          >
            {widgetEditing ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
            {widgetEditing ? "Done" : "Edit"}
          </Button>
        )}
      </div>

      <CardContent className="px-4 pb-3 pt-1 flex-1 overflow-auto">
        {links.length === 0 && !widgetEditing ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2">
            <Link2 className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">No quick links yet</p>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={openAdd}>
              <Plus className="w-3 h-3" /> Add link
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {links.map((link) => (
              <div key={link.id} className="relative group">
                {widgetEditing ? (
                  <button
                    onClick={() => openEdit(link)}
                    className="w-full flex flex-col items-center gap-1.5 p-2 rounded-lg border border-dashed border-muted-foreground/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getFavicon(link.url) ? (
                        <img
                          src={getFavicon(link.url)!}
                          alt=""
                          className="w-5 h-5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <ExternalLink className={getFavicon(link.url) ? "hidden w-4 h-4 text-primary" : "w-4 h-4 text-primary"} />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight line-clamp-2">{link.title}</span>
                  </button>
                ) : (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getFavicon(link.url) ? (
                        <img
                          src={getFavicon(link.url)!}
                          alt=""
                          className="w-5 h-5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <ExternalLink className={getFavicon(link.url) ? "hidden w-4 h-4 text-primary" : "w-4 h-4 text-primary"} />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight line-clamp-2">{link.title}</span>
                  </a>
                )}
              </div>
            ))}
            {widgetEditing && (
              <button
                onClick={openAdd}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-dashed border-muted-foreground/20 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-[11px] text-muted-foreground">Add</span>
              </button>
            )}
          </div>
        )}
      </CardContent>

      {/* Add Link Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Quick Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g. Training Guide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} className="w-full" disabled={!title.trim() || !url.trim()}>
              Add Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => { if (!open) setEditingLink(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} className="flex-1" disabled={!title.trim() || !url.trim()}>
                Save
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (editingLink) removeLink(editingLink.id);
                  setEditingLink(null);
                }}
                className="gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default QuickLinksWidget;
