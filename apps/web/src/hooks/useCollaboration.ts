import { useEffect, useState, useRef } from 'react';
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
  doc: Y.Doc;
  provider: HocuspocusProvider;
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
  
  // Use refs to maintain stable references
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  
  // Get user info from Supabase auth or fallback to anonymous
  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || `Guest-${Math.random().toString(36).substring(2, 6)}`,
    color: authUser?.id ? getUserColor(authUser.id) : generateUserColor(),
  };
  const userRef = useRef(user);
  
  // Update userRef when auth user changes
  useEffect(() => {
    userRef.current = user;
    if (providerRef.current) {
      providerRef.current.setAwarenessField('user', user);
    }
  }, [authUser?.id, user.name, user.color]);

  // Initialize doc and provider only once per docId
  if (!docRef.current || docRef.current.meta?.docId !== docId) {
    // Cleanup old provider if exists
    if (providerRef.current) {
      providerRef.current.destroy();
    }
    
    docRef.current = createYDoc(docId);
    providerRef.current = new HocuspocusProvider({
      url: COLLAB_SERVER_URL,
      name: docId,
      document: docRef.current,
      // Reconnection settings
      connect: true,
      preserveConnection: true,
      broadcast: true,
    });
  }

  const doc = docRef.current;
  const provider = providerRef.current!;
  const currentUser = userRef.current;

  useEffect(() => {
    // Handle connection status
    const onStatus = ({ status }: { status: string }) => {
      console.log('Hocuspocus status:', status);
      setIsConnected(status === 'connected');
    };

    // Handle sync status
    const onSynced = ({ state }: { state: boolean }) => {
      console.log('Hocuspocus synced:', state);
    };

    provider.on('status', onStatus);
    provider.on('synced', onSynced);
    
    // Check if already connected
    if (provider.isConnected) {
      setIsConnected(true);
    }

    // Set local user awareness
    provider.setAwarenessField('user', currentUser);

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

    // Handle visibility change - reconnect when tab becomes visible
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
      // Don't destroy provider on cleanup - keep connection alive
    };
  }, [provider, currentUser]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      docRef.current = null;
    };
  }, []);

  return { doc, provider, isConnected, users };
}
