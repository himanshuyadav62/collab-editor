import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

export interface UserState {
  user: {
    id: string;
    name: string;
    color: string;
  };
  cursor?: {
    anchor: number;
    head: number;
  } | null;
}

/**
 * Creates awareness instance for presence tracking
 */
export function createAwareness(doc: Y.Doc): Awareness {
  return new Awareness(doc);
}

/**
 * Sets local user state in awareness
 */
export function setLocalUser(awareness: Awareness, user: UserState['user']): void {
  awareness.setLocalStateField('user', user);
}

/**
 * Updates cursor position in awareness
 */
export function setCursor(awareness: Awareness, cursor: UserState['cursor']): void {
  awareness.setLocalStateField('cursor', cursor);
}

/**
 * Gets all connected users
 */
export function getUsers(awareness: Awareness): Map<number, UserState> {
  return awareness.getStates() as Map<number, UserState>;
}

/**
 * Generates a random color for user cursor
 */
export function generateUserColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
