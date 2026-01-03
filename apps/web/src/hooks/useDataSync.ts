import { useEffect, useCallback, useState, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/apiClient';
import { Note, Todo, TodoGroup, Workflow } from '@/lib/types';
import { toast } from 'sonner';

type DataMode = 'local' | 'remote';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotesState] = useState<Note[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const dataMode: DataMode = user ? 'remote' : 'local';

  const loadLocalNotes = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const stored = localStorage.getItem('notes');
      setNotesState(stored ? JSON.parse(stored) : []);
    } catch {
      setNotesState([]);
    }
    setHasLoaded(true);
    isLoadingRef.current = false;
  }, []);

  const loadRemoteNotes = useCallback(async () => {
    if (!user || isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const data = await apiClient.getNotes(user.id);
      setNotesState(
        (data || []).map((note: any) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: new Date(note.created_at).getTime(),
          updatedAt: new Date(note.updated_at).getTime(),
          deletedAt: note.deleted_at ? new Date(note.deleted_at).getTime() : undefined,
          attachments: [],
        }))
      );
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setHasLoaded(true);
      isLoadingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (hasLoaded) return;
    if (dataMode === 'local') loadLocalNotes();
    else loadRemoteNotes();
  }, [dataMode, hasLoaded, loadLocalNotes, loadRemoteNotes]);

  const setNotes = useCallback(async (notesOrUpdater: Note[] | ((prev: Note[]) => Note[])) => {
    const nextNotes = typeof notesOrUpdater === 'function' ? notesOrUpdater(notes) : notesOrUpdater;
    setNotesState(nextNotes);

    if (dataMode === 'local') {
      localStorage.setItem('notes', JSON.stringify(nextNotes));
    } else if (user) {
      try {
        const changed = nextNotes.filter(n => {
          const prev = notes.find(p => p.id === n.id);
          return !prev || prev.title !== n.title || prev.content !== n.content;
        });
        if (changed.length > 0) {
          await apiClient.batchUpsertNotes(user.id, changed.map(n => ({
            id: n.id, title: n.title, content: n.content,
            created_at: new Date(n.createdAt).toISOString(),
            updated_at: new Date(n.updatedAt).toISOString(),
            deleted_at: n.deletedAt ? new Date(n.deletedAt).toISOString() : null,
          })));
        }
        const deleted = notes.filter(p => !nextNotes.some(n => n.id === p.id));
        for (const d of deleted) await apiClient.deleteNote(user.id, d.id);
      } catch {
        toast.error('Failed to save notes');
      }
    }
  }, [notes, dataMode, user]);

  return { notes, setNotes, dataMode, refetch: dataMode === 'local' ? loadLocalNotes : loadRemoteNotes };
}

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodosState] = useState<Todo[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const dataMode: DataMode = user ? 'remote' : 'local';

  const loadLocalTodos = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const stored = localStorage.getItem('todos');
      setTodosState(stored ? JSON.parse(stored) : []);
    } catch {
      setTodosState([]);
    }
    setHasLoaded(true);
    isLoadingRef.current = false;
  }, []);

  const loadRemoteTodos = useCallback(async () => {
    if (!user || isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const data = await apiClient.getTodos(user.id);
      setTodosState(
        (data || []).map((t: any) => ({
          id: t.id, title: t.title, completed: t.completed,
          createdAt: new Date(t.created_at).getTime(),
          updatedAt: new Date(t.updated_at).getTime(),
          deletedAt: t.deleted_at ? new Date(t.deleted_at).getTime() : undefined,
          linkedNoteIds: [], groupIds: t.group_ids || [], tags: t.tags || [],
          dueDate: t.due_date ? new Date(t.due_date).getTime() : undefined,
        }))
      );
    } catch {
      toast.error('Failed to load todos');
    } finally {
      setHasLoaded(true);
      isLoadingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (hasLoaded) return;
    if (dataMode === 'local') loadLocalTodos();
    else loadRemoteTodos();
  }, [dataMode, hasLoaded, loadLocalTodos, loadRemoteTodos]);

  const setTodos = useCallback(async (todosOrUpdater: Todo[] | ((prev: Todo[]) => Todo[])) => {
    const nextTodos = typeof todosOrUpdater === 'function' ? todosOrUpdater(todos) : todosOrUpdater;
    setTodosState(nextTodos);

    if (dataMode === 'local') {
      localStorage.setItem('todos', JSON.stringify(nextTodos));
    } else if (user) {
      try {
        const changed = nextTodos.filter(t => {
          const prev = todos.find(p => p.id === t.id);
          return !prev || prev.title !== t.title || prev.completed !== t.completed;
        });
        if (changed.length > 0) {
          await apiClient.batchUpsertTodos(user.id, changed.map(t => ({
            id: t.id, title: t.title, completed: t.completed,
            group_ids: t.groupIds || [], tags: t.tags || [],
            due_date: t.dueDate ? new Date(t.dueDate).toISOString() : null,
            created_at: new Date(t.createdAt).toISOString(),
            updated_at: new Date(t.updatedAt).toISOString(),
            deleted_at: t.deletedAt ? new Date(t.deletedAt).toISOString() : null,
          })));
        }
        const deleted = todos.filter(p => !nextTodos.some(t => t.id === p.id));
        for (const d of deleted) await apiClient.deleteTodo(user.id, d.id);
      } catch {
        toast.error('Failed to save todos');
      }
    }
  }, [todos, dataMode, user]);

  return { todos, setTodos, dataMode, refetch: dataMode === 'local' ? loadLocalTodos : loadRemoteTodos };
}

export function useTodoGroups() {
  const { user } = useAuth();
  const [groups, setGroupsState] = useState<TodoGroup[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const dataMode: DataMode = user ? 'remote' : 'local';

  const loadLocal = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const stored = localStorage.getItem('todo-groups');
      setGroupsState(stored ? JSON.parse(stored) : []);
    } catch {
      setGroupsState([]);
    }
    setHasLoaded(true);
    isLoadingRef.current = false;
  }, []);

  const loadRemote = useCallback(async () => {
    if (!user || isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const data = await apiClient.getTodoGroups(user.id);
      setGroupsState(
        (data || []).map((g: any) => ({
          id: g.id, name: g.name, color: g.color,
          createdAt: new Date(g.created_at).getTime(),
          isDefault: !!g.is_default,
        }))
      );
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setHasLoaded(true);
      isLoadingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (hasLoaded) return;
    if (dataMode === 'local') loadLocal();
    else loadRemote();
  }, [dataMode, hasLoaded, loadLocal, loadRemote]);

  const setGroups = useCallback(async (groupsOrUpdater: TodoGroup[] | ((prev: TodoGroup[]) => TodoGroup[])) => {
    const nextGroups = typeof groupsOrUpdater === 'function' ? groupsOrUpdater(groups) : groupsOrUpdater;
    setGroupsState(nextGroups);

    if (dataMode === 'local') {
      localStorage.setItem('todo-groups', JSON.stringify(nextGroups));
    } else if (user) {
      try {
        await apiClient.batchUpsertTodoGroups(user.id, nextGroups.map(g => ({
          id: g.id, name: g.name, color: g.color,
          is_default: !!g.isDefault,
          created_at: new Date(g.createdAt).toISOString(),
        })));
      } catch {
        toast.error('Failed to save groups');
      }
    }
  }, [groups, dataMode, user]);

  return { groups, setGroups, dataMode, refetch: dataMode === 'local' ? loadLocal : loadRemote };
}

export function useWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflowsState] = useState<Workflow[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const dataMode: DataMode = user ? 'remote' : 'local';

  const loadLocal = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const stored = localStorage.getItem('workflows-list');
      const summaries = stored ? JSON.parse(stored) : [];
      const full: Workflow[] = summaries.map((s: any) => {
        const data = localStorage.getItem(`workflow:${s.id}`);
        return { id: s.id, name: s.name, data: data ? JSON.parse(data) : null,
          createdAt: s.createdAt || s.updatedAt, updatedAt: s.updatedAt, todos: s.todos || [] };
      });
      setWorkflowsState(full);
    } catch {
      setWorkflowsState([]);
    }
    setHasLoaded(true);
    isLoadingRef.current = false;
  }, []);

  const loadRemote = useCallback(async () => {
    if (!user || isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const data = await apiClient.getWorkflows(user.id);
      setWorkflowsState(
        (data || []).map((w: any) => ({
          id: w.id, name: w.name, data: w.data,
          createdAt: new Date(w.created_at).getTime(),
          updatedAt: new Date(w.updated_at).getTime(),
          deletedAt: w.deleted_at ? new Date(w.deleted_at).getTime() : undefined,
          todos: w.todos || [],
        }))
      );
    } catch {
      toast.error('Failed to load workflows');
    } finally {
      setHasLoaded(true);
      isLoadingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (hasLoaded) return;
    if (dataMode === 'local') loadLocal();
    else loadRemote();
  }, [dataMode, hasLoaded, loadLocal, loadRemote]);

  const setWorkflows = useCallback(async (wfOrUpdater: Workflow[] | ((prev: Workflow[]) => Workflow[])) => {
    const next = typeof wfOrUpdater === 'function' ? wfOrUpdater(workflows) : wfOrUpdater;
    setWorkflowsState(next);

    if (dataMode === 'local') {
      const summaries = next.map(w => ({ id: w.id, name: w.name, updatedAt: w.updatedAt, createdAt: w.createdAt, todos: w.todos }));
      localStorage.setItem('workflows-list', JSON.stringify(summaries));
      next.forEach(w => { if (w.data) localStorage.setItem(`workflow:${w.id}`, JSON.stringify(w.data)); });
    } else if (user) {
      try {
        await apiClient.batchUpsertWorkflows(user.id, next.map(w => ({
          id: w.id, name: w.name, data: w.data, todos: w.todos || [],
          created_at: new Date(w.createdAt).toISOString(),
          updated_at: new Date(w.updatedAt).toISOString(),
          deleted_at: w.deletedAt ? new Date(w.deletedAt).toISOString() : null,
        })));
      } catch {
        toast.error('Failed to save workflows');
      }
    }
  }, [workflows, dataMode, user]);

  const deleteWorkflow = useCallback(async (id: string) => {
    setWorkflowsState(prev => prev.filter(w => w.id !== id));
    if (dataMode === 'local') {
      const stored = localStorage.getItem('workflows-list');
      const summaries = stored ? JSON.parse(stored) : [];
      localStorage.setItem('workflows-list', JSON.stringify(summaries.filter((s: any) => s.id !== id)));
      localStorage.removeItem(`workflow:${id}`);
    } else if (user) {
      await apiClient.deleteWorkflow(user.id, id);
    }
  }, [dataMode, user]);

  return { workflows, setWorkflows, deleteWorkflow, dataMode, hasLoaded, refetch: dataMode === 'local' ? loadLocal : loadRemote };
}
