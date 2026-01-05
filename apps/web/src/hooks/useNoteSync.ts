import { useEffect, useState, useRef } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { createYDoc } from '@collab-editor/collab';
import * as Y from 'yjs';

interface UseNoteSyncReturn {
  doc: Y.Doc | null;
  provider: HocuspocusProvider | null;
  isConnected: boolean;
  isSynced: boolean;
}

const COLLAB_SERVER_URL = import.meta.env.VITE_COLLAB_SERVER_URL || 'ws://localhost:1234';

export function useNoteSync(noteId: string | null): UseNoteSyncReturn {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const providerRef = useRef<HocuspocusProvider | null>(null);

  useEffect(() => {
    if (!noteId) {
      setDoc(null);
      setProvider(null);
      setIsConnected(false);
      setIsSynced(false);
      return;
    }

    // Use note: prefix to distinguish from collab documents
    const docName = `note:${noteId}`;
    console.log('[NoteSync] Creating Y.Doc for:', docName);

    const newDoc = createYDoc(docName);
    const newProvider = new HocuspocusProvider({
      url: COLLAB_SERVER_URL,
      name: docName,
      document: newDoc,
      connect: true,
      preserveConnection: true,
    });

    providerRef.current = newProvider;
    setDoc(newDoc);
    setProvider(newProvider);

    const onStatus = ({ status }: { status: string }) => {
      console.log('[NoteSync] Status:', status);
      setIsConnected(status === 'connected');
    };

    const onSynced = ({ state }: { state: boolean }) => {
      console.log('[NoteSync] Synced:', state);
      setIsSynced(state);
    };

    newProvider.on('status', onStatus);
    newProvider.on('synced', onSynced);

    return () => {
      console.log('[NoteSync] Destroying provider for:', docName);
      newProvider.off('status', onStatus);
      newProvider.off('synced', onSynced);
      newProvider.destroy();
      providerRef.current = null;
    };
  }, [noteId]);

  return { doc, provider, isConnected, isSynced };
}
