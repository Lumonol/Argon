import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Check, Trash2 } from "lucide-react";
import { ALL_TILES, TileDefinition } from "./HomeTileDefinitions";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TileSize, TileState } from "@/hooks/useHomeTiles";
import QuickLinksWidget from "./QuickLinksWidget";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HomeTileGridProps {
  tiles: TileState[];
  workspaceId: string;
  userId: string;
  isChairman: boolean;
  editing: boolean;
  onToggleEdit: () => void;
  onRemoveTile: (key: string) => void;
  onAddTile: (key: string, defaultSize?: TileSize) => void;
  onResizeTile: (key: string, size: TileSize) => void;
  onReorder: (tiles: TileState[]) => void;
}

const sizeClasses: Record<TileSize, string> = {
  small: "col-span-1 row-span-1",
  medium: "col-span-2 row-span-1",
  large: "col-span-2 row-span-2",
  widget: "col-span-4 row-span-3",
  full: "col-span-full row-span-3",
};

interface SortableTileProps {
  tile: TileState;
  definition: TileDefinition;
  editing: boolean;
  workspaceId: string;
  userId: string;
  onEditTile: (key: string) => void;
}

const SortableTile = ({ tile, definition, editing, workspaceId, userId, onEditTile }: SortableTileProps) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.key, disabled: !editing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease, opacity 200ms ease",
    opacity: isDragging ? 0.4 : 1,
  };

  const Icon = definition.icon;

  // Widget tiles render their own component at all sizes
  const showAsWidget = definition.isWidget && tile.size !== "small";

  const widgetContent = showAsWidget ? (
    <div
      className={cn(
        "h-full",
        editing && "pointer-events-none opacity-80 animate-[wiggle_0.3s_ease-in-out_infinite] border border-dashed border-muted-foreground/30 rounded-xl"
      )}
    >
      {definition.key === "quick_links" && (
        <QuickLinksWidget userId={userId} workspaceId={workspaceId} tileEditing={editing} />
      )}
    </div>
  ) : null;

  const cardContent = !showAsWidget ? (
    <Card
      className={cn(
        "relative group h-full overflow-hidden",
        "transition-all duration-300 ease-in-out",
        !editing && "hover:bg-muted/50 hover:shadow-md hover:-translate-y-0.5",
        editing && "animate-[wiggle_0.3s_ease-in-out_infinite] border-dashed border-muted-foreground/30 cursor-grab active:cursor-grabbing opacity-80",
        isDragging && "shadow-xl ring-2 ring-primary/30"
      )}
    >
      {tile.size === "small" && (
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </CardContent>
      )}

      {tile.size === "medium" && (
        <CardContent className="p-5 h-full flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">{definition.label}</p>
            <p className="text-xs text-muted-foreground truncate">{definition.description}</p>
          </div>
        </CardContent>
      )}

      {tile.size === "large" && (
        <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{definition.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{definition.description}</p>
          </div>
        </CardContent>
      )}
    </Card>
  ) : null;

  const handleClick = (e: React.MouseEvent) => {
    if (!editing) return;
    onEditTile(tile.key);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(editing ? listeners : {})}
      className={cn(
        sizeClasses[tile.size],
        "transition-[grid-column,grid-row,transform,opacity,max-width] duration-300 ease-in-out",
        "animate-[scale-in_0.2s_ease-out]",
        tile.size === "small" && "max-w-[100px]",
        showAsWidget && editing && "cursor-grab active:cursor-grabbing"
      )}
      onClick={editing ? handleClick : undefined}
    >
      {showAsWidget ? (
        widgetContent
      ) : editing ? (
        cardContent
      ) : definition.href ? (
        <Link to={definition.href(workspaceId)} className="block h-full">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </div>
  );
};

const HomeTileGrid = ({
  tiles,
  workspaceId,
  userId,
  isChairman,
  editing,
  onToggleEdit,
  onRemoveTile,
  onAddTile,
  onResizeTile,
  onReorder,
}: HomeTileGridProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTileKey, setEditingTileKey] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeTiles = tiles.filter((t) => {
    const def = ALL_TILES.find((d) => d.key === t.key);
    return def && (!def.requiresChairman || isChairman);
  });

  const availableTiles = ALL_TILES.filter(
    (t) => !tiles.some((s) => s.key === t.key) && (!t.requiresChairman || isChairman)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tiles.findIndex((t) => t.key === active.id);
    const newIndex = tiles.findIndex((t) => t.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(tiles, oldIndex, newIndex));
  };

  const activeDef = activeId ? ALL_TILES.find((t) => t.key === activeId) : null;
  const editingTile = editingTileKey ? tiles.find((t) => t.key === editingTileKey) : null;
  const editingTileDef = editingTileKey ? ALL_TILES.find((t) => t.key === editingTileKey) : null;

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={editing ? "default" : "outline"}
          size="sm"
          onClick={onToggleEdit}
          className="gap-1.5"
        >
          {editing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          {editing ? "Done" : "Edit"}
        </Button>
        {editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
            disabled={availableTiles.length === 0}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tile
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={activeTiles.map((t) => t.key)} strategy={rectSortingStrategy}>
          <div className="grid gap-3 grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 auto-rows-[80px]">
            {activeTiles.map((tile) => {
              const def = ALL_TILES.find((d) => d.key === tile.key);
              if (!def) return null;
              return (
                <SortableTile
                  key={tile.key}
                  tile={tile}
                  definition={def}
                  editing={editing}
                  workspaceId={workspaceId}
                  userId={userId}
                  onEditTile={setEditingTileKey}
                />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeDef ? (
            <Card className="shadow-2xl ring-2 ring-primary/40 rotate-3">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <activeDef.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-sm">{activeDef.label}</p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Tile Dialog */}
      <Dialog open={!!editingTileKey} onOpenChange={(open) => { if (!open) setEditingTileKey(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingTileDef && <editingTileDef.icon className="w-5 h-5 text-primary" />}
              {editingTileDef?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              <Select
                value={editingTile?.size || "medium"}
                onValueChange={(val) => {
                  if (editingTileKey) onResizeTile(editingTileKey, val as TileSize);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {!editingTileDef?.isWidget && (
                    <SelectItem value="small">Small — Icon only</SelectItem>
                  )}
                  <SelectItem value="medium">Medium — Compact</SelectItem>
                  <SelectItem value="large">Large — Full card</SelectItem>
                  {editingTileDef?.isWidget && (
                    <SelectItem value="widget">Widget — Full widget</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => setEditingTileKey(null)}
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => {
                  if (editingTileKey) {
                    onRemoveTile(editingTileKey);
                    setEditingTileKey(null);
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Tile Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Tile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {availableTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.key}
                  onClick={() => {
                    onAddTile(tile.key, tile.defaultSize || (tile.isWidget ? "widget" : undefined));
                    setShowAddDialog(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left w-full"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tile.label}</p>
                    <p className="text-xs text-muted-foreground">{tile.description}</p>
                  </div>
                </button>
              );
            })}
            {availableTiles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">All tiles have been added</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomeTileGrid;
