import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [docId, setDocId] = useState('');

  const createNewDocument = () => {
    const newDocId = crypto.randomUUID();
    navigate(`/doc/${newDocId}`);
  };

  const joinDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (docId.trim()) {
      navigate(`/doc/${docId.trim()}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Collaborative Editor
        </h1>
        {user && (
          <p className="text-muted-foreground">
            Welcome, {user.user_metadata?.full_name || user.email}
          </p>
        )}
      </div>
      
      <div className="w-full max-w-md space-y-6">
        <Button
          size="lg"
          className="w-full"
          onClick={createNewDocument}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Document
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">or join existing</span>
          </div>
        </div>

        <form onSubmit={joinDocument} className="flex gap-2">
          <Input
            type="text"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="Enter document ID"
            className="flex-1"
          />
          <Button type="submit" variant="secondary" size="lg">
            <ArrowRight className="w-4 h-4 mr-1" />
            Join
          </Button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;
