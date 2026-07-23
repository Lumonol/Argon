import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, GripVertical, AlertCircle, Coins, Clock, User as UserIcon } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type TaskStatus = "Concept" | "Modeling" | "Texturing" | "Implementing" | "Paid";
const STATUSES: TaskStatus[] = ["Concept", "Modeling", "Texturing", "Implementing", "Paid"];

interface ContractorTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee_id: string | null;
  bounty_robux: number;
  created_at: string;
}

const ContractorTrackerApp = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<ContractorTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Task Form State
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskRobux, setNewTaskRobux] = useState("0");
  
  // Staff List for Assignment
  const [staff, setStaff] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    
    const fetchTasksAndStaff = async () => {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("contractor_tasks")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
        
      if (!tasksError && tasksData) setTasks(tasksData as ContractorTask[]);
      
      // Fetch staff (simplified for now to just profiles in workspace)
      const { data: staffData } = await supabase
        .from("workspace_user_roles")
        .select("user_id, profiles(display_name, roblox_username)")
        .eq("workspace_id", workspaceId);
        
      if (staffData) {
        const staffMap = new Map();
        staffData.forEach((s: any) => {
          if (s.profiles && !staffMap.has(s.user_id)) {
            staffMap.set(s.user_id, {
              id: s.user_id,
              name: s.profiles.display_name || s.profiles.roblox_username || "Unknown"
            });
          }
        });
        setStaff(Array.from(staffMap.values()));
      }
      
      setLoading(false);
    };
    
    fetchTasksAndStaff();
    
    const channel = supabase.channel("contractor_tasks_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "contractor_tasks", filter: `workspace_id=eq.${workspaceId}` }, (payload) => {
        if (payload.eventType === "INSERT") {
          setTasks(prev => [payload.new as ContractorTask, ...prev]);
        } else if (payload.eventType === "UPDATE") {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as ContractorTask : t));
        } else if (payload.eventType === "DELETE") {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  const handleCreateTask = async () => {
    if (!workspaceId || !newTaskTitle.trim()) return;
    
    const { error } = await supabase.from("contractor_tasks").insert({
      workspace_id: workspaceId,
      title: newTaskTitle,
      description: newTaskDesc,
      bounty_robux: parseInt(newTaskRobux) || 0,
      status: "Concept"
    });
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created successfully" });
      setIsNewTaskOpen(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskRobux("0");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceStatus = result.source.droppableId as TaskStatus;
    const destStatus = result.destination.droppableId as TaskStatus;
    const taskId = result.draggableId;
    
    if (sourceStatus === destStatus) return;
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: destStatus } : t));
    
    const { error } = await supabase
      .from("contractor_tasks")
      .update({ status: destStatus })
      .eq("id", taskId);
      
    if (error) {
      toast({ title: "Error moving task", description: error.message, variant: "destructive" });
      // Revert optimism if failed (simplified: just rely on realtime to fix it soon)
    }
  };

  const getAssigneeName = (id: string | null) => {
    if (!id) return "Unassigned";
    return staff.find(s => s.id === id)?.name || "Unknown";
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contractor Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage game asset pipelines and bounties.</p>
        </div>
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="e.g. Cyberpunk Hovercar Model" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Asset requirements..." />
              </div>
              <div className="space-y-2">
                <Label>Bounty (R$)</Label>
                <Input type="number" value={newTaskRobux} onChange={e => setNewTaskRobux(e.target.value)} placeholder="5000" />
              </div>
              <Button onClick={handleCreateTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STATUSES.map(status => (
            <div key={status} className="flex flex-col bg-muted/30 rounded-xl border border-border/50 p-3 min-w-[280px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  {status}
                  <Badge variant="secondary" className="text-xs bg-background/50">
                    {tasks.filter(t => t.status === status).length}
                  </Badge>
                </h3>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 min-h-[200px] transition-colors rounded-lg",
                      snapshot.isDraggingOver ? "bg-muted/50" : ""
                    )}
                  >
                    {tasks.filter(t => t.status === status).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "mb-3 border border-border/50 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all",
                              snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20 rotate-2" : ""
                            )}
                          >
                            <CardContent className="p-3">
                              <p className="font-medium text-sm mb-1">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-500">
                                  <Coins className="w-3.5 h-3.5" />
                                  {task.bounty_robux.toLocaleString()}
                                </div>
                                <div onClick={(e) => e.stopPropagation()} className="w-[120px]">
                                  <Select 
                                    value={task.assignee_id || "unassigned"} 
                                    onValueChange={async (val) => {
                                      const newAssignee = val === "unassigned" ? null : val;
                                      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, assignee_id: newAssignee } : t));
                                      await supabase.from("contractor_tasks").update({ assignee_id: newAssignee }).eq("id", task.id);
                                    }}
                                  >
                                    <SelectTrigger className="h-6 text-xs bg-secondary/30 border-0">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <UserIcon className="w-3 h-3 flex-shrink-0" />
                                        <SelectValue placeholder="Assignee" />
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">Unassigned</SelectItem>
                                      {staff.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ContractorTrackerApp;
