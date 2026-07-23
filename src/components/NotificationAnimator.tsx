import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { subscribeAnimation } from "@/lib/notificationAnimation";

interface FlyingCircle {
  id: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

let idCounter = 0;

function FlyingCircle({ from, to, onReach }: { from: { x: number; y: number }; to: { x: number; y: number }; onReach: () => void }) {
  const [pos, setPos] = useState(from);
  const [phase, setPhase] = useState<"bounce" | "fly" | "done">("bounce");
  const reachedRef = useRef(false);

  useEffect(() => {
    // Phase 1: bounce at source (200ms)
    const t1 = setTimeout(() => {
      setPhase("fly");
      setPos(to);
    }, 180);

    // Phase 2: ring bell when circle arrives (~180 + 800ms)
    const t2 = setTimeout(() => {
      if (!reachedRef.current) {
        reachedRef.current = true;
        onReach();
      }
      setPhase("done");
    }, 1000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "done") return null;

  const style: React.CSSProperties = {
    position: "fixed",
    left: pos.x - 7,
    top: pos.y - 7,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "hsl(var(--primary))",
    zIndex: 99999,
    pointerEvents: "none",
    transition: phase === "fly"
      ? "left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-in"
      : "none",
    opacity: phase === "fly" ? 0 : undefined,
    animation: phase === "bounce" ? "notif-bounce 0.18s ease-out" : undefined,
  };

  return <div style={style} />;
}

export default function NotificationAnimator() {
  const [circles, setCircles] = useState<FlyingCircle[]>([]);

  useEffect(() => {
    return subscribeAnimation((from, to) => {
      const id = ++idCounter;
      setCircles((prev) => [...prev, { id, from, to }]);
      setTimeout(() => {
        setCircles((prev) => prev.filter((c) => c.id !== id));
      }, 1200);
    });
  }, []);

  if (circles.length === 0) return null;

  return createPortal(
    <>
      {circles.map((c) => (
        <FlyingCircle
          key={c.id}
          from={c.from}
          to={c.to}
          onReach={() => window.dispatchEvent(new CustomEvent("notification-bell-shake"))}
        />
      ))}
    </>,
    document.body
  );
}
