import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Collaboration from '@tiptap/extension-collaboration';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon, Cloud, CloudOff
} from 'lucide-react';
import { useEffect } from 'react';
import { useNoteSync } from '@/hooks/useNoteSync';

interface NoteEditorProps {
  noteId: string;
  initialContent?: string;
  placeholder?: string;
}

interface ToolbarProps {
  editor: Editor;
  isConnected: boolean;
  isSynced: boolean;
}

function NoteEditorToolbar({ editor, isConnected, isSynced }: Readonly<ToolbarProps>) {
  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = globalThis.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    const chain = editor.chain().focus().extendMarkRange('link');
    url === '' ? chain.unsetLink().run() : chain.setLink({ href: url }).run();
  };

  const chain = editor.chain().focus.bind(editor.chain());
  const isActive = editor.isActive.bind(editor);
  const btnClass = (active: boolean) => active ? 'bg-accent/20' : '';

  return (
    <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30 shrink-0 sticky top-0 z-10">
      <Button variant="ghost" size="sm" onClick={() => chain().toggleBold().run()} className={btnClass(isActive('bold'))}><Bold className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => chain().toggleItalic().run()} className={btnClass(isActive('italic'))}><Italic className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => chain().toggleUnderline().run()} className={btnClass(isActive('underline'))}><UnderlineIcon className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => chain().toggleStrike().run()} className={btnClass(isActive('strike'))}><Strikethrough className="w-4 h-4" /></Button>
      <Separator orientation="vertical" className="h-8 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => chain().toggleHeading({ level: 1 }).run()} className={btnClass(isActive('heading', { level: 1 }))}>H1</Button>
      <Button variant="ghost" size="sm" onClick={() => chain().toggleHeading({ level: 2 }).run()} className={btnClass(isActive('heading', { level: 2 }))}>H2</Button>
      <Button variant="ghost" size="sm" onClick={() => chain().toggleHeading({ level: 3 }).run()} className={btnClass(isActive('heading', { level: 3 }))}>H3</Button>
      <Separator orientation="vertical" className="h-8 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => chain().toggleBulletList().run()} className={btnClass(isActive('bulletList'))}><List className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => chain().toggleOrderedList().run()} className={btnClass(isActive('orderedList'))}><ListOrdered className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => chain().toggleBlockquote().run()} className={btnClass(isActive('blockquote'))}><Quote className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => chain().toggleCode().run()} className={btnClass(isActive('code'))}><Code className="w-4 h-4" /></Button>
      <Separator orientation="vertical" className="h-8 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => chain().setTextAlign('left').run()} className={btnClass(isActive({ textAlign: 'left' }))}><AlignLeft className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => chain().setTextAlign('center').run()} className={btnClass(isActive({ textAlign: 'center' }))}><AlignCenter className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => chain().setTextAlign('right').run()} className={btnClass(isActive({ textAlign: 'right' }))}><AlignRight className="w-4 h-4" /></Button>
      <Separator orientation="vertical" className="h-8 mx-1" />
      <Button variant="ghost" size="sm" onClick={setLink} className={btnClass(isActive('link'))}><LinkIcon className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={addImage}><ImageIcon className="w-4 h-4" /></Button>
      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
        {isConnected ? <Cloud className="w-4 h-4 text-green-500" /> : <CloudOff className="w-4 h-4 text-red-500" />}
        <span>{isConnected ? isSynced ? 'Synced' : 'Syncing...' : 'Offline'}</span>
      </div>
    </div>
  );
}

export function NoteEditor({ noteId, initialContent, placeholder }: Readonly<NoteEditorProps>) {
  const { doc, isConnected, isSynced } = useNoteSync(noteId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, history: false }),
      Image.configure({ inline: true, allowBase64: true, HTMLAttributes: { class: 'rounded-lg max-w-full h-auto my-4' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-accent underline cursor-pointer' } }),
      Underline,
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ...(doc ? [Collaboration.configure({ document: doc })] : []),
    ],
    editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px]' } },
  }, [doc]);

  useEffect(() => {
    if (!doc || !isSynced || !initialContent || initialContent === '<p></p>') return;
    const fragment = doc.getXmlFragment('default');
    if (fragment.length === 0) {
      editor?.commands.setContent(initialContent);
    }
  }, [doc, isSynced, initialContent, editor]);

  if (!editor) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <NoteEditorToolbar editor={editor} isConnected={isConnected} isSynced={isSynced} />
      <div className="flex-1 overflow-auto p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
