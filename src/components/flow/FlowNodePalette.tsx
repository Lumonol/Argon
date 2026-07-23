import { NODE_TYPES, type NodeTypeDef } from "./FlowCanvas";

const MODULE_TRIGGER_TYPES = new Set([
  "trigger_staff",
  "trigger_activity",
  "trigger_assignments",
  "trigger_messages",
  "trigger_moderation",
  "trigger_forms",
  "trigger_sessions",
  "trigger_docs",
  "trigger_sentinel",
]);

const MODULER_TYPES = new Set([
  "trigger_moduler",
  "moduler_update",
]);

const GENERAL_TRIGGER_TYPES = new Set([
  "trigger_schedule",
  "trigger_webhook",
  "trigger_manual",
]);

const categories = [
  { key: "module_trigger", label: "Module Triggers", filter: (n: NodeTypeDef) => MODULE_TRIGGER_TYPES.has(n.type) },
  { key: "general_trigger", label: "General Triggers", filter: (n: NodeTypeDef) => GENERAL_TRIGGER_TYPES.has(n.type) },
  { key: "logic", label: "Logic", filter: (n: NodeTypeDef) => n.category === "logic" },
  { key: "action", label: "Actions", filter: (n: NodeTypeDef) => n.category === "action" && !MODULER_TYPES.has(n.type) },
  { key: "ai", label: "AI", filter: (n: NodeTypeDef) => n.category === "ai" },
  { key: "moduler", label: "Moduler", filter: (n: NodeTypeDef) => MODULER_TYPES.has(n.type) },
];

const FlowNodePalette = () => {
  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("flow-node-type", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-56 shrink-0 border-r border-border/30 bg-card/30 overflow-y-auto">
      <div className="p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Node Palette
        </p>

        {categories.map((cat) => {
          const items = NODE_TYPES.filter(cat.filter);
          if (items.length === 0) return null;
          return (
            <div key={cat.key} className="mb-4">
              <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1.5">
                {cat.label}
              </p>
              <div className="flex flex-col gap-1">
                {items.map((def: NodeTypeDef) => (
                  <div
                    key={def.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, def.type)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/20 bg-card/50 hover:border-border/50 hover:bg-card cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-md ${def.bg} ${def.color} flex items-center justify-center shrink-0`}>
                      <def.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{def.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlowNodePalette;
