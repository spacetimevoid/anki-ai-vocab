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
  const POPOVER_CSS = "/**\n * Compact Floating Popover Styles (Shadow DOM Encapsulated)\n * Design Style: Modern Linear / Shadcn UI / Clean Typography\n * 375px Width, 2-Row Header, Muted Pastel Badges & Custom Deck Dropdown Menu\n */\n\n:host {\n  all: initial;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Inter\", \"Helvetica Neue\", Arial, sans-serif !important;\n  font-size: 14px;\n  line-height: 1.5;\n  box-sizing: border-box;\n  -webkit-font-smoothing: antialiased;\n}\n\n:host, .popover-container, *:not(.phonetic-text):not(.anki-ipa-text):not(.ipa) {\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Inter\", \"Helvetica Neue\", Arial, sans-serif !important;\n  -webkit-font-smoothing: antialiased;\n}\n\n*, *::before, *::after {\n  box-sizing: inherit;\n  margin: 0;\n  padding: 0;\n}\n\n/* =========================================================\n   DESIGN TOKENS (SHADCN ZINC PALETTE)\n   ========================================================= */\n:host,\n:host([data-theme=\"light\"]) {\n  /* Light Mode */\n  --popover-bg: #FFFFFF;\n  --border: #E4E4E7;            /* Zinc-200 */\n  --text-primary: #09090B;      /* Zinc-950 */\n  --text-secondary: #71717A;    /* Zinc-500 */\n  --text-muted: #A1A1AA;        /* Zinc-400 */\n  --badge-bg: #F4F4F5;          /* Zinc-100 */\n  --badge-text: #18181B;        /* Zinc-900 */\n  --btn-bg: #18181B;            /* Zinc-900 */\n  --btn-text: #FAFAFA;          /* Zinc-50 */\n  --btn-hover: #27272A;         /* Zinc-800 */\n  --btn-secondary-bg: #F4F4F5;\n  --btn-secondary-hover: #E4E4E7;\n  --hover-bg: #F4F4F5;          /* Zinc-100 */\n  --skeleton-bg: #F4F4F5;\n  --skeleton-shine: #E4E4E7;\n  --success: #10B981;\n  --success-bg: #ECFDF5;\n  --danger: #EF4444;\n  --danger-bg: #FEF2F2;\n  --radius: 12px;\n  --shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04);\n}\n\n:host([data-theme=\"dark\"]) {\n  /* Explicit Dark Mode (PeakPlanner Theme) */\n  --popover-bg: #0E0F14;\n  --border: #242530;\n  --text-primary: #FFFFFF;\n  --text-secondary: #9698A6;\n  --text-muted: #646675;\n  --badge-bg: #1F202A;\n  --badge-text: #FFFFFF;\n  --btn-bg: #FFFFFF;\n  --btn-text: #0E0F14;\n  --btn-hover: #E4E5EB;\n  --btn-secondary-bg: #1F202A;\n  --btn-secondary-hover: #292B38;\n  --hover-bg: #171820;\n  --skeleton-bg: #171820;\n  --skeleton-shine: #242530;\n  --success: #10B981;\n  --success-bg: #064E3B;\n  --danger: #F87171;\n  --danger-bg: #450A0A;\n  --radius: 12px;\n  --shadow: 0 16px 42px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4);\n}\n\n@media (prefers-color-scheme: dark) {\n  :host(:not([data-theme=\"light\"])) {\n    /* Auto Dark Mode */\n    --popover-bg: #0E0F14;\n    --border: #242530;\n    --text-primary: #FFFFFF;\n    --text-secondary: #9698A6;\n    --text-muted: #646675;\n    --badge-bg: #1F202A;\n    --badge-text: #FFFFFF;\n    --btn-bg: #FFFFFF;\n    --btn-text: #0E0F14;\n    --btn-hover: #E4E5EB;\n    --btn-secondary-bg: #1F202A;\n    --btn-secondary-hover: #292B38;\n    --hover-bg: #171820;\n    --skeleton-bg: #171820;\n    --skeleton-shine: #242530;\n    --success: #10B981;\n    --success-bg: #064E3B;\n    --danger: #F87171;\n    --danger-bg: #450A0A;\n    --radius: 12px;\n    --shadow: 0 16px 42px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4);\n  }\n}\n\n/* =========================================================\n   1. QUICK TRIGGER PILL BUTTON (FLOATING NEAR SELECTION)\n   ========================================================= */\n.anki-quick-trigger {\n  position: absolute;\n  z-index: 2147483646;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  height: 28px;\n  background: var(--popover-bg);\n  color: var(--text-primary);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  padding: 0 10px;\n  font-size: 12px;\n  font-weight: 500;\n  cursor: pointer;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n  transition: all 0.14s ease;\n  user-select: none;\n  animation: anki-fade-in 0.12s ease-out;\n}\n\n.anki-quick-trigger:hover {\n  background: var(--hover-bg);\n  border-color: var(--text-muted);\n}\n\n.anki-quick-trigger svg {\n  width: 13px;\n  height: 13px;\n  fill: currentColor;\n  flex-shrink: 0;\n}\n\n/* =========================================================\n   2. COMPACT FLOATING POPOVER (375PX WIDTH)\n   ========================================================= */\n.anki-floating-popover {\n  position: absolute;\n  z-index: 2147483647;\n  width: 380px;\n  max-width: 95vw;\n  max-height: 500px;\n  background: var(--popover-bg);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  box-shadow: var(--shadow);\n  display: flex;\n  flex-direction: column;\n  overflow: visible; /* Allows custom dropdown menu to open downward cleanly */\n  user-select: text;\n  color: var(--text-primary);\n  animation: anki-scale-in 0.14s cubic-bezier(0.16, 1, 0.3, 1);\n  pointer-events: auto;\n}\n\n/* Custom Slim Scrollbar */\n.anki-popover-content::-webkit-scrollbar {\n  width: 4px;\n}\n.anki-popover-content::-webkit-scrollbar-track {\n  background: transparent;\n}\n.anki-popover-content::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 2px;\n}\n.anki-popover-content::-webkit-scrollbar-thumb:hover {\n  background: var(--text-muted);\n}\n\n/* =========================================================\n   POPOVER HEADER (2-ROW TYPOGRAPHY STRUCTURE & DRAG HANDLE)\n   ========================================================= */\n.anki-popover-header {\n  padding: 14px 16px 8px;\n  border-bottom: 1px solid var(--border);\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 12px;\n  cursor: grab;\n  user-select: none;\n  background: var(--popover-bg);\n  border-top-left-radius: calc(var(--radius) - 1px);\n  border-top-right-radius: calc(var(--radius) - 1px);\n}\n\n/* Ensure interactive controls in header maintain their normal cursors */\n.anki-popover-header .anki-header-controls,\n.anki-popover-header .anki-btn-icon,\n.anki-popover-header .anki-editable,\n.anki-popover-header [contenteditable=\"true\"] {\n  cursor: default;\n}\n\n.anki-popover-header .anki-btn-icon {\n  cursor: pointer;\n}\n\n.anki-popover-header .anki-editable,\n.anki-popover-header [contenteditable=\"true\"] {\n  cursor: text;\n  user-select: text;\n}\n\n/* Active Dragging States */\n.anki-floating-popover.anki-is-dragging,\n.anki-floating-popover.anki-is-dragging * {\n  cursor: grabbing !important;\n  user-select: none !important;\n}\n\n.anki-floating-popover.anki-is-dragging {\n  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.15);\n  transition: box-shadow 0.15s ease;\n}\n\n:host([data-theme=\"light\"]) .anki-floating-popover.anki-is-dragging {\n  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18), 0 0 0 1px #E4E4E7;\n}\n\n.anki-header-left {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  flex: 1;\n}\n\n/* Row 1: Word + Part of Speech Badge */\n.header-row,\n.anki-header-row1 {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 2px;\n  min-width: 0;\n}\n\n.word-text,\n.anki-word-text {\n  font-size: 19px !important;       /* Cỡ chữ to vừa phải, hiện đại */\n  font-weight: 700 !important;\n  letter-spacing: -0.02em;\n  color: #FAFAFA !important;\n  line-height: 1.2;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 250px;\n}\n\n:host([data-theme=\"light\"]) .word-text,\n:host([data-theme=\"light\"]) .anki-word-text {\n  color: #09090B !important;\n}\n\n/* Row 2: Phonetic IPA (Specialized Serif: Times New Roman for crisp IPA symbols) */\n.header-row-2,\n.anki-header-row2 {\n  display: flex;\n  align-items: center;\n}\n\n.phonetic-text,\n.anki-ipa-text,\n.ipa {\n  font-family: \"Times New Roman\", Times, serif !important;\n  font-size: 17px !important;\n  font-style: normal;\n  font-weight: 400;\n  letter-spacing: 0.03em;\n  color: #A1A1AA !important;\n  margin-top: 2px;\n  margin-bottom: 12px;\n  line-height: 1.2;\n}\n\n:host([data-theme=\"light\"]) .phonetic-text,\n:host([data-theme=\"light\"]) .anki-ipa-text,\n:host([data-theme=\"light\"]) .ipa {\n  color: #71717A !important;\n}\n\n/* Part of Speech Badges (Refined Pastel / Muted Tones) */\n.pos-badge,\n.anki-pos-badge {\n  display: inline-flex;\n  align-items: center;\n  font-size: 11px !important;\n  font-weight: 600 !important;\n  padding: 2px 7px;\n  border-radius: 4px;\n  line-height: 1.25;\n  flex-shrink: 0;\n  text-transform: lowercase;\n  letter-spacing: 0.02em;\n  transition: all 0.12s ease;\n  user-select: text;\n}\n\n/* Dark Mode POS Badges */\n.anki-pos-badge.pos-verb {\n  background-color: rgba(59, 130, 246, 0.12);\n  color: #60A5FA;\n  border: 1px solid rgba(59, 130, 246, 0.22);\n}\n\n.anki-pos-badge.pos-noun {\n  background-color: rgba(99, 102, 241, 0.12);\n  color: #818CF8;\n  border: 1px solid rgba(99, 102, 241, 0.22);\n}\n\n.anki-pos-badge.pos-adj {\n  background-color: rgba(16, 185, 129, 0.12);\n  color: #34D399;\n  border: 1px solid rgba(16, 185, 129, 0.22);\n}\n\n.anki-pos-badge.pos-adv,\n.anki-pos-badge.pos-other {\n  background-color: rgba(245, 158, 11, 0.12);\n  color: #FBBF24;\n  border: 1px solid rgba(245, 158, 11, 0.22);\n}\n\n/* Light Mode POS Badges */\n:host([data-theme=\"light\"]) .anki-pos-badge.pos-verb {\n  background-color: #EFF6FF;\n  color: #2563EB;\n  border: 1px solid #BFDBFE;\n}\n\n:host([data-theme=\"light\"]) .anki-pos-badge.pos-noun {\n  background-color: #EEF2FF;\n  color: #4F46E5;\n  border: 1px solid #C7D2FE;\n}\n\n:host([data-theme=\"light\"]) .anki-pos-badge.pos-adj {\n  background-color: #ECFDF5;\n  color: #059669;\n  border: 1px solid #A7F3D0;\n}\n\n:host([data-theme=\"light\"]) .anki-pos-badge.pos-adv,\n:host([data-theme=\"light\"]) .anki-pos-badge.pos-other {\n  background-color: #FFFBEB;\n  color: #D97706;\n  border: 1px solid #FDE68A;\n}\n\n.anki-header-controls {\n  display: flex;\n  align-items: center;\n  gap: 3px;\n  flex-shrink: 0;\n}\n\n.anki-btn-icon {\n  background: transparent;\n  border: none;\n  width: 26px;\n  height: 26px;\n  border-radius: 5px;\n  color: var(--text-secondary);\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.12s ease;\n}\n\n.anki-btn-icon:hover {\n  background: var(--hover-bg);\n  color: var(--text-primary);\n}\n\n.anki-btn-relookup:hover svg {\n  transform: rotate(45deg);\n  transition: transform 0.2s ease;\n}\n\n.anki-spinning svg,\nsvg.anki-spinning,\n.anki-btn-icon.anki-spinning svg {\n  animation: anki-spin 0.6s linear infinite !important;\n}\n\n.anki-btn-audio {\n  width: 28px !important;\n  height: 28px !important;\n  border-radius: 50% !important;\n  background: var(--badge-bg) !important;\n  border: 1px solid var(--border) !important;\n  color: var(--text-secondary);\n  transition: all 0.15s ease;\n}\n\n.anki-btn-audio:hover {\n  background: var(--hover-bg) !important;\n  color: var(--text-primary) !important;\n  transform: scale(1.08);\n}\n\n/* =========================================================\n   POPOVER BODY CONTENT (CLEAR TYPOGRAPHY)\n   ========================================================= */\n.anki-popover-content {\n  padding: 16px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n/* High-Legibility Meaning Row */\n.anki-meaning-row {\n  font-size: 15.5px;\n  font-weight: 600;\n  color: var(--text-primary);\n  line-height: 1.4;\n}\n\n/* English Definition */\n.anki-def-row {\n  font-size: 13.5px;\n  color: var(--text-secondary);\n  line-height: 1.5;\n}\n\n/* Context Example with Spacious Padding & Border */\n.anki-example-box {\n  margin-top: 4px;\n  border-left: 2px solid rgba(255, 255, 255, 0.15);\n  padding: 4px 0 4px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  background-color: transparent;\n  border-radius: 0;\n}\n\n:host([data-theme=\"light\"]) .anki-example-box {\n  border-left: 2px solid rgba(0, 0, 0, 0.12);\n}\n\n.anki-example-en {\n  color: var(--text-primary);\n  font-size: 14px;\n  line-height: 1.6;\n  font-style: italic;\n}\n\n.anki-example-vi {\n  color: var(--text-secondary);\n  font-size: 13px;\n  line-height: 1.5;\n  font-style: normal;\n}\n\n/* =========================================================\n   INLINE EDITABLE FIELDS (ZERO LAYOUT SHIFT)\n   ========================================================= */\n.anki-editable {\n  outline: none;\n  cursor: text;\n  border-radius: 4px;\n  font-size: inherit;\n  transition: background-color 0.12s ease, box-shadow 0.12s ease;\n  padding: 1px 4px;\n  margin: -1px -4px;\n  position: relative;\n}\n\n.anki-editable:hover {\n  background-color: var(--hover-bg);\n}\n\n.anki-editable:focus {\n  outline: none;\n  background-color: var(--hover-bg);\n  box-shadow: 0 0 0 1px var(--text-muted);\n}\n\n.anki-word-text.anki-editable {\n  min-width: 32px;\n  display: inline-block;\n}\n\n.anki-word-text.anki-editable:focus {\n  overflow: visible;\n  text-overflow: clip;\n  max-width: 260px;\n}\n\n.anki-ipa-text.anki-editable {\n  min-width: 24px;\n  display: inline-block;\n}\n\n.anki-pos-badge.anki-editable {\n  cursor: text;\n}\n\n.anki-meaning-row.anki-editable {\n  min-height: 22px;\n}\n\n.anki-def-row.anki-editable {\n  min-height: 20px;\n}\n\n.anki-example-en.anki-editable {\n  min-height: 20px;\n}\n\n.anki-example-vi.anki-editable {\n  min-height: 18px;\n}\n\n.anki-editable[placeholder]:empty::before {\n  content: attr(placeholder);\n  color: var(--text-muted);\n  font-style: italic;\n  pointer-events: none;\n}\n\n/* =========================================================\n   POPOVER FOOTER WITH CUSTOM DECK DROPDOWN MENU\n   ========================================================= */\n.anki-popover-footer {\n  padding: 10px 16px;\n  border-top: 1px solid var(--border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  background: var(--popover-bg);\n  position: relative;\n  border-bottom-left-radius: calc(var(--radius) - 1px);\n  border-bottom-right-radius: calc(var(--radius) - 1px);\n  background-clip: padding-box;\n}\n\n.anki-deck-dropdown-container {\n  position: relative;\n  display: inline-flex;\n}\n\n/* Trigger Button */\n.anki-deck-trigger {\n  background-color: #18181B;\n  border: 1px solid #27272A;\n  border-radius: 6px;\n  height: 32px;\n  padding: 0 10px;\n  display: inline-flex;\n  align-items: center;\n  gap: 7px;\n  color: #E4E4E7;\n  cursor: pointer;\n  font-size: 12.5px;\n  font-weight: 500;\n  transition: all 0.14s ease;\n  max-width: 175px;\n  outline: none;\n  user-select: none;\n}\n\n.anki-deck-trigger:hover {\n  background-color: #27272A;\n  border-color: #3F3F46;\n  color: #FFFFFF;\n}\n\n.anki-deck-trigger.active {\n  border-color: #52525B;\n  background-color: #27272A;\n}\n\n.anki-deck-icon {\n  width: 14px;\n  height: 14px;\n  color: #A1A1AA;\n  flex-shrink: 0;\n}\n\n.anki-deck-current-label {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 110px;\n  color: inherit;\n}\n\n.anki-deck-chevron {\n  width: 12px;\n  height: 12px;\n  color: #71717A;\n  flex-shrink: 0;\n  transition: transform 0.15s ease;\n}\n\n.anki-deck-trigger.active .anki-deck-chevron {\n  transform: rotate(180deg);\n}\n\n/* Custom Floating Dropdown Menu (Opens downward below trigger button) */\n.deck-menu,\n.anki-deck-menu {\n  position: absolute;\n  top: calc(100% + 6px) !important;\n  bottom: auto !important;\n  left: 0 !important;\n  min-width: 190px;\n  max-width: 270px;\n  max-height: 200px;\n  overflow-y: auto;\n  background-color: #121215;\n  border: 1px solid #27272A;\n  border-radius: 8px;\n  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.55);\n  z-index: 100;\n  padding: 4px;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  animation: anki-fade-in 0.12s ease-out;\n}\n\n/* Custom thin scrollbar for deck menu */\n.anki-deck-menu::-webkit-scrollbar {\n  width: 4px;\n}\n.anki-deck-menu::-webkit-scrollbar-track {\n  background: transparent;\n}\n.anki-deck-menu::-webkit-scrollbar-thumb {\n  background: #27272A;\n  border-radius: 2px;\n}\n.anki-deck-menu::-webkit-scrollbar-thumb:hover {\n  background: #3F3F46;\n}\n\n.anki-deck-item {\n  padding: 8px 10px;\n  font-size: 13px;\n  color: #E4E4E7;\n  border-radius: 4px;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  transition: background-color 0.12s ease, color 0.12s ease;\n  user-select: none;\n}\n\n.anki-deck-item:hover {\n  background-color: #27272A;\n  color: #FFFFFF;\n}\n\n.anki-deck-item.selected {\n  color: #FAFAFA;\n  font-weight: 500;\n  background-color: rgba(255, 255, 255, 0.05);\n}\n\n.anki-deck-item-text {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.anki-deck-item-check {\n  width: 13px;\n  height: 13px;\n  color: var(--success);\n  flex-shrink: 0;\n}\n\n/* Light Mode Overrides for Deck Dropdown */\n:host([data-theme=\"light\"]) .anki-deck-trigger {\n  background-color: #F4F4F5;\n  border: 1px solid #E4E4E7;\n  color: #18181B;\n}\n\n:host([data-theme=\"light\"]) .anki-deck-trigger:hover {\n  background-color: #E4E4E7;\n  border-color: #D4D4D8;\n}\n\n:host([data-theme=\"light\"]) .anki-deck-icon {\n  color: #71717A;\n}\n\n:host([data-theme=\"light\"]) .deck-menu,\n:host([data-theme=\"light\"]) .anki-deck-menu {\n  background-color: #FFFFFF;\n  border: 1px solid #E4E4E7;\n  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);\n}\n\n:host([data-theme=\"light\"]) .anki-deck-item {\n  color: #18181B;\n}\n\n:host([data-theme=\"light\"]) .anki-deck-item:hover {\n  background-color: #F4F4F5;\n  color: #09090B;\n}\n\n:host([data-theme=\"light\"]) .anki-deck-item.selected {\n  color: #09090B;\n  background-color: #F4F4F5;\n}\n\n:host([data-theme=\"light\"]) .anki-deck-menu::-webkit-scrollbar-thumb {\n  background: #E4E4E7;\n}\n\n.anki-btn-add {\n  height: 32px;\n  padding: 0 14px;\n  font-size: 13px;\n  font-weight: 600;\n  border-radius: 6px;\n  border: 1px solid transparent;\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  background: var(--btn-bg);\n  color: var(--btn-text);\n  transition: all 0.12s ease;\n  user-select: none;\n  flex-shrink: 0;\n}\n\n.anki-btn-add:hover {\n  background: var(--btn-hover);\n}\n\n.anki-btn-add:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n.anki-btn-add.anki-added {\n  background: var(--success);\n  color: #FFFFFF;\n}\n\n/* =========================================================\n   SKELETON SHIMMER LOADER\n   ========================================================= */\n.anki-skeleton-wrap {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 4px 0;\n}\n\n.anki-skeleton {\n  background: linear-gradient(90deg, var(--skeleton-bg) 25%, var(--skeleton-shine) 50%, var(--skeleton-bg) 75%);\n  background-size: 200% 100%;\n  border-radius: 4px;\n  animation: anki-shimmer 1.4s infinite ease-in-out;\n}\n\n.anki-skeleton-title {\n  height: 18px;\n  width: 55%;\n}\n\n.anki-skeleton-line {\n  height: 14px;\n  width: 90%;\n}\n\n.anki-skeleton-box {\n  height: 44px;\n  width: 100%;\n  margin-top: 2px;\n}\n\n@keyframes anki-shimmer {\n  0% { background-position: 200% 0; }\n  100% { background-position: -200% 0; }\n}\n\n/* =========================================================\n   ERROR / WARNING BANNER\n   ========================================================= */\n.anki-popover-banner {\n  padding: 8px 10px;\n  border-radius: 6px;\n  font-size: 12.5px;\n  line-height: 1.4;\n  display: flex;\n  align-items: flex-start;\n  gap: 6px;\n}\n\n.anki-banner-error {\n  background: var(--danger-bg);\n  color: var(--danger);\n  border: 1px solid var(--danger);\n}\n\n/* Minimal Spinner */\n.anki-spinner-sm {\n  width: 12px;\n  height: 12px;\n  border: 2px solid currentColor;\n  border-top-color: transparent;\n  border-radius: 50%;\n  animation: anki-spin 0.6s linear infinite;\n  display: inline-block;\n  opacity: 0.8;\n}\n\n@keyframes anki-spin {\n  to { transform: rotate(360deg); }\n}\n\n@keyframes anki-fade-in {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n@keyframes anki-scale-in {\n  from { opacity: 0; transform: scale(0.97) translateY(2px); }\n  to { opacity: 1; transform: scale(1) translateY(0); }\n}\n";

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
    chevron: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`
  };

  /**
   * Returns pastel/muted color class according to part of speech
   */
  function getPosClass(pos) {
    const p = (pos || '').toLowerCase().trim();
    if (p.includes('verb') || p === 'v' || p === 'v.') return 'pos-verb';
    if (p.includes('noun') || p === 'n' || p === 'n.') return 'pos-noun';
    if (p.includes('adj') || p.includes('adjective') || p === 'a' || p === 'a.') return 'pos-adj';
    if (p.includes('adv') || p.includes('adverb')) return 'pos-adv';
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

  // State
  let extensionConfig = null;
  let shadowRoot = null;
  let quickTriggerEl = null;
  let activePopoverEl = null;
  let currentSelectionContext = null;
  let currentCardData = null;
  let lastUsedDeck = null;

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
      styleEl.textContent = POPOVER_CSS;
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

    return {
      word: selectedText,
      sentence: fullSentence,
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

    const pos = getText('pos') || originalData.pos || 'noun';
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

    const exampleSentence = (isRealContext 
      ? rawContextSentence 
      : (aiData.example_sentence || aiData.example_en || rawContextSentence || '')
    ).trim();
    const exampleTranslation = (aiData.example_translation || aiData.example_vi || '').trim();

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
        <div class="anki-meaning-row anki-editable" contenteditable="true" spellcheck="false" data-field="meaning_vi" title="Click to edit meaning" placeholder="Meaning in context...">
          ${escapeHtml(aiData.meaning_vi || '')}
        </div>

        ${aiData.definition_en ? `
          <div class="anki-def-row anki-editable" contenteditable="true" spellcheck="false" data-field="definition_en" title="Click to edit English definition">
            ${escapeHtml(aiData.definition_en)}
          </div>
        ` : ''}

        ${(exampleSentence || exampleTranslation) ? `
          <div class="anki-example-box">
            ${exampleSentence ? `<div class="anki-example-en anki-editable" contenteditable="true" spellcheck="false" data-field="example_sentence" title="Click to edit example sentence">${escapeHtml(exampleSentence)}</div>` : ''}
            ${exampleTranslation ? `<div class="anki-example-vi anki-editable" contenteditable="true" spellcheck="false" data-field="example_translation" title="Click to edit translation">${escapeHtml(exampleTranslation)}</div>` : ''}
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

    // Custom Deck Dropdown Controller
    let selectedDeck = currentDeck;
    activePopoverEl._selectedDeck = selectedDeck;
    const triggerBtn = activePopoverEl.querySelector('#anki-deck-trigger');
    const menuEl = activePopoverEl.querySelector('#anki-deck-menu');
    const labelEl = activePopoverEl.querySelector('#anki-deck-current-label');

    if (triggerBtn && menuEl) {
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
        }
      });

      menuEl.querySelectorAll('.anki-deck-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const deckVal = item.dataset.deck;
          selectedDeck = deckVal;
          activePopoverEl._selectedDeck = deckVal;
          if (labelEl) labelEl.textContent = deckVal;

          // Update item checkmark state
          menuEl.querySelectorAll('.anki-deck-item').forEach(i => {
            i.classList.remove('selected');
            const check = i.querySelector('.anki-deck-item-check');
            if (check) check.remove();
          });
          item.classList.add('selected');
          const checkWrap = document.createElement('span');
          checkWrap.innerHTML = `<svg class="anki-deck-item-check" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          item.appendChild(checkWrap.firstElementChild);

          // Close menu
          triggerBtn.classList.remove('active');
          triggerBtn.setAttribute('aria-expanded', 'false');
          menuEl.style.display = 'none';

          // Persist default choice
          saveSelectedDeck(deckVal);
        });
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

          // Update mutable context so future actions (Save/Reset) reflect user's updated sentence
          if (context) {
            context.word = currentWord;
            context.sentence = currentSentence;
          }

          // Cache fresh data and re-render loaded popover
          activePopoverEl._originalAiData = JSON.parse(JSON.stringify(res.data));
          renderPopoverLoadedData(res.data, {
            ...context,
            word: currentWord,
            sentence: currentSentence,
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

    // Dynamic POS badge style updater when user edits part of speech
    const posBadgeEl = activePopoverEl.querySelector('[data-field="pos"]');
    if (posBadgeEl) {
      posBadgeEl.addEventListener('input', () => {
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
      if (shadowRoot && shadowRoot.activeElement && shadowRoot.activeElement.isContentEditable) {
        shadowRoot.activeElement.blur();
        return;
      }
      removeQuickTrigger();
      closeFloatingPopover();
    }
  });

  document.addEventListener('mouseup', () => {
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
