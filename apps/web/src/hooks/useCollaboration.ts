import { useEffect, useState, useMemo } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { createYDoc, generateUserColor } from '@collab-editor/collab';
import * as Y from 'yjs';
import { useAuth } from '@/providers/AuthProvider';

interface User {
  id: string;
  name: string;
  color: string;
}

interface UseCollaborationReturn {
  doc: Y.Doc | null;
  provider: HocuspocusProvider | null;
  isConnected: boolean;
  users: User[];
}

const COLLAB_SERVER_URL = import.meta.env.VITE_COLLAB_SERVER_URL || 'ws://localhost:1234';

// Generate stable user color per user ID
const getUserColor = (userId: string) => {
  const stored = sessionStorage.getItem(`collab-color-${userId}`);
  if (stored) return stored;
  const color = generateUserColor();
  sessionStorage.setItem(`collab-color-${userId}`, color);
  return color;
};

export function useCollaboration(docId: string): UseCollaborationReturn {
  const { user: authUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  
  // Get user info from Supabase auth or fallback to anonymous
  const user = useMemo(() => ({
    name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || `Guest-${Math.random().toString(36).substring(2, 6)}`,
    color: authUser?.id ? getUserColor(authUser.id) : generateUserColor(),
  }), [authUser?.id, authUser?.user_metadata?.full_name, authUser?.email]);

  // Initialize doc and provider
  useEffect(() => {
    console.log('Creating new Y.Doc and provider for:', docId);
    
    const newDoc = createYDoc(docId);
    const newProvider = new HocuspocusProvider({
      url: COLLAB_SERVER_URL,
      name: docId,
      document: newDoc,
      connect: true,
      preserveConnection: true,
      broadcast: true,
    });

    setDoc(newDoc);
    setProvider(newProvider);

    return () => {
      console.log('Destroying provider for:', docId);
      newProvider.destroy();
    };
  }, [docId]);

  // Handle provider events
  useEffect(() => {
    if (!provider) return;

    const onStatus = ({ status }: { status: string }) => {
      console.log('Hocuspocus status:', status);
      setIsConnected(status === 'connected');
    };

    const onSynced = ({ state }: { state: boolean }) => {
      console.log('Hocuspocus synced:', state);
    };

    provider.on('status', onStatus);
    provider.on('synced', onSynced);
    
    if (provider.isConnected) {
      setIsConnected(true);
    }

    // Set local user awareness
    provider.setAwarenessField('user', user);

    // Listen for awareness changes
    const handleAwarenessChange = () => {
      const states = provider.awareness?.getStates();
      if (states) {
        const connectedUsers: User[] = [];
        states.forEach((state, clientId) => {
          if (state.user) {
            connectedUsers.push({
              id: String(clientId),
              name: state.user.name,
              color: state.user.color,
            });
          }
        });
        setUsers(connectedUsers);
      }
    };

    provider.awareness?.on('change', handleAwarenessChange);
    handleAwarenessChange();

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !provider.isConnected) {
        console.log('Tab visible, reconnecting...');
        provider.connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      provider.off('status', onStatus);
      provider.off('synced', onSynced);
      provider.awareness?.off('change', handleAwarenessChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [provider, user]);

  return { doc, provider, isConnected, users };
}
