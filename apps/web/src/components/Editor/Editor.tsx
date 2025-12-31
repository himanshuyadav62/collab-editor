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
      <div className="p-4 text-gray-500">Loading editor...</div>
    );
  }

  return (
    <div className="flex flex-col">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="min-h-[400px]" />
    </div>
  );
}
