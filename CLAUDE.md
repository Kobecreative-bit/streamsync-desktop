# StreamSync — Desktop Live Commerce App

## What This Is
StreamSync is an Electron desktop app that lets users go live on TikTok, YouTube, Instagram, and Facebook simultaneously using embedded browser windows (webview tags), with AI-powered selling tools built in.

## Critical Architecture Rules
- EMBEDDED BROWSERS, NOT APIs: Each platform panel is a <webview> with partition="persist:platformname"
- NEVER use OAuth, platform APIs, Mux, IVS, or any streaming service
- Users log into their OWN accounts inside the webviews
- The app wraps these browsers to look like native StreamSync screens
- webviewTag: true MUST be set in BrowserWindow webPreferences

## Tech Stack
- Electron 28+ with electron-vite
- React 18 + TypeScript for renderer
- Tailwind CSS (PostCSS, not CDN)
- electron-builder for packaging
- electron-updater for auto-updates
- GitHub Actions for CI/CD builds

## Project Structure
```
streamsync-desktop/
├── .github/workflows/build.yml
├── CLAUDE.md
├── package.json
├── electron.vite.config.ts
├── electron-builder.yml
├── src/
│   ├── main/
│   │   ├── index.ts              # Main process: window creation, menu, IPC handlers
│   │   └── store.ts              # Persistent storage (electron-store)
│   ├── preload/
│   │   └── index.ts              # Context bridge: expose IPC to renderer
│   └── renderer/
│       ├── index.html
│       ├── src/
│       │   ├── main.tsx          # React entry
│       │   ├── App.tsx           # Router + layout
│       │   ├── components/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── StreamPanel.tsx       # Single platform webview panel
│       │   │   ├── StreamGrid.tsx        # 2x2 grid of StreamPanels
│       │   │   ├── CommentPanel.tsx      # Unified comment feed
│       │   │   ├── ProductOverlay.tsx    # Product card overlay on streams
│       │   │   ├── ProductModal.tsx      # Add/edit product form
│       │   │   ├── AIcopilot.tsx         # AI buying signal + suggested replies
│       │   │   └── StreamControls.tsx    # Go Live / End Stream bar
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── GoLive.tsx
│       │   │   ├── Products.tsx
│       │   │   ├── Analytics.tsx
│       │   │   └── Settings.tsx
│       │   ├── hooks/
│       │   │   ├── useStreamState.ts
│       │   │   ├── useComments.ts
│       │   │   └── useProducts.ts
│       │   ├── lib/
│       │   │   ├── commentScraper.ts     # Inject JS into webviews to scrape comments
│       │   │   └── aiCopilot.ts          # AI logic for buying signal detection
│       │   └── styles/
│       │       └── globals.css           # Tailwind base
│       └── env.d.ts
├── resources/
│   └── icon.png                  # App icon (1024x1024)
└── tsconfig.json
```

## Color Palette (Match Marketing Site)
- Background: #0a0e1a (primary), #111827 (secondary), #1a1f35 (cards)
- Accent: #f97316 (orange)
- Text: #f1f5f9 (primary), #94a3b8 (secondary)
- Platform colors: TikTok #ff0050, YouTube #ff0000, Instagram #e1306c, Facebook #1877f2
- Success: #22c55e, Danger: #ef4444

## Security Requirements
- contextIsolation: true
- nodeIntegration: false
- sandbox: false (needed for webview)
- Preload script with contextBridge.exposeInMainWorld
- CSP headers allowing webview content

## Webview Configuration
Each platform webview MUST have:
- partition="persist:{platform}" for session persistence
- allowpopups attribute for OAuth redirects within platforms
- useragent set to latest Chrome to avoid mobile redirects
- Error handling for: did-fail-load, crashed, unresponsive events

## Comment Scraping Strategy
Inject JavaScript into webviews using webview.executeJavaScript() to:
1. Find comment DOM elements on each platform's live page
2. Extract username + comment text
3. Send back to renderer via IPC
4. Aggregate in CommentPanel sorted by time
5. Run through AI buying signal detection

## Product Overlay
- Users add products (name, price, description, buy link)
- Products stored with electron-store for persistence
- "Pin" a product to show overlay on all stream panels
- Overlay appears as floating card at bottom of each webview panel
- Shows product name, price, "Buy Now" button

## AI Comment Copilot
- Scans comments for buying keywords: "how much", "price", "where to buy", "link", "want", "order", "ship", "available", "cost"
- Flags buying signal comments with orange highlight
- Auto-generates suggested reply templates
- Shows alert in AI Copilot panel with one-click "Send Reply"

## GitHub Actions Build
- Trigger on push tag v*
- Matrix: macOS (arm64+x64), Windows (NSIS), Linux (AppImage+deb)
- Use electron-builder
- Upload to GitHub Releases
- Set CSC_IDENTITY_AUTO_DISCOVERY=false to skip code signing for now

## Known Pitfalls (READ THESE)
1. webview not rendering: MUST set webviewTag: true in BrowserWindow webPreferences
2. Platform blocking webview: Set useragent to real Chrome UA string
3. Session not persisting: Use partition="persist:platform" (the "persist:" prefix is REQUIRED)
4. Build failing on CI: Skip code signing with CSC_IDENTITY_AUTO_DISCOVERY=false
5. Tailwind not loading: Must be in renderer vite config, not main process config
6. White screen on launch: Check renderer/index.html path in electron-vite config
7. electron-store errors: Use v8+ and import as ESM in main process
8. Webview CSP errors: Set up session.defaultSession.webRequest.onHeadersReceived in main process

## What NOT To Do
- Do NOT use any external streaming API (no Mux, no IVS, no RTMP)
- Do NOT build a web app -- this is Electron ONLY
- Do NOT use webpack -- use electron-vite
- Do NOT hardcode paths -- use app.getPath() and path.join()
- Do NOT skip error handling on webview events
- Do NOT use BrowserView -- use <webview> tags with partitions for our multi-session use case
