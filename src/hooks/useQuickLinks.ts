import { useState, useCallback, useEffect } from "react";

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

const storageKey = (userId: string, workspaceId: string) =>
  `quick_links:${userId}:${workspaceId}`;

export const useQuickLinks = (userId: string | undefined, workspaceId: string) => {
  const [links, setLinks] = useState<QuickLink[]>([]);

  useEffect(() => {
    if (!userId || !workspaceId) return;
    try {
      const raw = localStorage.getItem(storageKey(userId, workspaceId));
      if (raw) setLinks(JSON.parse(raw));
    } catch {
      setLinks([]);
    }
  }, [userId, workspaceId]);

  const save = useCallback((next: QuickLink[]) => {
    if (!userId || !workspaceId) return;
    setLinks(next);
    localStorage.setItem(storageKey(userId, workspaceId), JSON.stringify(next));
  }, [userId, workspaceId]);

  const addLink = useCallback((title: string, url: string) => {
    const next = [...links, { id: crypto.randomUUID(), title, url }];
    save(next);
  }, [links, save]);

  const removeLink = useCallback((id: string) => {
    save(links.filter((l) => l.id !== id));
  }, [links, save]);

  const updateLink = useCallback((id: string, title: string, url: string) => {
    save(links.map((l) => l.id === id ? { ...l, title, url } : l));
  }, [links, save]);

  return { links, addLink, removeLink, updateLink };
};
