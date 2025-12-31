import { Server } from '@hocuspocus/server';
import { loadDocument, saveDocument } from './documents/persistence.js';
import { config } from './config/env.js';

const server = Server.configure({
  port: config.port,
  
  // Disable authentication requirement for development
  // async onAuthenticate(data) {
  //   return authenticate(data);
  // },

  async onLoadDocument(data) {
    // Load document from database
    const doc = await loadDocument(data.documentName);
    return doc;
  },

  async onStoreDocument(data) {
    // Save document to database
    await saveDocument(data.documentName, data.document);
  },

  async onConnect(data) {
    console.log(`Client connected to document: ${data.documentName}`);
  },

  async onDisconnect(data) {
    console.log(`Client disconnected from document: ${data.documentName}`);
  },
});

server.listen().then(() => {
  console.log(`🚀 Collaboration server running on port ${config.port}`);
});
