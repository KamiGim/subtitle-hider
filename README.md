# Subtitle Hider

A draggable, resizable blur overlay to hide hardcoded subtitles on any page.

![](promo.png)

## Features

- **Draggable & resizable** overlay — position and size it to cover subtitles
- **Backdrop blur** — blurs what's underneath, no solid colors
- **Per-site settings** — position, size, and opacity saved per domain
- **Opacity control** — hover the overlay to reveal a tiny opacity slider
- **Keyboard shortcut** — `Ctrl+Shift+S` (or `⌘+Shift+S` on Mac) to toggle
- **Toolbar icon** — click to toggle on/off, shows "ON" badge when active
- **Options page** — set defaults, reset all settings
- **Manifest V3** — modern extension standard
- **Firefox compatible** — works on both Chrome and Firefox
- **No dependencies** — pure vanilla JS, zero libraries

## Usage

1. Install the extension
2. Navigate to any page with hardcoded subtitles
3. Click the toolbar icon or press `Ctrl+Shift+S` to show the overlay
4. Drag and resize the overlay to cover the subtitle area
5. Hover the overlay to adjust opacity with the slider
6. Settings persist per site

## Install

### Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on" and select `manifest.json`

## Version 2.0 Changes

- Upgraded from Manifest V2 to V3
- Removed jQuery and jQuery UI dependencies (~100KB savings per page)
- Native drag and resize implementation
- Per-site persistent settings
- Opacity slider control
- Keyboard shortcut support
- Options page
- Firefox compatibility
- Improved border visibility on dark pages
- Service worker with storage-backed state (survives restarts)
