import { useState, useMemo } from "react";
import { icons, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// kebab-case → PascalCase for lucide lookup
export const iconToPascal = (str: string) =>
  str.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

export const getIconComponent = (icon: string): React.ComponentType<{ className?: string }> => {
  const pascal = iconToPascal(icon) as keyof typeof icons;
  return (icons[pascal] as React.ComponentType<{ className?: string }>) || Users;
};

// Build full icon list once at module level
const ALL_ICONS = Object.entries(icons)
  .map(([name, component]) => ({
    value: name.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase(),
    label: name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2"),
    Icon: component as React.ComponentType<{ className?: string }>,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

interface IconPickerPopoverProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const IconPickerPopover = ({ value, onChange, className }: IconPickerPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_ICONS;
    const q = query.toLowerCase();
    return ALL_ICONS.filter(i => i.label.toLowerCase().includes(q));
  }, [query]);

  const SelectedIcon = getIconComponent(value);
  const selectedLabel = iconToPascal(value).replace(/([a-z])([A-Z])/g, "$1 $2");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start gap-2 h-10 font-normal", className)}>
          <SelectedIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">{selectedLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="start"
        side="bottom"
        onWheel={e => e.stopPropagation()}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <div className="p-2 border-b">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search icons..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <div
          style={{ maxHeight: "256px", overflowY: "auto", overscrollBehavior: "contain" }}
          onWheel={e => e.stopPropagation()}
        >
          <div className="grid grid-cols-6 gap-1 p-2">
            {filtered.map(i => (
              <button
                key={i.value}
                type="button"
                title={i.label}
                onClick={() => { onChange(i.value); setOpen(false); setQuery(""); }}
                className={cn(
                  "w-10 h-10 rounded-md flex items-center justify-center hover:bg-muted transition-colors",
                  value === i.value && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <i.Icon className="w-5 h-5" />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-6 py-6 text-center text-sm text-muted-foreground">No icons found</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconPickerPopover;
