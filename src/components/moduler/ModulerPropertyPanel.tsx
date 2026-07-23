import { X, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CanvasComponent } from "./ModulerCanvas";

/* ------------------------------------------------------------------ */
/*  Field definitions per component type                               */
/* ------------------------------------------------------------------ */

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const FIELD_DEFS: Record<string, FieldDef[]> = {
  heading: [
    { key: "text", label: "Text", type: "text", placeholder: "Heading text" },
    { key: "level", label: "Level", type: "select", options: [
      { value: "h1", label: "H1 — Large" },
      { value: "h2", label: "H2 — Medium" },
      { value: "h3", label: "H3 — Small" },
      { value: "h4", label: "H4 — XSmall" },
    ]},
  ],
  text: [
    { key: "text", label: "Content", type: "textarea", placeholder: "Paragraph text..." },
  ],
  button: [
    { key: "text", label: "Label", type: "text", placeholder: "Button text" },
    { key: "variant", label: "Variant", type: "select", options: [
      { value: "default", label: "Primary" },
      { value: "outline", label: "Outline" },
      { value: "ghost", label: "Ghost" },
      { value: "destructive", label: "Destructive" },
    ]},
  ],
  image: [
    { key: "src", label: "Image URL", type: "text", placeholder: "https://..." },
    { key: "alt", label: "Alt Text", type: "text", placeholder: "Describe the image" },
  ],
  badge: [
    { key: "text", label: "Text", type: "text", placeholder: "Badge text" },
    { key: "variant", label: "Variant", type: "select", options: [
      { value: "default", label: "Default" },
      { value: "secondary", label: "Secondary" },
      { value: "outline", label: "Outline" },
    ]},
  ],
  divider: [],
  container: [
    { key: "direction", label: "Direction", type: "select", options: [
      { value: "vertical", label: "Vertical" },
      { value: "horizontal", label: "Horizontal" },
    ]},
    { key: "padding", label: "Padding (px)", type: "number", placeholder: "16" },
    { key: "gap", label: "Gap (px)", type: "number", placeholder: "12" },
  ],
  columns: [
    { key: "columns", label: "Columns", type: "number", placeholder: "2" },
    { key: "gap", label: "Gap (px)", type: "number", placeholder: "12" },
  ],
  rows: [
    { key: "rows", label: "Rows", type: "number", placeholder: "2" },
    { key: "gap", label: "Gap (px)", type: "number", placeholder: "12" },
  ],
  text_input: [
    { key: "label", label: "Label", type: "text", placeholder: "Field label" },
    { key: "placeholder", label: "Placeholder", type: "text", placeholder: "Placeholder text" },
  ],
  textarea: [
    { key: "label", label: "Label", type: "text", placeholder: "Field label" },
    { key: "placeholder", label: "Placeholder", type: "text", placeholder: "Placeholder text" },
    { key: "rows", label: "Rows", type: "number", placeholder: "3" },
  ],
  select: [
    { key: "label", label: "Label", type: "text", placeholder: "Field label" },
    { key: "options", label: "Options (comma-separated)", type: "text", placeholder: "Option 1, Option 2, Option 3" },
  ],
  checkbox: [
    { key: "label", label: "Label", type: "text", placeholder: "Checkbox label" },
  ],
  radio: [
    { key: "label", label: "Label", type: "text", placeholder: "Group label" },
    { key: "options", label: "Options (comma-separated)", type: "text", placeholder: "Option 1, Option 2" },
  ],
  toggle: [
    { key: "label", label: "Label", type: "text", placeholder: "Toggle label" },
  ],
  table: [
    { key: "columns", label: "Columns (comma-separated)", type: "text", placeholder: "Name, Value, Status" },
    { key: "rows", label: "Row Count", type: "number", placeholder: "3" },
  ],
  list: [
    { key: "items", label: "Items (comma-separated)", type: "textarea", placeholder: "Item 1, Item 2, Item 3" },
    { key: "style", label: "Style", type: "select", options: [
      { value: "bullet", label: "Bullet" },
      { value: "numbered", label: "Numbered" },
    ]},
  ],
  stat: [
    { key: "label", label: "Label", type: "text", placeholder: "e.g. Total Users" },
    { key: "value", label: "Value", type: "text", placeholder: "e.g. 1,234" },
    { key: "change", label: "Change Text", type: "text", placeholder: "e.g. +12% from last week" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  component: CanvasComponent;
  onUpdate: (id: string, props: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClose: () => void;
}

const ModulerPropertyPanel = ({ component, onUpdate, onDelete, onDuplicate, onClose }: Props) => {
  const fields = FIELD_DEFS[component.type] || [];

  const handleChange = (key: string, value: string | number) => {
    onUpdate(component.id, { ...component.props, [key]: value });
  };

  return (
    <div className="w-72 border-l border-border/30 bg-card/30 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        <div>
          <p className="text-xs font-semibold text-foreground capitalize">{component.type.replace("_", " ")}</p>
          <p className="text-[10px] text-muted-foreground">Properties</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No configurable properties</p>
        ) : (
          fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs">{field.label}</Label>
              {field.type === "text" && (
                <Input
                  value={(component.props[field.key] as string) || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-8 text-xs"
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  value={(component.props[field.key] as string) || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="text-xs"
                />
              )}
              {field.type === "number" && (
                <Input
                  type="number"
                  value={(component.props[field.key] as number) || ""}
                  onChange={(e) => handleChange(field.key, Number(e.target.value))}
                  placeholder={field.placeholder}
                  className="h-8 text-xs"
                />
              )}
              {field.type === "select" && field.options && (
                <Select
                  value={(component.props[field.key] as string) || field.options[0]?.value}
                  onValueChange={(v) => handleChange(field.key, v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-border/20 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5"
            onClick={() => onDuplicate(component.id)}
          >
            <Copy className="w-3 h-3" />
            Duplicate Component
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => onDelete(component.id)}
          >
            <Trash2 className="w-3 h-3" />
            Delete Component
          </Button>
        </div>

        {/* Component ID */}
        <p className="text-[10px] text-muted-foreground/40 pt-1">ID: {component.id.slice(0, 8)}</p>
      </div>
    </div>
  );
};

export default ModulerPropertyPanel;
