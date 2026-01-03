import { useState, useMemo, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, GitBranch, Edit } from 'lucide-react';
import { Workflow } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkflows } from '@/hooks/useDataSync';

export function WorkflowsPage() {
  const { user } = useAuth();
  const { workflows, setWorkflows, deleteWorkflow, refetch } = useWorkflows();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  useEffect(() => {
    refetch();
  }, []);

  const activeWorkflows = useMemo(() => (workflows || []).filter(w => !w.deletedAt), [workflows]);
  const sortedWorkflows = useMemo(() => [...activeWorkflows].sort((a, b) => b.updatedAt - a.updatedAt), [activeWorkflows]);

  const createWorkflow = useCallback(() => {
    if (!newWorkflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }
    const newWorkflow: Workflow = {
      id: uuidv4(),
      name: newWorkflowName.trim(),
      data: { nodes: [], edges: [] },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      todos: [],
    };
    setWorkflows(current => [newWorkflow, ...(current || [])]);
    setNewWorkflowName('');
    setIsCreateOpen(false);
    toast.success('Workflow created');
  }, [newWorkflowName, setWorkflows]);

  const handleDelete = useCallback((id: string) => {
    deleteWorkflow(id);
    toast.success('Workflow deleted');
  }, [deleteWorkflow]);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="border-b px-6 py-4 bg-card/30 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Workflow
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {sortedWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">No workflows yet</h2>
              <p className="text-muted-foreground mb-4">Create your first workflow to get started</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create Workflow
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedWorkflows.map(workflow => (
                <div key={workflow.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold truncate">{workflow.name}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/workflows/${workflow.id}`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(workflow.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {workflow.data?.nodes?.length || 0} nodes • {workflow.data?.edges?.length || 0} connections
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Workflow name..."
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createWorkflow()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={createWorkflow}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
