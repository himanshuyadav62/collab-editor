import { Editor, Extensions } from '@tiptap/core';
import { getDefaultExtensions, getCollaborationExtensions } from './extensions/index.js';
import * as Y from 'yjs';

export interface CreateEditorOptions {
  element?: HTMLElement;
  content?: string;
  editable?: boolean;
  autofocus?: boolean;
  collaboration?: {
    document: Y.Doc;
    field?: string;
    provider: unknown;
    user: {
      name: string;
      color: string;
    };
  };
}

/**
 * Creates a configured Tiptap editor instance
 */
export function createEditor(options: CreateEditorOptions = {}): Editor {
  const { collaboration, ...editorOptions } = options;

  let extensions: Extensions = getDefaultExtensions();

  if (collaboration) {
    extensions = [
      ...extensions,
      ...getCollaborationExtensions({
        document: collaboration.document,
        field: collaboration.field || 'content',
        provider: collaboration.provider,
        user: collaboration.user,
      }),
    ];
  }

  return new Editor({
    extensions,
    ...editorOptions,
  });
}
