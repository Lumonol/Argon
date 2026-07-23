import { useRef, useState, useEffect } from "react";
import { GripVertical } from "lucide-react";
import { type FlowNode, type FlowEdge } from "./FlowCanvas";
import { getNodeType } from "./FlowCanvas";

interface Props {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onChange: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
}

const SimpleFlowCanvas = ({ nodes, edges, onChange, selectedNodeId, onSelectNode }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectionEnd, setConnectionEnd] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Track spacebar state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const screenToCanvas = (sx: number, sy: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: sx, y: sy };
    return {
      x: (sx - rect.left - pan.x) / zoom,
      y: (sy - rect.top - pan.y) / zoom,
    };
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    if (e.detail === 2) {
      // Double click - open config
      onSelectNode?.(nodeId);
    } else {
      // Single click - drag node
      setDraggingNodeId(nodeId);
    }
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingNodeId) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const updated = nodes.map((n) =>
        n.id === draggingNodeId ? { ...n, x: x - 85, y: y - 30 } : n
      );
      onChange(updated, edges);
    } else if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({
        x: panStart.current.panX + dx,
        y: panStart.current.panY + dy,
      });
    } else if (connectingFrom) {
      handleConnectionMove(e);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (connectingFrom) {
      handleConnectionEnd(e);
    }
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Pan with left click on empty space, middle mouse, or spacebar + left click
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      onSelectNode?.(null);
      e.preventDefault();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.1, Math.min(3, z * delta)));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("flow-node-type");
    if (!nodeType) return;

    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      label: getNodeType(nodeType).label,
      x: x - 85,
      y: y - 30,
    };

    onChange([...nodes, newNode], edges);
  };

  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
    setConnectionEnd({ x: e.clientX, y: e.clientY });
  };

  const handleConnectionMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (connectingFrom) {
      setConnectionEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleConnectionEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!connectingFrom) return;

    // Find if we're over an input port of another node
    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    for (const node of nodes) {
      if (node.id === connectingFrom) continue;
      const def = getNodeType(node.type);
      // Check if over this node's input port (left side)
      if (def.category !== "trigger") {
        const portX = node.x;
        const portY = node.y + 30;
        if (Math.hypot(x - portX, y - portY) < 15) {
          // Create edge
          const newEdge: FlowEdge = {
            id: `edge_${Date.now()}`,
            source: connectingFrom,
            target: node.id,
          };
          onChange(nodes, [...edges, newEdge]);
          setConnectingFrom(null);
          return;
        }
      }
    }

    setConnectingFrom(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[hsl(var(--card)/0.3)] rounded-xl border border-border/30"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleContainerMouseDown}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ cursor: isPanning ? "grabbing" : draggingNodeId ? "grabbing" : spacePressed ? "grab" : "default" }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: "inherit" }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges (connections) */}
          {edges.map((edge) => {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;

            const x1 = source.x + 170;
            const y1 = source.y + 30;
            const x2 = target.x;
            const y2 = target.y + 30;

            const dist = Math.hypot(x2 - x1, y2 - y1) / 2;
            const cp1x = x1 + dist;
            const cp2x = x2 - dist;

            return (
              <path
                key={edge.id}
                d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="hsl(var(--primary) / 0.4)"
                strokeWidth="2"
                className="transition-colors"
              />
            );
          })}

          {/* Temporary connection line while dragging */}
          {connectingFrom && (
            <g>
              {(() => {
                const source = nodes.find((n) => n.id === connectingFrom);
                if (!source) return null;

                const x1 = source.x + 170;
                const y1 = source.y + 30;
                const { x: x2, y: y2 } = screenToCanvas(connectionEnd.x, connectionEnd.y);

                const dist = Math.hypot(x2 - x1, y2 - y1) / 2;
                const cp1x = x1 + dist;
                const cp2x = x2 - dist;

                return (
                  <path
                    d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="hsl(var(--primary) / 0.6)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })()}
            </g>
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const def = getNodeType(node.type);
            const isSelected = selectedNodeId === node.id;

            return (
              <g key={node.id}>
                {/* Node rectangle */}
                <foreignObject
                  x={node.x}
                  y={node.y}
                  width="170"
                  height="60"
                  className="overflow-visible"
                >
                  <div
                    className={`w-[170px] h-[60px] rounded-xl border ${
                      isSelected ? "border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]" : "border-border/50"
                    } bg-card flex items-center gap-2.5 px-3 cursor-grab active:cursor-grabbing select-none transition-shadow`}
                    onMouseDown={(e) => handleNodeMouseDown(e as any, node.id)}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${def.bg} ${def.color} flex items-center justify-center shrink-0`}
                    >
                      <def.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground truncate flex-1">
                      {node.label}
                    </span>

                    {/* Input port */}
                    {def.category !== "trigger" && (
                      <div
                        className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-border bg-card hover:border-primary transition-colors"
                        style={{ position: "absolute" }}
                      />
                    )}

                    {/* Output port */}
                    <div
                      className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-border bg-card hover:border-primary hover:bg-primary/20 transition-colors cursor-crosshair"
                      style={{ position: "absolute" }}
                      onMouseDown={(e) => handlePortMouseDown(e as any, node.id)}
                    />
                  </div>
                </foreignObject>
              </g>
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

export default SimpleFlowCanvas;
