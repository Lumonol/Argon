import { useState, useEffect } from "react";
import { useSentinel } from "@/hooks/useSentinel";
import type { SentinelSettings as SentinelSettingsType } from "@/hooks/useSentinel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { IconPicker, getIconByValue } from "@/components/sentinel/IconPicker";
import {
  Loader2, Save, ScrollText, StickyNote, Plus, Trash2, Pencil, X,
} from "lucide-react";

interface SentinelSettingsProps {
  workspaceId: string;
}

type Rule = { id: string; title: string; description: string };
type Note = { id: string; content: string };

type CustomFilter = {
  id: string;
  label: string;
  description: string;
  icon: string;
  mode: string;
  action: string;
  rules: string;
};

type FilterConfig = {
  disabled_defaults: string[];
  custom_filters: CustomFilter[];
};

const PRESET_FILTERS: Omit<CustomFilter, "id">[] = [
  {
    label: "AFK Detection",
    description: "Detect players who are idle or away from keyboard",
    icon: "clock",
    mode: "approval",
    action: "kick",
    rules: "Flag players who are standing still with no input for more than 10 minutes.",
  },
  {
    label: "Spam Detection",
    description: "Catch message spam and chat flooding",
    icon: "messages-square",
    mode: "auto",
    action: "warn",
    rules: "Flag players who send the same or similar message more than 3 times in quick succession, or flood the chat with excessive messages.",
  },
  {
    label: "Impersonation",
    description: "Detect players impersonating staff or others",
    icon: "user-x",
    mode: "approval",
    action: "ban",
    rules: "Flag players whose usernames or display names closely resemble staff members or use misleading titles like 'Admin' or 'Moderator'.",
  },
  {
    label: "Team Killing",
    description: "Detect intentional friendly-fire or griefing",
    icon: "sword",
    mode: "approval",
    action: "warn",
    rules: "Flag players who repeatedly attack, damage, or sabotage teammates.",
  },
  {
    label: "Scam Detection",
    description: "Catch phishing links and trade scams",
    icon: "shield-alert",
    mode: "auto",
    action: "ban",
    rules: "Flag messages containing suspicious links, phishing attempts, fake giveaways, or trade scam patterns.",
  },
  {
    label: "Glitch Abuse",
    description: "Detect players abusing map glitches",
    icon: "bug",
    mode: "approval",
    action: "kick",
    rules: "Flag players who are in out-of-bounds areas, clipping through walls, or exploiting known map glitches.",
  },
  {
    label: "Inappropriate Names",
    description: "Flag offensive usernames and display names",
    icon: "ban",
    mode: "approval",
    action: "kick",
    rules: "Flag players with usernames or display names that contain profanity, slurs, sexual content, or other inappropriate language.",
  },
  {
    label: "Bot Detection",
    description: "Identify automated or bot accounts",
    icon: "bot",
    mode: "approval",
    action: "ban",
    rules: "Flag accounts that show bot-like behavior: repetitive automated actions, unrealistically fast inputs, or suspicious account patterns.",
  },
];

const STRICTNESS_LEVELS = [
  { value: 0, label: "Low", threshold: 0.90, description: "Only flag clear, obvious violations. Minimal false positives." },
  { value: 1, label: "Medium", threshold: 0.75, description: "Balanced detection. Flags likely violations with reasonable confidence." },
  { value: 2, label: "High", threshold: 0.50, description: "Aggressive detection. Flags suspicious activity for review." },
  { value: 3, label: "Max", threshold: 0.25, description: "Extreme sensitivity. All potential issues will trigger alerts." },
];

function getStrictnessFromThreshold(threshold: number): number {
  if (threshold >= 0.85) return 0;
  if (threshold >= 0.60) return 1;
  if (threshold >= 0.35) return 2;
  return 3;
}

function parseFilterConfig(raw: string | undefined | null): FilterConfig {
  if (!raw) return { disabled_defaults: [], custom_filters: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      disabled_defaults: Array.isArray(parsed.disabled_defaults) ? parsed.disabled_defaults : [],
      custom_filters: Array.isArray(parsed.custom_filters) ? parsed.custom_filters : [],
    };
  } catch {
    return { disabled_defaults: [], custom_filters: [] };
  }
}

const DEFAULT_CATEGORIES = [
  { key: "avatar", label: "Avatar Detection", description: "Flag unrealistic avatar appearances and usernames", icon: "eye" },
  { key: "chat", label: "Chat Filtering", description: "Detect toxic messages, spam, and scams", icon: "message-square" },
  { key: "exploit", label: "Exploit Detection", description: "Catch speed hacks, teleportation, and more", icon: "zap" },
];

const SentinelSettings = ({ workspaceId }: SentinelSettingsProps) => {
  const { getSettings, updateSettings } = useSentinel(workspaceId);
  const { toast } = useToast();
  const [settings, setSettings] = useState<SentinelSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Rules modal state
  const [rulesOpen, setRulesOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");

  // Notes modal state
  const [notesOpen, setNotesOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");

  // Custom filter dialog state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterDialogStep, setFilterDialogStep] = useState<"choose" | "form">("choose");
  const [editingFilter, setEditingFilter] = useState<CustomFilter | null>(null);
  const [filterForm, setFilterForm] = useState({
    label: "",
    description: "",
    icon: "shield",
    mode: "approval" as string,
    action: "warn" as string,
    rules: "",
  });
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getSettings();
        setSettings(result.settings);
      } catch {
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const result = await updateSettings(settings);
      setSettings(result.settings);
      toast({ title: "Saved", description: "Sentinel settings updated" });
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateField = (field: string, value: unknown) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const rules: Rule[] = Array.isArray(settings.rules) ? settings.rules : [];
  const notes: Note[] = Array.isArray(settings.notes) ? settings.notes : [];
  const filterConfig = parseFilterConfig(settings.custom_rules);

  const updateFilterConfig = (newConfig: FilterConfig) => {
    updateField("custom_rules", JSON.stringify(newConfig));
  };

  // Default category helpers
  const removeDefaultCategory = (key: string) => {
    const updated = { ...filterConfig, disabled_defaults: [...filterConfig.disabled_defaults, key] };
    updateField(`${key}_mode`, "off");
    updateFilterConfig(updated);
  };

  const restoreDefaultCategory = (key: string) => {
    const updated = { ...filterConfig, disabled_defaults: filterConfig.disabled_defaults.filter(k => k !== key) };
    updateFilterConfig(updated);
  };

  const activeDefaults = DEFAULT_CATEGORIES.filter(c => !filterConfig.disabled_defaults.includes(c.key));
  const removedDefaults = DEFAULT_CATEGORIES.filter(c => filterConfig.disabled_defaults.includes(c.key));

  // Custom filter helpers
  const openNewFilterDialog = () => {
    setEditingFilter(null);
    setFilterForm({ label: "", description: "", icon: "shield", mode: "approval", action: "warn", rules: "" });
    setFilterDialogStep("choose");
    setFilterDialogOpen(true);
  };

  const selectPreset = (preset: Omit<CustomFilter, "id">) => {
    setFilterForm({
      label: preset.label,
      description: preset.description,
      icon: preset.icon,
      mode: preset.mode,
      action: preset.action,
      rules: preset.rules,
    });
    setFilterDialogStep("form");
  };

  const openEditFilterDialog = (filter: CustomFilter) => {
    setEditingFilter(filter);
    setFilterForm({
      label: filter.label,
      description: filter.description,
      icon: filter.icon,
      mode: filter.mode,
      action: filter.action,
      rules: filter.rules,
    });
    setFilterDialogStep("form");
    setFilterDialogOpen(true);
  };

  const saveFilter = () => {
    if (!filterForm.label.trim()) return;
    if (editingFilter) {
      const updated = filterConfig.custom_filters.map(f =>
        f.id === editingFilter.id ? { ...f, ...filterForm, label: filterForm.label.trim(), description: filterForm.description.trim(), rules: filterForm.rules.trim() } : f
      );
      updateFilterConfig({ ...filterConfig, custom_filters: updated });
    } else {
      const newFilter: CustomFilter = {
        id: crypto.randomUUID(),
        ...filterForm,
        label: filterForm.label.trim(),
        description: filterForm.description.trim(),
        rules: filterForm.rules.trim(),
      };
      updateFilterConfig({ ...filterConfig, custom_filters: [...filterConfig.custom_filters, newFilter] });
    }
    setFilterDialogOpen(false);
  };

  const deleteCustomFilter = (id: string) => {
    updateFilterConfig({ ...filterConfig, custom_filters: filterConfig.custom_filters.filter(f => f.id !== id) });
  };

  // Rule helpers
  const addRule = () => {
    if (!ruleTitle.trim()) return;
    const newRule: Rule = { id: crypto.randomUUID(), title: ruleTitle.trim(), description: ruleDesc.trim() };
    updateField("rules", [...rules, newRule]);
    setRuleTitle("");
    setRuleDesc("");
  };
  const updateRule = () => {
    if (!editingRule || !ruleTitle.trim()) return;
    updateField("rules", rules.map(r => r.id === editingRule.id ? { ...r, title: ruleTitle.trim(), description: ruleDesc.trim() } : r));
    setEditingRule(null);
    setRuleTitle("");
    setRuleDesc("");
  };
  const deleteRule = (id: string) => {
    updateField("rules", rules.filter(r => r.id !== id));
  };

  // Note helpers
  const addNote = () => {
    if (!noteContent.trim()) return;
    const newNote: Note = { id: crypto.randomUUID(), content: noteContent.trim() };
    updateField("notes", [...notes, newNote]);
    setNoteContent("");
  };
  const updateNote = () => {
    if (!editingNote || !noteContent.trim()) return;
    updateField("notes", notes.map(n => n.id === editingNote.id ? { ...n, content: noteContent.trim() } : n));
    setEditingNote(null);
    setNoteContent("");
  };
  const deleteNote = (id: string) => {
    updateField("notes", notes.filter(n => n.id !== id));
  };

  const strictness = getStrictnessFromThreshold(Number(settings.confidence_threshold));
  const currentLevel = STRICTNESS_LEVELS[strictness];

  const SelectedFilterIcon = getIconByValue(filterForm.icon);

  // Filter out presets that are already added
  const existingLabels = new Set(filterConfig.custom_filters.map(f => f.label));
  const availablePresets = PRESET_FILTERS.filter(p => !existingLabels.has(p.label));

  return (
    <div className="space-y-6">
      {/* ── Configuration ── */}
      <Card className="border-border/30 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Configuration</CardTitle>
              <CardDescription>Configure Sentinel AI moderation for your game</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={openNewFilterDialog}>
              <Plus className="w-3.5 h-3.5" />
              Add Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable/Disable Sentinel</p>
              <p className="text-xs text-muted-foreground">Toggle AI moderation for your game</p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateField("enabled", checked)}
            />
          </div>

          <div className="border-t border-border/20 pt-4 space-y-4">
            {/* Default categories */}
            {activeDefaults.map(({ key, label, description, icon }) => {
              const modeKey = `${key}_mode` as keyof SentinelSettingsType;
              const actionKey = `${key}_action` as keyof SentinelSettingsType;
              const IconComp = getIconByValue(icon);
              return (
                <div key={key} className="space-y-3 group">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => removeDefaultCategory(key)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-9">
                    <div className="space-y-1">
                      <Label className="text-xs">Mode</Label>
                      <Select value={settings[modeKey] as string} onValueChange={(v) => updateField(modeKey, v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">Off</SelectItem>
                          <SelectItem value="approval">Approval Required</SelectItem>
                          <SelectItem value="auto">Auto-Punish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Default Action</Label>
                      <Select value={settings[actionKey] as string} onValueChange={(v) => updateField(actionKey, v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warn">Warn</SelectItem>
                          <SelectItem value="kick">Kick</SelectItem>
                          <SelectItem value="ban">Ban</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Custom filters */}
            {filterConfig.custom_filters.map((filter) => {
              const IconComp = getIconByValue(filter.icon);
              return (
                <div key={filter.id} className="space-y-3 group">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{filter.label}</p>
                      <p className="text-xs text-muted-foreground">{filter.description}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => openEditFilterDialog(filter)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteCustomFilter(filter.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-9">
                    <div className="space-y-1">
                      <Label className="text-xs">Mode</Label>
                      <Select
                        value={filter.mode}
                        onValueChange={(v) => {
                          const updated = filterConfig.custom_filters.map(f => f.id === filter.id ? { ...f, mode: v } : f);
                          updateFilterConfig({ ...filterConfig, custom_filters: updated });
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">Off</SelectItem>
                          <SelectItem value="approval">Approval Required</SelectItem>
                          <SelectItem value="auto">Auto-Punish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Default Action</Label>
                      <Select
                        value={filter.action}
                        onValueChange={(v) => {
                          const updated = filterConfig.custom_filters.map(f => f.id === filter.id ? { ...f, action: v } : f);
                          updateFilterConfig({ ...filterConfig, custom_filters: updated });
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warn">Warn</SelectItem>
                          <SelectItem value="kick">Kick</SelectItem>
                          <SelectItem value="ban">Ban</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {filter.rules && (
                    <p className="text-xs text-muted-foreground pl-9 italic">Rules: {filter.rules}</p>
                  )}
                </div>
              );
            })}
          </div>

        </CardContent>
      </Card>

      {/* ── Rules & Notes ── */}
      <Card className="border-border/30 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Rules & Notes</CardTitle>
          <CardDescription>Manage custom rules and notes for Sentinel to learn from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium">Server Rules</p>
              <p className="text-xs text-muted-foreground mb-3">Create rules for Sentinel to learn & operate on</p>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => { setRulesOpen(true); setEditingRule(null); setRuleTitle(""); setRuleDesc(""); }}
              >
                <ScrollText className="w-4 h-4" />
                Manage Server Rules ({rules.length})
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium">Sentinel Notes</p>
              <p className="text-xs text-muted-foreground mb-3">Create notes for Sentinel to reference</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => { setNotesOpen(true); setEditingNote(null); setNoteContent(""); }}
              >
                <StickyNote className="w-4 h-4" />
                Manage Notes ({notes.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Strictness Level ── */}
      <Card className="border-border/30 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Strictness Level</CardTitle>
          <CardDescription>Configure how strict Sentinel should be when monitoring your game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative pt-2 pb-1">
              <Slider
                value={[strictness]}
                onValueChange={([v]) => {
                  const level = STRICTNESS_LEVELS[v];
                  if (level) updateField("confidence_threshold", level.threshold);
                }}
                min={0}
                max={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                {STRICTNESS_LEVELS.map((level) => (
                  <span
                    key={level.value}
                    className={`text-xs ${strictness === level.value ? "text-primary font-semibold" : "text-muted-foreground"}`}
                  >
                    {level.label}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Current level: <span className="font-semibold text-foreground">{currentLevel.label}</span> — {currentLevel.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Save Button ── */}
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </Button>

      {/* ── Add/Edit Custom Filter Dialog ── */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          {filterDialogStep === "choose" && !editingFilter ? (
            <>
              <div className="p-6 pb-4">
                <DialogHeader>
                  <DialogTitle>Add a filter</DialogTitle>
                  <DialogDescription>
                    Choose a preset or create a custom filter from scratch.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-6 pb-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 px-4"
                  onClick={() => {
                    setFilterForm({ label: "", description: "", icon: "shield", mode: "approval", action: "warn", rules: "" });
                    setFilterDialogStep("form");
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Custom Filter</p>
                    <p className="text-xs text-muted-foreground">Build your own detection filter from scratch</p>
                  </div>
                </Button>
              </div>

              {removedDefaults.length > 0 && (
                <div className="px-6 pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Defaults</p>
                  <div className="space-y-1.5">
                    {removedDefaults.map(({ key, label, description, icon }) => {
                      const DefaultIcon = getIconByValue(icon);
                      return (
                        <button
                          key={key}
                          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                          onClick={() => { restoreDefaultCategory(key); setFilterDialogOpen(false); }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <DefaultIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground truncate">{description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availablePresets.length > 0 && (
                <div className="px-6 pt-2 pb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Presets</p>
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                    {availablePresets.map((preset) => {
                      const PresetIcon = getIconByValue(preset.icon);
                      return (
                        <button
                          key={preset.label}
                          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                          onClick={() => selectPreset(preset)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <PresetIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{preset.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-6 pb-4">
                <DialogHeader>
                  <DialogTitle>{editingFilter ? "Edit Filter" : "Create Filter"}</DialogTitle>
                  <DialogDescription>
                    Configure the filter's detection rules. Sentinel AI will use these to flag matching incidents.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-6 pb-6 space-y-4">
                {/* Icon + Name row */}
                <div className="flex gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Icon</Label>
                    <Button
                      variant="outline"
                      className="h-10 w-10 p-0"
                      onClick={() => setIconPickerOpen(true)}
                    >
                      <SelectedFilterIcon className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      placeholder="e.g. AFK Detection"
                      value={filterForm.label}
                      onChange={(e) => setFilterForm(f => ({ ...f, label: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    placeholder="e.g. Detect players who are idle"
                    value={filterForm.description}
                    onChange={(e) => setFilterForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                {/* Mode + Action */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Mode</Label>
                    <Select value={filterForm.mode} onValueChange={(v) => setFilterForm(f => ({ ...f, mode: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Off</SelectItem>
                        <SelectItem value="approval">Approval Required</SelectItem>
                        <SelectItem value="auto">Auto-Punish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Default Action</Label>
                    <Select value={filterForm.action} onValueChange={(v) => setFilterForm(f => ({ ...f, action: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warn">Warn</SelectItem>
                        <SelectItem value="kick">Kick</SelectItem>
                        <SelectItem value="ban">Ban</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rules */}
                <div className="space-y-1">
                  <Label className="text-xs">Rules</Label>
                  <Textarea
                    placeholder="Describe what this filter should detect..."
                    value={filterForm.rules}
                    onChange={(e) => setFilterForm(f => ({ ...f, rules: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {!editingFilter && (
                    <Button variant="ghost" size="sm" onClick={() => setFilterDialogStep("choose")}>
                      Back
                    </Button>
                  )}
                  <div className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => setFilterDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={!filterForm.label.trim()}
                    onClick={saveFilter}
                  >
                    {editingFilter ? "Save Changes" : "Create Filter"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Icon Picker Dialog */}
      <IconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        value={filterForm.icon}
        onSelect={(v) => setFilterForm(f => ({ ...f, icon: v }))}
      />

      {/* ── Rules Dialog ── */}
      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Server Rules</DialogTitle>
            <DialogDescription>
              Rules tell Sentinel what to enforce. These are injected into the AI and take priority over defaults.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {rules.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No rules yet. Add one below.</p>
            )}
            {rules.map((rule) => (
              <div key={rule.id} className="border border-border/30 rounded-lg p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rule.title}</p>
                    {rule.description && <p className="text-xs text-muted-foreground">{rule.description}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditingRule(rule); setRuleTitle(rule.title); setRuleDesc(rule.description); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/20 pt-4 space-y-3">
            <p className="text-sm font-medium">{editingRule ? "Edit Rule" : "Add Rule"}</p>
            <Input
              placeholder="Rule title (e.g. No swearing)"
              value={ruleTitle}
              onChange={(e) => setRuleTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description (e.g. Players must not use any profanity, including mild swear words)"
              value={ruleDesc}
              onChange={(e) => setRuleDesc(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1"
                disabled={!ruleTitle.trim()}
                onClick={editingRule ? updateRule : addRule}
              >
                {editingRule ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {editingRule ? "Update Rule" : "Add Rule"}
              </Button>
              {editingRule && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditingRule(null); setRuleTitle(""); setRuleDesc(""); }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Notes Dialog ── */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sentinel Notes</DialogTitle>
            <DialogDescription>
              Notes give Sentinel extra context about your game. Use them to describe your game type, player base, or special situations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Add one below.</p>
            )}
            {notes.map((note) => (
              <div key={note.id} className="border border-border/30 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm flex-1 min-w-0">{note.content}</p>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditingNote(note); setNoteContent(note.content); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/20 pt-4 space-y-3">
            <p className="text-sm font-medium">{editingNote ? "Edit Note" : "Add Note"}</p>
            <Textarea
              placeholder="e.g. This is a family-friendly roleplay game. Our player base is mostly under 13, so be extra strict with any inappropriate content."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1"
                disabled={!noteContent.trim()}
                onClick={editingNote ? updateNote : addNote}
              >
                {editingNote ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {editingNote ? "Update Note" : "Add Note"}
              </Button>
              {editingNote && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditingNote(null); setNoteContent(""); }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SentinelSettings;
