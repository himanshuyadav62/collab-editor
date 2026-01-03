import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './providers/AuthProvider';
import { AppLayout } from './components/AppLayout';
import { NotesPage } from './pages/NotesPage';
import { TodosPage } from './pages/TodosPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { AuthCallback } from './pages/AuthCallback';
import HomePage from './pages/HomePage';
import DocumentPage from './pages/DocumentPage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<NotesPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/:noteId" element={<NotesPage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/workflows/:workflowId" element={<WorkflowBuilder />} />
            <Route path="/doc" element={<HomePage />} />
            <Route path="/doc/:docId" element={<DocumentPage />} />
          </Route>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
        <Toaster position="bottom-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
