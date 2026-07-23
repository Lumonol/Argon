type AnimHandler = (from: { x: number; y: number }, to: { x: number; y: number }) => void;

let bellEl: HTMLElement | null = null;
// Capture position at click time so it's still valid after the button is removed from DOM
let lastClickPos: { x: number; y: number } | null = null;
const animHandlers = new Set<AnimHandler>();

if (typeof document !== "undefined") {
  document.addEventListener(
    "mousedown",
    (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button, [role="button"], a') as HTMLElement | null;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        if (rect.width) {
          lastClickPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
      }
    },
    true
  );
}

export function registerBell(el: HTMLElement | null) {
  bellEl = el;
}

export function subscribeAnimation(handler: AnimHandler) {
  animHandlers.add(handler);
  return () => animHandlers.delete(handler);
}

export function triggerAnimation() {
  if (!bellEl || !lastClickPos) return;
  const toRect = bellEl.getBoundingClientRect();
  if (!toRect.width) return;
  const to = { x: toRect.left + toRect.width / 2, y: toRect.top + toRect.height / 2 };
  // Don't animate if source is the bell itself
  if (Math.abs(lastClickPos.x - to.x) < 5 && Math.abs(lastClickPos.y - to.y) < 5) return;
  animHandlers.forEach((h) => h(lastClickPos!, to));
}
