import { createContext, useContext, useState, useCallback } from "react";

interface AvatarVersionContextValue {
  version: number;
  bump: () => void;
}

const AvatarVersionContext = createContext<AvatarVersionContextValue>({ version: 0, bump: () => {} });

export function AvatarVersionProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(() => {
    try { return parseInt(localStorage.getItem("prism_avatar_version") || "0", 10); } catch { return 0; }
  });

  const bump = useCallback(() => {
    setVersion(v => {
      const next = v + 1;
      try { localStorage.setItem("prism_avatar_version", String(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <AvatarVersionContext.Provider value={{ version, bump }}>
      {children}
    </AvatarVersionContext.Provider>
  );
}

export function useAvatarVersion() {
  return useContext(AvatarVersionContext);
}
