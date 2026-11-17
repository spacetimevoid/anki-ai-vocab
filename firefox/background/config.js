/**
 * Default configurations, model constants, and storage helpers for Anki AI Vocab
 */

export const PRIMARY_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';

/**
 * Token-optimized prompt adhering strictly to SPEC.md with lemmatization, 100% complete translation and standalone example generation
 */
export const DEFAULT_PROMPT = `Dictionary parser. Output JSON strictly adhering to schema. No thoughts. No markdown. Translation language: {{target_lang}}.

STRICT TRANSLATION QUALITY & ANALYSIS PRIORITIES:
1. NATURAL CONVERSATIONAL QUALITY (SÁT ĐỜI SỐNG, THUẦN VIỆT, KHÔNG MÁY MÓC):
   - All translations ("meaning_vi" and "example_vi") MUST sound natural, fluent, and idiomatic in {{target_lang}}, matching authentic everyday native speech.
   - Strictly avoid stiff word-for-word machine translation ("translationese").
   - Eliminate awkward passive voice ("được/bị" when unnatural), clumsy literal pronouns ("của nó/chúng nó"), and robotic phrasing.
   - For dialogs, colloquial expressions, subtitles, slang, or idioms, translate with natural conversational tone (e.g. adapt naturally like high-quality movie subtitles or professional human translators).
2. PRIORITY 1 - CONTEXTUAL MEANING (meaning_vi - HIGHEST PRIORITY):
   - Concise, natural translation of the target word/phrase fitting the EXACT REAL-LIFE CONTEXT of the sentence.
   - Never output an out-of-context, academic, or rigid primary dictionary headword if it does not fit this specific context.
3. PRIORITY 2 - CONTEXT SENTENCE & NATURAL FULL TRANSLATION (example_sentence & example_vi):
   - "example_sentence" (or "example_en"): Preserve 100% of the complete original context sentence.
   - "example_vi": Translate the entire meaning and nuances of the full sentence into smooth, natural, conversational {{target_lang}}. Convey all clauses naturally without mechanical word-by-word conversion.
4. PRIORITY 3 - CONCISE DEFINITION (definition_en):
   - Clear, concise English learner definition explaining the target word/phrase specifically AS USED in this context.
5. Lemmatization (Base Form):
   The "word" property in the output MUST ALWAYS be the base dictionary form (lemma) in lowercase (e.g., "families" -> "family", "studied" -> "study", "running" -> "run", "better" -> "good", "went" -> "go", "ran" -> "run", "caught up" -> "catch up", "stepping stones" -> "stepping stone"). The "phonetic" field must correspond to this base lemma.
6. Part of Speech Standardization (pos):
   The "pos" property MUST ALWAYS be one single full English word in lowercase from standard categories: "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "interjection", "phrasal verb", "idiom". NEVER output abbreviations like "prep", "n", "v", "adj", "adv", or "conj" (e.g. use "preposition" never "prep", "noun" never "n").
7. Standalone Word Lookup:
   If Context is missing, "none", or empty, generate an authentic B1-B2 English example sentence for "example_en" and provide a natural, conversational translation for "example_vi".
8. Context Normalization:
   If Context is in ALL CAPS (e.g., "PASS THE BALL BRO, I AM INTERESTED"), has excessive capitalization, strange spaces before punctuation, or noisy artifacts, normalize "example_sentence" into natural, standard English sentence casing (e.g., "Pass the ball bro, I am interested.") with standard punctuation spacing, while preserving all original words.

Word: "{{word}}"
Context: "{{sentence}}"`;

export const DEFAULT_CONFIG = {
  // AI Engine Settings (Quota & Speed Optimized)
  apiProvider: 'gemini', // 'gemini' | 'claude' | 'openai' | 'custom'
  apiKey: '', // Active provider's key (backward compatibility)
  geminiApiKey: '',
  claudeApiKey: '',
  openaiApiKey: '',
  customApiKey: '',
  geminiModel: PRIMARY_GEMINI_MODEL,
  fallbackGeminiModel: FALLBACK_GEMINI_MODEL,
  claudeModel: 'claude-haiku-5-5',
  claudeBaseUrl: 'https://1gw.gwai.cloud/v1',
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
  lastUsedModel: 'Basic',
  availableModels: ['Basic', 'Anki AI Vocab'],
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
  autoTokenBudget: true, // Auto output token budget to prevent truncating definitions & meanings
  maxOutputTokens: 500,  // Used when autoTokenBudget is false
  autoPronounce: false,
  audioVoice: 'random', // 'random' | 'male' | 'female'
  closeOnlyOnX: false, // Keep popover open on click outside; only dismiss via '×' button or Esc
  theme: 'dark' // 'dark' | 'light' | 'system'
};

/**
 * Get active API key corresponding to the configured or requested provider
 */
export function getProviderApiKey(config, provider) {
  const activeProvider = provider || config?.apiProvider || 'gemini';
  if (activeProvider === 'gemini') return config?.geminiApiKey || (config?.apiProvider === 'gemini' ? config?.apiKey : '') || '';
  if (activeProvider === 'claude') return config?.claudeApiKey || (config?.apiProvider === 'claude' ? config?.apiKey : '') || '';
  if (activeProvider === 'openai') return config?.openaiApiKey || (config?.apiProvider === 'openai' ? config?.apiKey : '') || '';
  if (activeProvider === 'custom') return config?.customApiKey || (config?.apiProvider === 'custom' ? config?.apiKey : '') || '';
  return config?.apiKey || '';
}

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

      // Automatic backward compatibility & migration for separate provider keys
      if (!merged.geminiApiKey && (merged.apiProvider === 'gemini' || (merged.apiKey && merged.apiKey.startsWith('AIzaSy')))) {
        merged.geminiApiKey = merged.apiKey;
      }
      if (!merged.claudeApiKey && merged.apiProvider === 'claude' && merged.apiKey) {
        merged.claudeApiKey = merged.apiKey;
      }
      if (!merged.openaiApiKey && merged.apiProvider === 'openai' && merged.apiKey) {
        merged.openaiApiKey = merged.apiKey;
      }
      if (!merged.customApiKey && merged.apiProvider === 'custom' && merged.apiKey) {
        merged.customApiKey = merged.apiKey;
      }

      // Always synchronize merged.apiKey with the active provider's specific key
      merged.apiKey = getProviderApiKey(merged, merged.apiProvider);

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

  // Synchronize active provider's key to apiKey for backward compatibility
  const provider = safeConfig.apiProvider || 'gemini';
  safeConfig.apiKey = getProviderApiKey(safeConfig, provider);

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
