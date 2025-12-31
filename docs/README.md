# Collaborative Editor

A real-time collaborative text editor built with React, Tiptap, Yjs, and Hocuspocus.

## Tech Stack

- **Frontend**: React + Tiptap + Tailwind CSS
- **CRDT**: Yjs (Conflict-free Replicated Data Types)
- **WebSocket Server**: Hocuspocus
- **Build Tool**: Vite
- **Monorepo**: pnpm workspaces + Nx

## Project Structure

```
collab-editor/
├── apps/
│   ├── web/              # React frontend
│   └── collab-server/    # Hocuspocus WebSocket server
├── packages/
│   ├── editor/           # Tiptap editor configuration
│   ├── collab/           # Yjs shared logic
│   └── ui/               # Shared UI components
├── infra/                # Docker & deployment
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
pnpm install
```

### Development

Start both the frontend and collaboration server:

```bash
pnpm dev
```

Or run them separately:

```bash
# Terminal 1: Collaboration server
pnpm dev:server

# Terminal 2: Web frontend
pnpm dev:web
```

### Access

- Frontend: http://localhost:3000
- WebSocket Server: ws://localhost:1234

## Features

- ✅ Real-time collaborative editing
- ✅ Cursor presence & awareness
- ✅ Rich text formatting (headings, bold, italic, lists)
- ✅ Automatic conflict resolution (CRDT)
- ✅ Offline support (Yjs)
- ✅ Document persistence

## Architecture

```
Editor UI → Tiptap → Yjs (CRDT) → WebSocket → Hocuspocus Server
```

The editor uses Yjs for conflict-free synchronization. All changes are automatically merged without conflicts, even when users edit the same content simultaneously.
