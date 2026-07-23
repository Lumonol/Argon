import { useState, useEffect, useCallback } from "react";
import { DEFAULT_TILE_KEYS } from "@/components/home/HomeTileDefinitions";

export type TileSize = "small" | "medium" | "large" | "widget" | "full";

export interface TileState {
  key: string;
  size: TileSize;
}

const DEFAULT_TILES: TileState[] = DEFAULT_TILE_KEYS.map((key) => ({ key, size: "medium" }));

export const useHomeTiles = (userId: string | undefined, workspaceId: string, getToken?: () => Promise<string | null>) => {
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTiles = useCallback(() => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(`argon_home_tiles_${workspaceId}`);
      if (stored) {
        setTiles(JSON.parse(stored));
      } else {
        setTiles(DEFAULT_TILES);
      }
    } catch (e) {
      setTiles(DEFAULT_TILES);
    }
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    fetchTiles();
  }, [fetchTiles]);

  const saveTiles = useCallback((newTiles: TileState[]) => {
    localStorage.setItem(`argon_home_tiles_${workspaceId}`, JSON.stringify(newTiles));
  }, [workspaceId]);

  const addTile = useCallback((key: string, defaultSize?: TileSize) => {
    const next = [...tiles, { key, size: defaultSize || "medium" }];
    setTiles(next);
    saveTiles(next);
  }, [tiles, saveTiles]);

  const removeTile = useCallback((key: string) => {
    const next = tiles.filter((t) => t.key !== key);
    setTiles(next);
    saveTiles(next);
  }, [tiles, saveTiles]);

  const resizeTile = useCallback((key: string, newSize: TileSize) => {
    const next = tiles.map((t) => t.key === key ? { ...t, size: newSize } : t);
    setTiles(next);
    saveTiles(next);
  }, [tiles, saveTiles]);

  const reorderTiles = useCallback((newTiles: TileState[]) => {
    setTiles(newTiles);
    saveTiles(newTiles);
  }, [saveTiles]);

  return { tiles, loading, addTile, removeTile, resizeTile, reorderTiles };
};
