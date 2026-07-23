import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { ArrowLeft, Save, Eye, Loader2, Undo2, Grid3x3, Package, Download, Monitor, Server, Workflow, Code2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ModulerComponentPalette from "./ModulerComponentPalette";
import ModulerCanvas from "./ModulerCanvas";
import type { CanvasComponent } from "./ModulerCanvas";
import ModulerPropertyPanel from "./ModulerPropertyPanel";
import type { ModulerComponentDef } from "./ModulerComponentPalette";
import type { FlowNode, FlowEdge } from "@/components/flow/FlowCanvas";
import FlowNodePalette from "@/components/flow/FlowNodePalette";
import FlowNodeConfig from "@/components/flow/FlowNodeConfig";
import SimpleFlowCanvas from "@/components/flow/SimpleFlowCanvas";

const CodeEditor = lazy(() => import("@uiw/react-textarea-code-editor"));

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ModulerModule {
  id: string;
  name: string;
  description: string;
  status: string;
  components: CanvasComponent[];
  flowNodes?: FlowNode[];
  flowEdges?: FlowEdge[];
  functions?: ModulerFunction[];
}

export interface ModulerFunction {
  id: string;
  name: string;
  language: string;
  code: string;
  description: string;
}

type BuilderMode = "frontend" | "backend";
type BackendTab = "flow" | "functions";

interface Props {
  module: ModulerModule;
  onBack: () => void;
  onSave: (mod: ModulerModule) => void;
}

/* ------------------------------------------------------------------ */
/*  Code templates                                                     */
/* ------------------------------------------------------------------ */

const LANGUAGES = [
  {
    value: "javascript",
    label: "JavaScript",
    extension: "js",
    placeholder: "// Module function\n\nasync function handler(moduleData, context) {\n  // Your logic here\n  return { success: true };\n}\n",
  },
  {
    value: "typescript",
    label: "TypeScript",
    extension: "ts",
    placeholder: "// Module function\n\nasync function handler(moduleData: any, context: any) {\n  // Your logic here\n  return { success: true };\n}\n",
  },
  {
    value: "python",
    label: "Python",
    extension: "py",
    placeholder: "# Module function\n\ndef handler(module_data, context):\n    # Your logic here\n    return {\"success\": True}\n",
  },
  {
    value: "lua",
    label: "Lua",
    extension: "lua",
    placeholder: "-- Module function\n\nfunction handler(module_data, context)\n    -- Your logic here\n    return { success = true }\nend\n",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const MAX_HISTORY = 30;

const ModulerBuilder = ({ module: initialModule, onBack, onSave }: Props) => {
  const { toast } = useToast();

  /* ---- Mode ---- */
  const [mode, setMode] = useState<BuilderMode>("frontend");
  const [backendTab, setBackendTab] = useState<BackendTab>("flow");

  /* ---- Frontend state ---- */
  const [components, setComponents] = useState<CanvasComponent[]>(initialModule.components || []);
  const [history, setHistory] = useState<CanvasComponent[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const selectedComponent = components.find((c) => c.id === selectedId) || null;

  /* ---- Backend: Flow state ---- */
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>(initialModule.flowNodes || []);
  const [flowEdges, setFlowEdges] = useState<FlowEdge[]>(initialModule.flowEdges || []);
  const [selectedFlowNodeId, setSelectedFlowNodeId] = useState<string | null>(null);
  const selectedFlowNode = flowNodes.find((n) => n.id === selectedFlowNodeId);

  /* ---- Backend: Functions state ---- */
  const [functions, setFunctions] = useState<ModulerFunction[]>(initialModule.functions || []);
  const [selectedFnId, setSelectedFnId] = useState<string | null>(null);
  const selectedFn = functions.find((f) => f.id === selectedFnId);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-MAX_HISTORY + 1), components]);
  }, [components]);

  /* ---- Frontend Handlers ---- */

  const handleAddComponent = useCallback((def: ModulerComponentDef) => {
    pushHistory();
    const newComp: CanvasComponent = { id: crypto.randomUUID(), type: def.type, props: { ...def.defaults } };
    setComponents((prev) => {
      if (selectedId) {
        const idx = prev.findIndex((c) => c.id === selectedId);
        if (idx !== -1) { const next = [...prev]; next.splice(idx + 1, 0, newComp); return next; }
      }
      return [...prev, newComp];
    });
    setSelectedId(newComp.id);
    setDirty(true);
  }, [pushHistory, selectedId]);

  const handleDeleteComponent = useCallback((id: string) => {
    pushHistory();
    setComponents((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDirty(true);
  }, [pushHistory, selectedId]);

  const handleDuplicateComponent = useCallback((id: string) => {
    pushHistory();
    setComponents((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const clone: CanvasComponent = { id: crypto.randomUUID(), type: prev[idx].type, props: { ...prev[idx].props } };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      setSelectedId(clone.id);
      return next;
    });
    setDirty(true);
  }, [pushHistory]);

  const handleReorder = useCallback((id: string, direction: "up" | "down") => {
    pushHistory();
    setComponents((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setDirty(true);
  }, [pushHistory]);

  const handleUpdateProps = useCallback((id: string, props: Record<string, unknown>) => {
    pushHistory();
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, props } : c)));
    setDirty(true);
  }, [pushHistory]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    setHistory((h) => h.slice(0, -1));
    setComponents(history[history.length - 1]);
    setSelectedId(null);
    setDirty(true);
  }, [history]);

  /* ---- Backend: Flow Handlers ---- */

  const handleFlowChange = useCallback((nodes: FlowNode[], edges: FlowEdge[]) => {
    setFlowNodes(nodes); setFlowEdges(edges); setDirty(true);
  }, []);

  const handleFlowNodeUpdate = useCallback((updatedNode: FlowNode) => {
    setFlowNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setDirty(true);
  }, []);

  const handleFlowNodeDelete = useCallback((nodeId: string) => {
    setFlowNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setFlowEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedFlowNodeId === nodeId) setSelectedFlowNodeId(null);
    setDirty(true);
  }, [selectedFlowNodeId]);

  /* ---- Backend: Functions Handlers ---- */

  const handleAddFunction = useCallback(() => {
    const newFn: ModulerFunction = { id: crypto.randomUUID(), name: `function_${functions.length + 1}`, language: "javascript", code: "", description: "" };
    setFunctions((prev) => [...prev, newFn]);
    setSelectedFnId(newFn.id);
    setDirty(true);
  }, [functions.length]);

  const handleUpdateFunction = useCallback((id: string, updates: Partial<ModulerFunction>) => {
    setFunctions((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    setDirty(true);
  }, []);

  const handleDeleteFunction = useCallback((id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
    if (selectedFnId === id) setSelectedFnId(null);
    setDirty(true);
  }, [selectedFnId]);

  /* ---- Save ---- */

  const handleSave = useCallback(() => {
    setSaving(true);
    onSave({ ...initialModule, components, flowNodes, flowEdges, functions });
    setDirty(false);
    setSaving(false);
    toast({ title: "Module saved", description: `"${initialModule.name}" has been saved.` });
  }, [components, flowNodes, flowEdges, functions, initialModule, onSave, toast]);

  const handleBack = useCallback(() => {
    if (dirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    onBack();
  }, [dirty, onBack]);

  /* ---- Package ---- */

  const [packageOpen, setPackageOpen] = useState(false);
  const [pkgVersion, setPkgVersion] = useState("1.0.0");
  const [pkgAuthor, setPkgAuthor] = useState("");
  const [pkgIcon, setPkgIcon] = useState("");
  const [pkgTags, setPkgTags] = useState("");
  const [pkgSidebarLabel, setPkgSidebarLabel] = useState(initialModule.name);
  const [pkgSidebarSlug, setPkgSidebarSlug] = useState(initialModule.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  const [packaging, setPackaging] = useState(false);

  const handlePackage = useCallback(async () => {
    if (dirty) { toast({ title: "Save first", description: "Please save your module before packaging.", variant: "destructive" }); return; }
    if (components.length === 0) { toast({ title: "Nothing to package", description: "Add at least one component.", variant: "destructive" }); return; }
    setPackaging(true);
    try {
      const manifest = {
        name: initialModule.name, description: initialModule.description || "", version: pkgVersion,
        author: pkgAuthor || undefined, icon: pkgIcon || undefined,
        tags: pkgTags ? pkgTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        sdk: "prism-space-sdk", type: "moduler-app",
        sidebar: { label: pkgSidebarLabel || initialModule.name, slug: pkgSidebarSlug || initialModule.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        entrypoint: "module.json",
      };
      const moduleData = {
        id: initialModule.id, name: initialModule.name, description: initialModule.description, components,
        flowNodes: flowNodes.length > 0 ? flowNodes : undefined, flowEdges: flowEdges.length > 0 ? flowEdges : undefined,
        functions: functions.length > 0 ? functions : undefined,
      };
      const linkedFlows: Record<string, unknown>[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        try {
          if (key.startsWith("flow_editor_") || key.startsWith("workspace_flow_")) {
            const flowData = JSON.parse(localStorage.getItem(key) || "{}");
            if ((flowData.nodes || []).some((n: { type?: string }) => n.type === "trigger_moduler" || n.type === "moduler_update")) linkedFlows.push(flowData);
          }
        } catch { /* skip */ }
      }
      const readme = [
        `# ${initialModule.name}`, "", initialModule.description || "", "",
        "## Installation", "", "1. Open your workspace's **Module Store**", "2. Click **Import from File**", "3. Select this `.prism-module.json` file", "",
        "## Contents", "", `- **${components.length}** UI component${components.length !== 1 ? "s" : ""}`,
        flowNodes.length > 0 ? `- **${flowNodes.length}** flow node${flowNodes.length !== 1 ? "s" : ""}` : "",
        functions.length > 0 ? `- **${functions.length}** function${functions.length !== 1 ? "s" : ""}` : "",
        "", "Packaged with Moduler for Hive SDK.",
      ].filter(Boolean).join("\n");
      const blob = new Blob([JSON.stringify({ manifest, module: moduleData, flows: linkedFlows.length > 0 ? linkedFlows : undefined, readme, _meta: { packaged_at: new Date().toISOString(), moduler_version: "1.0", sdk_version: "prism-space-sdk@latest" } }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${manifest.sidebar.slug}.prism-module.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast({ title: "Package downloaded", description: `"${initialModule.name}" has been packaged for the Hive Module Store.` });
      setPackageOpen(false);
    } catch (err) { toast({ title: "Packaging failed", description: String(err), variant: "destructive" }); }
    finally { setPackaging(false); }
  }, [dirty, components, flowNodes, flowEdges, functions, initialModule, pkgVersion, pkgAuthor, pkgIcon, pkgTags, pkgSidebarLabel, pkgSidebarSlug, toast]);

  /* ---- Keyboard shortcuts ---- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") { setSelectedId(null); setSelectedFlowNodeId(null); setSelectedFnId(null); }
      if ((e.key === "Delete" || e.key === "Backspace") && mode === "frontend" && selectedId) { e.preventDefault(); handleDeleteComponent(selectedId); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && mode === "frontend") { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); if (dirty) handleSave(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && mode === "frontend" && selectedId) { e.preventDefault(); handleDuplicateComponent(selectedId); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, selectedId, handleDeleteComponent, handleDuplicateComponent, handleUndo, handleSave, dirty]);

  /* ---- Render ---- */

  const langDef = selectedFn ? (LANGUAGES.find((l) => l.value === selectedFn.language) || LANGUAGES[0]) : LANGUAGES[0];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-card/50 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{initialModule.name}</h2>
                {dirty && <span className="text-[10px] text-amber-400 font-medium">Unsaved</span>}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {components.length} component{components.length !== 1 ? "s" : ""}
                {flowNodes.length > 0 && ` · ${flowNodes.length} node${flowNodes.length !== 1 ? "s" : ""}`}
                {functions.length > 0 && ` · ${functions.length} fn${functions.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-border/40 bg-muted/30 p-0.5 mr-2">
            <button onClick={() => { setMode("frontend"); setPreview(false); }} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all", mode === "frontend" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Monitor className="w-3.5 h-3.5" /> Frontend
            </button>
            <button onClick={() => { setMode("backend"); setPreview(false); }} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all", mode === "backend" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Server className="w-3.5 h-3.5" /> Backend
            </button>
          </div>
          {mode === "frontend" && (
            <>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleUndo} disabled={history.length === 0}><Undo2 className="w-3.5 h-3.5" /></Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setPreview((p) => !p)}><Eye className="w-3.5 h-3.5" /> {preview ? "Edit" : "Preview"}</Button>
            </>
          )}
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setPackageOpen(true)} disabled={components.length === 0}><Package className="w-3.5 h-3.5" /> Package</Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
          </Button>
        </div>
      </div>

      {/* ===== FRONTEND ===== */}
      {mode === "frontend" && (
        <div className="flex flex-1 overflow-hidden">
          {!preview && <ModulerComponentPalette onAddComponent={handleAddComponent} />}
          <ModulerCanvas components={components} selectedId={preview ? null : selectedId} onSelect={preview ? () => {} : setSelectedId} onDelete={handleDeleteComponent} onDuplicate={handleDuplicateComponent} onReorder={handleReorder} />
          {!preview && selectedComponent && <ModulerPropertyPanel component={selectedComponent} onUpdate={handleUpdateProps} onDelete={handleDeleteComponent} onDuplicate={handleDuplicateComponent} onClose={() => setSelectedId(null)} />}
        </div>
      )}

      {/* ===== BACKEND ===== */}
      {mode === "backend" && (
        <>
          {/* Sub-tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border/30 bg-card/20 shrink-0">
            <button onClick={() => setBackendTab("flow")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors", backendTab === "flow" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30")}>
              <Workflow className="w-3.5 h-3.5" /> Automations
              {flowNodes.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-[10px]">{flowNodes.length}</span>}
            </button>
            <button onClick={() => setBackendTab("functions")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors", backendTab === "functions" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30")}>
              <Code2 className="w-3.5 h-3.5" /> Functions
              {functions.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-[10px]">{functions.length}</span>}
            </button>
          </div>

          {/* ---- Flow tab ---- */}
          {backendTab === "flow" && (
            <div className="flex flex-1 overflow-hidden">
              <div className="w-64 border-r border-border/30 bg-card/50 overflow-y-auto shrink-0">
                <FlowNodePalette />
              </div>
              <div className="flex-1 overflow-hidden">
                <SimpleFlowCanvas nodes={flowNodes} edges={flowEdges} onChange={handleFlowChange} onSelectNode={setSelectedFlowNodeId} selectedNodeId={selectedFlowNodeId} />
              </div>
              {selectedFlowNode && (
                <div className="w-96 border-l border-border/30 bg-card/50 overflow-y-auto shrink-0">
                  <FlowNodeConfig node={selectedFlowNode} onUpdate={handleFlowNodeUpdate} onDelete={handleFlowNodeDelete} onClose={() => setSelectedFlowNodeId(null)} edges={flowEdges} allNodes={flowNodes} />
                </div>
              )}
            </div>
          )}

          {/* ---- Functions tab ---- */}
          {backendTab === "functions" && (
            <div className="flex flex-1 overflow-hidden">
              {/* Function list */}
              <div className="w-56 border-r border-border/30 bg-card/30 overflow-y-auto shrink-0">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Functions</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddFunction}><Plus className="w-3.5 h-3.5" /></Button>
                  </div>
                  {functions.length === 0 ? (
                    <div className="text-center py-8">
                      <Code2 className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-[11px] text-muted-foreground/50 mb-3">No functions yet</p>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={handleAddFunction}><Plus className="w-3 h-3" /> Add Function</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {functions.map((fn) => (
                        <button key={fn.id} onClick={() => setSelectedFnId(fn.id)} className={cn("flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors", selectedFnId === fn.id ? "bg-primary/10 border border-primary/30" : "border border-border/20 bg-card/50 hover:border-border/50 hover:bg-card")}>
                          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0"><Code2 className="w-3.5 h-3.5" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">{fn.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{fn.language}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Editor */}
              {selectedFn ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 shrink-0">
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Name</Label>
                        <Input value={selectedFn.name} onChange={(e) => handleUpdateFunction(selectedFn.id, { name: e.target.value })} className="h-7 text-xs w-48" placeholder="function_name" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Language</Label>
                        <Select value={selectedFn.language} onValueChange={(v) => handleUpdateFunction(selectedFn.id, { language: v })}>
                          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-[10px] text-muted-foreground">Description</Label>
                        <Input value={selectedFn.description} onChange={(e) => handleUpdateFunction(selectedFn.id, { description: e.target.value })} className="h-7 text-xs" placeholder="What does this function do?" />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteFunction(selectedFn.id)}>Delete</Button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <Suspense fallback={<div className="p-4 text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Loading editor...</div>}>
                      <CodeEditor value={selectedFn.code || langDef.placeholder} language={langDef.extension} onChange={(e) => handleUpdateFunction(selectedFn.id, { code: e.target.value })} padding={20} data-color-mode="dark" style={{ fontFamily: "ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace", fontSize: 13, lineHeight: 1.6, backgroundColor: "hsl(var(--card))", minHeight: "100%" }} />
                    </Suspense>
                  </div>
                  <div className="px-4 py-2 border-t border-border/30 bg-card/20 shrink-0">
                    <p className="text-[10px] text-muted-foreground">{"The handler() function receives module data and context. Use context.trigger to check which event invoked it."}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Code2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground/50 font-medium">Select a function to edit</p>
                    <p className="text-xs text-muted-foreground/30 mt-1">or create a new one from the sidebar</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== Package Dialog ===== */}
      <Dialog open={packageOpen} onOpenChange={setPackageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Package for Module Store</DialogTitle>
            <DialogDescription>Bundle your module into a Hive SDK package.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-border/30 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Module</span><span className="text-xs font-medium">{initialModule.name}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Components</span><span className="text-xs font-medium">{components.length}</span></div>
              {flowNodes.length > 0 && <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Flow Nodes</span><span className="text-xs font-medium">{flowNodes.length}</span></div>}
              {functions.length > 0 && <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Functions</span><span className="text-xs font-medium">{functions.length}</span></div>}
              {dirty && <p className="text-[10px] text-amber-500 pt-1">Save before packaging.</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Version</Label><Input value={pkgVersion} onChange={(e) => setPkgVersion(e.target.value)} placeholder="1.0.0" className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Author</Label><Input value={pkgAuthor} onChange={(e) => setPkgAuthor(e.target.value)} placeholder="Your name" className="h-8 text-xs mt-1" /></div>
            </div>
            <div><Label className="text-xs">Icon URL (optional)</Label><Input value={pkgIcon} onChange={(e) => setPkgIcon(e.target.value)} placeholder="https://example.com/icon.png" className="h-8 text-xs mt-1" /></div>
            <div><Label className="text-xs">Tags (comma-separated)</Label><Input value={pkgTags} onChange={(e) => setPkgTags(e.target.value)} placeholder="dashboard, staff" className="h-8 text-xs mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Sidebar Label</Label><Input value={pkgSidebarLabel} onChange={(e) => setPkgSidebarLabel(e.target.value)} className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Sidebar Slug</Label><Input value={pkgSidebarSlug} onChange={(e) => setPkgSidebarSlug(e.target.value)} className="h-8 text-xs mt-1" /></div>
            </div>
            <Button onClick={handlePackage} disabled={packaging || dirty} className="w-full gap-2">
              {packaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download Package
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModulerBuilder;
