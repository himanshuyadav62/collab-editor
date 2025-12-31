import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Extensions } from '@tiptap/core';
import * as Y from 'yjs';

export function getDefaultExtensions(): Extensions {
  return [
    Document,
    Paragraph,
    Text,
    Heading.configure({ levels: [1, 2, 3] }),
    Bold,
    Italic,
    Strike,
    Code,
    BulletList,
    OrderedList,
    ListItem,
    Placeholder.configure({
      placeholder: 'Start typing...',
    }),
  ];
}

export interface CollaborationOptions {
  document: Y.Doc;
  field: string;
  provider: unknown;
  user: {
    name: string;
    color: string;
  };
}

export function getCollaborationExtensions(options: CollaborationOptions): Extensions {
  return [
    Collaboration.configure({
      document: options.document,
      field: options.field,
    }),
    CollaborationCursor.configure({
      provider: options.provider,
      user: options.user,
    }),
  ];
}
