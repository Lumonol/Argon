import { useCallback } from "react";
import {
  Type,
  AlignLeft,
  RectangleHorizontal,
  Image,
  Minus,
  Square,
  Columns2,
  Rows2,
  TextCursorInput,
  LayoutList,
  SlidersHorizontal,
  CheckSquare,
  CircleDot,
  ToggleLeft,
  Table2,
  Badge,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Plus,
  List,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CanvasComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

interface Props {
  components: CanvasComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
}

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, React.ElementType> = {
  container: Square,
  columns: Columns2,
  rows: Rows2,
  divider: Minus,
  heading: Type,
  text: AlignLeft,
  button: RectangleHorizontal,
  image: Image,
  badge: Badge,
  text_input: TextCursorInput,
  textarea: LayoutList,
  select: SlidersHorizontal,
  checkbox: CheckSquare,
  radio: CircleDot,
  toggle: ToggleLeft,
  table: Table2,
  list: List,
  stat: BarChart3,
};

/* ------------------------------------------------------------------ */
/*  Preview renderers                                                  */
/* ------------------------------------------------------------------ */

const ComponentPreview = ({ comp }: { comp: CanvasComponent }) => {
  const props = comp.props;

  switch (comp.type) {
    case "heading": {
      const level = (props.level as string) || "h2";
      const text = (props.text as string) || "Heading";
      const sizes: Record<string, string> = { h1: "text-2xl", h2: "text-xl", h3: "text-lg", h4: "text-base" };
      return <div className={cn("font-bold text-foreground", sizes[level] || "text-xl")}>{text}</div>;
    }
    case "text":
      return <p className="text-sm text-muted-foreground leading-relaxed">{(props.text as string) || "Text"}</p>;
    case "button":
      return (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
            props.variant === "outline"
              ? "border border-border text-foreground"
              : props.variant === "ghost"
              ? "text-foreground"
              : props.variant === "destructive"
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {(props.text as string) || "Button"}
        </div>
      );
    case "image": {
      const src = props.src as string;
      if (src) {
        return (
          <img
            src={src}
            alt={(props.alt as string) || "Image"}
            className="w-full max-h-48 object-cover rounded-lg border border-border/30"
          />
        );
      }
      return (
        <div className="w-full h-32 rounded-lg bg-muted/30 border border-dashed border-border/40 flex flex-col items-center justify-center gap-1">
          <Image className="w-8 h-8 text-muted-foreground/30" />
          <span className="text-[10px] text-muted-foreground/40">{(props.alt as string) || "No image set"}</span>
        </div>
      );
    }
    case "badge":
      return (
        <span className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          props.variant === "secondary" ? "bg-secondary text-secondary-foreground" :
          props.variant === "outline" ? "border border-border text-foreground" :
          "bg-primary/10 text-primary"
        )}>
          {(props.text as string) || "Badge"}
        </span>
      );
    case "divider":
      return <div className="w-full h-px bg-border/60" />;
    case "container":
      return (
        <div
          className="w-full rounded-lg border border-dashed border-border/40 min-h-[60px] flex items-center justify-center"
          style={{ padding: `${props.padding || 16}px`, gap: `${props.gap || 12}px` }}
        >
          <span className="text-[10px] text-muted-foreground/40">Container</span>
        </div>
      );
    case "columns":
      return (
        <div className="w-full grid gap-2" style={{ gridTemplateColumns: `repeat(${(props.columns as number) || 2}, 1fr)` }}>
          {Array.from({ length: (props.columns as number) || 2 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-dashed border-border/40 flex items-center justify-center bg-muted/10">
              <span className="text-[10px] text-muted-foreground/40">Col {i + 1}</span>
            </div>
          ))}
        </div>
      );
    case "rows":
      return (
        <div className="w-full flex flex-col gap-2">
          {Array.from({ length: (props.rows as number) || 2 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg border border-dashed border-border/40 flex items-center justify-center bg-muted/10">
              <span className="text-[10px] text-muted-foreground/40">Row {i + 1}</span>
            </div>
          ))}
        </div>
      );
    case "text_input":
      return (
        <div className="w-full space-y-1.5">
          <label className="text-xs font-medium text-foreground">{(props.label as string) || "Label"}</label>
          <div className="h-9 rounded-md border border-border bg-background px-3 flex items-center">
            <span className="text-xs text-muted-foreground/60">{(props.placeholder as string) || "Enter text..."}</span>
          </div>
        </div>
      );
    case "textarea":
      return (
        <div className="w-full space-y-1.5">
          <label className="text-xs font-medium text-foreground">{(props.label as string) || "Label"}</label>
          <div className="rounded-md border border-border bg-background p-2.5" style={{ minHeight: `${((props.rows as number) || 3) * 24}px` }}>
            <span className="text-xs text-muted-foreground/60">{(props.placeholder as string) || "Enter text..."}</span>
          </div>
        </div>
      );
    case "select":
      return (
        <div className="w-full space-y-1.5">
          <label className="text-xs font-medium text-foreground">{(props.label as string) || "Label"}</label>
          <div className="h-9 rounded-md border border-border bg-background px-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground/60">Select...</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60" />
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-[3px] border border-border bg-background flex-shrink-0" />
          <span className="text-sm text-foreground">{(props.label as string) || "Checkbox"}</span>
        </div>
      );
    case "radio":
      return (
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">{(props.label as string) || "Radio group"}</label>
          {((props.options as string) || "Option 1, Option 2").split(",").map((opt, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full border border-border bg-background flex-shrink-0" />
              <span className="text-sm text-foreground">{opt.trim()}</span>
            </div>
          ))}
        </div>
      );
    case "toggle":
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-5 rounded-full bg-muted border border-border relative flex-shrink-0">
            <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-muted-foreground/40 transition-all" />
          </div>
          <span className="text-sm text-foreground">{(props.label as string) || "Toggle"}</span>
        </div>
      );
    case "table": {
      const cols = ((props.columns as string) || "Name, Value, Status").split(",");
      return (
        <div className="w-full rounded-lg border border-border overflow-hidden">
          <div className="grid bg-muted/30 border-b border-border" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
            {cols.map((col, i) => (
              <div key={i} className="px-3 py-2 text-[11px] font-medium text-foreground">{col.trim()}</div>
            ))}
          </div>
          {Array.from({ length: Math.min((props.rows as number) || 3, 5) }).map((_, r) => (
            <div key={r} className="grid border-b border-border/30 last:border-0" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
              {cols.map((_, c) => (
                <div key={c} className="px-3 py-2 text-[11px] text-muted-foreground/50">—</div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    case "list": {
      const items = ((props.items as string) || "Item 1, Item 2, Item 3").split(",");
      const style = (props.style as string) || "bullet";
      return (
        <div className="w-full space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground">
              {style === "numbered" ? (
                <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}.</span>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
              )}
              {item.trim()}
            </div>
          ))}
        </div>
      );
    }
    case "stat":
      return (
        <div className="rounded-lg border border-border/50 bg-background p-4">
          <p className="text-xs text-muted-foreground mb-1">{(props.label as string) || "Total"}</p>
          <p className="text-2xl font-bold text-foreground">{(props.value as string) || "0"}</p>
          {(props.change as string) && (
            <p className="text-xs text-emerald-500 mt-1">{props.change as string}</p>
          )}
        </div>
      );
    default:
      return <span className="text-xs text-muted-foreground">Unknown: {comp.type}</span>;
  }
};

/* ------------------------------------------------------------------ */
/*  Canvas                                                             */
/* ------------------------------------------------------------------ */

const ModulerCanvas = ({ components, selectedId, onSelect, onDelete, onDuplicate, onReorder }: Props) => {
  const handleBgClick = useCallback(() => onSelect(null), [onSelect]);

  return (
    <div
      className="flex-1 overflow-y-auto p-6"
      onClick={handleBgClick}
      style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--border) / 0.15) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="min-h-full rounded-xl border border-border/30 bg-card/80 backdrop-blur-sm p-6 space-y-1">
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-dashed border-primary/20 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary/30" />
            </div>
            <p className="text-sm text-muted-foreground/60 font-medium">Empty canvas</p>
            <p className="text-xs text-muted-foreground/40 mt-1 max-w-[240px]">
              Click components from the palette to start building your module
            </p>
          </div>
        ) : (
          components.map((comp, index) => {
            const Icon = ICON_MAP[comp.type] || Square;
            const isSelected = selectedId === comp.id;
            return (
              <div
                key={comp.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(comp.id);
                }}
                className={cn(
                  "group relative rounded-lg p-3 transition-all cursor-pointer",
                  isSelected
                    ? "ring-2 ring-primary/50 bg-primary/[0.03]"
                    : "hover:bg-muted/20 hover:ring-1 hover:ring-border/40"
                )}
              >
                {/* Toolbar */}
                <div
                  className={cn(
                    "absolute -top-3 right-2 flex items-center gap-0.5 rounded-md border border-border/50 bg-card shadow-sm px-1 py-0.5 z-10",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    "transition-opacity"
                  )}
                >
                  <span className="text-[9px] text-muted-foreground font-medium px-1.5 flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {comp.type.replace("_", " ")}
                  </span>
                  <div className="w-px h-3 bg-border/50" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => { e.stopPropagation(); onReorder(comp.id, "up"); }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => { e.stopPropagation(); onReorder(comp.id, "down"); }}
                    disabled={index === components.length - 1}
                    title="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <div className="w-px h-3 bg-border/50" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => { e.stopPropagation(); onDuplicate(comp.id); }}
                    title="Duplicate (Ctrl+D)"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(comp.id); }}
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Drag handle */}
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-muted-foreground/20",
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  "transition-opacity"
                )}>
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Component preview */}
                <ComponentPreview comp={comp} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ModulerCanvas;
