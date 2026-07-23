import { useState, useRef, useCallback, useEffect } from "react";
import {
  Zap,
  GitBranch,
  BrainCircuit,
  Workflow,
  MessageSquare,
  Timer,
  Bell,
  Filter,
  Repeat,
  ArrowUpRight,
  Database,
  Trash2,
  GripVertical,
  Users,
  BarChart3,
  ClipboardList,
  ShieldBan,
  FileCheck,
  Calendar,
  BookOpen,
  Shield,
  ToggleLeft,
  Pencil,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FlowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  config?: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  config?: Record<string, unknown>;
}

interface Props {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onChange: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  onSelectNode?: (nodeId: string | null) => void;
  onEdgeCreated?: (edge: FlowEdge, sourceNode: FlowNode, targetNode: FlowNode) => Promise<FlowEdge | null>;
  selectedNodeId?: string | null;
  readOnly?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Node type registry                                                 */
/* ------------------------------------------------------------------ */

export interface NodeTypeDef {
  type: string;
  label: string;
  icon: LucideIcon;
  color: string;         // tailwind text color
  bg: string;            // tailwind bg color
  category: "trigger" | "logic" | "action" | "ai";
}

export const NODE_TYPES: NodeTypeDef[] = [
  // Module triggers
  { type: "trigger_staff",       label: "Staff Trigger",       icon: Users,         color: "text-amber-400",   bg: "bg-amber-500/10",   category: "trigger" },
  { type: "trigger_activity",    label: "Activity Trigger",    icon: BarChart3,     color: "text-green-400",   bg: "bg-green-500/10",   category: "trigger" },
  { type: "trigger_assignments", label: "Assignments Trigger", icon: ClipboardList, color: "text-orange-400",  bg: "bg-orange-500/10",  category: "trigger" },
  { type: "trigger_messages",    label: "Messages Trigger",    icon: MessageSquare, color: "text-sky-400",     bg: "bg-sky-500/10",     category: "trigger" },
  { type: "trigger_moderation",  label: "Moderation Trigger",  icon: ShieldBan,     color: "text-red-400",     bg: "bg-red-500/10",     category: "trigger" },
  { type: "trigger_forms",       label: "Forms Trigger",       icon: FileCheck,     color: "text-pink-400",    bg: "bg-pink-500/10",    category: "trigger" },
  { type: "trigger_sessions",    label: "Sessions Trigger",    icon: Calendar,      color: "text-blue-400",    bg: "bg-blue-500/10",    category: "trigger" },
  { type: "trigger_docs",        label: "Knowledge Base Trigger", icon: BookOpen,   color: "text-emerald-400", bg: "bg-emerald-500/10", category: "trigger" },
  { type: "trigger_sentinel",    label: "Sentinel Trigger",    icon: Shield,        color: "text-violet-400",  bg: "bg-violet-500/10",  category: "trigger" },
  // General triggers
  { type: "trigger_schedule",    label: "Schedule",            icon: Timer,         color: "text-blue-400",    bg: "bg-blue-500/10",    category: "trigger" },
  { type: "trigger_webhook",     label: "Webhook",             icon: ArrowUpRight,  color: "text-purple-400",  bg: "bg-purple-500/10",  category: "trigger" },
  { type: "trigger_manual",      label: "Manual Trigger",      icon: Zap,           color: "text-yellow-400",  bg: "bg-yellow-500/10",  category: "trigger" },
  // Logic
  { type: "condition",        label: "Condition",        icon: GitBranch,       color: "text-cyan-400",   bg: "bg-cyan-500/10",   category: "logic" },
  { type: "filter",           label: "Filter",           icon: Filter,          color: "text-teal-400",   bg: "bg-teal-500/10",   category: "logic" },
  { type: "loop",             label: "Loop",             icon: Repeat,          color: "text-orange-400", bg: "bg-orange-500/10", category: "logic" },
  { type: "delay",            label: "Delay",            icon: Timer,           color: "text-slate-400",  bg: "bg-slate-500/10",  category: "logic" },
  // Actions
  { type: "send_message",     label: "Send Message",     icon: MessageSquare,   color: "text-green-400",  bg: "bg-green-500/10",  category: "action" },
  { type: "notification",     label: "Notification",     icon: Bell,            color: "text-rose-400",   bg: "bg-rose-500/10",   category: "action" },
  { type: "action_custom",    label: "Custom Action",    icon: Workflow,        color: "text-primary",    bg: "bg-primary/10",    category: "action" },
  { type: "data_lookup",      label: "Data Lookup",      icon: Database,        color: "text-indigo-400", bg: "bg-indigo-500/10", category: "action" },
  // AI
  { type: "ai_classify",      label: "AI Classify",      icon: BrainCircuit,    color: "text-violet-400", bg: "bg-violet-500/10", category: "ai" },
  { type: "ai_generate",      label: "AI Generate",      icon: BrainCircuit,    color: "text-fuchsia-400",bg: "bg-fuchsia-500/10",category: "ai" },
  // Moduler
  { type: "trigger_moduler",  label: "Moduler Trigger",  icon: ToggleLeft,      color: "text-lime-400",   bg: "bg-lime-500/10",   category: "trigger" },
  { type: "moduler_update",   label: "Moduler Update",   icon: Pencil,          color: "text-lime-400",   bg: "bg-lime-500/10",   category: "action" },
];

export const getNodeType = (type: string): NodeTypeDef =>
  NODE_TYPES.find((n) => n.type === type) || NODE_TYPES[0];

/* ------------------------------------------------------------------ */
/*  Canvas                                                             */
/* ------------------------------------------------------------------ */

const GRID_SIZE = 20;
const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;

const FlowCanvas = ({ nodes, edges, onChange, onSelectNode, selectedNodeId, readOnly }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Drag node
  const [dragging, setDragging] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Connecting
  const [connecting, setConnecting] = useState<{ sourceId: string; x: number; y: number } | null>(null);

  // Selected — controlled if props provided, otherwise internal
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selected = selectedNodeId !== undefined ? selectedNodeId : internalSelected;
  const setSelected = (id: string | null) => {
    setInternalSelected(id);
    onSelectNode?.(id);
  };

  /* ----- helpers to convert screen coords to canvas coords ----- */
  const screenToCanvas = useCallback(
    (sx: number, sy: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: sx, y: sy };
      return {
        x: (sx - rect.left - pan.x) / zoom,
        y: (sy - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom],
  );

  /* ----- Zoom with scroll ----- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((z) => Math.min(2, Math.max(0.25, z + delta)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  /* ----- Pan handlers ----- */
  const onPanStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.target === svgRef.current)) {
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      }
    },
    [pan],
  );

  const onPanMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({
          x: panStart.current.panX + (e.clientX - panStart.current.x),
          y: panStart.current.panY + (e.clientY - panStart.current.y),
        });
      }
    },
    [isPanning],
  );

  const onPanEnd = useCallback(() => setIsPanning(false), []);

  /* ----- Node drag ----- */
  const onNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (readOnly) return;
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const pos = screenToCanvas(e.clientX, e.clientY);
      dragOffset.current = { x: pos.x - node.x, y: pos.y - node.y };
      setDragging(nodeId);
      setSelected(nodeId);
    },
    [nodes, readOnly, screenToCanvas],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) {
        const pos = screenToCanvas(e.clientX, e.clientY);
        const newX = snap(pos.x - dragOffset.current.x);
        const newY = snap(pos.y - dragOffset.current.y);
        onChange(
          nodes.map((n) => (n.id === dragging ? { ...n, x: newX, y: newY } : n)),
          edges,
        );
      } else if (connecting) {
        const pos = screenToCanvas(e.clientX, e.clientY);
        setConnecting((c) => (c ? { ...c, x: pos.x, y: pos.y } : null));
      } else {
        onPanMove(e);
      }
    },
    [dragging, connecting, nodes, edges, onChange, screenToCanvas, onPanMove],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (connecting) {
        // Check if mouse is over a node port
        const pos = screenToCanvas(e.clientX, e.clientY);
        const targetNode = nodes.find(
          (n) =>
            n.id !== connecting.sourceId &&
            pos.x >= n.x - 10 &&
            pos.x <= n.x + 180 &&
            pos.y >= n.y - 10 &&
            pos.y <= n.y + 70,
        );
        if (targetNode) {
          const exists = edges.some(
            (ed) => ed.source === connecting.sourceId && ed.target === targetNode.id,
          );
          if (!exists) {
            const sourceNode = nodes.find((n) => n.id === connecting.sourceId);
            const newEdge = { id: `e-${Date.now()}`, source: connecting.sourceId, target: targetNode.id };

            // Call onEdgeCreated callback to allow configuration
            if (sourceNode && onEdgeCreated) {
              onEdgeCreated(newEdge, sourceNode, targetNode).then((configuredEdge) => {
                if (configuredEdge) {
                  onChange(nodes, [...edges, configuredEdge]);
                }
              }).catch(() => {
                // If callback fails, just add the edge without config
                onChange(nodes, [...edges, newEdge]);
              });
            } else {
              onChange(nodes, [...edges, newEdge]);
            }
          }
        }
        setConnecting(null);
      }
      setDragging(null);
      onPanEnd();
    },
    [connecting, nodes, edges, onChange, screenToCanvas, onPanEnd, onEdgeCreated],
  );

  /* ----- Port handlers ----- */
  const onOutputPort = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (readOnly) return;
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      setConnecting({ sourceId: nodeId, x: node.x + 170, y: node.y + 30 });
    },
    [nodes, readOnly],
  );

  /* ----- Delete selected ----- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selected && !readOnly) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        onChange(
          nodes.filter((n) => n.id !== selected),
          edges.filter((ed) => ed.source !== selected && ed.target !== selected),
        );
        setSelected(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, nodes, edges, onChange, readOnly]);

  /* ----- Drop from palette ----- */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("flow-node-type");
      if (!type) return;
      const def = getNodeType(type);
      const pos = screenToCanvas(e.clientX, e.clientY);
      const newNode: FlowNode = {
        id: `node-${Date.now()}`,
        type,
        label: def.label,
        x: snap(pos.x - 85),
        y: snap(pos.y - 30),
      };
      onChange([...nodes, newNode], edges);
    },
    [nodes, edges, onChange, screenToCanvas],
  );

  /* ----- Edge path helper ----- */
  const edgePath = (src: FlowNode, tgt: FlowNode) => {
    const sx = src.x + 170;
    const sy = src.y + 30;
    const tx = tgt.x;
    const ty = tgt.y + 30;
    const dx = Math.abs(tx - sx) * 0.5;
    return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
  };

  /* ----- Click canvas to deselect ----- */
  const onCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current) setSelected(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[hsl(var(--card)/0.3)] rounded-xl border border-border/30"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        onMouseDown={onPanStart}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={onCanvasClick}
        style={{ cursor: isPanning ? "grabbing" : dragging ? "grabbing" : "default" }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.source);
            const tgt = nodes.find((n) => n.id === edge.target);
            if (!src || !tgt) return null;
            return (
              <g key={edge.id}>
                <path
                  d={edgePath(src, tgt)}
                  fill="none"
                  stroke="hsl(var(--primary) / 0.4)"
                  strokeWidth={2}
                  className="transition-colors"
                />
                <path
                  d={edgePath(src, tgt)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={12}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!readOnly) {
                      onChange(nodes, edges.filter((ed) => ed.id !== edge.id));
                    }
                  }}
                />
              </g>
            );
          })}

          {/* Connecting line */}
          {connecting && (() => {
            const src = nodes.find((n) => n.id === connecting.sourceId);
            if (!src) return null;
            const sx = src.x + 170;
            const sy = src.y + 30;
            const dx = Math.abs(connecting.x - sx) * 0.5;
            return (
              <path
                d={`M ${sx} ${sy} C ${sx + dx} ${sy}, ${connecting.x - dx} ${connecting.y}, ${connecting.x} ${connecting.y}`}
                fill="none"
                stroke="hsl(var(--primary) / 0.6)"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            );
          })()}

          {/* Nodes */}
          {nodes.map((node) => {
            const def = getNodeType(node.type);
            const isSelected = selected === node.id;
            return (
              <foreignObject
                key={node.id}
                x={node.x}
                y={node.y}
                width={170}
                height={60}
                className="overflow-visible"
              >
                <div
                  className={`w-[170px] h-[60px] rounded-xl border ${
                    isSelected ? "border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]" : "border-border/50"
                  } bg-card flex items-center gap-2.5 px-3 cursor-grab active:cursor-grabbing select-none transition-shadow`}
                  onMouseDown={(e) => onNodeMouseDown(e, node.id)}
                >
                  <div className={`w-8 h-8 rounded-lg ${def.bg} ${def.color} flex items-center justify-center shrink-0`}>
                    <def.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground truncate flex-1">
                    {node.label}
                  </span>
                  {/* Input port (left) */}
                  {def.category !== "trigger" && (
                    <div
                      className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-border bg-card hover:border-primary transition-colors"
                      style={{ position: "absolute" }}
                    />
                  )}
                  {/* Output port (right) */}
                  <div
                    className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-border bg-card hover:border-primary hover:bg-primary/20 transition-colors cursor-crosshair"
                    style={{ position: "absolute" }}
                    onMouseDown={(e) => onOutputPort(e, node.id)}
                  />
                </div>
              </foreignObject>
            );
          })}
        </g>
      </svg>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-card/80 border border-border/30 text-[10px] text-muted-foreground font-mono">
        {Math.round(zoom * 100)}%
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <GripVertical className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/50">Drag nodes from the palette to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowCanvas;
