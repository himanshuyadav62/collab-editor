import { Server } from '@hocuspocus/server';
import { loadDocument, saveDocument } from './documents/persistence.js';
import { config } from './config/env.js';

const server = Server.configure({
  port: config.port,
  
  // Debounce document storage
  debounce: 2000,
  maxDebounce: 10000,
  
  async onLoadDocument(data) {
    console.log(`[LOAD] Loading document: ${data.documentName}`);
    const doc = await loadDocument(data.documentName);
    return doc;
  },

  async onStoreDocument(data) {
    console.log(`[STORE] Storing document: ${data.documentName}`);
    await saveDocument(data.documentName, data.document);
  },

  async onConnect(data) {
    console.log(`[CONNECT] Client connected to document: ${data.documentName}`);
  },

  async onDisconnect(data) {
    console.log(`[DISCONNECT] Client disconnected from document: ${data.documentName}`);
  },
});

server.listen().then(() => {
  console.log(`🚀 Collaboration server running on port ${config.port}`);
});
