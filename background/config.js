/**
 * Default configurations, model constants, and storage helpers for Anki AI Vocab
 */

export const PRIMARY_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';

/**
 * Token-optimized prompt adhering strictly to SPEC.md with 100% complete translation and standalone example generation
 */
export const DEFAULT_PROMPT = `Dictionary parser. Output JSON strictly adhering to schema. No thoughts. No markdown. Translation language: {{target_lang}}.

CRITICAL RULES:
1. Complete 100% Translation: If Context is provided, you MUST translate 100% of the entire Context sentence into {{target_lang}} for example_vi. Never omit, truncate, or summarize any clause, phrase, or conjunction (including clauses connected by "and", "but", "because", "so", or relative pronouns).
2. Standalone Word Lookup: If Context is missing, "none", empty, or identical to the target word, you MUST:
   - Generate a clear, natural English example sentence (B1-B2 level) demonstrating real-world usage of "{{word}}" for example_en.
   - Translate 100% of that generated sentence completely into {{target_lang}} for example_vi without skipping any clause or word.
3. If Context is provided, set example_en to the exact context sentence.

Word: "{{word}}"
Context: "{{sentence}}"`;

export const DEFAULT_CONFIG = {
  // AI Engine Settings (Quota & Speed Optimized)
  apiProvider: 'gemini', // 'gemini' | 'openai' | 'custom'
  apiKey: '',
  geminiModel: PRIMARY_GEMINI_MODEL,
  fallbackGeminiModel: FALLBACK_GEMINI_MODEL,
  openaiModel: 'gpt-4o-mini',
  customModel: 'gpt-4o-mini',
  customBaseUrl: 'https://api.openai.com/v1',
  targetLanguage: 'Vietnamese',
  customPrompt: DEFAULT_PROMPT,

  // Anki Settings
  ankiUrl: 'http://127.0.0.1:8765',
  ankiApiKey: '',
  deckName: 'Default',
  availableDecks: ['Default'],
  noteType: 'Basic',
  tags: 'anki-ai-vocab',

  // Field Mapping for Anki Note Types
  fieldMappings: {
    Basic: {
      Front: '{{word}} <span style="color:#71717a;font-size:0.85em;margin-left:6px;font-family:monospace;">[{{phonetic}}]</span> {{audio}}',
      Back: `<div style="font-size:17px;font-weight:600;color:#111827;line-height:1.45;">
  <span style="font-size:11px;font-weight:500;padding:2px 7px;border-radius:4px;background:#f3f4f6;color:#4b5563;border:1px solid #e5e7eb;margin-right:6px;vertical-align:middle;">{{pos}}</span>
  {{meaning_vi}}
</div>
<div style="font-size:13px;color:#6b7280;margin-top:4px;line-height:1.45;">{{definition_en}}</div>

<div style="border-top:1px dashed #d1d5db;margin:16px 0 14px 0;"></div>

<div style="font-size:14px;color:#374151;line-height:1.6;">
  <div>{{example_sentence}}</div>
  <div style="font-size:12.5px;color:#6b7280;font-style:italic;margin-top:4px;">{{example_translation}}</div>
</div>
<div style="margin-top:14px;font-size:11px;color:#9ca3af;text-align:right;">
  Source: <a href="{{source_url}}" style="color:#9ca3af;text-decoration:none;">web context</a>
</div>`.trim()
    },
    'Anki AI Vocab': {
      Word: '{{Word}}',
      Phonetic: '{{Phonetic}}',
      PartOfSpeech: '{{PartOfSpeech}}',
      Meaning: '{{Meaning}}',
      DefinitionEN: '{{DefinitionEN}}',
      ContextSentence: '{{ContextSentence}}',
      ContextTranslation: '{{ContextTranslation}}',
      Audio: '{{Audio}}'
    }
  },

  // UI & Behavior Settings (Compact Popover)
  showQuickTooltip: true,
  autoCloseOnSuccess: true,
  autoCloseDelayMs: 1400,
  maxOutputTokens: 250,
  autoPronounce: false,
  audioVoice: 'random', // 'random' | 'male' | 'female'
  closeOnlyOnX: false, // Keep popover open on click outside; only dismiss via '×' button or Esc
  theme: 'dark' // 'dark' | 'light' | 'system'
};

/**
 * Load user settings with fallback to defaults
 */
export async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_CONFIG, (items) => {
      const merged = { ...DEFAULT_CONFIG, ...items };
      merged.fieldMappings = {
        ...DEFAULT_CONFIG.fieldMappings,
        ...(items.fieldMappings || {})
      };
      resolve(merged);
    });
  });
}

/**
 * Save configuration to storage
 */
export async function saveConfig(newConfig) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(newConfig, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
