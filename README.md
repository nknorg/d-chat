# D-Chat

D-Chat is a decentralized chat application built on NKN network, available as a web application, browser extension, and desktop application.

## Features

- Decentralized messaging using NKN network
- Multi-platform support:
  - Web Application
  - Browser Extension (Chrome & Firefox)
  - Desktop Application (Windows, macOS, Linux)
- End-to-end encryption
- Cross-platform synchronization
- Modern UI with Vue 3 and TypeScript

## Prerequisites

- Node.js >= 23.0.0
- pnpm >= 10.10.0

## Installation

```bash
# Install dependencies
$ pnpm install
```

## Development

### Web Application

```bash
# Start development server
$ pnpm dev:web

# Build for production
$ pnpm build:web

# Preview production build
$ pnpm preview
```

### Browser Extension

```bash
# Development mode (Chrome & Firefox)
$ pnpm dev:webext

# Build extension for Chrome
$ pnpm build:chrome

# Build extension for Firefox
$ pnpm build:firefox

# Build for both browsers
$ pnpm build:webext
```

### Desktop Application

```bash
# Start development mode
$ pnpm dev

# Build for Windows
$ pnpm build:win

# Build for macOS
$ pnpm build:mac

# Build for Linux
$ pnpm build:linux
```

## Project Structure

```
d-chat/
├── src/                    # Source code
│   ├── background/        # Browser extension background scripts
│   ├── ui/               # UI components and pages
│   └── ...
├── web-extension/        # Browser extension specific code
└── ...
```

## Technology Stack

- Vue 3
- TypeScript
- Vite
- Electron (for desktop app)
- NKN SDK
- Vuetify
- Pinia (State Management)
- Vue Router
- Vue I18n (Internationalization)

## Scripts

- `pnpm dev` - Start electron development
- `pnpm dev:web` - Start web development
- `pnpm dev:webext` - Start browser extension development
- `pnpm dev:chrome` - Start chrome extension development
- `pnpm build` - Build electron app
- `pnpm build:web` - Build web app
- `pnpm build:webext` - Build browser extension
- `pnpm build:chrome` - Build chrome extension
- `pnpm typecheck` - Run type checking
- `pnpm lint` - Run linting
- `pnpm format` - Format code with Prettier

## License

MIT
