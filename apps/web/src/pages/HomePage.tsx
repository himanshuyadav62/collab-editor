import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@collab-editor/ui';

function HomePage() {
  const navigate = useNavigate();
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Collaborative Editor
      </h1>
      
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={createNewDocument}
        >
          Create New Document
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">or join existing</span>
          </div>
        </div>

        <form onSubmit={joinDocument} className="flex gap-2">
          <input
            type="text"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="Enter document ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" variant="secondary" size="lg">
            Join
          </Button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;
