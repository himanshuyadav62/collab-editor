import { EditorContent } from '@tiptap/react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useEditor } from '../../hooks/useEditor';
import { EditorToolbar } from './EditorToolbar';

interface EditorProps {
  doc: Y.Doc;
  provider: HocuspocusProvider;
}

export function Editor({ doc, provider }: EditorProps) {
  const editor = useEditor({ doc, provider });

  if (!editor) {
    return (
      <div className="p-4 text-muted-foreground">Loading editor...</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-auto p-4" />
    </div>
  );
}
