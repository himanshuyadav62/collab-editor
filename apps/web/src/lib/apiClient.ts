const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private getAuthHeader(userId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userId}`,
    };
  }

  // Notes API
  async getNotes(userId: string) {
    const res = await fetch(`${API_URL}/api/notes`, {
      headers: this.getAuthHeader(userId),
    });
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  }

  async createNote(userId: string, note: any) {
    const res = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: this.getAuthHeader(userId),
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error('Failed to create note');
    return res.json();
  }

  async updateNote(userId: string, id: string, note: any) {
    const res = await fetch(`${API_URL}/api/notes/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(userId),
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error('Failed to update note');
    return res.json();
  }

  async updateNoteContent(userId: string, id: string, content: string) {
    const res = await fetch(`${API_URL}/api/notes/${id}/content`, {
      method: 'PATCH',
      headers: this.getAuthHeader(userId),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to update note content');
    return res.json();
  }

  async updateNoteTitle(userId: string, id: string, title: string) {
    const res = await fetch(`${API_URL}/api/notes/${id}/title`, {
      method: 'PATCH',
      headers: this.getAuthHeader(userId),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to update note title');
    return res.json();
  }

  async deleteNote(userId: string, id: string) {
    const res = await fetch(`${API_URL}/api/notes/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(userId),
    });
    if (!res.ok) throw new Error('Failed to delete note');
    return res.json();
  }

  async batchUpsertNotes(userId: string, notes: any[]) {
    const res = await fetch(`${API_URL}/api/notes/batch`, {
      method: 'POST',
      headers: this.getAuthHeader(userId),
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) throw new Error('Failed to batch upsert notes');
    return res.json();
  }

  // Todos API
  async getTodos(userId: string) {
    const res = await fetch(`${API_URL}/api/todos`, {
      headers: this.getAuthHeader(userId),
    });
    if (!res.ok) throw new Error('Failed to fetch todos');
    return res.json();
  }

  async batchUpsertTodos(userId: string, todos: any[]) {
    const res = await fetch(`${API_URL}/api/todos/batch`, {
      method: 'POST',
      headers: this.getAuthHeader(userId),
      body: JSON.stringify({ todos }),
    });
    if (!res.ok) throw new Error('Failed to batch upsert todos');
    return res.json();
  }

  async deleteTodo(userId: string, id: string) {
    const res = await fetch(`${API_URL}/api/todos/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(userId),
    });
    if (!res.ok) throw new Error('Failed to delete todo');
    return res.json();
  }

  // Todo Groups API
  async getTodoGroups(userId: string) {
    const res = await fetch(`${API_URL}/api/todo-groups`, {
      headers: this.getAuthHeader(userId),
    });
    if (!res.ok) throw new Error('Failed to fetch todo groups');
    return res.json();
  }

  async batchUpsertTodoGroups(userId: string, groups: any[]) {
    const res = await fetch(`${API_URL}/api/todo-groups/batch`, {
      method: 'POST',
      headers: this.getAuthHeader(userId),
      body: JSON.stringify({ groups }),
    });
    if (!res.ok) throw new Error('Failed to batch upsert todo groups');
    return res.json();
  }

  async deleteTodoGroup(userId: string, id: string) {
    const res = await fetch(`${API_URL}/api/todo-groups/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(userId),
    });
    if (!res.ok) throw new Error('Failed to delete todo group');
    return res.json();
  }

  // Workflows API
  async getWorkflows(userId: string) {
    const res = await fetch(`${API_URL}/api/workflows`, {
      headers: this.getAuthHeader(userId),
    });
    if (!res.ok) throw new Error('Failed to fetch workflows');
    return res.json();
  }

  async batchUpsertWorkflows(userId: string, workflows: any[]) {
    const res = await fetch(`${API_URL}/api/workflows/batch`, {
      method: 'POST',
      headers: this.getAuthHeader(userId),
      body: JSON.stringify({ workflows }),
    });
    if (!res.ok) throw new Error('Failed to batch upsert workflows');
    return res.json();
  }

  async deleteWorkflow(userId: string, id: string) {
    const res = await fetch(`${API_URL}/api/workflows/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(userId),
    });
    if (!res.ok) throw new Error('Failed to delete workflow');
    return res.json();
  }
}

export const apiClient = new ApiClient();
