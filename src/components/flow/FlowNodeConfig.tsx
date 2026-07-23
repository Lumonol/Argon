import { useState, useEffect, lazy, Suspense } from "react";
import { X, Code2, Settings2, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { type FlowNode, type FlowEdge, getNodeType } from "./FlowCanvas";

const CodeEditor = lazy(() => import("@uiw/react-textarea-code-editor"));

/* ------------------------------------------------------------------ */
/*  Node-specific option definitions                                   */
/* ------------------------------------------------------------------ */

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface NodeFieldDef {
  key: string;
  label: string;
  type: "select" | "text" | "textarea" | "number" | "toggle";
  options?: SelectOption[];
  placeholder?: string;
  description?: string;
}


const SCHEDULE_INTERVALS: SelectOption[] = [
  { value: "every_5m", label: "Every 5 minutes" },
  { value: "every_15m", label: "Every 15 minutes" },
  { value: "every_30m", label: "Every 30 minutes" },
  { value: "hourly", label: "Every hour" },
  { value: "every_6h", label: "Every 6 hours" },
  { value: "every_12h", label: "Every 12 hours" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom_cron", label: "Custom cron expression" },
];

const CONDITION_OPERATORS: SelectOption[] = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "matches_regex", label: "Matches regex" },
];

const FILTER_MODES: SelectOption[] = [
  { value: "include", label: "Include matching" },
  { value: "exclude", label: "Exclude matching" },
];

const MESSAGE_TARGETS: SelectOption[] = [
  { value: "workspace_channel", label: "Workspace Channel", description: "Post to workspace messages" },
  { value: "direct_message", label: "Direct Message", description: "Send a DM to a user" },
  { value: "staff_group", label: "Staff Group", description: "Message a staff department" },
  { value: "all_staff", label: "All Staff", description: "Broadcast to all staff members" },
];

const NOTIFICATION_TARGETS: SelectOption[] = [
  { value: "owner", label: "Workspace Owner" },
  { value: "management", label: "Management Team" },
  { value: "all_staff", label: "All Staff" },
  { value: "specific_role", label: "Specific Role" },
  { value: "specific_user", label: "Specific User" },
];

const NOTIFICATION_PRIORITIES: SelectOption[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const DATA_SOURCES: SelectOption[] = [
  { value: "staff_list", label: "Staff List", description: "Query the staff directory" },
  { value: "activity_log", label: "Activity Log", description: "Look up activity records" },
  { value: "assignments", label: "Assignments", description: "Query assignments" },
  { value: "sentinel_incidents", label: "Sentinel Incidents", description: "Look up moderation incidents" },
  { value: "form_responses", label: "Form Responses", description: "Query form submissions" },
  { value: "session_history", label: "Session History", description: "Look up past sessions" },
];

const AI_CLASSIFY_CATEGORIES: SelectOption[] = [
  { value: "sentiment", label: "Sentiment Analysis", description: "Positive, negative, neutral" },
  { value: "toxicity", label: "Toxicity Detection", description: "Toxic, clean" },
  { value: "intent", label: "Intent Classification", description: "Question, complaint, request, etc." },
  { value: "spam", label: "Spam Detection", description: "Spam or legitimate" },
  { value: "language", label: "Language Detection", description: "Detect the language of text" },
  { value: "custom", label: "Custom Categories", description: "Define your own categories" },
];

const DELAY_UNITS: SelectOption[] = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

const LOOP_SOURCES: SelectOption[] = [
  { value: "input_array", label: "Input Array", description: "Loop over an array from the previous node" },
  { value: "staff_list", label: "Staff List", description: "Loop over all staff members" },
  { value: "query_results", label: "Query Results", description: "Loop over data lookup results" },
];

/* ------------------------------------------------------------------ */
/*  Moduler options                                                    */
/* ------------------------------------------------------------------ */

const MODULER_COMPONENT_TYPES: SelectOption[] = [
  { value: "toggle", label: "Toggle", description: "Switch on/off" },
  { value: "button", label: "Button", description: "Button click" },
  { value: "checkbox", label: "Checkbox", description: "Checkbox checked/unchecked" },
  { value: "select", label: "Select", description: "Dropdown selection changed" },
  { value: "radio", label: "Radio Group", description: "Radio option selected" },
  { value: "text_input", label: "Text Input", description: "Text input value changed" },
  { value: "textarea", label: "Textarea", description: "Textarea value changed" },
];

const MODULER_TRIGGER_EVENTS: SelectOption[] = [
  { value: "value_changed", label: "Value Changed", description: "Component value is updated" },
  { value: "clicked", label: "Clicked", description: "Component is clicked or activated" },
  { value: "toggled_on", label: "Toggled On", description: "Toggle or checkbox is turned on" },
  { value: "toggled_off", label: "Toggled Off", description: "Toggle or checkbox is turned off" },
  { value: "submitted", label: "Submitted", description: "Input value is submitted" },
];

const MODULER_UPDATE_ACTIONS: SelectOption[] = [
  { value: "set_value", label: "Set Value", description: "Set the component's value" },
  { value: "toggle_on", label: "Toggle On", description: "Turn a toggle/checkbox on" },
  { value: "toggle_off", label: "Toggle Off", description: "Turn a toggle/checkbox off" },
  { value: "set_text", label: "Set Text", description: "Update displayed text or label" },
  { value: "show", label: "Show", description: "Make the component visible" },
  { value: "hide", label: "Hide", description: "Hide the component" },
  { value: "enable", label: "Enable", description: "Enable the component" },
  { value: "disable", label: "Disable", description: "Disable the component" },
];

/** Map node type → visual config fields */
// Per-module event options
const STAFF_EVENTS: SelectOption[] = [
  { value: "staff:joined", label: "Staff Joined", description: "A new staff member is added" },
  { value: "staff:removed", label: "Staff Removed", description: "A staff member is removed" },
  { value: "staff:role_changed", label: "Role Changed", description: "A staff member's role is updated" },
  { value: "staff:rank_changed", label: "Rank Changed", description: "A staff member's Roblox rank changes" },
  { value: "staff:profile_updated", label: "Profile Updated", description: "A staff member updates their profile" },
];

const ACTIVITY_EVENTS: SelectOption[] = [
  { value: "activity:logged", label: "Activity Logged", description: "A staff member logs activity time" },
  { value: "activity:milestone", label: "Milestone Reached", description: "A staff member hits an activity milestone" },
  { value: "activity:streak", label: "Streak Achieved", description: "A consecutive activity streak is reached" },
  { value: "activity:inactive", label: "Inactivity Detected", description: "A staff member has been inactive" },
];

const ASSIGNMENT_EVENTS: SelectOption[] = [
  { value: "assignment:created", label: "Assignment Created", description: "A new assignment is created" },
  { value: "assignment:completed", label: "Assignment Completed", description: "An assignment is completed" },
  { value: "assignment:overdue", label: "Assignment Overdue", description: "An assignment passes its deadline" },
  { value: "assignment:updated", label: "Assignment Updated", description: "An assignment is modified" },
];

const MESSAGE_EVENTS: SelectOption[] = [
  { value: "message:received", label: "Message Received", description: "A new message is posted" },
  { value: "message:mention", label: "User Mentioned", description: "A user is mentioned in a message" },
];

const MODERATION_EVENTS: SelectOption[] = [
  { value: "moderation:ban_created", label: "Ban Created", description: "A new ban is issued" },
  { value: "moderation:ban_expired", label: "Ban Expired", description: "A ban reaches its expiry" },
  { value: "moderation:ban_appealed", label: "Ban Appealed", description: "A player submits a ban appeal" },
  { value: "moderation:warning_issued", label: "Warning Issued", description: "A warning is issued" },
];

const FORM_EVENTS: SelectOption[] = [
  { value: "form:submitted", label: "Form Submitted", description: "A form response is submitted" },
  { value: "form:approved", label: "Form Approved", description: "A submission is approved" },
  { value: "form:rejected", label: "Form Rejected", description: "A submission is rejected" },
];

const SESSION_EVENTS: SelectOption[] = [
  { value: "session:scheduled", label: "Session Scheduled", description: "A new session is scheduled" },
  { value: "session:started", label: "Session Started", description: "A session begins" },
  { value: "session:ended", label: "Session Ended", description: "A session is completed" },
  { value: "session:attendance_marked", label: "Attendance Marked", description: "Attendance is recorded" },
  { value: "session:cancelled", label: "Session Cancelled", description: "A session is cancelled" },
];

const DOCS_EVENTS: SelectOption[] = [
  { value: "docs:created", label: "Document Created", description: "A new document is published" },
  { value: "docs:updated", label: "Document Updated", description: "A document is edited" },
];

const SENTINEL_EVENTS: SelectOption[] = [
  { value: "sentinel:incident", label: "Incident Flagged", description: "Sentinel detects a new incident" },
  { value: "sentinel:critical", label: "Critical Alert", description: "A high-severity incident is flagged" },
  { value: "sentinel:exploit", label: "Exploit Detected", description: "An exploit or cheat is detected" },
  { value: "sentinel:chat_violation", label: "Chat Violation", description: "A chat message violates filters" },
  { value: "sentinel:avatar_violation", label: "Avatar Violation", description: "An avatar check fails" },
  { value: "sentinel:action_taken", label: "Action Taken", description: "A moderation action is executed" },
];

/** Helper to build trigger fields for a module */
const moduleTriggerFields = (events: SelectOption[]): NodeFieldDef[] => [
  { key: "event", label: "When", type: "select", options: events, description: "What triggers this node" },
  { key: "filter_value", label: "Filter (optional)", type: "text", placeholder: "e.g. specific user, minimum value", description: "Only trigger when this condition is met" },
];

const NODE_FIELDS: Record<string, NodeFieldDef[]> = {
  // Module triggers
  trigger_staff:       moduleTriggerFields(STAFF_EVENTS),
  trigger_activity:    moduleTriggerFields(ACTIVITY_EVENTS),
  trigger_assignments: moduleTriggerFields(ASSIGNMENT_EVENTS),
  trigger_messages:    moduleTriggerFields(MESSAGE_EVENTS),
  trigger_moderation:  moduleTriggerFields(MODERATION_EVENTS),
  trigger_forms:       moduleTriggerFields(FORM_EVENTS),
  trigger_sessions:    moduleTriggerFields(SESSION_EVENTS),
  trigger_docs:        moduleTriggerFields(DOCS_EVENTS),
  trigger_sentinel:    moduleTriggerFields(SENTINEL_EVENTS),
  // General triggers
  trigger_manual: [],
  trigger_schedule: [
    { key: "interval", label: "Interval", type: "select", options: SCHEDULE_INTERVALS, description: "How often this flow runs" },
    { key: "cron_expression", label: "Cron Expression", type: "text", placeholder: "0 9 * * 1", description: "Only used with custom cron interval" },
    { key: "timezone", label: "Timezone", type: "text", placeholder: "UTC" },
  ],
  trigger_webhook: [
    { key: "method", label: "HTTP Method", type: "select", options: [{ value: "POST", label: "POST" }, { value: "GET", label: "GET" }, { value: "PUT", label: "PUT" }] },
    { key: "path", label: "Path", type: "text", placeholder: "/my-webhook" },
    { key: "secret", label: "Webhook Secret", type: "text", placeholder: "Optional secret for validation" },
  ],
  condition: [
    { key: "field", label: "Field", type: "text", placeholder: "e.g. data.role, input.status", description: "The data field to check" },
    { key: "operator", label: "Operator", type: "select", options: CONDITION_OPERATORS },
    { key: "value", label: "Value", type: "text", placeholder: "Value to compare against" },
  ],
  filter: [
    { key: "mode", label: "Mode", type: "select", options: FILTER_MODES },
    { key: "field", label: "Field", type: "text", placeholder: "e.g. data.status" },
    { key: "operator", label: "Operator", type: "select", options: CONDITION_OPERATORS },
    { key: "value", label: "Value", type: "text", placeholder: "Value to match" },
  ],
  loop: [
    { key: "source", label: "Loop Over", type: "select", options: LOOP_SOURCES, description: "What data to iterate through" },
    { key: "batch_size", label: "Batch Size", type: "number", placeholder: "1", description: "Process items in batches" },
    { key: "continue_on_error", label: "Continue on Error", type: "toggle", description: "Keep looping even if one item fails" },
  ],
  delay: [
    { key: "duration", label: "Duration", type: "number", placeholder: "1" },
    { key: "unit", label: "Unit", type: "select", options: DELAY_UNITS },
  ],
  send_message: [
    { key: "target", label: "Send To", type: "select", options: MESSAGE_TARGETS, description: "Where to send the message" },
    { key: "target_id", label: "Target ID (optional)", type: "text", placeholder: "Channel or user ID" },
    { key: "message", label: "Message", type: "textarea", placeholder: "Use {{input.field}} for dynamic values", description: "Supports template variables from previous nodes" },
  ],
  notification: [
    { key: "target", label: "Notify", type: "select", options: NOTIFICATION_TARGETS },
    { key: "priority", label: "Priority", type: "select", options: NOTIFICATION_PRIORITIES },
    { key: "title", label: "Title", type: "text", placeholder: "Notification title" },
    { key: "message", label: "Message", type: "textarea", placeholder: "Notification body" },
  ],
  data_lookup: [
    { key: "source", label: "Data Source", type: "select", options: DATA_SOURCES, description: "Where to look up data" },
    { key: "query_field", label: "Query Field", type: "text", placeholder: "e.g. user_id, status" },
    { key: "query_value", label: "Query Value", type: "text", placeholder: "Value or {{input.field}}" },
    { key: "limit", label: "Limit Results", type: "number", placeholder: "10" },
  ],
  ai_classify: [
    { key: "classification", label: "Classification Type", type: "select", options: AI_CLASSIFY_CATEGORIES },
    { key: "custom_categories", label: "Custom Categories", type: "text", placeholder: "cat1, cat2, cat3 (comma-separated)", description: "Only used with custom classification" },
    { key: "input_field", label: "Input Field", type: "text", placeholder: "e.g. input.text, input.message", description: "Which field to classify" },
    { key: "confidence_threshold", label: "Confidence Threshold", type: "number", placeholder: "0.7" },
  ],
  ai_generate: [
    { key: "prompt", label: "Prompt", type: "textarea", placeholder: "Generate a summary of {{input.data}}...", description: "The prompt to send to AI. Use {{input.field}} for dynamic values." },
    { key: "max_tokens", label: "Max Tokens", type: "number", placeholder: "256" },
    { key: "temperature", label: "Temperature", type: "number", placeholder: "0.7" },
  ],
  // Moduler
  trigger_moduler: [
    { key: "component_type", label: "Component Type", type: "select", options: MODULER_COMPONENT_TYPES, description: "Which type of Moduler component triggers this" },
    { key: "component_id", label: "Component ID", type: "text", placeholder: "e.g. my-toggle, settings-switch", description: "The ID of the component in your Moduler layout" },
    { key: "event", label: "Event", type: "select", options: MODULER_TRIGGER_EVENTS, description: "What interaction triggers this flow" },
    { key: "filter_value", label: "Filter Value (optional)", type: "text", placeholder: "e.g. specific option value", description: "Only trigger when value matches" },
  ],
  moduler_update: [
    { key: "component_type", label: "Component Type", type: "select", options: MODULER_COMPONENT_TYPES, description: "Which type of Moduler component to update" },
    { key: "component_id", label: "Component ID", type: "text", placeholder: "e.g. my-toggle, status-text", description: "The ID of the component to update" },
    { key: "action", label: "Action", type: "select", options: MODULER_UPDATE_ACTIONS, description: "What to do to the component" },
    { key: "value", label: "Value", type: "text", placeholder: "e.g. true, Hello World, {{input.result}}", description: "The value to set (supports template variables)" },
  ],
};

/** Node types that show the code editor */
const ADVANCED_NODE_TYPES = new Set(["action_custom"]);

/* ------------------------------------------------------------------ */
/*  Language definitions (for code editor)                             */
/* ------------------------------------------------------------------ */

interface LangDef {
  value: string;
  label: string;
  extension: string;
  placeholder: string;
}

const LANGUAGES: LangDef[] = [
  {
    value: "python",
    label: "Python",
    extension: "py",
    placeholder: `# Write your node logic here
# Available variables:
#   input_data  — data from connected input nodes
#   context     — workspace context (workspace_id, user, etc.)
#
# Return a value to pass to the next node:
#   return {"result": "value"}

def run(input_data, context):
    # Your code here
    return {"result": input_data}
`,
  },
  {
    value: "javascript",
    label: "JavaScript",
    extension: "js",
    placeholder: `// Write your node logic here
// Available variables:
//   inputData  — data from connected input nodes
//   context    — workspace context (workspaceId, user, etc.)
//
// Return a value to pass to the next node

async function run(inputData, context) {
  // Your code here
  return { result: inputData };
}
`,
  },
  {
    value: "typescript",
    label: "TypeScript",
    extension: "ts",
    placeholder: `// Write your node logic here

interface NodeInput {
  [key: string]: unknown;
}

interface NodeContext {
  workspaceId: string;
  userId: string;
}

async function run(inputData: NodeInput, context: NodeContext) {
  // Your code here
  return { result: inputData };
}
`,
  },
  {
    value: "lua",
    label: "Lua",
    extension: "lua",
    placeholder: `-- Write your node logic here
-- Available variables:
--   input_data  — data from connected input nodes
--   context     — workspace context (workspace_id, user, etc.)

function run(input_data, context)
    -- Your code here
    return { result = input_data }
end
`,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  node: FlowNode;
  onUpdate: (node: FlowNode) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
  edges?: FlowEdge[];
  allNodes?: FlowNode[];
}

const FlowNodeConfig = ({ node, onUpdate, onDelete, onClose, edges = [], allNodes = [] }: Props) => {
  const { toast } = useToast();
  const def = getNodeType(node.type);
  const config = node.config || {};
  const isAdvanced = ADVANCED_NODE_TYPES.has(node.type);
  let fields = NODE_FIELDS[node.type] || [];

  // Get incoming edges (nodes connected TO this node)
  const incomingEdges = edges.filter((e) => e.target === node.id);
  const connectedSourceNodes = incomingEdges.map((e) => allNodes.find((n) => n.id === e.source)).filter(Boolean) as FlowNode[];

  // Add dynamic fields based on connections
  const dynamicFields: NodeFieldDef[] = [];

  // If this is a filter and it's connected from trigger_forms
  if (node.type === "filter") {
    const fromForms = connectedSourceNodes.some((n) => n.type === "trigger_forms");
    if (fromForms) {
      dynamicFields.push({
        key: "filter_form",
        label: "Form Filter",
        type: "select",
        options: [
          { value: "all", label: "All forms" },
          { value: "specific", label: "Specific form" },
        ],
        description: "Filter by which forms trigger this",
      });
      if ((config.filter_form as string) === "specific") {
        dynamicFields.push({
          key: "form_id",
          label: "Form ID",
          type: "text",
          placeholder: "Enter form ID",
        });
      }
    }
  }

  // If this is a filter and it's connected from trigger_staff
  if (node.type === "filter") {
    const fromStaff = connectedSourceNodes.some((n) => n.type === "trigger_staff");
    if (fromStaff) {
      dynamicFields.push({
        key: "staff_filter_by",
        label: "Filter Staff By",
        type: "select",
        options: [
          { value: "role", label: "Role" },
          { value: "rank", label: "Rank" },
          { value: "username", label: "Username" },
          { value: "user_id", label: "User ID" },
        ],
        description: "What staff property to filter by",
      });
    }
  }

  // Add dynamic fields to the fields list
  fields = [...fields, ...dynamicFields];

  const [label, setLabel] = useState(node.label);
  const [description, setDescription] = useState((config.description as string) || "");
  const [language, setLanguage] = useState((config.language as string) || "python");
  const [code, setCode] = useState((config.code as string) || "");
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>(() => {
    const vals: Record<string, unknown> = {};
    for (const f of fields) {
      vals[f.key] = config[f.key] ?? "";
    }
    return vals;
  });

  // Reset when node changes
  useEffect(() => {
    const c = node.config || {};
    setLabel(node.label);
    setDescription((c.description as string) || "");
    setLanguage((c.language as string) || "python");
    setCode((c.code as string) || "");
    const vals: Record<string, unknown> = {};
    // Include all fields (base + dynamic)
    for (const f of fields) {
      vals[f.key] = c[f.key] ?? "";
    }
    setFieldValues(vals);
  }, [node.id, node.config, fields]);

  const lang = LANGUAGES.find((l) => l.value === language) || LANGUAGES[0];

  const setField = (key: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    onUpdate({
      ...node,
      label,
      config: {
        ...config,
        ...fieldValues,
        description,
        ...(isAdvanced ? { language, code } : {}),
      },
    });
    toast({ title: "Successfully saved node configuration" });
  };

  // Auto-save on changes
  useEffect(() => {
    const timeout = setTimeout(save, 400);
    return () => clearTimeout(timeout);
  }, [label, description, language, code, fieldValues]);

  /* ----- Render a config field ----- */
  const renderField = (field: NodeFieldDef) => {
    const value = fieldValues[field.key];

    switch (field.type) {
      case "select":
        return (
          <div key={field.key}>
            <Label className="text-xs">{field.label}</Label>
            {field.description && (
              <p className="text-[10px] text-muted-foreground mb-1">{field.description}</p>
            )}
            <Select value={(value as string) || ""} onValueChange={(v) => setField(field.key, v)}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <span>{opt.label}</span>
                      {opt.description && (
                        <span className="text-muted-foreground ml-1.5 text-[10px]">
                          — {opt.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "textarea":
        return (
          <div key={field.key}>
            <Label className="text-xs">{field.label}</Label>
            {field.description && (
              <p className="text-[10px] text-muted-foreground mb-1">{field.description}</p>
            )}
            <Textarea
              value={(value as string) || ""}
              onChange={(e) => setField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1 h-20 resize-none text-sm"
            />
          </div>
        );

      case "number":
        return (
          <div key={field.key}>
            <Label className="text-xs">{field.label}</Label>
            {field.description && (
              <p className="text-[10px] text-muted-foreground mb-1">{field.description}</p>
            )}
            <Input
              type="number"
              value={(value as string) || ""}
              onChange={(e) => setField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1 h-8 text-sm"
            />
          </div>
        );

      case "toggle":
        return (
          <div key={field.key} className="flex items-center justify-between py-1">
            <div>
              <Label className="text-xs">{field.label}</Label>
              {field.description && (
                <p className="text-[10px] text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Switch
              checked={!!value}
              onCheckedChange={(v) => setField(field.key, v)}
            />
          </div>
        );

      default: // text
        return (
          <div key={field.key}>
            <Label className="text-xs">{field.label}</Label>
            {field.description && (
              <p className="text-[10px] text-muted-foreground mb-1">{field.description}</p>
            )}
            <Input
              value={(value as string) || ""}
              onChange={(e) => setField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1 h-8 text-sm"
            />
          </div>
        );
    }
  };

  return (
    <div className="w-80 shrink-0 border-l border-border/30 bg-card/30 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg ${def.bg} ${def.color} flex items-center justify-center shrink-0`}>
            <def.icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{node.label}</p>
            <p className="text-[10px] text-muted-foreground">{def.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={save}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-7 h-7 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content — tabs for advanced nodes, direct config for standard nodes */}
      {isAdvanced ? (
        <Tabs defaultValue="code" className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-4 mt-3 mb-0">
            <TabsTrigger value="settings" className="gap-1.5 text-xs">
              <Settings2 className="w-3.5 h-3.5" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1.5 text-xs">
              <Code2 className="w-3.5 h-3.5" />
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="px-4 py-3 space-y-4 overflow-y-auto flex-1">
            <div>
              <Label className="text-xs">Node Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this node do?"
                className="mt-1 h-20 resize-none text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex flex-col flex-1 min-h-0 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-h-0 rounded-lg border border-border/30 overflow-hidden">
              <Suspense
                fallback={
                  <div className="p-4 text-xs text-muted-foreground">Loading editor...</div>
                }
              >
                <CodeEditor
                  value={code || lang.placeholder}
                  language={lang.extension}
                  onChange={(e) => setCode(e.target.value)}
                  padding={16}
                  data-color-mode="dark"
                    style={{
                    fontFamily: "ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace",
                    fontSize: 12,
                    lineHeight: 1.6,
                    backgroundColor: "hsl(var(--card))",
                    minHeight: "100%",
                    height: "100%",
                    overflow: "auto",
                  }}
                />
              </Suspense>
            </div>

            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
              Write custom logic for this node. The <code className="text-primary/80">run()</code> function
              receives input data from connected nodes and should return data for the next node.
            </p>
          </TabsContent>
        </Tabs>
      ) : (
        /* Standard node — visual config */
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Label */}
          <div>
            <Label className="text-xs">Node Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
          </div>

          {/* Node-specific fields */}
          {fields.length > 0 && (
            <>
              <div className="h-px bg-border/30" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Configuration
              </p>
              {fields.map(renderField)}
            </>
          )}

          {/* Description */}
          <div className="h-px bg-border/30" />
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this node"
              className="mt-1 h-16 resize-none text-sm"
            />
          </div>

          {/* Node info */}
          <div className="rounded-lg border border-border/20 bg-muted/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-5 h-5 rounded ${def.bg} ${def.color} flex items-center justify-center`}>
                <def.icon className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium text-foreground">{def.label}</span>
              <span className="text-[10px] text-muted-foreground ml-auto capitalize">{def.category}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Position: ({node.x}, {node.y})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowNodeConfig;
