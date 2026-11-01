<div align="center">

  <img src="icons/icon.svg" width="80" height="80" alt="Anki AI Vocab Logo" />

  # Anki AI Vocab
  **Context-Aware Vocabulary Flashcard Generator for Chromium & Mozilla Firefox**

  [![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?style=flat-square&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
  [![Firefox Add-on](https://img.shields.io/badge/Firefox_Add--on-Manifest_V3-FF7139?style=flat-square&logo=firefox&logoColor=white)](https://addons.mozilla.org/)
  [![Release](https://img.shields.io/badge/Release-v3.19.0-10B981?style=flat-square)](https://github.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6?style=flat-square)](LICENSE)
  [![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_Flash--Lite_%7C_OpenAI-8B5CF6?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
  [![AnkiConnect](https://img.shields.io/badge/Anki-AnkiConnect_Ready-F59E0B?style=flat-square&logo=anki&logoColor=white)](https://ankiweb.net/shared/info/2055492159)

  <p align="center">
    Highlight English words on any webpage or crop visual subtitles to extract context-accurate definitions, IPA phonetics, and native audio, then export directly to Anki Desktop with one click.
  </p>

  [Features](#features) &bull; [Architecture](#architecture) &bull; [Installation](#installation) &bull; [Usage](#usage) &bull; [Troubleshooting](#troubleshooting) &bull; [License](#license)
</div>

---

## Overview

Traditional dictionary extensions translate words in isolation, ignoring surrounding sentence context and forcing learners to manually format and copy fields into flashcard apps.

**Anki AI Vocab** automates this workflow:
- Captures sentence-level context directly from active DOM selections or visual screen cropping (Alt+S).
- Dispatches lean, structured JSON prompts to low-latency AI models (Google Gemini 3.5 Flash-Lite / OpenAI `gpt-4o-mini`).
- Renders an isolated, non-blocking Shadow DOM popover for immediate review and inline editing.
- Transmits structured card data and native audio to Anki Desktop via the local AnkiConnect HTTP API.

---

## Features

### Context-Aware AI Analysis (<0.5s Latency)
- **Precise Polysemy Resolution**: Extracts surrounding sentences to resolve word meanings in real context rather than returning generic dictionary headwords.
- **Quota-Optimized Engine**: Defaults to `gemini-3.5-flash-lite` on Google AI Studio's free tier (500 RPD, 15 RPM) with sub-500ms latency. Automatic fallback to `gemini-3.1-flash-lite` seamlessly handles transient HTTP 429 rate limits.
- **Dynamic Auto Token Budget**: Automatically allocates token headroom to prevent truncated definitions and meanings, with manual slider adjustment when desired.
- **Provider Flexibility**: Supports Google Gemini, OpenAI (`gpt-4o-mini`), and custom OpenAI-compatible endpoints (e.g., local Ollama or vLLM instances).

### Screen Crop & Look Up (Hybrid OCR + Vision AI)
- **Visual Cropping Overlay (`Alt + S`)**: Draw a crop box over YouTube video subtitles, Netflix frames, image infographics, and PDF pages.
- **Gemini Vision OCR**: OffscreenCanvas processes high-DPI screenshots, extracts complete sentence context, and analyzes target vocabulary in lemmatized dictionary base form.

### Interactive Captured Context & Phrase Lookup
- **1-Click Word Switch**: Click any individual word inside the Captured Context box to instantly look it up (0ms if cached in session).
- **Hold Ctrl + Click Phrase Selection**: Hold `Ctrl` (or `Cmd` on macOS / `Shift`) and click any target word to instantly combine the range into a multi-word phrase or idiom with real-time visual range hover preview.
- **Context Session State Manager**: When exploring multiple words within the same context sentence, existing sentence translations are automatically reused to eliminate token overhead, reduce latency to zero, and maintain translation consistency.
- **Client-Side Highlighting**: Target words and phrases are highlighted in vivid cyan (`#38bdf8`) without relying on inconsistent AI markdown tags.

### Context-Aware Caching (FNV-1a & In-Session Memory)
- **Sentence Context Hashing**: Computes 32-bit FNV-1a hashes across normalized sentence strings (`vocab_${word}_${lang}_${ctxHash}`). Identical words in different sentences are evaluated and cached independently.
- **Zero-Latency In-Session Recall**: Re-selecting previously explored words instantly renders full card state in 0ms while preserving any user inline edits.
- **Force Re-Analysis**: The re-lookup button allows bypassing cache on demand (`bypassCache = true`) using user-edited context text.

### Real-Time Anki Deck Synchronization
- **Zero Manual Save Required**: Automatically queries and syncs newly created or renamed Anki decks directly from Anki Desktop in real-time.
- **Sticky Deck Memory**: Remembers last-used decks across sessions and tabs for frictionless one-click flashcard creation.

### Floating Draggable Popover (Non-Blocking Shadow DOM)
- **No Page Backdrop**: The popover operates without an overlay or scroll lock, allowing uninterrupted reading.
- **Shadow DOM Isolation**: All CSS styles and custom properties are scoped within a Shadow Root, preventing conflicts with host page stylesheets.
- **Draggable Header with Viewport Bounds**: Drag handle supports repositioning without layout shifts, bounded safely within viewport margins.
- **Pin Mode & Auto-Close Timer**: Configurable auto-dismiss timer on card creation or pin mode to keep the card open until dismissed.

### Minimalist Options Architecture & Unsaved Changes Protection
- **4 Focused Segmented Tabs**: Intuitive settings dashboard divided into **AI Engine**, **Anki Sync**, **Preferences**, and **Advanced** (Linear / shadcn/ui aesthetic).
- **Quick Onboarding**: 1-click free Google Gemini API key callout (500 req/day, no credit card required) for instant 30-second setup.
- **Unsaved Changes Detection**: Visual pulse indicator, native browser `beforeunload` interception, and `Ctrl+S` / `Cmd+S` keyboard shortcut prevent accidental configuration loss.

### Native Audio & AnkiConnect Pipeline
- **Media Ingestion**: Fetches native pronunciation audio files and stores them into Anki's media collection via AnkiConnect `storeMediaFile`.
- **Voice Preferences**: Configurable voice profile selection synced across the popover, popup, and options page.
- **Dynamic Field Mapping**: Maps extracted attributes to standard Basic, Cloze, or custom multi-field note types (up to 10 fields).

---

## Architecture

```
anki-ai-vocab/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── icons/                     # Vector SVG and multi-resolution PNG icons
├── background/                # Service worker environment (ES Modules)
│   ├── background.js          # Context menus, message routing, deck auto-sync
│   ├── config.js              # Default configurations, schema tokens, sync storage
│   ├── ai-service.js          # Gemini/OpenAI API dispatch, vision OCR, FNV-1a cache
│   └── anki-service.js        # AnkiConnect HTTP client and media file handler
├── content/                   # Content script injected into host pages
│   ├── content.js             # Text selection, crop overlay, context session manager
│   ├── content.css            # Scoped popover design system tokens
│   ├── popover-ui.js          # Popover markup templates and SVG icons
│   └── position-calculator.js # Viewport collision and placement logic
├── options/                   # Extension options dashboard (4 segmented tabs)
│   ├── options.html           # Settings interface (AI, Anki, preferences, advanced)
│   ├── options.css            # Zinc dark/light stylesheet with dirty state indicator
│   └── options.js             # Dirty tracking, connection testing, settings persistence
├── popup/                     # Action toolbar popup
│   ├── popup.html             # Manual lookup, crop trigger, deck selector, selection toggle
│   ├── popup.css              # Auto-sizing flex container stylesheet
│   └── popup.js               # Active tab text extraction and quick lookup logic
├── firefox/                   # Dedicated Firefox Add-on build (Manifest V3 Gecko)
│   ├── manifest.json          # Gecko-compliant manifest with browser_specific_settings
│   └── ...                    # Bundled background, content, icons, options, popup
├── build_firefox.js           # Automated Firefox build and synchronization tool
└── generate_icons.js          # Node.js icon rasterizer from SVG
```

---

## Installation

### 1. Prerequisites: Anki Desktop & AnkiConnect

1. Download and install [Anki Desktop](https://apps.ankiweb.net/) (Windows, macOS, or Linux).
2. Launch Anki, navigate to **Tools** &rarr; **Add-ons**.
3. Click **Get Add-ons...**, input code `2055492159`, and click **OK** to install **AnkiConnect**.
4. Configure CORS permissions for browser requests:
   - Select **AnkiConnect** in the add-on list and click **Config**.
   - Add `"*"` to `webCorsOriginList`:
     ```json
     {
         "apiKey": null,
         "webBindAddress": "127.0.0.1",
         "webBindPort": 8765,
         "webCorsOriginList": [
             "*"
         ]
     }
     ```
   - Click **OK** and restart Anki Desktop.

### 2. Install Extension in Google Chrome / Chromium / Edge / Brave

1. Clone or download this repository:
   ```bash
   git clone https://github.com/spacetimevoid/anki-ai-vocab.git
   ```
2. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/` / `brave://extensions/`).
3. Enable **Developer mode** via the top-right toggle.
4. Click **Load unpacked** in the top-left toolbar.
5. Select the repository root folder.

### 3. Install Extension in Mozilla Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...** (Tải tiện ích tạm thời...).
3. Navigate into the `firefox/` directory in this repository and select `manifest.json`.
4. The extension will immediately load and activate on Firefox!

*Tip:* You can regenerate or re-sync the Firefox build at any time by running:
```bash
node build_firefox.js
```

### 4. API Key Configuration

1. Right-click the extension icon in the toolbar and select **Options** (or open the gear icon in the toolbar popup).
2. Select your AI provider (recommended: **Google Gemini**).
3. Generate a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and paste it into the API Key field.
4. Click **Save Settings** (or press `Ctrl+S`). Anki AI Vocab will automatically connect to AnkiConnect to retrieve your available decks and note models.

---

## Usage

| Interaction | Action |
| :--- | :--- |
| **Select Text** | Highlight any English word or phrase on a webpage. The popover displays immediately below the selection. |
| **Crop Screen (`Alt+S`)** | Press `Alt + S` or click the Crop icon in the popup to drag a selection box over video subtitles or images. |
| **Ctrl + Click Phrase** | In the Captured Context box, hold `Ctrl` (`Cmd` / `Shift`) and click a target word to look up a multi-word phrase. |
| **Drag Popover** | Click and hold the header bar to reposition the window across the screen. |
| **Edit Fields** | Click directly on the word, phonetic, meaning, definition, or example sentence to modify text inline. |
| **Audio Playback** | Click the speaker icon to stream pronunciation using your preferred voice profile. |
| **Re-Analyze** | Click the refresh icon to bypass cache and re-query the language model for the current context. |
| **Select Deck** | Use the footer dropdown to change the destination Anki deck on the fly (auto-synced with Anki Desktop). |
| **Add to Anki** | Click **+ Add to Anki** to create the card with pronunciation audio in Anki Desktop. |
| **Dismiss** | Press `Escape` or click outside the popover (configurable via Pin Mode). |

---

## Troubleshooting

### Anki Status Displays "Offline"
- Confirm Anki Desktop is running on the host machine.
- Verify AnkiConnect (add-on code `2055492159`) is active under **Tools** &rarr; **Add-ons**.
- Ensure `webCorsOriginList` contains `"*"` in the AnkiConnect configuration.
- Check that port `8765` is not occupied by another process (`curl http://127.0.0.1:8765`).

### Rate Limit Errors (HTTP 429)
- Google AI Studio's free tier provides 15 requests per minute (RPM) and 500 requests per day (RPD).
- The extension automatically retries with secondary fallback models (`gemini-3.1-flash-lite`). If quota is temporarily exhausted, wait 10 seconds before initiating subsequent lookups.

### Retaining the Popover On Screen
- To prevent the popover from closing when clicking outside, navigate to **Options** &rarr; **Preferences**, and enable **Close Only via Close Button ('X')**.

---

## Contributing

Contributions, bug reports, and pull requests are welcome. Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for code conventions, testing steps, and pull request guidelines.

---

## License

This project is licensed under the [MIT License](LICENSE).
