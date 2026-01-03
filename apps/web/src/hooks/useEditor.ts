import { useEditor as useTiptapEditor } from '@tiptap/react';
import { getDefaultExtensions, getCollaborationExtensions } from '@collab-editor/editor';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useEffect } from 'react';

interface UseEditorOptions {
  doc: Y.Doc;
  provider: HocuspocusProvider;
}

export function useEditor({ doc, provider }: UseEditorOptions) {
  const user = provider.awareness?.getLocalState()?.user || {
    name: 'Anonymous',
    color: '#888888',
  };

  // Debug: log when doc changes
  useEffect(() => {
    const handleUpdate = (update: Uint8Array, origin: any) => {
      console.log('Y.Doc updated, origin:', origin, 'update size:', update.length);
    };
    doc.on('update', handleUpdate);
    return () => doc.off('update', handleUpdate);
  }, [doc]);

  const editor = useTiptapEditor({
    extensions: [
      ...getDefaultExtensions(),
      ...getCollaborationExtensions({
        document: doc,
        field: 'content',
        provider,
        user,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
      },
    },
  });

  return editor;
}
