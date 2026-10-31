<div align="center">

  <img src="icons/icon.svg" width="80" height="80" alt="Anki AI Vocab Logo" />

  # Anki AI Vocab
  **Context-Aware Vocabulary Flashcard Generator for Google Chrome**

  [![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?style=flat-square&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
  [![Firefox Add-on](https://img.shields.io/badge/Firefox_Add--on-Manifest_V3-FF7139?style=flat-square&logo=firefox&logoColor=white)](https://addons.mozilla.org/)
  [![Release](https://img.shields.io/badge/Release-v3.15.0-10B981?style=flat-square)](https://github.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6?style=flat-square)](LICENSE)
  [![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_Flash--Lite_%7C_OpenAI-8B5CF6?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
  [![AnkiConnect](https://img.shields.io/badge/Anki-AnkiConnect_Ready-F59E0B?style=flat-square&logo=anki&logoColor=white)](https://ankiweb.net/shared/info/2055492159)

  <p align="center">
    Highlight English words on any webpage to extract context-accurate definitions, IPA phonetics, and native audio, then export directly to Anki Desktop with one click.
  </p>

  [Features](#features) &bull; [Architecture](#architecture) &bull; [Installation](#installation) &bull; [Usage](#usage) &bull; [Troubleshooting](#troubleshooting) &bull; [License](#license)
</div>

---

## Overview

Traditional dictionary extensions translate words in isolation, ignoring surrounding sentence context and forcing learners to manually format and copy fields into flashcard apps.

**Anki AI Vocab** automates this workflow:
- Captures sentence-level context directly from the active DOM selection.
- Dispatches lean, structured JSON prompts to low-latency AI models (Google Gemini 3.5 Flash-Lite / OpenAI `gpt-4o-mini`).
- Renders an isolated, non-blocking Shadow DOM popover for immediate review and inline editing.
- Transmits structured card data and native TTS audio to Anki Desktop via the local AnkiConnect HTTP API.

---

## Features

### Context-Aware AI Analysis (<0.5s Latency)
- **Precise Polysemy Resolution**: Extracts the surrounding sentence to resolve word meanings in real context rather than returning generic dictionary headwords.
- **Quota-Optimized Engine**: Defaults to `gemini-3.5-flash-lite` on Google AI Studio's free tier (500 RPD, 15 RPM) with sub-500ms round-trip latency. Automatic fallback to `gemini-3.1-flash-lite` handles transient HTTP 429 rate limits.
- **Provider Flexibility**: Supports Google Gemini, OpenAI (`gpt-4o-mini`), and custom OpenAI-compatible endpoints (e.g., local Ollama or vLLM instances).

### Context-Aware Caching (FNV-1a)
- **Sentence Context Hashing**: Computes a 32-bit FNV-1a hash across normalized sentence strings (`vocab_${word}_${lang}_${ctxHash}`). Identical words in different sentences are evaluated and cached independently.
- **Zero-Latency Hits**: Previously analyzed context lookups resolve locally in 0ms without consuming API quota.
- **Force Re-Analysis**: A dedicated re-lookup button allows bypassing cache on demand (`bypassCache = true`).

### Exhaustive Translation & Standalone Word Support
- **Complete Sentence Translation**: Enforces 100% translation of compound and multi-clause sentences, preventing clause truncation.
- **Automated Example Generation**: When a single word is highlighted without surrounding context, the model automatically generates an authentic B1-B2 level English example sentence and a complete Vietnamese translation.

### Floating Draggable Popover (Non-Blocking Shadow DOM)
- **No Page Backdrop**: The popover operates without an overlay or scroll lock, allowing uninterrupted reading.
- **Shadow DOM Isolation**: All CSS styles and custom properties are scoped within a Shadow Root, preventing conflicts with host page stylesheets.
- **Draggable Header with Viewport Boundary Constraints**: Drag handle supports free repositioning without layout shifts, bounded safely within viewport margins.
- **Pin Mode**: Optional toggle to keep the popover open until explicitly dismissed via the close button or the Escape key.

### Minimalist Shadcn / Zinc Interface
- **Dual-Row Typography**: Dedicated row for word and pastel part-of-speech badge, with IPA transcription formatted in Times New Roman on the row below for accurate phonetic glyph rendering.
- **Inline Field Editing**: All text attributes (word, phonetic, POS, definitions, context, and translation) are directly editable (`contenteditable="true"`) prior to export.
- **Target Deck Selector**: Floating dropdown menu enables instantaneous deck switching directly inside the popover and popup.

### Native Audio & AnkiConnect Pipeline
- **Media Ingestion**: Fetches native pronunciation audio files and stores them into Anki's media collection via AnkiConnect `storeMediaFile`.
- **Voice Preferences**: Configurable voice profile selection (Random, Male Voice, or Female Voice) synced across the popover and options page.
- **Dynamic Field Mapping**: Maps extracted attributes to standard Basic, Cloze, or custom multi-field note types (up to 10 fields).

---

## Architecture

```
anki-ai-vocab/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── icons/                     # Vector SVG and multi-resolution PNG icons
├── background/                # Service worker environment (ES Modules)
│   ├── background.js          # Context menus, message routing, lifecycle hooks
│   ├── config.js              # Default configurations, schema tokens, sync storage
│   ├── ai-service.js          # Gemini/OpenAI API dispatch, FNV-1a cache, retry logic
│   └── anki-service.js        # AnkiConnect HTTP client and media file handler
├── content/                   # Content script injected into host pages
│   ├── content.js             # Text selection, Shadow DOM lifecycle, event handlers
│   ├── content.css            # Scoped popover design system tokens
│   ├── popover-ui.js          # Popover markup templates and SVG icons
│   └── position-calculator.js # Viewport collision and placement logic
├── options/                   # Extension options dashboard
│   ├── options.html           # Settings interface (API keys, models, field mapping)
│   ├── options.css            # Zinc dark/light stylesheet
│   └── options.js             # Connection testing, deck querying, settings persistence
├── popup/                     # Action toolbar popup
│   ├── popup.html             # Manual lookup interface and status indicators
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
4. Click **Save Settings**. Anki AI Vocab will automatically connect to AnkiConnect to retrieve your available decks and note models.

---

## Usage

| Interaction | Action |
| :--- | :--- |
| **Select Text** | Highlight any English word or phrase on a webpage. The popover displays immediately below the selection. |
| **Drag Popover** | Click and hold the header bar to reposition the window across the screen. |
| **Edit Fields** | Click directly on the word, phonetic, meaning, definition, or example sentence to modify text inline. |
| **Audio Playback** | Click the speaker icon to stream pronunciation using your preferred voice gender. |
| **Re-Analyze** | Click the refresh icon to bypass cache and re-query the language model for the current context. |
| **Select Deck** | Use the footer dropdown to change the destination Anki deck on the fly. |
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
- To prevent the popover from closing when clicking outside, navigate to **Options** &rarr; **Preferences & Performance**, and enable **Close Only via Close Button ('X')**.

---

## Contributing

Contributions, bug reports, and pull requests are welcome. Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for code conventions, testing steps, and pull request guidelines.

---

## License

This project is licensed under the [MIT License](LICENSE).
