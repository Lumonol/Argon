import { useState } from "react";
import {
  Search,
  Type,
  RectangleHorizontal,
  TextCursorInput,
  Image,
  Minus,
  Square,
  LayoutList,
  ToggleLeft,
  CheckSquare,
  CircleDot,
  SlidersHorizontal,
  Table2,
  Badge,
  AlignLeft,
  Columns2,
  Rows2,
  List,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Component definitions                                              */
/* ------------------------------------------------------------------ */

export interface ModulerComponentDef {
  type: string;
  label: string;
  icon: React.ElementType;
  category: "layout" | "content" | "input" | "data";
  defaults: Record<string, unknown>;
}

export const MODULER_COMPONENTS: ModulerComponentDef[] = [
  // Layout
  { type: "container", label: "Container", icon: Square, category: "layout", defaults: { direction: "vertical", padding: "16", gap: "12" } },
  { type: "columns", label: "Columns", icon: Columns2, category: "layout", defaults: { columns: 2, gap: "12" } },
  { type: "rows", label: "Rows", icon: Rows2, category: "layout", defaults: { rows: 2, gap: "12" } },
  { type: "divider", label: "Divider", icon: Minus, category: "layout", defaults: { color: "border" } },

  // Content
  { type: "heading", label: "Heading", icon: Type, category: "content", defaults: { text: "Heading", level: "h2" } },
  { type: "text", label: "Text", icon: AlignLeft, category: "content", defaults: { text: "Paragraph text goes here." } },
  { type: "button", label: "Button", icon: RectangleHorizontal, category: "content", defaults: { text: "Button", variant: "default" } },
  { type: "image", label: "Image", icon: Image, category: "content", defaults: { src: "", alt: "Image" } },
  { type: "badge", label: "Badge", icon: Badge, category: "content", defaults: { text: "Badge", variant: "default" } },

  // Input
  { type: "text_input", label: "Text Input", icon: TextCursorInput, category: "input", defaults: { label: "Label", placeholder: "Enter text..." } },
  { type: "textarea", label: "Textarea", icon: LayoutList, category: "input", defaults: { label: "Label", placeholder: "Enter text...", rows: 3 } },
  { type: "select", label: "Select", icon: SlidersHorizontal, category: "input", defaults: { label: "Label", options: "Option 1, Option 2, Option 3" } },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, category: "input", defaults: { label: "Checkbox label" } },
  { type: "radio", label: "Radio Group", icon: CircleDot, category: "input", defaults: { label: "Radio group", options: "Option 1, Option 2" } },
  { type: "toggle", label: "Toggle", icon: ToggleLeft, category: "input", defaults: { label: "Toggle label" } },

  // Data
  { type: "table", label: "Table", icon: Table2, category: "data", defaults: { columns: "Name, Value, Status", rows: 3 } },
  { type: "list", label: "List", icon: List, category: "data", defaults: { items: "Item 1, Item 2, Item 3", style: "bullet" } },
  { type: "stat", label: "Stat Card", icon: BarChart3, category: "data", defaults: { label: "Total", value: "0", change: "" } },
];

const CATEGORIES = [
  { key: "layout", label: "Layout" },
  { key: "content", label: "Content" },
  { key: "input", label: "Input" },
  { key: "data", label: "Data" },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  onAddComponent: (def: ModulerComponentDef) => void;
}

const ModulerComponentPalette = ({ onAddComponent }: Props) => {
  const [search, setSearch] = useState("");

  const filtered = MODULER_COMPONENTS.filter(
    (c) => c.label.toLowerCase().includes(search.toLowerCase()) || c.type.includes(search.toLowerCase())
  );

  return (
    <div className="w-60 border-r border-border/30 bg-card/30 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {CATEGORIES.map((cat) => {
          const items = filtered.filter((c) => c.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
                {cat.label}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {items.map((comp) => {
                  const Icon = comp.icon;
                  return (
                    <button
                      key={comp.type}
                      onClick={() => onAddComponent(comp)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground",
                        "hover:bg-primary/10 hover:text-primary transition-colors",
                        "border border-transparent hover:border-primary/20",
                        "cursor-pointer select-none"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-medium leading-tight text-center">{comp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModulerComponentPalette;
