/**
 * Content Script for Anki AI Vocab (Manifest V3)
 * Implements Compact Floating Popover (NO BACKDROP / 100% NON-BLOCKING TAB)
 * 375px Width, Target Deck Selector, Enhanced Typography, 100% English
 */

(() => {
  // Prevent duplicate execution
  if (window.__ANKI_AI_VOCAB_INJECTED__) return;
  window.__ANKI_AI_VOCAB_INJECTED__ = true;

  // Constants
  const POPOVER_WIDTH = 380;
  const ESTIMATED_POPOVER_HEIGHT = 420;
  const OFFSET_GAP = 8;
  const VIEWPORT_MARGIN = 16;

  // Safe DOM query helpers
  const $ = (selector, context = shadowRoot || document) => (context?.querySelector ? context.querySelector(selector) : null);
  const $$ = (selector, context = shadowRoot || document) => (context?.querySelectorAll ? context.querySelectorAll(selector) : []);

  // Inlined Scoped Stylesheet for Shadow DOM
  const POPOVER_CSS = `/**
 * Compact Floating Popover Styles (Shadow DOM Encapsulated)
 * Design Style: Modern Linear / Shadcn UI / Clean Typography
 * 375px Width, 2-Row Header, Muted Pastel Badges & Custom Deck Dropdown Menu
 */

:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif !important;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

:host, .popover-container, *:not(.phonetic-text):not(.anki-ipa-text):not(.ipa) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
}

*, *::before, *::after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
}

/* =========================================================
   DESIGN TOKENS (SHADCN ZINC PALETTE)
   ========================================================= */
:host,
:host([data-theme="light"]) {
  /* Light Mode */
  --popover-bg: #FFFFFF;
  --border: #E4E4E7;            /* Zinc-200 */
  --text-primary: #09090B;      /* Zinc-950 */
  --text-secondary: #71717A;    /* Zinc-500 */
  --text-muted: #A1A1AA;        /* Zinc-400 */
  --badge-bg: #F4F4F5;          /* Zinc-100 */
  --badge-text: #18181B;        /* Zinc-900 */
  --btn-bg: #18181B;            /* Zinc-900 */
  --btn-text: #FAFAFA;          /* Zinc-50 */
  --btn-hover: #27272A;         /* Zinc-800 */
  --btn-secondary-bg: #F4F4F5;
  --btn-secondary-hover: #E4E4E7;
  --hover-bg: #F4F4F5;          /* Zinc-100 */
  --skeleton-bg: #F4F4F5;
  --skeleton-shine: #E4E4E7;
  --success: #10B981;
  --success-bg: #ECFDF5;
  --danger: #EF4444;
  --danger-bg: #FEF2F2;
  --radius: 12px;
  --shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
}

:host([data-theme="dark"]) {
  /* Explicit Dark Mode (PeakPlanner Theme) */
  --popover-bg: #0E0F14;
  --border: #242530;
  --text-primary: #FFFFFF;
  --text-secondary: #9698A6;
  --text-muted: #646675;
  --badge-bg: #1F202A;
  --badge-text: #FFFFFF;
  --btn-bg: #FFFFFF;
  --btn-text: #0E0F14;
  --btn-hover: #E4E5EB;
  --btn-secondary-bg: #1F202A;
  --btn-secondary-hover: #292B38;
  --hover-bg: #171820;
  --skeleton-bg: #171820;
  --skeleton-shine: #242530;
  --success: #10B981;
  --success-bg: #064E3B;
  --danger: #F87171;
  --danger-bg: #450A0A;
  --radius: 12px;
  --shadow: 0 16px 42px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4);
}

@media (prefers-color-scheme: dark) {
  :host(:not([data-theme="light"])) {
    /* Auto Dark Mode */
    --popover-bg: #0E0F14;
    --border: #242530;
    --text-primary: #FFFFFF;
    --text-secondary: #9698A6;
    --text-muted: #646675;
    --badge-bg: #1F202A;
    --badge-text: #FFFFFF;
    --btn-bg: #FFFFFF;
    --btn-text: #0E0F14;
    --btn-hover: #E4E5EB;
    --btn-secondary-bg: #1F202A;
    --btn-secondary-hover: #292B38;
    --hover-bg: #171820;
    --skeleton-bg: #171820;
    --skeleton-shine: #242530;
    --success: #10B981;
    --success-bg: #064E3B;
    --danger: #F87171;
    --danger-bg: #450A0A;
    --radius: 12px;
    --shadow: 0 16px 42px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4);
  }
}

/* =========================================================
   1. QUICK TRIGGER PILL BUTTON (FLOATING NEAR SELECTION)
   ========================================================= */
.anki-quick-trigger {
  position: absolute;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  background: var(--popover-bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.14s ease;
  user-select: none;
  animation: anki-fade-in 0.12s ease-out;
}

.anki-quick-trigger:hover {
  background: var(--hover-bg);
  border-color: var(--text-muted);
}

.anki-quick-trigger svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
  flex-shrink: 0;
}

/* =========================================================
   2. COMPACT FLOATING POPOVER (375PX WIDTH)
   ========================================================= */
.anki-floating-popover {
  position: absolute;
  z-index: 2147483647;
  width: 400px;
  max-width: 95vw;
  max-height: 560px;
  background: var(--popover-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: visible; /* Allows custom dropdown menu to open downward cleanly */
  user-select: text;
  color: var(--text-primary);
  animation: anki-scale-in 0.14s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto;
  box-sizing: border-box;
}

/* Custom Slim Scrollbar */
.anki-popover-content::-webkit-scrollbar {
  width: 4px;
}
.anki-popover-content::-webkit-scrollbar-track {
  background: transparent;
}
.anki-popover-content::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}
.anki-popover-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* =========================================================
   POPOVER HEADER (2-ROW TYPOGRAPHY STRUCTURE & DRAG HANDLE)
   ========================================================= */
.anki-popover-header {
  padding: 14px 16px 8px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  cursor: grab;
  user-select: none;
  background: var(--popover-bg);
  border-top-left-radius: calc(var(--radius) - 1px);
  border-top-right-radius: calc(var(--radius) - 1px);
  flex-shrink: 0;
  box-sizing: border-box;
}

/* Ensure interactive controls in header maintain their normal cursors */
.anki-popover-header .anki-header-controls,
.anki-popover-header .anki-btn-icon,
.anki-popover-header .anki-editable,
.anki-popover-header [contenteditable="true"] {
  cursor: default;
}

.anki-popover-header .anki-btn-icon {
  cursor: pointer;
}

.anki-popover-header .anki-editable,
.anki-popover-header [contenteditable="true"] {
  cursor: text;
  user-select: text;
}

/* Active Dragging States */
.anki-floating-popover.anki-is-dragging,
.anki-floating-popover.anki-is-dragging * {
  cursor: grabbing !important;
  user-select: none !important;
}

.anki-floating-popover.anki-is-dragging {
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.15);
  transition: box-shadow 0.15s ease;
}

:host([data-theme="light"]) .anki-floating-popover.anki-is-dragging {
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18), 0 0 0 1px #E4E4E7;
}

.anki-header-left {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

/* Row 1: Word + Part of Speech Badge */
.header-row,
.anki-header-row1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
  min-width: 0;
}

.word-text,
.anki-word-text {
  font-size: 19px !important;       /* Cỡ chữ to vừa phải, hiện đại */
  font-weight: 700 !important;
  letter-spacing: -0.02em;
  color: #FAFAFA !important;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

:host([data-theme="light"]) .word-text,
:host([data-theme="light"]) .anki-word-text {
  color: #09090B !important;
}

/* Row 2: Phonetic IPA (Specialized Serif: Times New Roman for crisp IPA symbols) */
.header-row-2,
.anki-header-row2 {
  display: flex;
  align-items: center;
}

.phonetic-text,
.anki-ipa-text,
.ipa {
  font-family: "Times New Roman", Times, serif !important;
  font-size: 17px !important;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0.03em;
  color: #A1A1AA !important;
  margin-top: 2px;
  margin-bottom: 12px;
  line-height: 1.2;
}

:host([data-theme="light"]) .phonetic-text,
:host([data-theme="light"]) .anki-ipa-text,
:host([data-theme="light"]) .ipa {
  color: #71717A !important;
}

/* Part of Speech Badges (Refined Pastel / Muted Tones) */
.pos-badge,
.anki-pos-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 2px 7px;
  border-radius: 4px;
  line-height: 1.25;
  flex-shrink: 0;
  text-transform: lowercase;
  letter-spacing: 0.02em;
  transition: all 0.12s ease;
  user-select: text;
}

/* Dark Mode POS Badges */
.anki-pos-badge.pos-verb {
  background-color: rgba(59, 130, 246, 0.12);
  color: #60A5FA;
  border: 1px solid rgba(59, 130, 246, 0.22);
}

.anki-pos-badge.pos-noun {
  background-color: rgba(99, 102, 241, 0.12);
  color: #818CF8;
  border: 1px solid rgba(99, 102, 241, 0.22);
}

.anki-pos-badge.pos-adj {
  background-color: rgba(16, 185, 129, 0.12);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.22);
}

.anki-pos-badge.pos-adv,
.anki-pos-badge.pos-other {
  background-color: rgba(245, 158, 11, 0.12);
  color: #FBBF24;
  border: 1px solid rgba(245, 158, 11, 0.22);
}

/* Light Mode POS Badges */
:host([data-theme="light"]) .anki-pos-badge.pos-verb {
  background-color: #EFF6FF;
  color: #2563EB;
  border: 1px solid #BFDBFE;
}

:host([data-theme="light"]) .anki-pos-badge.pos-noun {
  background-color: #EEF2FF;
  color: #4F46E5;
  border: 1px solid #C7D2FE;
}

:host([data-theme="light"]) .anki-pos-badge.pos-adj {
  background-color: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
}

:host([data-theme="light"]) .anki-pos-badge.pos-adv,
:host([data-theme="light"]) .anki-pos-badge.pos-other {
  background-color: #FFFBEB;
  color: #D97706;
  border: 1px solid #FDE68A;
}

.anki-header-controls {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.anki-btn-icon {
  background: transparent;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s ease;
}

.anki-btn-icon:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.anki-btn-relookup:hover svg {
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.anki-spinning svg,
svg.anki-spinning,
.anki-btn-icon.anki-spinning svg {
  animation: anki-spin 0.6s linear infinite !important;
}

.anki-btn-audio {
  width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  background: var(--badge-bg) !important;
  border: 1px solid var(--border) !important;
  color: var(--text-secondary);
  transition: all 0.15s ease;
}

.anki-btn-audio:hover {
  background: var(--hover-bg) !important;
  color: var(--text-primary) !important;
  transform: scale(1.08);
}

/* =========================================================
   POPOVER BODY CONTENT (CLEAR TYPOGRAPHY)
   ========================================================= */
.anki-popover-content {
  padding: 14px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  box-sizing: border-box;
}

/* High-Legibility Meaning Row */
.anki-meaning-row {
  flex-shrink: 0;
  font-size: 15.5px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.45;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* English Definition */
.anki-def-row {
  flex-shrink: 0;
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* Context Example with Spacious Padding & Border */
.anki-example-box {
  flex-shrink: 0;
  margin-top: 2px;
  border-left: 2px solid rgba(255, 255, 255, 0.18);
  padding: 6px 0 6px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: transparent;
  border-radius: 0;
  box-sizing: border-box;
}

:host([data-theme="light"]) .anki-example-box {
  border-left: 2px solid rgba(0, 0, 0, 0.12);
}

.anki-example-en {
  color: var(--text-primary);
  font-size: 13.5px;
  line-height: 1.6;
  font-style: italic;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.anki-example-en b,
.anki-example-en strong,
.anki-example-highlight {
  color: #38bdf8 !important;
  font-weight: 700 !important;
  font-style: normal !important;
}

:host([data-theme="light"]) .anki-example-highlight,
:host([data-theme="light"]) .anki-example-en b,
:host([data-theme="light"]) .anki-example-en strong {
  color: #0284c7 !important;
}

.anki-example-vi {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  font-style: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* =========================================================
   INLINE EDITABLE FIELDS (ZERO LAYOUT SHIFT)
   ========================================================= */
.anki-editable {
  outline: none;
  cursor: text;
  border-radius: 4px;
  font-size: inherit;
  transition: background-color 0.12s ease, box-shadow 0.12s ease;
  padding: 1px 4px;
  margin: -1px -4px;
  position: relative;
}

.anki-editable:hover {
  background-color: var(--hover-bg);
}

.anki-editable:focus {
  outline: none;
  background-color: var(--hover-bg);
  box-shadow: 0 0 0 1px var(--text-muted);
}

.anki-word-text.anki-editable {
  min-width: 32px;
  display: inline-block;
}

.anki-word-text.anki-editable:focus {
  overflow: visible;
  text-overflow: clip;
  max-width: 260px;
}

.anki-ipa-text.anki-editable {
  min-width: 24px;
  display: inline-block;
}

.anki-pos-badge.anki-editable {
  cursor: text;
}

.anki-meaning-row.anki-editable {
  min-height: 22px;
}

.anki-def-row.anki-editable {
  min-height: 20px;
}

.anki-example-en.anki-editable {
  min-height: 20px;
}

.anki-example-vi.anki-editable {
  min-height: 18px;
}

.anki-editable[placeholder]:empty::before {
  content: attr(placeholder);
  color: var(--text-muted);
  font-style: italic;
  pointer-events: none;
}

/* =========================================================
   POPOVER FOOTER WITH CUSTOM DECK DROPDOWN MENU
   ========================================================= */
.anki-popover-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--popover-bg);
  position: relative;
  border-bottom-left-radius: calc(var(--radius) - 1px);
  border-bottom-right-radius: calc(var(--radius) - 1px);
  background-clip: padding-box;
  flex-shrink: 0;
  box-sizing: border-box;
}

.anki-deck-dropdown-container {
  position: relative;
  display: inline-flex;
}

/* Trigger Button */
.anki-deck-trigger {
  background-color: #18181B;
  border: 1px solid #27272A;
  border-radius: 6px;
  height: 32px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #E4E4E7;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 500;
  transition: all 0.14s ease;
  max-width: 175px;
  outline: none;
  user-select: none;
}

.anki-deck-trigger:hover {
  background-color: #27272A;
  border-color: #3F3F46;
  color: #FFFFFF;
}

.anki-deck-trigger.active {
  border-color: #52525B;
  background-color: #27272A;
}

.anki-deck-icon {
  width: 14px;
  height: 14px;
  color: #A1A1AA;
  flex-shrink: 0;
}

.anki-deck-current-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
  color: inherit;
}

.anki-deck-chevron {
  width: 12px;
  height: 12px;
  color: #71717A;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.anki-deck-trigger.active .anki-deck-chevron {
  transform: rotate(180deg);
}

/* Custom Floating Dropdown Menu (Opens downward below trigger button) */
.deck-menu,
.anki-deck-menu {
  position: absolute;
  top: calc(100% + 6px) !important;
  bottom: auto !important;
  left: 0 !important;
  min-width: 190px;
  max-width: 270px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #121215;
  border: 1px solid #27272A;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.55);
  z-index: 100;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: anki-fade-in 0.12s ease-out;
}

/* Custom thin scrollbar for deck menu */
.anki-deck-menu::-webkit-scrollbar {
  width: 4px;
}
.anki-deck-menu::-webkit-scrollbar-track {
  background: transparent;
}
.anki-deck-menu::-webkit-scrollbar-thumb {
  background: #27272A;
  border-radius: 2px;
}
.anki-deck-menu::-webkit-scrollbar-thumb:hover {
  background: #3F3F46;
}

.anki-deck-item {
  padding: 8px 10px;
  font-size: 13px;
  color: #E4E4E7;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: background-color 0.12s ease, color 0.12s ease;
  user-select: none;
}

.anki-deck-item:hover {
  background-color: #27272A;
  color: #FFFFFF;
}

.anki-deck-item.selected {
  color: #FAFAFA;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.05);
}

.anki-deck-item-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.anki-deck-item-check {
  width: 13px;
  height: 13px;
  color: var(--success);
  flex-shrink: 0;
}

/* Light Mode Overrides for Deck Dropdown */
:host([data-theme="light"]) .anki-deck-trigger {
  background-color: #F4F4F5;
  border: 1px solid #E4E4E7;
  color: #18181B;
}

:host([data-theme="light"]) .anki-deck-trigger:hover {
  background-color: #E4E4E7;
  border-color: #D4D4D8;
}

:host([data-theme="light"]) .anki-deck-icon {
  color: #71717A;
}

:host([data-theme="light"]) .deck-menu,
:host([data-theme="light"]) .anki-deck-menu {
  background-color: #FFFFFF;
  border: 1px solid #E4E4E7;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

:host([data-theme="light"]) .anki-deck-item {
  color: #18181B;
}

:host([data-theme="light"]) .anki-deck-item:hover {
  background-color: #F4F4F5;
  color: #09090B;
}

:host([data-theme="light"]) .anki-deck-item.selected {
  color: #09090B;
  background-color: #F4F4F5;
}

:host([data-theme="light"]) .anki-deck-menu::-webkit-scrollbar-thumb {
  background: #E4E4E7;
}

.anki-btn-add {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--btn-bg);
  color: var(--btn-text);
  transition: all 0.12s ease;
  user-select: none;
  flex-shrink: 0;
}

.anki-btn-add:hover {
  background: var(--btn-hover);
}

.anki-btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.anki-btn-add.anki-added {
  background: var(--success);
  color: #FFFFFF;
}

/* =========================================================
   SKELETON SHIMMER LOADER
   ========================================================= */
.anki-skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}

.anki-skeleton {
  background: linear-gradient(90deg, var(--skeleton-bg) 25%, var(--skeleton-shine) 50%, var(--skeleton-bg) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: anki-shimmer 1.4s infinite ease-in-out;
}

.anki-skeleton-title {
  height: 18px;
  width: 55%;
}

.anki-skeleton-line {
  height: 14px;
  width: 90%;
}

.anki-skeleton-box {
  height: 44px;
  width: 100%;
  margin-top: 2px;
}

@keyframes anki-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* =========================================================
   ERROR / WARNING BANNER
   ========================================================= */
.anki-popover-banner {
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12.5px;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.anki-banner-error {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid var(--danger);
}

/* Minimal Spinner */
.anki-spinner-sm {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: anki-spin 0.6s linear infinite;
  display: inline-block;
  opacity: 0.8;
}

@keyframes anki-spin {
  to { transform: rotate(360deg); }
}

@keyframes anki-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes anki-scale-in {
  from { opacity: 0; transform: scale(0.97) translateY(2px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
`;

  const ICONS = {
    spark: `<svg viewBox="0 0 24 24"><path d="M12 2L14.39 8.26L21 9.27L16.09 13.74L17.5 20.24L12 16.9L6.5 20.24L7.91 13.74L3 9.27L9.61 8.26L12 2Z"/></svg>`,
    speaker: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`,
    undo: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
    close: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    check: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    alert: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    deck: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    chevron: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    crop: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`
  };

  const CHIPS_CSS = `
/* =========================================================
   CAPTURED CONTEXT & SELECTION LOOKUP (STREAMLINED UX)
   ========================================================= */
.anki-context-wrap {
  position: relative;
  flex-shrink: 0;
  max-height: 140px;
  overflow-y: auto;
  margin-bottom: 4px;
  padding: 8px 10px;
  background: var(--badge-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-sizing: border-box;
}

.anki-context-wrap::-webkit-scrollbar {
  width: 3px;
}
.anki-context-wrap::-webkit-scrollbar-track {
  background: transparent;
}
.anki-context-wrap::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.anki-context-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  min-height: 20px;
  line-height: 1;
}

.anki-context-title {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  user-select: none;
}

.anki-context-action-bar {
  display: inline-flex;
  align-items: center;
}

.anki-context-hint {
  font-size: 10.5px;
  color: var(--text-muted);
  user-select: none;
}

/* Header Lookup Button (visible when text is selected) */
.anki-ctx-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  background: rgba(56, 189, 248, 0.16);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  line-height: 1.2;
  transition: all 0.12s ease;
  user-select: none;
}

.anki-ctx-header-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

/* Flowing natural sentence container */
.anki-context-sentence {
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--text-secondary);
  user-select: text !important;
  -webkit-user-select: text !important;
  word-break: break-word;
  overflow-wrap: break-word;
}

.anki-context-sentence::selection,
.anki-context-sentence *::selection {
  background: rgba(56, 189, 248, 0.35) !important;
  color: #ffffff !important;
}

/* Interactive individual words */
.anki-ctx-word {
  display: inline;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.12s ease, color 0.12s ease;
  padding: 0 1px;
}

.anki-ctx-word:hover {
  background: rgba(56, 189, 248, 0.14);
  color: #38bdf8;
}

/* Target currently being analyzed */
.anki-ctx-target-pill {
  display: inline;
  background: rgba(56, 189, 248, 0.18);
  color: #38bdf8;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* Floating Action Pill attached to active popover */
.anki-selection-pill {
  position: absolute;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  animation: ankiPillFadeIn 0.14s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.3);
  border-radius: 6px;
  pointer-events: auto;
}

@keyframes ankiPillFadeIn {
  from { opacity: 0; transform: translateY(4px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.anki-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: #0284c7;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  line-height: 1;
  white-space: nowrap;
  transition: background 0.12s ease, transform 0.08s ease;
  user-select: none;
}

.anki-pill-btn:hover {
  background: #0369a1;
  transform: scale(1.02);
}

.anki-pill-btn:active {
  transform: scale(0.98);
}

.anki-pill-btn svg {
  flex-shrink: 0;
}

.anki-pill-key {
  font-size: 9.5px;
  background: rgba(255, 255, 255, 0.22);
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 2px;
  font-family: inherit;
}
`;

  /**
   * Returns pastel/muted color class according to part of speech
   */
    /**
   * Helper functions for Context Normalization & Highlighting
   */
  function cleanContextSpacing(str) {
    if (!str) return '';
    return str
      .replace(/\r\n|\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+([.,!?;:)]}”’])/g, '$1')
      .replace(/([([{“‘])\s+/g, '$1')
      .replace(/\s+('\w+)/g, '$1')
      .trim();
  }

  function isMostlyAllCaps(str) {
    if (!str) return false;
    const letters = str.replace(/[^a-zA-ZÀ-ỹ]/g, '');
    if (letters.length < 5) return false;
    const upperCount = (letters.match(/[A-ZÀ-Ý]/g) || []).length;
    return (upperCount / letters.length) > 0.7;
  }

  function toSentenceCase(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-zà-ỹ])/g, (m, p1, p2) => p1 + p2.toUpperCase())
      .replace(/\bi\b/g, 'I');
  }

  function normalizeContextSentence(raw) {
    if (!raw) return '';
    let cleaned = cleanContextSpacing(raw);
    if (isMostlyAllCaps(cleaned)) {
      cleaned = toSentenceCase(cleaned);
    }
    return cleaned;
  }

  function highlightWordInSentence(sentence, targetWord) {
    if (!sentence) return '';
    if (!targetWord) return escapeHtml(sentence);

    const cleanWord = targetWord.trim();
    if (!cleanWord) return escapeHtml(sentence);

    const escapedWord = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(^|[^a-zA-Z0-9À-ỹ])(' + escapedWord + ')([^a-zA-Z0-9À-ỹ]|$)', 'i');
    const match = sentence.match(regex);

    if (match) {
      const prefix = sentence.substring(0, match.index + match[1].length);
      const matchedText = match[2];
      const suffix = sentence.substring(match.index + match[1].length + matchedText.length);
      return `${escapeHtml(prefix)}<b class="anki-example-highlight">${escapeHtml(matchedText)}</b>${escapeHtml(suffix)}`;
    }

    const lowerSentence = sentence.toLowerCase();
    const lowerWord = cleanWord.toLowerCase();
    const idx = lowerSentence.indexOf(lowerWord);
    if (idx !== -1) {
      const prefix = sentence.substring(0, idx);
      const matchedText = sentence.substring(idx, idx + cleanWord.length);
      const suffix = sentence.substring(idx + cleanWord.length);
      return `${escapeHtml(prefix)}<b class="anki-example-highlight">${escapeHtml(matchedText)}</b>${escapeHtml(suffix)}`;
    }

    return escapeHtml(sentence);
  }

  /**
   * Session-level Context Manager
   * Preserves translation of context sentence across lookups and eliminates redundant re-translations.
   */
  class ContextSessionManager {
    constructor() {
      this.currentSentence = '';
      this.unifiedTranslation = '';
      this.wordCache = new Map();
    }

    normalizeKey(str) {
      if (!str) return '';
      return str.toLowerCase().trim().replace(/^[^w\sÀ-ỹ]+|[^w\sÀ-ỹ]+$/g, '');
    }

    initSession(sentence, initialTranslation = '') {
      const normSentence = normalizeContextSentence(sentence || '').trim();
      const normKey = this.normalizeKey(normSentence);
      const curKey = this.normalizeKey(this.currentSentence);

      if (normKey && curKey && normKey !== curKey) {
        this.currentSentence = normSentence;
        this.unifiedTranslation = initialTranslation ? initialTranslation.trim() : '';
        this.wordCache.clear();
      } else {
        if (!this.currentSentence) this.currentSentence = normSentence;
        if (initialTranslation && (!this.unifiedTranslation || this.unifiedTranslation.length < 5)) {
          this.unifiedTranslation = initialTranslation.trim();
        }
      }
    }

    setTranslation(translation) {
      if (translation && typeof translation === 'string') {
        const clean = translation.trim();
        if (clean && (!this.unifiedTranslation || this.unifiedTranslation.length < 5)) {
          this.unifiedTranslation = clean;
        }
      }
    }

    getUnifiedTranslation() {
      return this.unifiedTranslation;
    }

    hasTranslation() {
      return Boolean(this.unifiedTranslation && this.unifiedTranslation.trim().length > 0);
    }

    setWordData(wordOrPhrase, cardData) {
      const k = this.normalizeKey(wordOrPhrase);
      if (k && cardData) {
        this.wordCache.set(k, cardData);
      }
      if (cardData?.word) {
        const kw = this.normalizeKey(cardData.word);
        if (kw) this.wordCache.set(kw, cardData);
      }
      if (cardData?.raw_selected_word) {
        const kr = this.normalizeKey(cardData.raw_selected_word);
        if (kr) this.wordCache.set(kr, cardData);
      }
      const trans = cardData?.example_translation || cardData?.example_vi;
      if (trans) {
        this.setTranslation(trans);
      }
    }

    getWordData(wordOrPhrase) {
      const k = this.normalizeKey(wordOrPhrase);
      return k ? this.wordCache.get(k) : null;
    }

    hasWordData(wordOrPhrase) {
      const k = this.normalizeKey(wordOrPhrase);
      return k ? this.wordCache.has(k) : false;
    }

    invalidate(wordOrPhrase) {
      const k = this.normalizeKey(wordOrPhrase);
      if (k) this.wordCache.delete(k);
    }

    reset() {
      this.currentSentence = '';
      this.unifiedTranslation = '';
      this.wordCache.clear();
    }
  }

  const globalContextSession = new ContextSessionManager();

  /**
   * Standardize Part of Speech (POS) to unified full lowercase dictionary categories
   * Eliminates discrepancies between abbreviations ("prep", "prep.", "n", "v", "adj", "adv")
   * and full words ("preposition", "noun", "verb", "adjective", "adverb").
   */
  function normalizePos(rawPos) {
    if (!rawPos || typeof rawPos !== 'string') return 'noun';
    const clean = rawPos.trim().toLowerCase().replace(/[()[\]{}:;]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean || clean === 'null' || clean === 'undefined') return 'noun';

    const stripped = clean.replace(/\.+$/, '').trim();

    // 1. Phrasal verb & Idiom first (prevent 'verb' from intercepting 'phrasal verb')
    if (stripped === 'phr v' || stripped === 'phrv' || stripped.includes('phrasal')) {
      return 'phrasal verb';
    }
    if (stripped === 'idm' || stripped.includes('idiom') || stripped === 'collocation') {
      return 'idiom';
    }

    // 2. Preposition (prep, prep., preposition, etc.)
    if (stripped === 'prep' || stripped.startsWith('prep') || stripped.includes('prepos')) {
      return 'preposition';
    }

    // 3. Conjunction (conj, conj., conjunction, etc.)
    if (stripped === 'conj' || stripped.startsWith('conj') || stripped.includes('conjunc')) {
      return 'conjunction';
    }

    // 4. Pronoun (pron, pron., pronoun, etc.)
    if (stripped === 'pron' || stripped.startsWith('pron') || stripped.includes('pronoun')) {
      return 'pronoun';
    }

    // 5. Interjection (interj, int, interjection, exclamation, etc.)
    if (stripped === 'interj' || stripped === 'int' || stripped.includes('interjec') || stripped.includes('exclam')) {
      return 'interjection';
    }

    // 6. Adjective (adj, a, adjective, etc.)
    if (stripped === 'adj' || stripped === 'a' || stripped.startsWith('adj') || stripped.includes('adjectiv')) {
      return 'adjective';
    }

    // 7. Adverb (adv, adverb, etc.)
    if (stripped === 'adv' || stripped.startsWith('adv') || stripped.includes('adverb')) {
      return 'adverb';
    }

    // 8. Verb (v, vt, vi, verb, transitive verb, etc.)
    if (stripped === 'v' || stripped === 'vt' || stripped === 'vi' || stripped.includes('verb')) {
      return 'verb';
    }

    // 9. Noun (n, noun, proper noun, etc.)
    if (stripped === 'n' || stripped.includes('noun')) {
      return 'noun';
    }

    // 10. Determiner / Article
    if (stripped === 'det' || stripped.includes('determin') || stripped === 'article') {
      return 'determiner';
    }

    // 11. Numeral / Number
    if (stripped === 'num' || stripped.includes('numeral') || stripped === 'number') {
      return 'numeral';
    }

    // 12. Particle
    if (stripped === 'part' || stripped.includes('particle')) {
      return 'particle';
    }

    return stripped;
  }

  function getPosClass(pos) {
    const p = normalizePos(pos);
    if (p === 'verb' || p === 'phrasal verb') return 'pos-verb';
    if (p === 'noun') return 'pos-noun';
    if (p === 'adjective') return 'pos-adj';
    if (p === 'adverb') return 'pos-adv';
    return 'pos-other';
  }

  /**
   * Formats phonetic string cleanly as [ phonetic ] or / phonetic /
   */
  function formatPhonetic(raw) {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if ((trimmed.startsWith('/') && trimmed.endsWith('/')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return trimmed;
    }
    const clean = trimmed.replace(/^[\/\[\s]+|[\/\]\s]+$/g, '');
    return clean ? `/ ${clean} /` : '';
  }

  /**
   * Renders a flowing, readable sentence with clickable individual words
   * and distinct highlighting for the currently active target word/phrase.
   * Completely supports native browser text selection (bôi đen).
   */
  function renderInteractiveSentence(sentence, currentWord, rawWord) {
    if (!sentence) return '';
    const cleanTarget = (rawWord || currentWord || '').trim();
    const cleanTargetLower = cleanTarget.toLowerCase();

    let targetStart = -1;
    let targetEnd = -1;

    if (cleanTargetLower.length > 0) {
      const sLower = sentence.toLowerCase();
      targetStart = sLower.indexOf(cleanTargetLower);
      if (targetStart !== -1) {
        targetEnd = targetStart + cleanTarget.length;
      } else {
        const rawLower = (rawWord || '').toLowerCase().trim();
        if (rawLower && rawLower !== cleanTargetLower) {
          targetStart = sLower.indexOf(rawLower);
          if (targetStart !== -1) {
            targetEnd = targetStart + rawLower.length;
          }
        }
      }
    }

    const formatTextSegment = (text) => {
      // Splits text into words and delimiters (punctuation, spaces)
      const parts = text.split(/([a-zA-ZÀ-ỹ0-9]+(?:['’][a-zA-ZÀ-ỹ0-9]+)?)/);
      return parts.map(part => {
        if (!part) return '';
        if (/[a-zA-ZÀ-ỹ0-9]/.test(part)) {
          return `<span class="anki-ctx-word" data-word="${escapeHtml(part)}" title="Click to look up '${escapeHtml(part)}'">${escapeHtml(part)}</span>`;
        }
        return escapeHtml(part);
      }).join('');
    };

    if (targetStart !== -1 && targetEnd !== -1) {
      const before = sentence.slice(0, targetStart);
      const matched = sentence.slice(targetStart, targetEnd);
      const after = sentence.slice(targetEnd);

      return formatTextSegment(before) +
        `<mark class="anki-ctx-target-pill" data-word="${escapeHtml(matched)}" title="Currently analyzed target">${escapeHtml(matched)}</mark>` +
        formatTextSegment(after);
    }

    return formatTextSegment(sentence);
  }

  const renderInteractiveChips = renderInteractiveSentence;

  // State
  let extensionConfig = null;
  let shadowRoot = null;
  let quickTriggerEl = null;
  let activePopoverEl = null;
  let currentSelectionContext = null;
  let currentCardData = null;
  let lastUsedDeck = null;
  let isCropModeActive = false;
  let cropOverlayEl = null;

  /**
   * Persist selected deck across lookups and browser sessions (local + sync)
   */
  function saveSelectedDeck(deck) {
    if (!deck) return;
    lastUsedDeck = deck;
    if (extensionConfig) {
      extensionConfig.deckName = deck;
      extensionConfig.lastUsedDeck = deck;
    }
    try {
      chrome.storage?.local?.set({ deckName: deck, lastUsedDeck: deck });
      chrome.storage?.sync?.set({ deckName: deck, lastUsedDeck: deck });
    } catch {
      // ignore storage error
    }
  }

  /**
   * Safe sendMessage wrapper to prevent "Extension context invalidated" uncaught errors
   */
  function safeSendMessage(message, callback) {
    if (!chrome.runtime?.id) {
      console.warn('[Anki AI Vocab] Extension context invalidated. Please reload (F5) the webpage.');
      if (callback) callback({ success: false, error: 'Extension updated. Please refresh (F5) this webpage.' });
      return;
    }

    try {
      chrome.runtime.sendMessage(message, (res) => {
        if (chrome.runtime.lastError) {
          const errMsg = chrome.runtime.lastError.message || '';
          if (errMsg.includes('Extension context invalidated') || errMsg.includes('context invalidated')) {
            console.warn('[Anki AI Vocab] Extension context invalidated.');
            if (callback) callback({ success: false, error: 'Extension updated. Please refresh (F5) this webpage.' });
            return;
          }
          if (callback) callback({ success: false, error: errMsg });
          return;
        }
        if (callback) callback(res);
      });
    } catch (err) {
      console.warn('[Anki AI Vocab] Runtime connection error:', err);
      if (callback) callback({ success: false, error: 'Extension updated. Please refresh (F5) this webpage.' });
    }
  }

  /**
   * 1. Initialize Shadow DOM Root
   */
  function initShadowDOM() {
    let host = document.getElementById('anki-vocab-host-root');
    if (!host) {
      host = document.createElement('div');
      host.id = 'anki-vocab-host-root';
      host.style.all = 'initial';
      document.documentElement.appendChild(host);
    }

    shadowRoot = host.shadowRoot || host.attachShadow({ mode: 'open' });

    let styleEl = shadowRoot.querySelector('#anki-vocab-inlined-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'anki-vocab-inlined-styles';
      styleEl.textContent = POPOVER_CSS + CHIPS_CSS;
      shadowRoot.appendChild(styleEl);
    }

    // Load initial settings
    safeSendMessage({ action: 'GET_CONFIG' }, (res) => {
      if (res?.success) {
        extensionConfig = res.config;
        if (extensionConfig?.theme) {
          host.setAttribute('data-theme', extensionConfig.theme);
        }
        if (extensionConfig?.lastUsedDeck || extensionConfig?.deckName) {
          lastUsedDeck = extensionConfig.lastUsedDeck || extensionConfig.deckName;
        }
      }
    });

    // Listen for real-time config and theme changes
    try {
      chrome.storage?.onChanged?.addListener((changes, areaName) => {
        if (areaName === 'sync' || areaName === 'local') {
          if (changes.theme) {
            host.setAttribute('data-theme', changes.theme.newValue);
          }
          if (changes.lastUsedDeck?.newValue) {
            lastUsedDeck = changes.lastUsedDeck.newValue;
          } else if (changes.deckName?.newValue) {
            lastUsedDeck = changes.deckName.newValue;
          }
          if (!extensionConfig) {
            extensionConfig = {};
          }
          for (const key in changes) {
            extensionConfig[key] = changes[key].newValue;
          }
          if (changes.availableDecks?.newValue && Array.isArray(changes.availableDecks.newValue)) {
            activePopoverEl?._updateDeckMenu?.(changes.availableDecks.newValue);
          }
        }
      });
    } catch {
      // ignore storage listener errors in isolated worlds
    }
  }

  /**
   * 2. Sentence Context Extraction Algorithm
   */
  function extractSentenceContext(selection) {
    if (!selection || selection.rangeCount === 0) return null;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length > 120 || !/[a-zA-ZÀ-ỹ0-9]/.test(selectedText)) {
      return null;
    }

    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;

    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }

    const blockTags = ['P', 'DIV', 'SPAN', 'LI', 'TD', 'TH', 'ARTICLE', 'SECTION', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    while (container && container !== document.body && !blockTags.includes(container.tagName)) {
      container = container.parentElement;
    }

    let fullSentence = selectedText;

    if (container && container.innerText) {
      const containerText = container.innerText;
      const wordIndex = containerText.indexOf(selectedText);

      if (wordIndex !== -1) {
        let start = 0;
        for (let i = wordIndex - 1; i >= 0; i--) {
          const char = containerText[i];
          if (char === '.' || char === '!' || char === '?' || char === '\n') {
            start = i + 1;
            break;
          }
        }

        let end = containerText.length;
        for (let i = wordIndex + selectedText.length; i < containerText.length; i++) {
          const char = containerText[i];
          if (char === '.' || char === '!' || char === '?' || char === '\n') {
            end = i + 1;
            break;
          }
        }

        const candidate = containerText.substring(start, end).trim();
        if (candidate.length >= selectedText.length && candidate.length <= 300) {
          fullSentence = candidate;
        }
      }
    }

    const normalizedSentence = normalizeContextSentence(fullSentence);

    return {
      word: selectedText,
      sentence: normalizedSentence,
      sourceUrl: window.location.href,
      targetRect: range.getBoundingClientRect()
    };
  }

  /**
   * 3. Viewport Collision Calculator (375px width)
   */
  function calculatePopoverPosition(targetRect, customHeight = ESTIMATED_POPOVER_HEIGHT) {
    if (!targetRect) {
      return { top: 100, left: 100, placement: 'bottom' };
    }

    const popoverHeight = Math.min(customHeight || ESTIMATED_POPOVER_HEIGHT, 500);
    const popoverWidth = POPOVER_WIDTH;

    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Space available below target word inside the viewport
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    let top = 0;
    let placement = 'bottom';

    // 1. Vertical Positioning:
    // Strictly prioritize displaying BELOW the selected word (top = targetRect.bottom + scrollY + 8).
    // ONLY flip to top if space below is virtually zero (< 160px) AND there is significantly more space above (> 260px).
    if (spaceBelow < 160 && spaceAbove > 260 && spaceAbove > spaceBelow) {
      top = targetRect.top + scrollY - popoverHeight - OFFSET_GAP;
      placement = 'top';
    } else {
      // Default: strictly below the selected word with 8px gap
      top = targetRect.bottom + scrollY + OFFSET_GAP;
      placement = 'bottom';
    }

    // 2. Horizontal Positioning:
    // Default: aligned with the left edge of the selected word
    let left = targetRect.left + scrollX;

    // Edge Collision: clamp so popover remains completely within viewport
    const maxLeft = scrollX + viewportWidth - popoverWidth - VIEWPORT_MARGIN;
    const minLeft = scrollX + VIEWPORT_MARGIN;

    if (left > maxLeft) {
      left = maxLeft;
    }
    if (left < minLeft) {
      left = minLeft;
    }

    return {
      top: Math.round(top),
      left: Math.round(left),
      placement
    };
  }

  /**
   * 4. Quick Trigger Pill Button
   */
  function showQuickTrigger(rect, context) {
    if (extensionConfig?.showQuickTooltip === false) return;
    if (activePopoverEl) return;

    removeQuickTrigger();

    quickTriggerEl = document.createElement('button');
    quickTriggerEl.className = 'anki-quick-trigger';
    quickTriggerEl.setAttribute('type', 'button');
    quickTriggerEl.setAttribute('aria-label', 'Explain with AI');
    quickTriggerEl.innerHTML = `${ICONS.spark} <span>Explain</span>`;

    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Strictly position BELOW the selected word by default
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = (spaceBelow < 40 && rect.top > 40)
      ? (rect.top + scrollY - 34)       // Only flip to top if at very bottom edge of viewport
      : (rect.bottom + scrollY + 8);    // Default: strictly BELOW the word (+ 8px)

    const left = rect.left + scrollX + (rect.width / 2) - 40;

    quickTriggerEl.style.top = `${Math.round(top)}px`;
    quickTriggerEl.style.left = `${Math.round(Math.max(scrollX + 6, left))}px`;

    quickTriggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      removeQuickTrigger();
      openFloatingPopover(context);
    });

    shadowRoot.appendChild(quickTriggerEl);
  }

  function removeQuickTrigger() {
    if (quickTriggerEl && quickTriggerEl.parentNode) {
      quickTriggerEl.parentNode.removeChild(quickTriggerEl);
      quickTriggerEl = null;
    }
  }


  /**
   * 4b. Draggable Popover Interaction Engine
   * Allows smooth repositioning via header drag handle while protecting interactive controls
   */
  function makePopoverDraggable(popoverEl) {
    if (!popoverEl || popoverEl._isDraggableInitialized) return;
    popoverEl._isDraggableInitialized = true;

    let isDragging = false;
    let startPageX = 0;
    let startPageY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const deltaX = e.pageX - startPageX;
      const deltaY = e.pageY - startPageY;

      let nextLeft = initialLeft + deltaX;
      let nextTop = initialTop + deltaY;

      // Viewport boundary constraints (with scroll offsets)
      const popoverWidth = popoverEl.offsetWidth || 380;
      const popoverHeight = popoverEl.offsetHeight || 240;
      const scrollX = window.scrollX || window.pageXOffset || 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;

      const minLeft = scrollX + 8;
      const maxLeft = scrollX + window.innerWidth - popoverWidth - 8;
      const minTop = scrollY + 8;
      const maxTop = scrollY + window.innerHeight - popoverHeight - 8;

      nextLeft = Math.max(minLeft, Math.min(nextLeft, Math.max(minLeft, maxLeft)));
      nextTop = Math.max(minTop, Math.min(nextTop, Math.max(minTop, maxTop)));

      popoverEl.style.left = `${Math.round(nextLeft)}px`;
      popoverEl.style.top = `${Math.round(nextTop)}px`;
      popoverEl._hasBeenDragged = true;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      popoverEl.classList.remove('anki-is-dragging');
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onPointerMove, true);
      window.removeEventListener('pointerup', onPointerUp, true);
      window.removeEventListener('pointercancel', onPointerUp, true);
    };

    popoverEl.addEventListener('pointerdown', (e) => {
      // Only primary (left) mouse click initiates dragging
      if (e.button !== 0) return;

      // Only drag when mouse is pressed on header area
      const header = e.target.closest('.anki-popover-header');
      if (!header) return;

      // Do NOT trigger drag when clicking interactive elements
      const nonDragSelector = 'button, [contenteditable="true"], .anki-editable, input, textarea, a, .anki-header-controls, select, option';
      if (e.target.closest(nonDragSelector)) {
        return;
      }

      e.preventDefault();
      isDragging = true;
      startPageX = e.pageX;
      startPageY = e.pageY;

      const rect = popoverEl.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset || 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;

      initialLeft = parseFloat(popoverEl.style.left) || (rect.left + scrollX);
      initialTop = parseFloat(popoverEl.style.top) || (rect.top + scrollY);

      popoverEl.classList.add('anki-is-dragging');
      document.body.style.userSelect = 'none';

      window.addEventListener('pointermove', onPointerMove, { capture: true, passive: false });
      window.addEventListener('pointerup', onPointerUp, { capture: true });
      window.addEventListener('pointercancel', onPointerUp, { capture: true });
    });
  }

  /**
   * 5. Open Floating Popover
   */
  function openFloatingPopover(context) {
    if (!context || !context.word) return;
    removeQuickTrigger();
    closeFloatingPopover();

    if (context.sentence) {
      context.sentence = normalizeContextSentence(context.sentence);
    }
    globalContextSession.initSession(context.sentence);

    currentSelectionContext = context;

    // Create Popover Element
    activePopoverEl = document.createElement('div');
    activePopoverEl.className = 'anki-floating-popover popover-container';
    activePopoverEl.id = 'anki-floating-popover';

    // Position popover strictly below target word by default
    const pos = calculatePopoverPosition(context.targetRect, 220);
    activePopoverEl._placement = pos.placement;
    activePopoverEl.style.top = `${pos.top}px`;
    activePopoverEl.style.left = `${pos.left}px`;

    // Initialize Draggable Interaction
    makePopoverDraggable(activePopoverEl);

    // Initial Skeleton Shimmer UI (2-Row Header)
    activePopoverEl.innerHTML = `
      <div class="anki-popover-header">
        <div class="anki-header-left">
          <div class="anki-header-row1 header-row">
            <span class="anki-word-text word-text">${escapeHtml(context.word)}</span>
            <span class="anki-pos-badge pos-badge pos-verb" style="opacity:0.6;">...</span>
          </div>
          <div class="anki-header-row2 header-row-2">
            <span class="anki-ipa-text phonetic-text ipa" style="opacity:0.4;">/ ... /</span>
          </div>
        </div>
        <div class="anki-header-controls">
          <button class="anki-btn-icon" id="anki-popover-close" title="Close (Esc)">${ICONS.close}</button>
        </div>
      </div>
      <div class="anki-popover-content">
        <div class="anki-skeleton-wrap">
          <div class="anki-skeleton anki-skeleton-title"></div>
          <div class="anki-skeleton anki-skeleton-line"></div>
          <div class="anki-skeleton anki-skeleton-box"></div>
        </div>
      </div>
      <div class="anki-popover-footer">
        <span class="anki-footer-info">AI Dictionary Engine</span>
        <button class="anki-btn-add" disabled>
          <span class="anki-spinner-sm"></span>
          <span>Looking up...</span>
        </button>
      </div>
    `;

    shadowRoot.appendChild(activePopoverEl);

    // Setup Close Button
    activePopoverEl.querySelector('#anki-popover-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeFloatingPopover();
    });

    // Safety watchdog: ensure popover never hangs in loading state
    let hasResponded = false;
    const safetyTimeoutId = setTimeout(() => {
      if (!hasResponded) {
        hasResponded = true;
        renderPopoverError('Request timed out (> 15s). Please retry or reload the extension.');
      }
    }, 16000);

    // Proactively refresh live decks from Anki in parallel with AI analysis
    safeSendMessage({ action: 'FETCH_LIVE_DECKS' }, (deckRes) => {
      if (deckRes?.success && Array.isArray(deckRes.decks) && deckRes.decks.length > 0) {
        if (!extensionConfig) extensionConfig = {};
        extensionConfig.availableDecks = deckRes.decks;
        activePopoverEl?._updateDeckMenu?.(deckRes.decks);
      }
    });

    // Call Background AI Service
    safeSendMessage({
      action: 'EXPLAIN_WORD',
      payload: {
        word: context.word,
        sentence: context.sentence,
        sourceUrl: context.sourceUrl
      }
    }, (res) => {
      if (hasResponded) return;
      hasResponded = true;
      clearTimeout(safetyTimeoutId);

      if (chrome.runtime.lastError) {
        renderPopoverError(chrome.runtime.lastError.message || 'Extension connection error.');
        return;
      }

      if (!res || !res.success) {
        renderPopoverError(res?.error || 'Failed to retrieve AI explanation.');
        return;
      }

      if (res.decks && Array.isArray(res.decks) && res.decks.length > 0) {
        if (!extensionConfig) extensionConfig = {};
        extensionConfig.availableDecks = res.decks;
      }

      renderPopoverLoadedData(res.data, context);
    });
  }

  function closeFloatingPopover() {
    if (activePopoverEl && activePopoverEl.parentNode) {
      activePopoverEl.parentNode.removeChild(activePopoverEl);
      activePopoverEl = null;
    }
  }

  /**
   * 5b. Start Crop Mode (Screen Selection Box Overlay)
   */
  function startCropMode() {
    if (isCropModeActive) return;
    isCropModeActive = true;

    removeQuickTrigger();
    closeFloatingPopover();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    cropOverlayEl = document.createElement('div');
    cropOverlayEl.className = 'anki-crop-overlay';
    cropOverlayEl.innerHTML = `
      <style>
        .anki-crop-overlay {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 2147483645 !important;
          cursor: crosshair !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          background: rgba(0, 0, 0, 0.35) !important;
        }
        .anki-crop-banner {
          position: fixed !important;
          top: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          background: rgba(15, 23, 42, 0.94) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          color: #F8FAFC !important;
          padding: 8px 18px !important;
          border-radius: 9999px !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 12px 28px -5px rgba(0, 0, 0, 0.5) !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-size: 13px !important;
          pointer-events: none !important;
          z-index: 2147483647 !important;
          user-select: none !important;
        }
        .anki-crop-banner-badge {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          font-weight: 600 !important;
          color: #38BDF8 !important;
        }
        .anki-crop-banner-text {
          color: #E2E8F0 !important;
        }
        .anki-crop-banner-hint {
          color: #94A3B8 !important;
          font-size: 12px !important;
        }
        .anki-crop-banner-hint strong {
          color: #FFFFFF !important;
          padding: 1px 6px !important;
          border-radius: 4px !important;
          background: rgba(255, 255, 255, 0.12) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .anki-crop-box {
          position: fixed !important;
          border: 2px dashed #38BDF8 !important;
          background: rgba(56, 189, 248, 0.08) !important;
          box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.45) !important;
          pointer-events: none !important;
          border-radius: 4px !important;
          z-index: 2147483646 !important;
        }
      </style>
      <div class="anki-crop-banner">
        <div class="anki-crop-banner-badge">
          ${ICONS.crop}
          <span>Crop & Look Up</span>
        </div>
        <span class="anki-crop-banner-text">Drag a box over subtitles, image, or text</span>
        <span class="anki-crop-banner-hint">Press <strong>Esc</strong> to cancel</span>
      </div>
      <div class="anki-crop-box" style="display: none;"></div>
    `;

    document.documentElement.appendChild(cropOverlayEl);

    const cropBox = cropOverlayEl.querySelector('.anki-crop-box');
    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;

      cropBox.style.left = `${startX}px`;
      cropBox.style.top = `${startY}px`;
      cropBox.style.width = '0px';
      cropBox.style.height = '0px';
      cropBox.style.display = 'block';
    };

    const onMouseMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      e.stopPropagation();

      const currentX = e.clientX;
      const currentY = e.clientY;
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      cropBox.style.left = `${left}px`;
      cropBox.style.top = `${top}px`;
      cropBox.style.width = `${width}px`;
      cropBox.style.height = `${height}px`;
    };

    const onMouseUp = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      e.preventDefault();
      e.stopPropagation();

      const currentX = e.clientX;
      const currentY = e.clientY;
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      cleanupCropOverlay();

      if (width < 12 || height < 12) {
        return;
      }

      const cropArea = {
        x: left,
        y: top,
        width,
        height,
        devicePixelRatio: window.devicePixelRatio || 1
      };

      const targetRect = {
        top,
        bottom: top + height,
        left,
        right: left + width,
        width,
        height
      };

      openCropLoadingPopover(targetRect, cropArea);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanupCropOverlay();
      }
    };

    function cleanupCropOverlay() {
      isCropModeActive = false;
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('mouseup', onMouseUp, true);
      window.removeEventListener('keydown', onKeyDown, true);
      if (cropOverlayEl && cropOverlayEl.parentNode) {
        cropOverlayEl.parentNode.removeChild(cropOverlayEl);
        cropOverlayEl = null;
      }
    }

    cropOverlayEl.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('mousemove', onMouseMove, true);
    window.addEventListener('mouseup', onMouseUp, true);
    window.addEventListener('keydown', onKeyDown, true);
  }

  /**
   * 5c. Open Crop Loading Popover
   */
  function openCropLoadingPopover(targetRect, cropArea) {
    removeQuickTrigger();
    closeFloatingPopover();

    activePopoverEl = document.createElement('div');
    activePopoverEl.className = 'anki-floating-popover popover-container';

    const pos = calculatePopoverPosition(targetRect, 220);
    activePopoverEl._placement = pos.placement;
    activePopoverEl.style.top = `${pos.top}px`;
    activePopoverEl.style.left = `${pos.left}px`;

    makePopoverDraggable(activePopoverEl);

    activePopoverEl.innerHTML = `
      <div class="anki-popover-header">
        <div class="anki-header-left">
          <div class="anki-header-row1 header-row">
            <span class="anki-word-text word-text" style="font-size: 16px;">Scanning visual text...</span>
            <span class="anki-pos-badge pos-badge pos-other" style="opacity:0.8;">Vision OCR</span>
          </div>
          <div class="anki-header-row2 header-row-2">
            <span class="anki-ipa-text phonetic-text ipa" style="opacity:0.5;font-family:inherit;font-size:12px;">Analyzing crop area with Gemini Vision...</span>
          </div>
        </div>
        <div class="anki-header-controls">
          <button class="anki-btn-icon" id="anki-popover-close" title="Close (Esc)">${ICONS.close}</button>
        </div>
      </div>
      <div class="anki-popover-content">
        <div class="anki-skeleton-wrap">
          <div class="anki-skeleton anki-skeleton-title" style="width: 75%;"></div>
          <div class="anki-skeleton anki-skeleton-line" style="width: 95%;"></div>
          <div class="anki-skeleton anki-skeleton-box" style="height: 52px;"></div>
        </div>
      </div>
      <div class="anki-popover-footer">
        <span class="anki-footer-info" style="font-size:12px;color:var(--text-muted);">Vision AI Engine</span>
        <button class="anki-btn-add" disabled>
          <span class="anki-spinner-sm"></span>
          <span>Extracting...</span>
        </button>
      </div>
    `;

    shadowRoot.appendChild(activePopoverEl);

    activePopoverEl.querySelector('#anki-popover-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeFloatingPopover();
    });

    let hasResponded = false;
    const safetyTimeoutId = setTimeout(() => {
      if (!hasResponded) {
        hasResponded = true;
        renderPopoverError('OCR request timed out (> 18s). Please try again.');
      }
    }, 19000);

    safeSendMessage({
      action: 'CAPTURE_AND_LOOKUP_HYBRID',
      payload: {
        cropArea,
        sourceUrl: window.location.href
      }
    }, (res) => {
      if (hasResponded) return;
      hasResponded = true;
      clearTimeout(safetyTimeoutId);

      if (chrome.runtime.lastError) {
        renderPopoverError(chrome.runtime.lastError.message || 'Vision capture error.');
        return;
      }

      if (!res || !res.success) {
        renderPopoverError(res?.error || 'Failed to extract text from cropped area.');
        return;
      }

      if (res.decks && Array.isArray(res.decks) && res.decks.length > 0) {
        if (!extensionConfig) extensionConfig = {};
        extensionConfig.availableDecks = res.decks;
      }

      const rawSent = res.data.detected_sentence || res.data.example_sentence || '';
      const normalizedSentence = normalizeContextSentence(rawSent);
      const initialTrans = res.data.example_translation || res.data.example_vi || '';
      globalContextSession.initSession(normalizedSentence, initialTrans);

      const context = {
        word: res.data.word,
        sentence: normalizedSentence,
        detected_sentence: normalizedSentence,
        raw_selected_word: res.data.raw_selected_word,
        sourceUrl: window.location.href,
        targetRect,
        isCropMode: true
      };

      renderPopoverLoadedData(res.data, context);
    });
  }

  /**
   * Helper to extract current live edited values from the Popover DOM
   */
  function getEditedCardData(originalData, context) {
    if (!activePopoverEl) return originalData;

    const getText = (field) => {
      const el = activePopoverEl.querySelector(`[data-field="${field}"]`);
      return el ? el.innerText.trim() : '';
    };

    const word = getText('word') || originalData.word || '';
    let phonetic = getText('phonetic');
    if (!phonetic && originalData.phonetic) phonetic = originalData.phonetic;
    if (phonetic) {
      phonetic = phonetic.replace(/^[\/\[\s]+|[\/\]\s]+$/g, '').trim();
    }

    const pos = normalizePos(getText('pos') || originalData.pos || 'noun');
    const meaning_vi = getText('meaning_vi') || originalData.meaning_vi || '';
    const definition_en = getText('definition_en') || originalData.definition_en || '';

    // English Sentence: prioritize user edited input, then original English sentence from selection context (if real), then generated example
    const userEditedSentence = getText('example_sentence');
    const rawContextSentence = (context?.sentence || '').trim();
    const rawContextWord = (context?.word || originalData.word || word || '').trim();
    const isRealContext = rawContextSentence && 
      rawContextSentence.toLowerCase() !== rawContextWord.toLowerCase() && 
      rawContextSentence.split(/\s+/).length >= 3;

    const example_sentence = userEditedSentence || 
      (isRealContext ? rawContextSentence : (originalData.example_sentence || originalData.example_en || rawContextSentence || ''));

    // Vietnamese Translation: prioritize user edited translation, then AI translation
    const example_translation = getText('example_translation') || originalData.example_translation || originalData.example_vi || '';
    const example_vi = example_translation;
    const example_en = example_sentence;

    return {
      ...originalData,
      word,
      phonetic,
      pos,
      meaning_vi,
      definition_en,
      example_sentence,
      example_en,
      example_translation,
      example_vi,
      context_sentence: example_sentence,
      context_translation: example_translation,
      sentence: example_sentence
    };
  }

  /**
   * 6. Render Popover Loaded Content (Supports Inline Editing, Deck Selector & Reset)
   */
  function renderPopoverLoadedData(aiData, context, isReset = false) {
    if (!activePopoverEl) return;
    currentCardData = aiData;

    // Cache original AI response for Reset / Undo
    if (!activePopoverEl._originalAiData || !isReset) {
      activePopoverEl._originalAiData = JSON.parse(JSON.stringify(aiData));
    }

    const currentDeck = activePopoverEl._selectedDeck || lastUsedDeck || extensionConfig?.lastUsedDeck || extensionConfig?.deckName || 'Default';
    const allDecks = Array.from(new Set([currentDeck, ...(extensionConfig?.availableDecks || [])])).filter(Boolean);
    if (!allDecks.length) allDecks.push('Default');

    aiData.pos = normalizePos(aiData.pos || 'noun');
    const posClass = getPosClass(aiData.pos);
    const formattedPhonetic = formatPhonetic(aiData.phonetic);

    const deckItemsHtml = allDecks.map(d => `
      <div class="anki-deck-item ${d === currentDeck ? 'selected' : ''}" data-deck="${escapeHtml(d)}" role="option">
        <span class="anki-deck-item-text">${escapeHtml(d)}</span>
        ${d === currentDeck ? `<svg class="anki-deck-item-check" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
      </div>
    `).join('');

    // Resolve example texts (guarantees AI-generated example is shown when user looked up a single word)
    const rawContextSentence = (context?.sentence || '').trim();
    const rawContextWord = (context?.word || aiData.word || '').trim();
    const isRealContext = rawContextSentence && 
      rawContextSentence.toLowerCase() !== rawContextWord.toLowerCase() && 
      rawContextSentence.split(/\s+/).length >= 3;

    let exampleSentence = (isRealContext 
      ? rawContextSentence 
      : (aiData.example_sentence || aiData.example_en || rawContextSentence || '')
    ).trim();
    exampleSentence = normalizeContextSentence(exampleSentence);

    let detectedSentence = (aiData.detected_sentence || context?.detected_sentence || '').trim();
    if (detectedSentence) {
      detectedSentence = normalizeContextSentence(detectedSentence);
    }

    const rawTranslation = (aiData.example_translation || aiData.example_vi || '').trim();
    const sessionSentence = detectedSentence || exampleSentence;
    globalContextSession.initSession(sessionSentence, rawTranslation);
    if (rawTranslation) {
      globalContextSession.setTranslation(rawTranslation);
    }
    const unifiedTranslation = globalContextSession.getUnifiedTranslation() || rawTranslation;

    const activeWord = (aiData.word || context?.word || '').trim();
    const rawWord = (aiData.raw_selected_word || context?.raw_selected_word || activeWord).trim();

    // Session Cache for instant 0ms switching between previously looked up words/phrases
    if (!activePopoverEl._sessionWordCache) {
      activePopoverEl._sessionWordCache = new Map();
    }

    const normalizeLookupKey = (str) => {
      if (!str) return '';
      return str.toLowerCase().trim().replace(/^[^\w\sÀ-ỹ]+|[^\w\sÀ-ỹ]+$/g, '');
    };

    // Snapshot current AI card data into session cache and globalContextSession
    const currentSnapshotData = {
      ...aiData,
      example_translation: unifiedTranslation,
      example_vi: unifiedTranslation,
      detected_sentence: detectedSentence,
      raw_selected_word: rawWord
    };
    globalContextSession.setWordData(activeWord, currentSnapshotData);
    if (rawWord) globalContextSession.setWordData(rawWord, currentSnapshotData);
    if (context?.word) globalContextSession.setWordData(context.word, currentSnapshotData);
    const kWord = normalizeLookupKey(aiData.word);
    const kRaw = normalizeLookupKey(rawWord);
    const kCtxWord = normalizeLookupKey(context?.word);
    const kCtxRaw = normalizeLookupKey(context?.raw_selected_word);
    if (kWord) activePopoverEl._sessionWordCache.set(kWord, currentSnapshotData);
    if (kRaw) activePopoverEl._sessionWordCache.set(kRaw, currentSnapshotData);
    if (kCtxWord) activePopoverEl._sessionWordCache.set(kCtxWord, currentSnapshotData);
    if (kCtxRaw) activePopoverEl._sessionWordCache.set(kCtxRaw, currentSnapshotData);

    activePopoverEl.innerHTML = `
      <!-- Header: 2-Row Typography Structure -->
      <div class="anki-popover-header">
        <div class="anki-header-left">
          <!-- Row 1: Word + Part of Speech Badge -->
          <div class="anki-header-row1 header-row">
            <span class="anki-word-text word-text anki-editable" contenteditable="true" spellcheck="false" data-field="word" title="Click to edit word">${escapeHtml(aiData.word || '')}</span>
            <span class="anki-pos-badge pos-badge ${posClass} anki-editable" contenteditable="true" spellcheck="false" data-field="pos" title="Click to edit part of speech">${escapeHtml(aiData.pos || 'noun')}</span>
          </div>
          <!-- Row 2: Phonetic IPA -->
          <div class="anki-header-row2 header-row-2">
            <span class="anki-ipa-text phonetic-text ipa anki-editable" contenteditable="true" spellcheck="false" data-field="phonetic" title="Click to edit phonetic" placeholder="/IPA/">${escapeHtml(formattedPhonetic || '/ IPA /')}</span>
          </div>
        </div>
        <div class="anki-header-controls">
          <button class="anki-btn-icon anki-btn-audio" id="anki-btn-audio" title="Listen pronunciation">
            ${ICONS.speaker}
          </button>
          <button class="anki-btn-icon anki-btn-relookup" id="anki-btn-relookup" title="Re-analyze context with AI (Force refresh)">
            ${ICONS.refresh}
          </button>
          <button class="anki-btn-icon" id="anki-btn-reset" title="Reset to original AI content">
            ${ICONS.undo}
          </button>
          <button class="anki-btn-icon" id="anki-popover-close" title="Close (Esc)">
            ${ICONS.close}
          </button>
        </div>
      </div>

      <!-- Body Content (Flat & Minimalist Shadcn Style, Inline Editable) -->
      <div class="anki-popover-content">
        ${detectedSentence ? `
          <div class="anki-context-wrap">
            <div class="anki-context-header">
              <div class="anki-context-title">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                <span>Captured Context</span>
              </div>
              <div class="anki-context-action-bar" id="anki-context-action-bar">
                <span class="anki-context-hint" id="anki-context-hint">Click word or select phrase</span>
                <button type="button" class="anki-ctx-header-btn" id="anki-ctx-header-btn" style="display: none;" title="Look up highlighted text (Enter)"></button>
              </div>
            </div>
            <div class="anki-context-sentence" id="anki-context-sentence">
              ${renderInteractiveSentence(detectedSentence, activeWord, rawWord)}
            </div>
          </div>
        ` : ''}

        <div class="anki-meaning-row anki-editable" contenteditable="true" spellcheck="false" data-field="meaning_vi" title="Click to edit meaning" placeholder="Meaning in context...">
          ${escapeHtml(aiData.meaning_vi || '')}
        </div>

        ${aiData.definition_en ? `
          <div class="anki-def-row anki-editable" contenteditable="true" spellcheck="false" data-field="definition_en" title="Click to edit English definition">
            ${escapeHtml(aiData.definition_en)}
          </div>
        ` : ''}

        ${(exampleSentence || unifiedTranslation) ? `
          <div class="anki-example-box">
            ${exampleSentence ? `<div class="anki-example-en anki-editable" contenteditable="true" spellcheck="false" data-field="example_sentence" title="Click to edit example sentence">${highlightWordInSentence(exampleSentence, rawWord || activeWord)}</div>` : ''}
            ${unifiedTranslation ? `<div class="anki-example-vi anki-editable" contenteditable="true" spellcheck="false" data-field="example_translation" title="Click to edit translation">${escapeHtml(unifiedTranslation)}</div>` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Footer with Custom Floating Deck Dropdown Menu -->
      <div class="anki-popover-footer">
        <div class="anki-deck-dropdown-container">
          <button type="button" class="anki-deck-trigger" id="anki-deck-trigger" aria-haspopup="listbox" aria-expanded="false" title="Target Anki Deck">
            ${ICONS.folder}
            <span class="anki-deck-current-label" id="anki-deck-current-label">${escapeHtml(currentDeck)}</span>
            ${ICONS.chevron}
          </button>
          <div class="anki-deck-menu deck-menu" id="anki-deck-menu" role="listbox" style="display: none;">
            ${deckItemsHtml}
          </div>
        </div>
        <button class="anki-btn-add" id="anki-btn-add">
          <span>+ Add to Anki</span>
        </button>
      </div>
    `;

    // Recalculate vertical position with actual popover height if needed (unless manually dragged)
    if (!activePopoverEl._hasBeenDragged) {
      const actualHeight = activePopoverEl.offsetHeight;
      if (actualHeight > 0 && context?.targetRect) {
        const updatedPos = calculatePopoverPosition(context.targetRect, actualHeight);
        if (activePopoverEl._placement === 'bottom' || updatedPos.placement === 'bottom') {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          activePopoverEl.style.top = `${Math.round(context.targetRect.bottom + scrollY + OFFSET_GAP)}px`;
        } else {
          activePopoverEl.style.top = `${updatedPos.top}px`;
        }
        activePopoverEl.style.left = `${updatedPos.left}px`;
      }
    }

    // Ensure draggable stays active on loaded popover
    makePopoverDraggable(activePopoverEl);

    // Custom Deck Dropdown Controller with Auto-Sync
    let selectedDeck = currentDeck;
    activePopoverEl._selectedDeck = selectedDeck;
    const triggerBtn = activePopoverEl.querySelector('#anki-deck-trigger');
    const menuEl = activePopoverEl.querySelector('#anki-deck-menu');
    const labelEl = activePopoverEl.querySelector('#anki-deck-current-label');

    const bindDeckMenuItems = (decksList, activeDeck) => {
      if (!menuEl) return;
      const uniqueDecks = Array.from(new Set([activeDeck, ...(decksList || [])])).filter(Boolean);
      if (!uniqueDecks.length) uniqueDecks.push('Default');

      menuEl.innerHTML = uniqueDecks.map(d => `
        <div class="anki-deck-item ${d === activeDeck ? 'selected' : ''}" data-deck="${escapeHtml(d)}" role="option">
          <span class="anki-deck-item-text">${escapeHtml(d)}</span>
          ${d === activeDeck ? `<svg class="anki-deck-item-check" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
        </div>
      `).join('');

      menuEl.querySelectorAll('.anki-deck-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const deckVal = item.dataset.deck;
          selectedDeck = deckVal;
          if (activePopoverEl) activePopoverEl._selectedDeck = deckVal;
          if (labelEl) labelEl.textContent = deckVal;

          menuEl.querySelectorAll('.anki-deck-item').forEach(i => {
            i.classList.remove('selected');
            const check = i.querySelector('.anki-deck-item-check');
            if (check) check.remove();
          });
          item.classList.add('selected');
          const checkWrap = document.createElement('span');
          checkWrap.innerHTML = `<svg class="anki-deck-item-check" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          item.appendChild(checkWrap.firstElementChild);

          triggerBtn.classList.remove('active');
          triggerBtn.setAttribute('aria-expanded', 'false');
          menuEl.style.display = 'none';

          saveSelectedDeck(deckVal);
        });
      });
    };

    activePopoverEl._updateDeckMenu = (freshDecks) => {
      if (menuEl && Array.isArray(freshDecks) && freshDecks.length > 0) {
        const cur = activePopoverEl._selectedDeck || selectedDeck;
        bindDeckMenuItems(freshDecks, cur);
      }
    };

    if (triggerBtn && menuEl) {
      bindDeckMenuItems(allDecks, selectedDeck);

      // Silently fetch and update live Anki decks in background
      const requestLiveDecksUpdate = () => {
        safeSendMessage({ action: 'FETCH_LIVE_DECKS' }, (res) => {
          if (res?.success && Array.isArray(res.decks) && res.decks.length > 0) {
            if (!extensionConfig) extensionConfig = {};
            extensionConfig.availableDecks = res.decks;
            activePopoverEl?._updateDeckMenu?.(res.decks);
          }
        });
      };

      // Trigger immediate live check
      requestLiveDecksUpdate();

      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = triggerBtn.classList.contains('active');
        if (isExpanded) {
          triggerBtn.classList.remove('active');
          triggerBtn.setAttribute('aria-expanded', 'false');
          menuEl.style.display = 'none';
        } else {
          triggerBtn.classList.add('active');
          triggerBtn.setAttribute('aria-expanded', 'true');
          menuEl.style.display = 'flex';
          // Live query when user opens dropdown to capture decks created or renamed in Anki
          requestLiveDecksUpdate();
        }
      });

      // Close menu when clicking outside dropdown container inside popover
      activePopoverEl.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.anki-deck-dropdown-container')) {
          triggerBtn.classList.remove('active');
          triggerBtn.setAttribute('aria-expanded', 'false');
          menuEl.style.display = 'none';
        }
      });
    }

    // Audio Playback Listener (reads live word from editable element)
    const btnAudio = activePopoverEl.querySelector('#anki-btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentWord = activePopoverEl.querySelector('[data-field="word"]')?.innerText?.trim() || aiData.word;
        playAudioPronunciation(currentWord);
      });
    }

    // Auto Pronounce if configured
    if (extensionConfig?.autoPronounce && !isReset) {
      playAudioPronunciation(aiData.word);
    }

    // Re-lookup / Re-analyze Button Listener: forces fresh AI analysis bypassing cache
    const btnRelookup = activePopoverEl.querySelector('#anki-btn-relookup');
    if (btnRelookup) {
      btnRelookup.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activePopoverEl._isReanalyzing) return;
        activePopoverEl._isReanalyzing = true;

        btnRelookup.classList.add('anki-spinning');

        // Helper to extract text from inputs, textareas, or contenteditable elements
        const extractFieldText = (selector) => {
          const el = activePopoverEl.querySelector(selector);
          if (!el) return null;
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            return (el.value || '').trim();
          }
          return (el.innerText || el.textContent || '').trim();
        };

        // Extract user-edited context sentence directly from the UI before rendering skeleton
        const userEditedSentence = extractFieldText('[data-field="example_sentence"]') 
                                ?? extractFieldText('.anki-example-en')
                                ?? extractFieldText('.result-example-en');

        // Extract user-edited word directly from the UI
        const userEditedWord = extractFieldText('[data-field="word"]')
                            ?? extractFieldText('.anki-word-text')
                            ?? extractFieldText('.word-text');

        const currentWord = (userEditedWord && userEditedWord.length > 0)
          ? userEditedWord
          : (aiData.word || context?.word || '').trim();

        const currentSentence = (userEditedSentence !== null && userEditedSentence !== undefined && userEditedSentence.length > 0)
          ? userEditedSentence
          : (context?.sentence || aiData.example_sentence || '').trim();

        const currentSourceUrl = context?.sourceUrl || window.location.href;

        // Invalidate in-session cache for this word/phrase to force a fresh AI call
        const kCur = normalizeLookupKey(currentWord);
        if (kCur && activePopoverEl._sessionWordCache) activePopoverEl._sessionWordCache.delete(kCur);
        const kRawLookup = normalizeLookupKey(rawWord);
        if (kRawLookup && activePopoverEl._sessionWordCache) activePopoverEl._sessionWordCache.delete(kRawLookup);

        globalContextSession.invalidate(currentWord);
        globalContextSession.invalidate(rawWord);
        if (userEditedSentence) {
          globalContextSession.initSession(userEditedSentence);
        }

        // Display smooth skeleton loading in content area
        const contentEl = activePopoverEl.querySelector('.anki-popover-content');
        if (contentEl) {
          contentEl.innerHTML = `
            <div class="anki-skeleton-wrap">
              <div class="anki-skeleton anki-skeleton-title"></div>
              <div class="anki-skeleton anki-skeleton-line"></div>
              <div class="anki-skeleton anki-skeleton-box"></div>
            </div>
          `;
        }

        // Update Add button to show re-analyzing status
        const btnAdd = activePopoverEl.querySelector('#anki-btn-add');
        if (btnAdd) {
          btnAdd.disabled = true;
          btnAdd.innerHTML = `<span class="anki-spinner-sm"></span> <span>Re-analyzing...</span>`;
        }

        safeSendMessage({
          action: 'EXPLAIN_WORD',
          payload: {
            word: currentWord,
            sentence: currentSentence,
            sourceUrl: currentSourceUrl,
            bypassCache: true
          }
        }, (res) => {
          if (!activePopoverEl) return;
          activePopoverEl._isReanalyzing = false;
          btnRelookup.classList.remove('anki-spinning');

          if (chrome.runtime.lastError || !res || !res.success) {
            const errorMsg = chrome.runtime.lastError?.message || res?.error || 'Failed to re-analyze word.';
            renderPopoverError(errorMsg);
            return;
          }

          if (res.decks && Array.isArray(res.decks) && res.decks.length > 0) {
            extensionConfig.availableDecks = res.decks;
            activePopoverEl?._updateDeckMenu?.(res.decks);
          }

          // Update mutable context so future actions (Save/Reset) reflect user's updated sentence
          if (context) {
            context.word = currentWord;
            context.sentence = currentSentence;
          }

          // Cache fresh data and re-render loaded popover
          const refreshedData = {
            ...res.data,
            detected_sentence: detectedSentence,
            raw_selected_word: currentWord
          };

          const refreshedKey = normalizeLookupKey(res.data.word);
          const refreshedRawKey = normalizeLookupKey(currentWord);
          if (refreshedKey && activePopoverEl._sessionWordCache) {
            activePopoverEl._sessionWordCache.set(refreshedKey, refreshedData);
          }
          if (refreshedRawKey && activePopoverEl._sessionWordCache) {
            activePopoverEl._sessionWordCache.set(refreshedRawKey, refreshedData);
          }

          activePopoverEl._originalAiData = JSON.parse(JSON.stringify(refreshedData));
          renderPopoverLoadedData(refreshedData, {
            ...context,
            word: currentWord,
            sentence: currentSentence,
            detected_sentence: detectedSentence,
            raw_selected_word: currentWord,
            sourceUrl: currentSourceUrl
          });
        });
      });
    }

    // Reset Button Listener: restores original AI content
    const btnReset = activePopoverEl.querySelector('#anki-btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activePopoverEl._originalAiData) {
          renderPopoverLoadedData(activePopoverEl._originalAiData, context, true);
        }
      });
    }

    // Close Button Listener
    activePopoverEl.querySelector('#anki-popover-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeFloatingPopover();
    });

    // Add to Anki Button Listener
    const btnAdd = activePopoverEl.querySelector('#anki-btn-add');
    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        handleAddToAnki(btnAdd, aiData, context);
      });
    }

    // Helper to switch to analyzing a word or phrase with instant session cache retrieval
    const switchToWordOrPhrase = (targetText) => {
      const cleanTarget = (targetText || '').trim();
      if (!cleanTarget) return;

      const normTarget = normalizeLookupKey(cleanTarget);
      const currentWordInHeader = normalizeLookupKey(activePopoverEl.querySelector('[data-field="word"]')?.textContent);

      // Save user's live edits on existing card before switching
      try {
        const liveEdited = getEditedCardData(currentCardData || aiData, context);
        const liveKey = normalizeLookupKey(liveEdited.word);
        if (liveKey) {
          const snapshot = {
            ...liveEdited,
            detected_sentence: detectedSentence,
            raw_selected_word: rawWord
          };
          if (activePopoverEl._sessionWordCache) activePopoverEl._sessionWordCache.set(liveKey, snapshot);
          globalContextSession.setWordData(liveKey, snapshot);
        }
      } catch {
        // ignore live edit snapshot error
      }

      // If target is already currently displayed in header, no-op
      if (normTarget && normTarget === currentWordInHeader && !activePopoverEl._isReanalyzing) {
        return;
      }

      // 1. Session Cache Hit: Instant 0ms display without AI API call
      const cached = globalContextSession.getWordData(cleanTarget) 
                  || (activePopoverEl._sessionWordCache && activePopoverEl._sessionWordCache.get(normTarget));
      if (cached) {
        const nextContext = {
          ...context,
          word: cached.word || cleanTarget,
          raw_selected_word: cleanTarget,
          sentence: detectedSentence || context?.sentence,
          detected_sentence: detectedSentence
        };
        renderPopoverLoadedData(cached, nextContext);
        return;
      }

      // 2. Cache Miss: Partial Skeleton Loading (Keep Context Chips & Example Box fully visible at 0ms latency)
      // Header: update target word, show subtle loading badges
      const wordEl = activePopoverEl.querySelector('.anki-word-text');
      if (wordEl) wordEl.textContent = cleanTarget;

      const posEl = activePopoverEl.querySelector('.anki-pos-badge');
      if (posEl) {
        posEl.className = 'anki-pos-badge pos-badge pos-other';
        posEl.textContent = '...';
        posEl.style.opacity = '0.6';
      }

      const ipaEl = activePopoverEl.querySelector('.anki-ipa-text');
      if (ipaEl) {
        ipaEl.textContent = '/ ... /';
        ipaEl.style.opacity = '0.4';
      }

      // Captured Context: instantly highlight the new target in the context sentence
      const sentenceEl = activePopoverEl.querySelector('#anki-context-sentence');
      if (sentenceEl && detectedSentence) {
        sentenceEl.innerHTML = renderInteractiveSentence(detectedSentence, cleanTarget, cleanTarget);
      }

      // Meaning & Definition rows: show lightweight shimmer skeletons
      const meaningEl = activePopoverEl.querySelector('.anki-meaning-row');
      if (meaningEl) {
        meaningEl.innerHTML = `<span class="anki-spinner-sm" style="display:inline-block;margin-right:6px;vertical-align:middle;"></span>Analyzing "${escapeHtml(cleanTarget)}"...<div class="anki-skeleton anki-skeleton-title" style="width: 55%; height: 16px; margin-top: 6px;"></div>`;
      }
      const defEl = activePopoverEl.querySelector('.anki-def-row');
      if (defEl) {
        defEl.innerHTML = `<div class="anki-skeleton anki-skeleton-line" style="width: 85%; height: 14px; opacity: 0.6;"></div>`;
      }

      // Example Box: Instant 0ms update: re-highlight target in English sentence while keeping existing translation!
      const exampleEnEl = activePopoverEl.querySelector('.anki-example-en');
      if (exampleEnEl && exampleSentence) {
        exampleEnEl.innerHTML = highlightWordInSentence(exampleSentence, cleanTarget);
      }

      // Add Button: disable with loader
      const btnAdd = activePopoverEl.querySelector('#anki-btn-add');
      if (btnAdd) {
        btnAdd.disabled = true;
        btnAdd.innerHTML = `<span class="anki-spinner-sm"></span> <span>Analyzing...</span>`;
      }

      const hasReusedTranslation = globalContextSession.hasTranslation();
      const existingTrans = globalContextSession.getUnifiedTranslation();

      safeSendMessage({
        action: 'EXPLAIN_WORD',
        payload: {
          word: cleanTarget,
          sentence: detectedSentence || context?.sentence,
          sourceUrl: context?.sourceUrl || window.location.href,
          bypassCache: false,
          reuseTranslation: hasReusedTranslation,
          existingTranslation: existingTrans
        }
      }, (res) => {
        if (!activePopoverEl) return;
        if (!res || !res.success) {
          if (meaningEl) meaningEl.textContent = 'Failed to analyze word or phrase.';
          if (btnAdd) {
            btnAdd.disabled = false;
            btnAdd.innerHTML = `<span>+ Add to Anki</span>`;
          }
          return;
        }

        if (res.decks && Array.isArray(res.decks) && res.decks.length > 0) {
          extensionConfig.availableDecks = res.decks;
          activePopoverEl?._updateDeckMenu?.(res.decks);
        }

        const effectiveTranslation = existingTrans || res.data.example_translation || res.data.example_vi || '';
        if (effectiveTranslation) {
          globalContextSession.setTranslation(effectiveTranslation);
        }

        const updatedData = {
          ...res.data,
          example_translation: effectiveTranslation,
          example_vi: effectiveTranslation,
          detected_sentence: detectedSentence,
          raw_selected_word: cleanTarget
        };

        // Cache response in both globalContextSession and popover session cache
        const nextKey = normalizeLookupKey(res.data.word);
        const nextRawKey = normalizeLookupKey(cleanTarget);
        if (nextKey && activePopoverEl._sessionWordCache) activePopoverEl._sessionWordCache.set(nextKey, updatedData);
        if (nextRawKey && activePopoverEl._sessionWordCache) activePopoverEl._sessionWordCache.set(nextRawKey, updatedData);
        globalContextSession.setWordData(cleanTarget, updatedData);
        if (res.data.word) globalContextSession.setWordData(res.data.word, updatedData);

        const updatedContext = {
          ...context,
          word: res.data.word || cleanTarget,
          raw_selected_word: cleanTarget,
          sentence: detectedSentence || context?.sentence,
          detected_sentence: detectedSentence
        };

        renderPopoverLoadedData(updatedData, updatedContext);
      });
    };

    // Captured Context Interactions: 1-Click Word Lookup & Natural Highlight Selection (Bôi đen)
    const sentenceEl = activePopoverEl.querySelector('#anki-context-sentence');
    const hintEl = activePopoverEl.querySelector('#anki-context-hint');
    const headerBtn = activePopoverEl.querySelector('#anki-ctx-header-btn');

    if (sentenceEl && detectedSentence) {
      let currentSelectionText = '';

      const removeFloatingPill = () => {
        const existingPill = activePopoverEl.querySelector('#anki-selection-pill');
        if (existingPill) existingPill.remove();
      };

      const clearSelectionUI = () => {
        currentSelectionText = '';
        removeFloatingPill();
        if (headerBtn) headerBtn.style.display = 'none';
        if (hintEl) hintEl.style.display = 'inline';
      };

      const executeLookup = (text) => {
        const clean = (text || '').replace(/^[^\wÀ-ỹ]+|[^\wÀ-ỹ]+$/g, '').trim();
        if (!clean) return;
        clearSelectionUI();
        try {
          window.getSelection()?.removeAllRanges();
        } catch {}
        switchToWordOrPhrase(clean);
      };

      // 1. Single Click on any word in the sentence (fast lookup without needing to drag)
      sentenceEl.addEventListener('click', (e) => {
        const sel = window.getSelection();
        const selStr = sel?.toString()?.trim() || '';
        if (selStr.length > 0) return; // Ignore if user was completing a text selection

        const wordEl = e.target.closest('.anki-ctx-word');
        if (wordEl) {
          const clickedWord = wordEl.dataset.word || wordEl.textContent;
          if (clickedWord) {
            executeLookup(clickedWord);
          }
        }
      });

      // 2. Natural Selection (Bôi đen) Handler via mouseup
      const handleSelectionChange = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
          clearSelectionUI();
          return;
        }

        const rawText = sel.toString().trim();
        const cleanText = rawText.replace(/^[^\wÀ-ỹ]+|[^\wÀ-ỹ]+$/g, '').trim();

        if (!cleanText || cleanText.length < 1) {
          clearSelectionUI();
          return;
        }

        const range = sel.getRangeAt(0);
        const isInsideContext = sentenceEl.contains(range.startContainer) || sentenceEl.contains(range.commonAncestorContainer);
        if (!isInsideContext) {
          clearSelectionUI();
          return;
        }

        currentSelectionText = cleanText;

        const displayPhrase = cleanText.length > 20 ? cleanText.slice(0, 18) + '...' : cleanText;

        // A. Update Header Action Button
        if (headerBtn) {
          headerBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span>Look up "<strong>${escapeHtml(displayPhrase)}</strong>"</span>
          `;
          headerBtn.style.display = 'inline-flex';
          if (hintEl) hintEl.style.display = 'none';
        }

        // B. Spawn Floating Action Pill directly above selection
        removeFloatingPill();
        const pillEl = document.createElement('div');
        pillEl.className = 'anki-selection-pill';
        pillEl.id = 'anki-selection-pill';
        pillEl.innerHTML = `
          <button type="button" class="anki-pill-btn" id="anki-pill-lookup-btn">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span>Look up "<strong>${escapeHtml(displayPhrase)}</strong>"</span>
            <span class="anki-pill-key">↵</span>
          </button>
        `;

        const selRect = range.getBoundingClientRect();
        const popoverRect = activePopoverEl.getBoundingClientRect();

        activePopoverEl.appendChild(pillEl);

        const pillWidth = pillEl.offsetWidth || 150;
        let pillLeft = selRect.left - popoverRect.left + (selRect.width / 2) - (pillWidth / 2);
        pillLeft = Math.max(10, Math.min(popoverRect.width - pillWidth - 10, pillLeft));

        let pillTop = selRect.top - popoverRect.top - 36;
        if (pillTop < 8) {
          pillTop = selRect.bottom - popoverRect.top + 6;
        }
        pillEl.style.top = `${pillTop}px`;
        pillEl.style.left = `${pillLeft}px`;

        const pillBtn = pillEl.querySelector('#anki-pill-lookup-btn');
        if (pillBtn) {
          pillBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            executeLookup(currentSelectionText);
          });
        }
      };

      if (headerBtn) {
        headerBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (currentSelectionText) {
            executeLookup(currentSelectionText);
          }
        });
      }

      sentenceEl.addEventListener('mouseup', () => {
        setTimeout(handleSelectionChange, 10);
      });

      // Keyboard shortcut: press Enter to look up currently selected phrase
      const onKeyDown = (e) => {
        if (e.key === 'Enter' && currentSelectionText) {
          e.preventDefault();
          executeLookup(currentSelectionText);
        } else if (e.key === 'Escape') {
          clearSelectionUI();
        }
      };
      window.addEventListener('keydown', onKeyDown);

      // Dismiss pill on click outside sentence or pill
      activePopoverEl.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('#anki-selection-pill') && !e.target.closest('#anki-ctx-header-btn') && !e.target.closest('#anki-context-sentence')) {
          clearSelectionUI();
        }
      });

      // Dismiss pill on content scroll
      const contentScrollEl = activePopoverEl.querySelector('.anki-popover-content');
      if (contentScrollEl) {
        contentScrollEl.addEventListener('scroll', () => {
          removeFloatingPill();
        }, { passive: true });
      }
    }

    // Dynamic POS badge style updater when user edits part of speech
    const posBadgeEl = activePopoverEl.querySelector('[data-field="pos"]');
    if (posBadgeEl) {
      posBadgeEl.addEventListener('input', () => {
        const newClass = getPosClass(posBadgeEl.innerText);
        posBadgeEl.className = `anki-pos-badge pos-badge ${newClass} anki-editable`;
      });
      posBadgeEl.addEventListener('blur', () => {
        posBadgeEl.innerText = normalizePos(posBadgeEl.innerText);
        const newClass = getPosClass(posBadgeEl.innerText);
        posBadgeEl.className = `anki-pos-badge pos-badge ${newClass} anki-editable`;
      });
    }

    // Inline Editable Listeners: plain text paste & single-line enter handling
    activePopoverEl.querySelectorAll('.anki-editable').forEach(el => {
      if (['word', 'phonetic', 'pos'].includes(el.dataset.field)) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            el.blur();
          }
        });
      }
      el.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      });
    });
  }

  /**
   * 7. Error Rendering inside Popover
   */
  function renderPopoverError(errorMessage) {
    if (!activePopoverEl) return;

    const contentEl = activePopoverEl.querySelector('.anki-popover-content');
    const footerEl = activePopoverEl.querySelector('.anki-popover-footer');

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="anki-popover-banner anki-banner-error">
          ${ICONS.alert}
          <div>
            <b>AI Lookup Error:</b><br>
            ${escapeHtml(errorMessage)}
          </div>
        </div>
      `;
    }

    if (footerEl) {
      footerEl.innerHTML = `
        <span class="anki-footer-info">Check API in Settings</span>
        <button class="anki-btn-add" id="anki-btn-retry"><span>Retry</span></button>
      `;

      const btnRetry = footerEl.querySelector('#anki-btn-retry');
      if (btnRetry) {
        btnRetry.addEventListener('click', (e) => {
          e.stopPropagation();
          openFloatingPopover(currentSelectionContext);
        });
      }
    }

    const closeBtn = activePopoverEl.querySelector('#anki-popover-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeFloatingPopover();
      });
    }
  }

  /**
   * 8. Add Note to AnkiConnect
   */
  function handleAddToAnki(btnEl, cardData, context) {
    if (!btnEl || btnEl.disabled) return;

    btnEl.disabled = true;
    btnEl.innerHTML = `<span class="anki-spinner-sm"></span> <span>Adding...</span>`;

    let watchdogTimer = null;
    let isSettled = false;

    const resetButton = (errorMsg) => {
      if (isSettled) return;
      isSettled = true;
      if (watchdogTimer) {
        clearTimeout(watchdogTimer);
        watchdogTimer = null;
      }

      btnEl.disabled = false;
      btnEl.innerHTML = `<span>Retry</span>`;
      btnEl.style.background = 'var(--danger)';

      if (errorMsg && activePopoverEl) {
        const contentEl = activePopoverEl.querySelector('.anki-popover-content');
        if (contentEl) {
          let errBanner = contentEl.querySelector('.anki-banner-error');
          if (!errBanner) {
            errBanner = document.createElement('div');
            errBanner.className = 'anki-popover-banner anki-banner-error';
            contentEl.appendChild(errBanner);
          }
          errBanner.innerHTML = `${ICONS.alert} <span>${escapeHtml(errorMsg)}</span>`;
        }
      }
    };

    // Client-side watchdog timer (7 seconds): guarantee button NEVER gets stuck spinning forever
    watchdogTimer = setTimeout(() => {
      resetButton('Card save timed out (> 7s). Please check Anki Desktop and AnkiConnect.');
    }, 7000);

    try {
      // Extract live edited content directly from the Popover DOM
      const editedCardData = getEditedCardData(cardData, context);

      // Selected Target Deck from dropdown
      const selectedDeck = activePopoverEl?.querySelector('#anki-popover-deck-select')?.value 
        || activePopoverEl?._selectedDeck 
        || lastUsedDeck
        || extensionConfig?.lastUsedDeck
        || extensionConfig?.deckName 
        || 'Default';

      // Remember latest selected deck for future lookups
      saveSelectedDeck(selectedDeck);

      // English sentence (guaranteed original English from webpage)
      const rawEnglishSentence = editedCardData.example_sentence || context?.sentence || '';

      // Vietnamese translation
      const rawVietnameseTranslation = editedCardData.example_translation || editedCardData.example_vi || '';

      const enrichedCardData = {
        ...editedCardData,
        sentence: rawEnglishSentence,
        context_sentence: rawEnglishSentence,
        example_sentence: rawEnglishSentence,
        context_translation: rawVietnameseTranslation,
        example_translation: rawVietnameseTranslation,
        example_vi: rawVietnameseTranslation,
        source_url: editedCardData.source_url || context?.sourceUrl || window.location.href
      };

      safeSendMessage({
        action: 'ADD_ANKI_NOTE',
        payload: {
          cardData: enrichedCardData,
          targetDeck: selectedDeck,
          targetModel: extensionConfig?.noteType
        }
      }, (res) => {
        if (isSettled) return;
        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
        isSettled = true;

        if (chrome.runtime.lastError || !res || !res.success) {
          const errorMsg = chrome.runtime.lastError?.message || res?.error || 'Failed to add card';
          resetButton(errorMsg);
          return;
        }

        // Success!
        btnEl.disabled = true;
        btnEl.className = 'anki-btn-add anki-added';
        btnEl.style.background = '';
        btnEl.innerHTML = `${ICONS.check} <span>Added</span>`;

        // Auto-dismiss after configured delay
        if (extensionConfig?.autoCloseOnSuccess !== false) {
          setTimeout(() => {
            closeFloatingPopover();
          }, extensionConfig?.autoCloseDelayMs || 1400);
        }
      });
    } catch (err) {
      console.error('[Anki AI Vocab] Error preparing card data:', err);
      resetButton(`Data error: ${err.message}`);
    }
  }

  /**
   * 9. Pronunciation Audio via SpeechSynthesis
   */
  function playAudioPronunciation(word) {
    if (!word || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;

      // Select voice based on audioVoice preference if available
      const voices = window.speechSynthesis.getVoices() || [];
      const englishVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
      const voicePref = extensionConfig?.audioVoice || 'random';
      const targetGender = voicePref === 'random' ? (Math.random() < 0.5 ? 'male' : 'female') : voicePref;

      const matchedVoice = englishVoices.find(v => {
        const name = (v.name || '').toLowerCase();
        if (targetGender === 'male') {
          return name.includes('male') || name.includes('david') || name.includes('george') || name.includes('guy') || name.includes('james');
        } else {
          return name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('jenny') || name.includes('aria');
        }
      });
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio playback fallback
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * 10. Global Event Handlers: Click-Outside & Esc Dismissal
   */
  document.addEventListener('pointerdown', (e) => {
    if (isCropModeActive) return;

    if (activePopoverEl) {
      if (extensionConfig?.closeOnlyOnX !== true) {
        const path = e.composedPath ? e.composedPath() : [];
        const isInside = path.some(el => el && (el.id === 'anki-floating-popover' || el.className === 'anki-quick-trigger' || (typeof el.className === 'string' && el.className.includes('anki-deck-menu'))));
        if (!isInside) {
          closeFloatingPopover();
        }
      }
    }

    if (quickTriggerEl) {
      const path = e.composedPath ? e.composedPath() : [];
      const isInsideTrigger = path.some(el => el && el.className === 'anki-quick-trigger');
      if (!isInsideTrigger) {
        removeQuickTrigger();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isCropModeActive) return; // Handled inside crop mode
      if (shadowRoot && shadowRoot.activeElement && shadowRoot.activeElement.isContentEditable) {
        shadowRoot.activeElement.blur();
        return;
      }
      removeQuickTrigger();
      closeFloatingPopover();
    }
  });

  // Global Shortcut: Alt + S to launch Crop & Look Up
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.code === 'KeyS' || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      initShadowDOM();
      startCropMode();
    }
  }, true);

  document.addEventListener('mouseup', () => {
    if (isCropModeActive) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const context = extractSentenceContext(selection);

      if (context && selection.rangeCount > 0) {
        initShadowDOM();
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          showQuickTrigger(rect, context);
        }
      } else {
        removeQuickTrigger();
      }
    }, 80);
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'TRIGGER_CROP_MODE') {
      initShadowDOM();
      startCropMode();
      sendResponse({ received: true });
      return;
    }

    if (request.action === 'TRIGGER_LOOKUP_FROM_CONTEXT_MENU') {
      initShadowDOM();
      const selection = window.getSelection();
      let context = extractSentenceContext(selection);

      if (!context) {
        context = {
          word: (request.selectedText || '').trim(),
          sentence: '',
          sourceUrl: window.location.href,
          targetRect: {
            top: window.innerHeight / 3,
            bottom: window.innerHeight / 3 + 20,
            left: window.innerWidth / 2 - 50,
            right: window.innerWidth / 2 + 50,
            width: 100,
            height: 20
          }
        };
      }

      openFloatingPopover(context);
      sendResponse({ received: true });
    }
  });

  initShadowDOM();
})();
