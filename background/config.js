/**
 * Default configurations, model constants, and storage helpers for Anki AI Vocab
 */

export const PRIMARY_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';

/**
 * Token-optimized prompt adhering strictly to SPEC.md with lemmatization, 100% complete translation and standalone example generation
 */
export const DEFAULT_PROMPT = `Dictionary parser. Output JSON strictly adhering to schema. No thoughts. No markdown. Translation language: {{target_lang}}.

STRICT PRIORITY OF ANALYSIS:
1. PRIORITY 1 - CONTEXTUAL MEANING (meaning_vi):
   The "meaning_vi" property is your HIGHEST priority. It MUST be the exact, natural translation of the target word/phrase fitting the SPECIFIC CONTEXT of the provided sentence. Never output a generic, out-of-context, or primary dictionary meaning if it does not fit this sentence.
2. PRIORITY 2 - CONTEXT SENTENCE & 100% TRANSLATION (example_sentence & example_vi):
   If Context is provided, preserve 100% of the original Context sentence for "example_sentence" (or "example_en"). You MUST translate 100% of the entire Context sentence completely into {{target_lang}} for "example_vi" without omitting, dropping, or summarizing any clause, conjunction, or relative phrase.
3. PRIORITY 3 - CONCISE DEFINITION (definition_en):
   Provide a concise, clear English learner definition explaining the target word/phrase specifically AS USED in this context.
4. Lemmatization (Base Form):
   The "word" property in the output MUST ALWAYS be the base dictionary form (lemma) in lowercase (e.g., "families" -> "family", "studied" -> "study", "running" -> "run", "better" -> "good", "went" -> "go", "ran" -> "run", "caught up" -> "catch up", "stepping stones" -> "stepping stone"). The "phonetic" field must correspond to this base lemma.
5. Standalone Word Lookup:
   If Context is missing, "none", or empty, generate an authentic B1-B2 English example sentence for "example_en" and translate 100% of it into {{target_lang}} for "example_vi".

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
  lastUsedDeck: 'Default',
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

<div style="border-top:1px dashed #d1d5db;margin:14px 0 12px 0;"></div>

<div style="font-size:14px;color:#374151;line-height:1.6;">
  <div>{{example_sentence}}</div>
  <div style="font-size:12.5px;color:#6b7280;font-style:italic;margin-top:4px;">{{example_translation}}</div>
</div>

<div style="font-size:13px;color:#6b7280;margin-top:12px;line-height:1.45;">{{definition_en}}</div>

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
  autoTokenBudget: true, // Auto output token budget to prevent truncating definitions & meanings
  maxOutputTokens: 500,  // Used when autoTokenBudget is false
  autoPronounce: false,
  audioVoice: 'random', // 'random' | 'male' | 'female'
  closeOnlyOnX: false, // Keep popover open on click outside; only dismiss via '×' button or Esc
  theme: 'dark' // 'dark' | 'light' | 'system'
};

/**
 * Load user settings with dual fallback (local + sync) to defaults
 * Ensures complete reliability, prevents storage quota failures, and guarantees non-empty prompts
 */
export async function getConfig() {
  return new Promise((resolve) => {
    const readArea = (area) => {
      return new Promise((res) => {
        try {
          if (!area || typeof area.get !== 'function') return res({});
          area.get(null, (items) => {
            if (chrome.runtime.lastError || !items) {
              res({});
            } else {
              res(items);
            }
          });
        } catch {
          res({});
        }
      });
    };

    Promise.all([
      readArea(chrome.storage.local),
      readArea(chrome.storage.sync)
    ]).then(([localItems, syncItems]) => {
      // Hierarchy: DEFAULT_CONFIG < syncItems < localItems (local takes precedence as high-capacity source of truth)
      const merged = { ...DEFAULT_CONFIG, ...syncItems, ...localItems };

      merged.fieldMappings = {
        ...DEFAULT_CONFIG.fieldMappings,
        ...(syncItems?.fieldMappings || {}),
        ...(localItems?.fieldMappings || {})
      };

      // Strict safeguard: customPrompt must never be blank or whitespace
      if (!merged.customPrompt || typeof merged.customPrompt !== 'string' || !merged.customPrompt.trim()) {
        merged.customPrompt = DEFAULT_PROMPT;
      }

      resolve(merged);
    }).catch(() => {
      resolve({ ...DEFAULT_CONFIG });
    });
  });
}

/**
 * Save configuration to storage (Dual persistence: guaranteed local + best-effort sync)
 */
export async function saveConfig(newConfig) {
  const safeConfig = { ...newConfig };

  // Safeguard: Ensure customPrompt is never saved as blank or empty whitespace
  if (!safeConfig.customPrompt || typeof safeConfig.customPrompt !== 'string' || !safeConfig.customPrompt.trim()) {
    safeConfig.customPrompt = DEFAULT_PROMPT;
  }

  return new Promise((resolve, reject) => {
    // 1. Primary write to chrome.storage.local (10MB quota, high reliability)
    chrome.storage.local.set(safeConfig, () => {
      const localErr = chrome.runtime.lastError;
      if (localErr) {
        return reject(localErr);
      }

      // 2. Best-effort mirror to chrome.storage.sync (cross-device sync)
      try {
        chrome.storage.sync.set(safeConfig, () => {
          const syncErr = chrome.runtime.lastError;
          if (syncErr) {
            console.warn('[Storage] Sync storage quota notice (data safely persisted in local storage):', syncErr.message);
          }
          resolve();
        });
      } catch {
        resolve();
      }
    });
  });
}
