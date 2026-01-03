import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckSquare, GitBranch, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

type ActiveTab = 'notes' | 'todos' | 'workflows' | 'collab';

export function AppLayout() {
  const { user, loading: authLoading, actionLoading, isSkipped, signInWithGoogle, signOut, skipLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/todos')) setActiveTab('todos');
    else if (path.startsWith('/workflows')) setActiveTab('workflows');
    else if (path.startsWith('/doc')) setActiveTab('collab');
    else setActiveTab('notes');
  }, [location.pathname]);

  const navigateToNote = useCallback((noteId: string) => {
    setActiveTab('notes');
    navigate(`/notes/${noteId}`);
    toast.success('Opened note');
  }, [navigate]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'todos') navigate('/todos');
    else if (tab === 'workflows') navigate('/workflows');
    else if (tab === 'collab') navigate('/doc');
    else navigate('/');
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user && !isSkipped) {
    return (
      <div className="h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="text-muted-foreground text-sm">
              Sign in with Google to sync your data, or continue with local storage.
            </p>
          </div>
          <Button onClick={signInWithGoogle} disabled={actionLoading} className="w-full">
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">or</span>
            </div>
          </div>
          <Button onClick={skipLogin} disabled={actionLoading} variant="outline" className="w-full">
            Continue with Local Storage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-3 flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as ActiveTab)}>
            <TabsList>
              <TabsTrigger value="notes">
                <FileText className="w-4 h-4 mr-1" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="todos">
                <CheckSquare className="w-4 h-4 mr-1" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="workflows">
                <GitBranch className="w-4 h-4 mr-1" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="collab">
                Collab Editor
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            {user?.email && <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>}
            {user && (
              <Button variant="secondary" size="sm" onClick={signOut} disabled={actionLoading}>
                <LogOut className="w-4 h-4 mr-1" />
                Sign out
              </Button>
            )}
            {!user && isSkipped && (
              <Button variant="secondary" size="sm" onClick={signInWithGoogle} disabled={actionLoading}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <Outlet context={{ navigateToNote }} />
      </div>
    </div>
  );
}
