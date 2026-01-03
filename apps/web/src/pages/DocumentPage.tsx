import { useParams, Link } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { useCollaboration } from '../hooks/useCollaboration';

function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();
  const { doc, provider, isConnected, users } = useCollaboration(docId!);

  return (
    <div className="flex-1 flex flex-col w-full overflow-hidden">
      <header className="bg-card/50 border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </Link>
            <span className="text-sm text-muted-foreground">
              Document: {docId?.substring(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            
            <span
              className={`px-2 py-1 text-xs rounded ${
                isConnected
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-hidden">
        <div className="h-full bg-card border-x border-border">
          {doc && provider ? (
            <Editor doc={doc} provider={provider} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading editor...</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DocumentPage;
