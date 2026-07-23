import { useState, useMemo } from "react";
import HomeTileGrid from "@/components/home/HomeTileGrid";
import { useHomeTiles } from "@/hooks/useHomeTiles";

const quotes = [
  "You're absolutely smashing it today, {name}",
  "Great things are built one step at a time, {name}",
  "Keep up the amazing work, {name}",
  "Your team is lucky to have you, {name}",
  "Today's a great day to make a difference, {name}",
  "You're making things happen, {name}",
  "Stay focused and keep crushing it, {name}",
  "Every contribution counts — yours especially, {name}",
  "The best leaders show up every day, {name}",
  "You've got this, {name}",
];

export default function HomeModule({ module, activeSubmodule, UI }: { module: any, activeSubmodule?: string, UI: any }) {
  const [editing, setEditing] = useState(false);
  const workspaceId = "default"; // Mock workspace for local
  const userId = "local-admin";
  
  const displayName = "Admin";
  const quote = useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)].replace("{name}", displayName),
    [displayName]
  );

  const {
    tiles,
    loading: tilesLoading,
    addTile,
    removeTile,
    resizeTile,
    reorderTiles,
  } = useHomeTiles(userId, workspaceId);

  return (
    <div className="p-4 sm:p-6 h-full overflow-auto">
      <div>
        {/* Dashboard Banner */}
        <div className="relative rounded-xl overflow-hidden mb-6 group">
          <div className="w-full h-48 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          <p className="absolute bottom-5 left-6 text-base font-medium text-white/90 pointer-events-none" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
            {quote}
          </p>
        </div>

        {/* Customizable Tile Grid */}
        {!tilesLoading && (
          <HomeTileGrid
            tiles={tiles}
            workspaceId={workspaceId}
            userId={userId}
            isChairman={true} // Allow local admin to edit all tiles
            editing={editing}
            onToggleEdit={() => setEditing(!editing)}
            onRemoveTile={removeTile}
            onAddTile={addTile}
            onResizeTile={resizeTile}
            onReorder={reorderTiles}
          />
        )}
      </div>
    </div>
  );
}
