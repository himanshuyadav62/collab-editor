import { Editor } from '@tiptap/react';
import { Button, Toolbar, ToolbarGroup } from '@collab-editor/ui';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain = () => editor.chain().focus() as any;
  
  return (
    <Toolbar>
      <ToolbarGroup>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => chain().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          H1
        </Button>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          H2
        </Button>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          H3
        </Button>
      </ToolbarGroup>

      <ToolbarGroup>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('bold')}
          onClick={() => chain().toggleBold().run()}
          title="Bold"
        >
          <strong>B</strong>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('italic')}
          onClick={() => chain().toggleItalic().run()}
          title="Italic"
        >
          <em>I</em>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('strike')}
          onClick={() => chain().toggleStrike().run()}
          title="Strikethrough"
        >
          <s>S</s>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('code')}
          onClick={() => chain().toggleCode().run()}
          title="Code"
        >
          {'</>'}
        </Button>
      </ToolbarGroup>

      <ToolbarGroup>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('bulletList')}
          onClick={() => chain().toggleBulletList().run()}
          title="Bullet List"
        >
          • List
        </Button>
        <Button
          size="sm"
          variant="ghost"
          active={editor.isActive('orderedList')}
          onClick={() => chain().toggleOrderedList().run()}
          title="Numbered List"
        >
          1. List
        </Button>
      </ToolbarGroup>
    </Toolbar>
  );
}
