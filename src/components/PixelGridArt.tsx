import { useEffect, useRef } from "react";

const CELL = 10;
const ROWS = 18;
// hsl(160, 100%, 45%) → rgb(0, 229, 153)
const R = 0, G = 229, B = 153;

// 5-row pixel font (variable width)
const FONT: Record<string, number[][]> = {
  P: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  R: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
  I: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  S: [[0,1,1,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  A: [[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  C: [[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  E: [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  " ": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
};

function makeTextPattern(text: string): number[][] {
  const chars = text
    .toUpperCase()
    .split("")
    .map((ch) => FONT[ch] ?? FONT[" "]);
  const height = 5;
  const rows: number[][] = [];
  for (let r = 0; r < height; r++) {
    const row: number[] = [];
    chars.forEach((ch, i) => {
      const charRow = ch[r] ?? new Array((ch[0] ?? []).length).fill(0);
      row.push(...charRow);
      if (i < chars.length - 1) row.push(0); // 1-pixel gap between letters
    });
    rows.push(row);
  }
  return rows;
}

const SMILEY: number[][] = [
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [1, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
];

const HEART: number[][] = [
  [0, 1, 1, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
];

const STAR: number[][] = [
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1],
];

const PRISM_TEXT = makeTextPattern("PRISM SPACE");

const ALL_PATTERNS = [SMILEY, HEART, STAR, PRISM_TEXT, SMILEY, HEART, STAR];
// PRISM_TEXT is less frequent than shapes

interface Cell {
  alpha: number;
  fadeTimer: number; // ms remaining to hold before fading
}

export default function PixelGridArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    const grid: Cell[][] = [];

    const initGrid = (w: number) => {
      const newCols = Math.floor(w / CELL);
      if (newCols === cols) return;
      cols = newCols;
      for (let r = 0; r < ROWS; r++) {
        if (!grid[r]) grid[r] = [];
        // extend or trim
        while (grid[r].length < cols) grid[r].push({ alpha: 0, fadeTimer: 0 });
        grid[r].length = cols;
      }
    };

    const resize = () => {
      const w = canvas.parentElement!.clientWidth || window.innerWidth;
      canvas.width = w;
      canvas.height = ROWS * CELL;
      initGrid(w);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const placePattern = (pattern: number[][], pr: number, pc: number) => {
      const cells: [number, number][] = [];
      for (let r = 0; r < pattern.length; r++) {
        for (let c = 0; c < (pattern[r]?.length ?? 0); c++) {
          if (pattern[r][c]) {
            const gr = pr + r;
            const gc = pc + c;
            if (gr >= 0 && gr < ROWS && gc >= 0 && gc < cols) {
              cells.push([gr, gc]);
            }
          }
        }
      }
      cells.forEach(([r, c], i) => {
        setTimeout(() => {
          const cell = grid[r]?.[c];
          if (cell) {
            cell.alpha = 0.01;
            cell.fadeTimer = 3500;
          }
        }, i * 35);
      });
    };

    const scheduleRandom = () => {
      if (cols < 12) return;
      // try up to 6 times to find a fitting pattern
      for (let attempt = 0; attempt < 6; attempt++) {
        const pattern = ALL_PATTERNS[Math.floor(Math.random() * ALL_PATTERNS.length)];
        const ph = pattern.length;
        const pw = Math.max(...pattern.map((row) => row.length));
        if (pw >= cols - 2 || ph >= ROWS - 2) continue;
        const pr = 1 + Math.floor(Math.random() * (ROWS - ph - 2));
        const pc = 1 + Math.floor(Math.random() * (cols - pw - 2));
        placePattern(pattern, pr, pc);
        break;
      }
    };

    // Stagger initial patterns
    scheduleRandom();
    const t1 = setTimeout(scheduleRandom, 1500);
    const t2 = setTimeout(scheduleRandom, 3000);

    const interval = setInterval(() => {
      if (Math.random() < 0.75) scheduleRandom();
    }, 2800);

    let rafId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(now - lastTime, 50); // cap dt to avoid big jumps
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r]?.[c];
          if (!cell) continue;

          // Subtle background dot
          ctx.fillStyle = "rgba(255,255,255,0.035)";
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);

          if (cell.alpha > 0 || cell.fadeTimer > 0) {
            if (cell.fadeTimer > 0) {
              cell.fadeTimer -= dt;
              cell.alpha = Math.min(1, cell.alpha + 0.003 * dt);
            } else {
              cell.alpha = Math.max(0, cell.alpha - 0.001 * dt);
            }

            if (cell.alpha > 0.005) {
              const a = cell.alpha;
              ctx.shadowBlur = 8;
              ctx.shadowColor = `rgba(${R},${G},${B},${a * 0.6})`;
              ctx.fillStyle = `rgba(${R},${G},${B},${a})`;
              ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="w-full overflow-hidden bg-background border-t border-border">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
