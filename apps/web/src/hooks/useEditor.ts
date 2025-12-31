import { useEditor as useTiptapEditor } from '@tiptap/react';
import { getDefaultExtensions, getCollaborationExtensions } from '@collab-editor/editor';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';

interface UseEditorOptions {
  doc: Y.Doc;
  provider: HocuspocusProvider;
}

export function useEditor({ doc, provider }: UseEditorOptions) {
  const user = provider.awareness?.getLocalState()?.user || {
    name: 'Anonymous',
    color: '#888888',
  };

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
