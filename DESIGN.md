# DESIGN.md - Design Tokens & UI/UX Standards (Clean Minimalist & Modern SaaS System)

Specification of UI/UX design standards for the Anki AI Vocab Chrome Extension. Adheres to **Modern Linear / Vercel Settings / Shadcn UI** standards and **UI/UX Pro Max** guidelines.

---

## 1. Design Philosophy: Clean Single-Column Precision & Minimalist Contrast

### ❌ Anti-Patterns Strictly Avoided
1. **Cluttered Dashboards & Redundant Sidebars:** Eliminates heavy, complex vertical sidebars on settings pages; adopts a clean single-column centered scroll.
2. **Neon Glow & Heavy Gradients:** No distracting colored shadows, no multi-color gradient headings.
3. **Card-ception:** No nested card layers; separation achieved via crisp 1px borders (`var(--border-hairline)`).
4. **Disruptive Browser Alerts:** Zero browser `alert()` dialogs; all state feedback utilizes smooth inline badges or transient toasts.
5. **Low-contrast / Tiny Typography:** Eliminates cramped fonts; maintains high legibility with 19px headline word, 15px meanings, and 13.5px context sentences.

### ✅ Core Principles
1. **Single-Column Centered Layout (`max-width: 680px`):**
   - Centered container (`padding: 40px 20px 120px; margin: 0 auto;`) providing focus, rhythm, and comfortable scanning.
   - Clean continuous scroll divided into 3 dedicated sections: AI Provider, Anki Configuration, and Preferences & Performance.
   - Header with brand mark, title, and Sun ☀️ / Moon 🌙 theme switcher capsule.
   - Sticky bottom bar with real-time save status dot and "Save Changes" action.
2. **100% English Language Adherence (English Only):**
   - Natural, concise, idiomatic technical English across Options, Popup, Popover, tooltips, placeholders, and error banners.
3. **Target Deck Flexibility on Floating Popover:**
   - Dedicated `<select>` picker in Popover footer allowing users to switch target Anki deck immediately before saving.
4. **High-Legibility Typography & Sizing:**
   - Popover width expanded from 340px to 375px (`POPOVER_WIDTH = 375`).
   - Target word: `19px` bold (`font-weight: 700`).
   - IPA: `13px` monospace, Part of Speech badge: `11.5px` bold.
   - Meaning: `15px` semibold (`font-weight: 600`, line-height `1.5`).
   - Context sentence: `13.5px` italic with `padding: 8px 12px` and `border-left: 2px solid var(--border)`.
5. **Light / Dark Mode Parity:**
   - Seamless instant theme switching stored in `chrome.storage.sync` and applied across all Extension views via `data-theme="dark"` / `data-theme="light"`.

---

## 2. Color Design Tokens

| Token Name | Light Mode (CSS) | Dark Mode (CSS) | Purpose |
| :--- | :--- | :--- | :--- |
| `--bg-main` | `#FAFAFB` | `#0E0F14` | Main page background |
| `--bg-surface` | `#FFFFFF` | `#14151C` | Cards, switch rows, cors box |
| `--bg-surface-elevated`| `#F4F5F7` | `#1B1C25` | Badges, buttons, slider tracks |
| `--bg-input` | `#FFFFFF` | `#15161E` | Text inputs, selects, textareas |
| `--border-hairline` | `#E8EAEE` | `#20222D` | Section dividers & card borders |
| `--border-input` | `#DDE0E6` | `#272936` | Input borders |
| `--border-focus` | `#2563EB` | `#3B82F6` | Focus border highlight (Electric Blue) |
| `--focus-ring` | `rgba(37,99,235,0.25)` | `rgba(59,130,246,0.4)` | Focus ring glow |
| `--text-primary` | `#0F172A` | `#FFFFFF` | Primary headings, words, key text |
| `--text-secondary`| `#475569` | `#9698A6` | Descriptions, IPA, definitions |
| `--text-muted` | `#94A3B8` | `#646675` | Captions, placeholders, disabled text |
| `--pill-active-bg`| `#0F172A` | `#FFFFFF` | Save button, active pill background |
| `--pill-active-text`| `#FFFFFF`| `#0E0F14` | Save button text |
| `--success` | `#059669` | `#10B981` | Online status, success badges |
| `--warning` | `#D97706` | `#F59E0B` | Checking status, rate-limit warnings |
| `--danger` | `#DC2626` | `#EF4444` | Offline status, error banners |

---

## 3. Typography Hierarchy

- **Font Family:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
- **Font Mono:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **Settings Title:** `22px` / Font-weight `700` / Letter-spacing `-0.02em`
- **Settings Section Title:** `17px` / Font-weight `600` / Letter-spacing `-0.01em`
- **Popover Word:** `19px` / Font-weight `700` / Letter-spacing `-0.01em`
- **Popover Meaning:** `15px` / Font-weight `600` / Line-height `1.5`
- **Popover Definition:** `13.5px` / Line-height `1.5` / `var(--text-secondary)`
- **Popover Context:** `13.5px` / Line-height `1.6` / `padding: 8px 12px`
- **Popover IPA:** `13px` monospace / `var(--text-secondary)`
- **Popover POS Badge:** `11px` / Font-weight `600` / `padding: 2px 7px` / `border-radius: 4px`
- **Form Inputs & Selects:** `13.5px` - `14px` (avoids browser zoom & shift)

---

## 4. Popover 2-Row Header Layout & Typography Visual Harmony

To prevent horizontal crowding (`word /phonetic/ pos`) and establish visual harmony between vocabulary and pronunciation:
- **Row 1 (`.header-row`, `.anki-header-row1`):**
  - `Word` (`.word-text`, `.anki-word-text`): `19px` font-size (`font-weight: 700`, `letter-spacing: -0.02em`, `color: #FAFAFA`, `line-height: 1.2`).
  - `Part of Speech Badge` (`.pos-badge`, `.anki-pos-badge`): `11px` pill (`font-weight: 600`, `padding: 2px 7px`, `border-radius: 4px`, `text-transform: lowercase`).
  - Gap between word and badge: `12px`, with `margin-bottom: 2px`.
- **Row 2 (`.header-row-2`, `.anki-header-row2`):**
  - `Phonetic IPA` (`.phonetic-text`, `.anki-ipa-text`): `17px` font-size (`font-weight: 500`, `color: #A1A1AA`, `letter-spacing: 0.01em`, `line-height: 1.2`). Proportional to the 19px word headline, creating a balanced visual cluster.
  - Spacing: `margin-top: 2px; margin-bottom: 12px;`.
- **Global Font Family:** Modern sans-serif strictly enforced with `-webkit-font-smoothing: antialiased`:
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif !important`
- **Action Controls (`.anki-header-controls`):** Fixed at top-right containing Speaker pronunciation (`#anki-btn-audio`), Reset/Undo (`#anki-btn-reset`), and Close (`#anki-popover-close`).
- **Downward Positioning Priority:** Popover strictly opens below selection range (`top = targetRect.bottom + window.scrollY + 8`). Only flips up if viewport space below is insufficient (`< 320px`) and more room exists above.

---

## 5. Muted Pastel Badges for Part of Speech

Soft, muted pastel styling ensures badges are legible and calm without neon harshness:

| Part of Speech | Dark Background | Dark Text | Dark Border | Light Background | Light Text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Verb** | `rgba(59, 130, 246, 0.12)` | `#60A5FA` | `rgba(59, 130, 246, 0.22)` | `#EFF6FF` | `#2563EB` |
| **Noun** | `rgba(99, 102, 241, 0.12)` | `#818CF8` | `rgba(99, 102, 241, 0.22)` | `#EEF2FF` | `#4F46E5` |
| **Adjective** | `rgba(16, 185, 129, 0.12)` | `#34D399` | `rgba(16, 185, 129, 0.22)` | `#ECFDF5` | `#059669` |
| **Adverb / Other** | `rgba(245, 158, 11, 0.12)`| `#FBBF24` | `rgba(245, 158, 11, 0.22)` | `#FFFBEB` | `#D97706` |

*Badges are inline editable and automatically re-calculate their color class on input.*

---

## 6. Custom Floating Deck Dropdown Menu

Replaces standard browser `<select>` with a custom floating popup menu:
- **Trigger Button (`.anki-deck-trigger`):** Dark background (`#18181B`), subtle border (`1px solid #27272A`), folder icon (`14px`) on the left, deck title in center, and chevron-down (`12px`) on the right.
- **Floating Menu (`.anki-deck-menu`):** Floats upward (`bottom: calc(100% + 6px)`), background (`#121215`), border (`1px solid #27272A`), shadow (`0 10px 25px rgba(0,0,0,0.55)`), max height 180px with thin scrollbar.
- **Items (`.anki-deck-item`):** Font size 13px, padding 8px 10px, hover background `#27272A`. Active item highlighted with checkmark icon `✓`.
- **Dismissal:** Automatically closes on outside click or item selection.

---

## 7. AI Provider Segmented Selection Cards (Shadcn Dark Mode)

Eliminates blinding solid white card backgrounds in Dark Mode:
- **Unselected Card:** Background `#18181B` (`--surface-input`), border `1px solid #27272A`, title in `#A1A1AA` (Zinc-400), hover border `#3F3F46`.
- **Selected Card:** Dark background `#202026`, crisp border `1px solid #FAFAFA` with subtle ring `0 0 0 1px rgba(250, 250, 250, 0.15)`, title `#FAFAFA` bold.
- **Recommended Badge:** Compact pill in muted emerald (`background: rgba(16, 185, 129, 0.12)`, `color: #34D399`, `border: 1px solid rgba(16, 185, 129, 0.25)`).
- **Height & Layout:** Standardized `min-height: 56px`, `display: flex`, `flex-direction: column`, `justify-content: center`.

---

## 8. Brand Emblem & Unified Icon Identity: "The Luminary Flashcard"

Redesigned according to **UI/UX Pro Max** standards to represent the synergy of Spaced Repetition (Anki) and Artificial Intelligence:
- **Visual Metaphor:**
  - **Squircle Base Canvas (`rx: 24-28%`):** Deep linear zinc gradient (`#1E1F28` to `#090A0E`) with a refined physical edge highlight (`1px solid rgba(255, 255, 255, 0.12)`).
  - **Layered Deck Architecture:** Back card rotated by -7° with electric cyan rim (`rgba(56, 189, 248, 0.35)`), front card elevated with subtle card surface (`#161720`) and title guide line.
  - **Luminary 4-Point AI Star:** Precision astroid curve in pure white (`#FFFFFF`) with a radiant electric cyan core (`#38BDF8`), paired with a top-right satellite micro-sparkle.
- **Multisize Scalability:**
  - `16x16`: Crisp, high-contrast silhouette for Chrome toolbar and favicon.
  - `32x32` & `48x48`: Subpixel antialiased details with card outline and glowing star.
  - `128x128`: Full-fidelity master icon with deep gradients and subtle drop shadows.
- **System-Wide Icon Synchronization:**
  - **Options Page Header (`options/options.html`):** 38px brand emblem with smooth scale hover micro-interaction.
  - **Popup Header (`popup/popup.html`):** 24px brand badge emblem with updated `Anki AI Vocab v3.3` identity.
  - **Webstore & Extension Assets:** Master vector `icons/icon.svg` and supersampled PNGs `icons/icon{16,32,48,128}.png`.

---

## 9. Typography Specialization & Audio Voice Settings

- **Phonetic IPA Serif Typography (`"Times New Roman", Times, serif`):**
  - While all core UI typography strictly adheres to clean modern Sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter"`), the International Phonetic Alphabet (IPA) line (`.phonetic-text`, `.anki-ipa-text`, `.ipa`) uses `"Times New Roman", Times, serif !important`.
  - **Rationale:** Traditional serif typography renders delicate phonetic diacritics, stress marks (`ˈ`, `ˌ`), vowel glyphs (`æ`, `ə`, `ɪ`, `ʊ`), and fricatives (`θ`, `ð`, `ʃ`, `ʒ`) with superior typographical elegance, proportion, and clarity.
  - Specs: `font-size: 17px !important`, `font-weight: 400`, `letter-spacing: 0.03em`, `color: #A1A1AA` (dark) / `#71717A` (light).
- **Audio Voice Selection Architecture:**
  - Configuration key: `audioVoice` (`'random'` | `'male'` | `'female'`).
  - Stored in `chrome.storage.sync` and selectable in Options Settings under Section 3.
  - Integrates with AnkiConnect `storeMediaFile` via high-quality dictionary endpoints (US Male vs. UK/US Female) and Web Speech API synthesis.

---

## 10. Draggable Popover Interaction Standards

To ensure users can freely read underlying article text obscured by the dictionary card:
- **Drag Handle Surface:**
  - The Popover Header (`.anki-popover-header`) serves as the dedicated drag handle (`cursor: grab;`).
  - When actively dragging, `.anki-is-dragging` is applied with `cursor: grabbing !important;` and an elevated shadow (`box-shadow: 0 18px 42px rgba(0, 0, 0, 0.55)`).
- **Interactive Control Protection:**
  - Non-drag selectors (`button, [contenteditable="true"], .anki-editable, input, textarea, a, .anki-header-controls`) are explicitly excluded.
  - Clicking audio pronunciation, reset/undo, close (`×`), or inline text fields remains 100% interactive without triggering accidental drags.
- **Viewport Boundary Constraints:**
  - Movement is constrained in real-time within viewport boundaries (`8px` margin from all edges) accounting for current page scroll offsets (`window.scrollX`, `window.scrollY`).
  - Prevents dragging the popover off-screen or losing visibility.
- **Anti-Selection Protection:**
  - `user-select: none;` is enabled on `document.body` while dragging (`pointerdown` → `pointerup`) to prevent disruptive text selection on the host webpage.
- **State Preservation (`_hasBeenDragged`):**
  - Once manually moved by the user, automatic vertical collision repositioning in `renderPopoverLoadedData` is bypassed, keeping the card at the exact user-defined coordinates.

---

## 11. Persistent Popover Mode (Pin Mode & Close Control)

To support uninterrupted reading, note-taking, and studying workflows:
- **Core Problem:** By default, clicking outside dismisses the popover immediately. When users want to reference vocabulary definitions while scrolling through an article, taking notes, or clicking other tabs, premature popover dismissal disrupts the cognitive flow.
- **Configurable Pin Mode (`closeOnlyOnX`):**
  - Option added to Options Page (Section 3: Preferences & Performance, Switch 4).
  - Title: **Close Only via Close Button ('×')**.
  - Description: *Keep popover open when clicking outside on the page. Only dismiss when clicking the '×' button or pressing Esc.*
  - Default: `false` (preserves conventional lightweight dismiss-on-outside-click for standard users).
- **Dismissal Mechanism when Pin Mode is Enabled (`closeOnlyOnX: true`):**
  - The global outside `pointerdown` dismissal listener is bypassed for `activePopoverEl`.
  - The popover remains persistently visible and usable on the page during clicks, mouse selections, and scrolling.
  - Dismissal is strictly restricted to intentional actions:
    1. Clicking the close button (`#anki-popover-close` / '×') in the popover header.
    2. Pressing the `Escape` keyboard shortcut (unless currently editing inline text).
    3. Triggering a new dictionary lookup (which cleanly replaces the current card).
    4. Successful card creation in Anki (if `autoCloseOnSuccess` is enabled).
- **Real-Time Storage Synchronization:**
  - `chrome.storage.onChanged` in `content.js` continuously synchronizes `closeOnlyOnX` changes across all active tabs without requiring page reload.

---

## 12. Context-Aware Cache Architecture & Force Re-Analyze Control

### A. Context-Aware Cache Key (Polysemy & Sentence Context Isolation)
- **Problem Solved:** Legacy lookups keyed purely on `word` caused polysemous terms (e.g., "bank", "lead", "charge") to return cached financial meanings when encountered in geographical or physical contexts ("river bank").
- **FNV-1a Context Hash Algorithm:**
  - Cache key syntax: `vocab_${cleanWord}_${cleanLang}_${ctxHash}` where `ctxHash` is computed via 32-bit FNV-1a over normalized sentence text (`cleanSentence = sentence.toLowerCase().replace(/\s+/g, ' ').trim()`).
  - Fallback key: `vocab_${cleanWord}_${cleanLang}_nocontext` when lookup occurs without surrounding sentence context.
  - Guarantees 0ms cache hits for identical sentences while ensuring distinct contextual meanings are accurately analyzed and stored independently.

### B. Header Re-lookup / Force Refresh Button (`#anki-btn-relookup`)
- **Visual Design:**
  - Positioned between Audio (`#anki-btn-audio`) and Undo/Reset (`#anki-btn-reset`).
  - Feather/Phosphor circular arrow icon with hover rotation cue (`transform: rotate(45deg); transition: transform 0.2s ease`).
- **Interaction & State:**
  - Clicking triggers smooth spin animation (`.anki-spinning`), invalidates local memory and storage cache for the specific context key, displays lightweight skeleton shimmer in the body, and requests fresh Gemini AI analysis with `bypassCache: true`.
  - On response, updates live popover content, re-caches fresh data, and updates `_originalAiData` so Reset can revert to the new analysis.

### C. Refined Curvature & Seamless Bottom Edge Geometry
- **Design Tokens:** `--radius: 12px;` with elevated zinc box-shadows.
- **Edge Bleed Elimination:**
  - Popover uses `overflow: visible;` to allow the target deck selector dropdown to open downward without being clipped.
  - To prevent child element backgrounds (`#0E0F14` or `#FFFFFF`) from bleeding outside the rounded 1px container border and creating a square bottom edge:
    - `.anki-popover-header`: `border-top-left-radius: calc(var(--radius) - 1px); border-top-right-radius: calc(var(--radius) - 1px);`
    - `.anki-popover-footer`: `border-bottom-left-radius: calc(var(--radius) - 1px); border-bottom-right-radius: calc(var(--radius) - 1px); background-clip: padding-box;`
  - Restores a crisp, modern, completely unified rounded silhouette across all themes and states.

---

## 13. Popup UX Overhaul & Active Tab Selection Auto-Fill

### A. Active Webpage Selection Auto-Detection
- When the extension toolbar icon is clicked, `popup.js` queries the active tab via `chrome.tabs.query` and `chrome.scripting.executeScript`.
- Automatically extracts `window.getSelection()`, retrieves the surrounding sentence context, pre-fills both `quick-word` and `quick-sentence` inputs, and auto-invokes `handleQuickLookup()`.
- Provides an immediate definition with zero manual copy-pasting.

### B. Natural Content-Fitting Geometry (No Empty Void)
- Replaced fixed `min-height: 480px` with dynamic `min-height: auto; max-height: 580px; overflow-y: auto;`.
- Before lookups, an intentional `#popup-idle-guide` hint box replaces the former empty space, keeping the popup compact (under 280px tall) and purposeful.
- Removed redundant bottom `Settings ↗` link in favor of the persistent header gear button.

### C. Modern Shadcn Action Bar & Target Deck Selector
- Replaced the unstyled browser button with a polished Zinc action bar matching the Popover:
  - Custom target deck selector dropdown (`#popup-deck-select`) allowing dynamic deck switching and persisting choice to `chrome.storage.sync`.
  - Precision Add to Anki button (`.btn-add-anki`) with loading spinner and feedback states.

### D. Inline Editing, Re-lookup & Voice Selection Parity
- Full inline editing (`contenteditable="true"` with `.result-editable`) across all word, phonetic, meaning, definition, and example fields in the popup result card.
- Synchronized Web Speech API voice filtering matching `audioVoice` preference (`random`, `male`, `female`).
- Added Re-lookup / Force Refresh (`#btn-popup-relookup`) and Reset / Undo (`#btn-popup-reset`) control buttons.

---

## 14. Complete Context Sentence Translation & Standalone Word Example Generation

### A. 100% Complete Sentence Translation (Elimination of Clause Omission)
- **Problem Solved:** When users highlighted long or compound English sentences (e.g. *"Being read to is a magical experience for kids, and is a crucial stepping stone for language learning."*), previous models frequently summarized or dropped secondary clauses, translating only the first half.
- **Root Causes:**
  1. Lack of explicit prompt directives enforcing exhaustive, clause-by-clause translation.
  2. Overly restrictive `maxOutputTokens: 250` which choked multi-clause Vietnamese translations (Vietnamese BPE tokenization requires 2-4 tokens per word due to compound terms and diacritics).
- **Architecture Solution:**
  - Expanded `maxOutputTokens` from `250` to `450` tokens in `generationConfig`, providing ample headroom for complex multi-clause sentences.
  - Implemented explicit System Prompt rules: *"Translate 100% of the entire Context sentence completely into {{target_lang}} for example_vi. Never omit, truncate, drop, or summarize any clause, phrase, or conjunction (including clauses connected by 'and', 'but', 'because', 'so', or relative pronouns)."*

### B. Auto-Generated Example Sentence for Standalone Word Lookups
- **Problem Solved:** When users highlighted a standalone word without surrounding text (or manually typed a word in the extension popup with an empty context box), the popover or popup previously omitted the example box entirely or rendered only the solitary word as an "example".
- **Dynamic Context Detection:**
  - `isRealContext = rawSentence && rawSentence.toLowerCase() !== cleanWord.toLowerCase() && rawSentence.split(/\s+/).length >= 3;`
  - When `isRealContext === false`:
    1. Schema is instructed to generate a practical, natural B1-B2 level English sentence containing the target word in `example_en`.
    2. Model translates 100% of this generated sentence into `example_vi`.
    3. Added `example_en: { type: "STRING" }` to Gemini `responseSchema` and marked it required along with `example_vi`.
- **UI & Anki Synchronization:**
  - `renderPopoverLoadedData` and `renderQuickResult` display both lines (`example_sentence` and `example_translation`) cleanly in the example box.
  - `getEditedCardData` and Anki note creator seamlessly write the generated English example and Vietnamese translation to Anki flashcards, ensuring rich, actionable cards even when studying single words.








