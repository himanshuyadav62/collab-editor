import { useParams, Link } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { useCollaboration } from '../hooks/useCollaboration';

function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();
  const { doc, provider, isConnected, users } = useCollaboration(docId!);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          
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
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {doc && provider && (
            <Editor doc={doc} provider={provider} />
          )}
        </div>
      </main>
    </div>
  );
}

export default DocumentPage;
