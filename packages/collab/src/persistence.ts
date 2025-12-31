import * as Y from 'yjs';
import { encodeState, applyUpdate } from './encode.js';

export interface Snapshot {
  docId: string;
  state: Uint8Array;
  timestamp: number;
  version: number;
}

/**
 * Creates a snapshot from a Y.Doc
 */
export function createSnapshot(doc: Y.Doc, docId: string, version: number): Snapshot {
  return {
    docId,
    state: encodeState(doc),
    timestamp: Date.now(),
    version,
  };
}

/**
 * Restores a Y.Doc from a snapshot
 */
export function restoreFromSnapshot(snapshot: Snapshot): Y.Doc {
  const doc = new Y.Doc();
  applyUpdate(doc, snapshot.state);
  return doc;
}

/**
 * Converts snapshot state to base64 for storage
 */
export function snapshotToBase64(snapshot: Snapshot): string {
  return Buffer.from(snapshot.state).toString('base64');
}

/**
 * Converts base64 back to snapshot state
 */
export function base64ToState(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}
