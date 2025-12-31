import * as Y from 'yjs';

/**
 * Creates a new Y.Doc for collaborative editing
 */
export function createYDoc(docId: string): Y.Doc {
  const doc = new Y.Doc();
  doc.gc = true; // Enable garbage collection
  
  // Store document ID as metadata
  doc.meta = { docId };
  
  return doc;
}

/**
 * Gets the shared text content from a Y.Doc
 */
export function getSharedText(doc: Y.Doc, name = 'content'): Y.XmlFragment {
  return doc.getXmlFragment(name);
}

/**
 * Gets a shared map for document metadata
 */
export function getSharedMeta(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap('meta');
}
