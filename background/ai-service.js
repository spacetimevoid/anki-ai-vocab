/**
 * High-Performance AI Service for Chrome Extension (Manifest V3)
 * Optimized for sub-0.5s response times
 *
 * Key Performance Features:
 * 1. Instant Cache: In-memory Map + chrome.storage.local cache (0ms for repeat lookups)
 * 2. Dynamic Thinking Config: thinkingLevel: "LOW" for Gemini 3.x, thinkingBudget: 0 for Gemini 2.5
 * 3. Self-Healing: Automatic retry without thinkingConfig if rejected with HTTP 400
 * 4. Multi-part Smart Scanner: Specifically targets parts containing JSON, ignoring thinking parts
 * 5. Robust JSON Parser with truncated JSON auto-recovery
 * 6. Native Fetch with 14s AbortController timeout
 * 7. maxOutputTokens: 250 — lean schema means ~100-150 tokens, hard cap prevents over-generation
 * 8. Lean Schema: 6 fields only — dropped collocations, example_sentence, example_translation
 */

import { PRIMARY_GEMINI_MODEL, FALLBACK_GEMINI_MODEL } from './config.js';

// In-memory LRU cache for instant 0ms responses
const memoryVocabCache = new Map();

/**
 * Fast 32-bit FNV-1a hash for context sentences
 */
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Generate context-aware cache key combining word, sentence context, and target language
 */
function getCacheKey(word, sentence, targetLang = 'vietnamese') {
  if (!word) return null;
  const cleanWord = word.toLowerCase().trim();
  const cleanLang = (targetLang || 'vietnamese').toLowerCase().trim();
  const cleanSentence = (sentence || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const words = cleanSentence.split(/\s+/).filter(Boolean);

  // If there is no sentence, sentence is just the word itself, or less than 3 words
  if (!cleanSentence || cleanSentence === cleanWord || words.length < 3) {
    return `vocab_${cleanWord}_${cleanLang}_nocontext`;
  }

  const ctxHash = hashString(cleanSentence);
  return `vocab_${cleanWord}_${cleanLang}_${ctxHash}`;
}

/**
 * Invalidate cache for a specific word and context (including legacy unhashed key)
 */
export async function invalidateCache(word, sentence, targetLang) {
  const key = getCacheKey(word, sentence, targetLang);
  if (key) {
    memoryVocabCache.delete(key);
    try {
      await chrome.storage.local.remove(key);
    } catch {}
  }
  if (word) {
    const legacyKey = `vocab_${word.toLowerCase().trim()}_${targetLang}`;
    memoryVocabCache.delete(legacyKey);
    try {
      await chrome.storage.local.remove(legacyKey);
    } catch {}
  }
}

/**
 * Check local & memory cache before making any network call (Context-Aware)
 */
async function getFromCache(word, sentence, targetLang, bypassCache = false) {
  if (bypassCache || !word) return null;
  const key = getCacheKey(word, sentence, targetLang);
  if (!key) return null;

  if (memoryVocabCache.has(key)) {
    console.log(`[Cache HIT - Memory] "${word}" (${key}) -> 0ms`);
    return memoryVocabCache.get(key);
  }

  try {
    const res = await chrome.storage.local.get(key);
    if (res && res[key]) {
      console.log(`[Cache HIT - Storage] "${word}" (${key}) -> 1ms`);
      memoryVocabCache.set(key, res[key]);
      return res[key];
    }
  } catch {
    // Ignore storage cache lookup errors
  }

  return null;
}

/**
 * Save valid AI result to cache (Context-Aware)
 */
async function saveToCache(word, sentence, targetLang, data) {
  if (!word || !data) return;
  const key = getCacheKey(word, sentence, targetLang);
  if (!key) return;

  memoryVocabCache.set(key, data);
  if (memoryVocabCache.size > 500) {
    const oldestKey = memoryVocabCache.keys().next().value;
    memoryVocabCache.delete(oldestKey);
  }

  try {
    await chrome.storage.local.set({ [key]: data });
  } catch {
    // Ignore storage save errors
  }
}

/**
 * Build model-appropriate thinkingConfig:
 * - Gemini 3.x uses thinkingLevel: "LOW" (MINIMAL is not supported by 3.5/3.8 Flash)
 * - Gemini 2.5 uses thinkingBudget: 0
 */
function getThinkingConfig(modelName) {
  const lower = (modelName || '').toLowerCase();
  if (lower.includes('3.') || lower.includes('3-') || lower.includes('gemini-3')) {
    return { thinkingLevel: 'LOW' };
  }
  if (lower.includes('2.5')) {
    return { thinkingBudget: 0 };
  }
  return undefined;
}

/**
 * Smart part extractor: Locates the exact part containing JSON, ignoring thought parts
 */
function extractJsonFromParts(parts = []) {
  if (!Array.isArray(parts) || parts.length === 0) return '';

  // 1. Priority 1: A non-thought part that explicitly contains '{'
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (!p.thought && typeof p.text === 'string' && p.text.includes('{')) {
      return p.text;
    }
  }

  // 2. Priority 2: Any part containing '{'
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (typeof p.text === 'string' && p.text.includes('{')) {
      return p.text;
    }
  }

  // 3. Priority 3: Combined text of all non-thought parts
  const nonThoughtParts = parts.filter(p => !p.thought && typeof p.text === 'string');
  if (nonThoughtParts.length > 0) {
    const combined = nonThoughtParts.map(p => p.text).join('\n');
    if (combined.includes('{')) return combined;
  }

  // 4. Priority 4: Combined text of all parts if '{' exists in combined stream
  const combined = parts.map(p => p.text || '').join('\n');
  if (combined.includes('{')) {
    return combined;
  }

  // Fallback to the last part's text
  return parts[parts.length - 1]?.text || '';
}

/**
 * Robust JSON Sanitizer and Parser for AI responses
 */
export function safeParseAIJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI không trả về nội dung hợp lệ.');
  }

  let cleaned = rawText.trim();

  // 1. Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // 2. Extract substring between first '{' and last '}'
  const startIdx = cleaned.indexOf('{');
  let endIdx = cleaned.lastIndexOf('}');

  if (startIdx !== -1) {
    if (endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    } else {
      // Incomplete/Truncated JSON: append closing quote and brace
      cleaned = cleaned.substring(startIdx) + '\n}';
    }
  } else {
    // If no '{' is found, try regex extraction directly from full text
    const wordMatch = rawText.match(/['"]?word['"]?\s*:\s*['"]([^'"]+)['"]/i);
    const meaningMatch = rawText.match(/['"]?meaning_vi['"]?\s*:\s*['"]([^'"]+)['"]/i);
    if (wordMatch && meaningMatch) {
      const exEn = (rawText.match(/['"]?example_en['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || rawText.match(/['"]?example_sentence['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || '').trim();
      const exVi = (rawText.match(/['"]?example_vi['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || rawText.match(/['"]?example_translation['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || '').trim();
      return {
        word: wordMatch[1].trim(),
        phonetic: (rawText.match(/['"]?phonetic['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || '').trim(),
        pos: (rawText.match(/['"]?pos['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || 'noun').trim(),
        meaning_vi: meaningMatch[1].trim(),
        definition_en: (rawText.match(/['"]?definition_en['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || '').trim(),
        example_sentence: exEn,
        example_en: exEn,
        example_translation: exVi,
        example_vi: exVi,
        collocations: []
      };
    }

    console.error('[Anki AI Vocab] Raw text has no JSON block:', rawText);
    throw new Error('Không tìm thấy khối JSON hợp lệ trong phản hồi của AI.');
  }

  // 3. Attempt direct standard JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    // 4. Fallback sanitization pass:
    let repaired = cleaned
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([{,]\s*)'([a-zA-Z0-9_]+)'\s*:/g, '$1"$2":')
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/:\s*'([^'\r\n]*)'/g, ': "$1"');

    try {
      return JSON.parse(repaired);
    } catch {
      // 5. Fallback regex field extraction for known schema keys
      try {
        const getField = (field) => {
          const regex = new RegExp(`['"]?${field}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
          const match = rawText.match(regex);
          return match ? match[1].trim() : '';
        };

        const fallbackObj = {
          word: getField('word'),
          phonetic: getField('phonetic'),
          pos: getField('pos') || 'noun',
          meaning_vi: getField('meaning_vi'),
          definition_en: getField('definition_en'),
          example_en: getField('example_en') || getField('example_sentence'),
          example_vi: getField('example_vi') || getField('example_translation')
        };

        if (fallbackObj.word && (fallbackObj.meaning_vi || fallbackObj.definition_en)) {
          return fallbackObj;
        }
      } catch {
        // Fall through
      }

      console.error('[Anki AI Vocab] Failed to parse AI JSON response. Raw text:', rawText);
      throw new Error('Invalid JSON response from AI: ' + firstErr.message);
    }
  }
}

/**
 * Validate and normalize parsed AI response matching SPEC.md schema
 */
function normalizeSchema(result, fallbackWord = '', fallbackSentence = '', sourceUrl = '') {
  const word = (result.word || fallbackWord).trim();
  const phonetic = (result.phonetic || '').trim();
  const pos = (result.pos || 'noun').trim().toLowerCase();
  const meaning_vi = (result.meaning_vi || '').trim();
  const definition_en = (result.definition_en || '').trim();

  // English Context Sentence:
  // Check if fallbackSentence is an actual real sentence (>= 3 words and not equal to word or original highlighted form)
  const rawFallback = (fallbackSentence || '').trim();
  const cleanWord = (word || fallbackWord || '').trim();
  const cleanFallback = (fallbackWord || '').trim();
  const isRealContext = rawFallback && 
    rawFallback.toLowerCase() !== cleanWord.toLowerCase() && 
    rawFallback.toLowerCase() !== cleanFallback.toLowerCase() &&
    rawFallback.split(/\s+/).length >= 3;

  const example_sentence = (isRealContext 
    ? rawFallback 
    : (result.example_en || result.example_sentence || rawFallback || '')
  ).trim();

  // Vietnamese Translation: 100% complete translation
  const example_translation = (result.example_vi || result.example_translation || '').trim();
  const example_vi = example_translation;
  const example_en = example_sentence;
  const collocations = [];

  return {
    word,                  // Lemmatized base form
    phonetic,              // IPA for base form
    pos,
    meaning_vi,
    definition_en,
    example_sentence,      // Original English sentence or AI-generated example sentence
    example_en,            // Clean alias
    example_translation,   // 100% full translation
    example_vi,            // Vietnamese translation alias
    context_sentence: example_sentence,
    context_translation: example_translation,
    sentence: example_sentence,
    collocations,
    source_url: sourceUrl || ''
  };
}

/**
 * Ultra-fast lookup function using native Fetch with 14s AbortController timeout,
 * strict responseSchema + lean 7-field schema, minimal thinking level, configurable or Auto Token Budget.
 */
async function lookupGeminiFast(word, sentence, apiKey, model = PRIMARY_GEMINI_MODEL, targetLang = 'Vietnamese', customPrompt = '', tokenBudget = 'auto') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Hard timeout at 14 seconds: gives AI Studio breathing room while preventing indefinite hangs
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  const cleanWord = (word || '').trim();
  const rawSentence = (sentence || '').trim();
  const isRealContext = rawSentence && 
    rawSentence.toLowerCase() !== cleanWord.toLowerCase() && 
    rawSentence.split(/\s+/).length >= 3;

  let prompt = '';
  let defaultSystemInstruction = '';

  if (isRealContext) {
    defaultSystemInstruction = `Dictionary parser. Output JSON strictly adhering to schema. No thoughts. No markdown. Translation language: ${targetLang}.
CRITICAL RULES:
1. Lemmatization (Base Form): The "word" property in the output MUST ALWAYS be the base dictionary form (lemma) in lowercase (e.g., "families" -> "family", "studied" -> "study", "running" -> "run", "better" -> "good", "went" -> "go", "ran" -> "run", "caught up" -> "catch up", "phenomena" -> "phenomenon"). Never output inflected, conjugated, plural, comparative, or past tense forms for "word".
2. The "phonetic" property MUST match the pronunciation of this base lemma form.
3. Complete 100% Translation: Translate 100% of the entire Context sentence completely into ${targetLang} for "example_vi". Never omit, drop, or summarize any clause, phrase, or conjunction (e.g., secondary clauses joined by "and", "but", "because", "although", "which").
4. Set "example_en" to the exact Context sentence.`;
    prompt = `Word: "${cleanWord}"\nContext: "${rawSentence}"`;
  } else {
    defaultSystemInstruction = `Dictionary parser. Output JSON strictly adhering to schema. No thoughts. No markdown. Translation language: ${targetLang}.
CRITICAL RULES:
1. Lemmatization (Base Form): The "word" property in the output MUST ALWAYS be the base dictionary form (lemma) in lowercase (e.g., "families" -> "family", "studied" -> "study", "running" -> "run", "better" -> "good", "went" -> "go", "ran" -> "run", "caught up" -> "catch up", "phenomena" -> "phenomenon"). Never output inflected, conjugated, plural, comparative, or past tense forms for "word".
2. The "phonetic" property MUST match the pronunciation of this base lemma form.
3. Standalone Example: No context sentence was provided. Generate a natural, practical English example sentence (B1-B2 level) demonstrating real-world usage of the lemma for "example_en".
4. Translate 100% of this generated English example sentence completely into ${targetLang} for "example_vi" without omitting any clause or word.`;
    prompt = `Word: "${cleanWord}"\nContext: none. Generate an authentic example sentence containing the lemma.`;
  }

  const systemInstruction = (customPrompt && customPrompt.trim().length > 0 && !customPrompt.includes('You are a precision'))
    ? customPrompt.replace(/{{\s*target_lang\s*}}/g, targetLang).replace(/{{\s*word\s*}}/g, cleanWord).replace(/{{\s*sentence\s*}}/g, isRealContext ? rawSentence : 'none')
    : defaultSystemInstruction;

  const thinkingCfg = getThinkingConfig(model);

  // Dynamic token limit: In "auto" mode, allocate 1024 tokens to guarantee no truncation.
  const isAutoToken = tokenBudget === 'auto' || tokenBudget === null || tokenBudget === undefined || tokenBudget <= 0;
  const maxTokensLimit = isAutoToken ? 1024 : Math.max(150, parseInt(tokenBudget, 10));

  const requestBody = {
    contents: [
      { parts: [{ text: prompt }] }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: maxTokensLimit,
      responseMimeType: "application/json",
      ...(thinkingCfg ? { thinkingConfig: thinkingCfg } : {}),
      responseSchema: {
        type: "OBJECT",
        properties: {
          word: { type: "STRING" },
          phonetic: { type: "STRING" },
          pos: { type: "STRING" },
          meaning_vi: { type: "STRING" },
          definition_en: { type: "STRING" },
          example_en: { type: "STRING" },
          example_vi: { type: "STRING" }
        },
        required: ["word", "phonetic", "pos", "meaning_vi", "example_en", "example_vi"]
      }
    }
  };

  const startTime = performance.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        const err = new Error("API rate limit reached (429). Please wait a few seconds and try again.");
        err.status = 429;
        throw err;
      }
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || response.statusText;

      // Self-healing: If thinking level or budget is rejected by this model (HTTP 400),
      // immediately retry without thinkingConfig
      if (response.status === 400 && /thinking/i.test(errMsg) && requestBody.generationConfig?.thinkingConfig) {
        console.warn(`[Anki AI Vocab] Model "${model}" rejected thinkingConfig (${errMsg}). Retrying without thinkingConfig...`);
        delete requestBody.generationConfig.thinkingConfig;

        const retryRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        if (retryRes.ok) {
          const retryData = await retryRes.json();
          const elapsed = Math.round(performance.now() - startTime);
          console.log(`[Timer] Lookup (${model}) succeeded after recovering thinkingConfig: ${elapsed}ms`);
          const rawText = extractJsonFromParts(retryData.candidates?.[0]?.content?.parts);
          if (rawText) return safeParseAIJson(rawText);
        }
      }

      const err = new Error(`Gemini API error (${response.status}): ${errMsg}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const elapsed = Math.round(performance.now() - startTime);
    console.log(`[Timer] Lookup (${model}) succeeded in: ${elapsed}ms`);

    // Extract text from parts using smart scanner
    const rawText = extractJsonFromParts(data.candidates?.[0]?.content?.parts);
    if (!rawText) throw new Error("AI did not return any content.");

    return safeParseAIJson(rawText);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Request timed out (> 14s). Google AI server is responding slowly, please retry.");
    }
    throw error;
  }
}

/**
 * Query Google Gemini with Max 1 Quick Fallback (Fail-Fast Policy)
 */
async function queryGemini({ word, sentence, sourceUrl, config, bypassCache = false }) {
  const apiKey = (config.apiKey || '').trim();
  if (!apiKey) {
    throw new Error('Gemini API Key is not configured. Please open Settings to enter your API Key.');
  }

  const primaryModel = config.geminiModel || PRIMARY_GEMINI_MODEL;
  const fallbackModel = config.fallbackGeminiModel || FALLBACK_GEMINI_MODEL;
  const targetLang = config.targetLanguage || 'Vietnamese';
  const customPrompt = config.customPrompt || '';

  // Determine token budget (Auto or manual cap)
  const isAuto = config?.autoTokenBudget !== false;
  const tokenBudget = isAuto ? 'auto' : (config?.maxOutputTokens || 500);

  // 1. Check Context-Aware Cache first (0ms)
  const cached = await getFromCache(word, sentence, targetLang, bypassCache);
  if (cached) {
    return cached;
  }

  try {
    // Attempt 1: Primary Model (<1s)
    const rawResult = await lookupGeminiFast(word, sentence, apiKey, primaryModel, targetLang, customPrompt, tokenBudget);
    const normalized = normalizeSchema(rawResult, word, sentence, sourceUrl);
    // Save to Cache with context
    saveToCache(word, sentence, targetLang, normalized);
    if (normalized.word && normalized.word.toLowerCase() !== word.toLowerCase()) {
      saveToCache(normalized.word, sentence, targetLang, normalized);
    }
    return normalized;
  } catch (primaryErr) {
    // Fail-fast on auth or timeout errors
    if (primaryErr.status === 400 || primaryErr.status === 401 || primaryErr.status === 403 || primaryErr.message.includes('Timeout')) {
      throw primaryErr;
    }

    // Attempt 2: Max 1 quick fallback if 429/503 occurs
    if ((primaryErr.status === 429 || primaryErr.status === 503) && fallbackModel && fallbackModel !== primaryModel) {
      console.warn(`[Anki AI Vocab] Model "${primaryModel}" encountered ${primaryErr.status}. Retrying fallback model "${fallbackModel}"...`);
      try {
        const fallbackResult = await lookupGeminiFast(word, sentence, apiKey, fallbackModel, targetLang, customPrompt, tokenBudget);
        const normalized = normalizeSchema(fallbackResult, word, sentence, sourceUrl);
        saveToCache(word, sentence, targetLang, normalized);
        if (normalized.word && normalized.word.toLowerCase() !== word.toLowerCase()) {
          saveToCache(normalized.word, sentence, targetLang, normalized);
        }
        return normalized;
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }

    throw primaryErr;
  }
}

/**
 * Query OpenAI or OpenAI-Compatible API with Configurable Token Budget
 */
async function queryOpenAI({ word, sentence, sourceUrl, config, isCustom = false, bypassCache = false }) {
  const apiKey = (config.apiKey || '').trim();
  if (!apiKey && !isCustom) {
    throw new Error('OpenAI API Key is not configured. Please open Settings to enter your API Key.');
  }

  const targetLang = config.targetLanguage || 'Vietnamese';

  // Check Context-Aware Cache first (0ms)
  const cached = await getFromCache(word, sentence, targetLang, bypassCache);
  if (cached) {
    return cached;
  }

  const baseUrl = isCustom 
    ? (config.customBaseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') 
    : 'https://api.openai.com/v1';
  
  const model = isCustom ? (config.customModel || 'gpt-4o-mini') : (config.openaiModel || 'gpt-4o-mini');
  const endpoint = `${baseUrl}/chat/completions`;

  const cleanWord = (word || '').trim();
  const rawSentence = (sentence || '').trim();
  const isRealContext = rawSentence && 
    rawSentence.toLowerCase() !== cleanWord.toLowerCase() && 
    rawSentence.split(/\s+/).length >= 3;

  let systemInstruction = '';
  let prompt = '';

  if (isRealContext) {
    systemInstruction = `You are a high-speed dictionary parser. Output JSON strictly adhering to schema: {"word":"","phonetic":"","pos":"","meaning_vi":"","definition_en":"","example_en":"","example_vi":""}. Translation language: ${targetLang}.
RULES:
1. Lemmatization (Base Form): The "word" property in the output MUST ALWAYS be the base dictionary form (lemma) in lowercase (e.g., "families" -> "family", "studied" -> "study", "running" -> "run", "better" -> "good", "went" -> "go", "ran" -> "run", "caught up" -> "catch up"). The "phonetic" field must correspond to this base lemma.
2. Translate 100% of the entire Context sentence completely into ${targetLang} for "example_vi". Never omit, drop, or summarize any clause, phrase, or conjunction (including clauses connected by "and", "but", "because", "so", or relative pronouns).
3. Set "example_en" to the exact Context sentence.`;
    prompt = `Word: "${cleanWord}". Context: "${rawSentence}".`;
  } else {
    systemInstruction = `You are a high-speed dictionary parser. Output JSON strictly adhering to schema: {"word":"","phonetic":"","pos":"","meaning_vi":"","definition_en":"","example_en":"","example_vi":""}. Translation language: ${targetLang}.
RULES:
1. Lemmatization (Base Form): The "word" property in the output MUST ALWAYS be the base dictionary form (lemma) in lowercase (e.g., "families" -> "family", "studied" -> "study", "running" -> "run", "better" -> "good", "went" -> "go", "ran" -> "run", "caught up" -> "catch up"). The "phonetic" field must correspond to this base lemma.
2. No context sentence was provided. Generate a natural, practical English example sentence (B1-B2 level) demonstrating real-world usage of the lemma for "example_en".
3. Translate 100% of this generated English example sentence completely into ${targetLang} for "example_vi" without skipping any clause or word.`;
    prompt = `Word: "${cleanWord}". Context: none. Generate a natural English example sentence for this word.`;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  // Token budget: In auto mode, use 1000 tokens to prevent truncating definitions/translations
  const isAuto = config?.autoTokenBudget !== false;
  const maxTokens = isAuto ? 1000 : Math.max(150, parseInt(config?.maxOutputTokens || '500', 10));

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: maxTokens
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  const startTime = performance.now();
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit reached. Please wait a few seconds and retry.');
      }
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || response.statusText;
      throw new Error(`AI server error (${response.status}): ${errMsg}`);
    }

    const data = await response.json();
    const elapsed = Math.round(performance.now() - startTime);
    console.log(`[Timer] Lookup (${model}) succeeded in: ${elapsed}ms`);

    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('AI server did not return any content.');

    const parsed = safeParseAIJson(rawText);
    const normalized = normalizeSchema(parsed, word, sentence, sourceUrl);
    saveToCache(word, sentence, targetLang, normalized);
    if (normalized.word && normalized.word.toLowerCase() !== word.toLowerCase()) {
      saveToCache(normalized.word, sentence, targetLang, normalized);
    }
    return normalized;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out (> 7s). AI server did not respond in time.');
    }
    throw err;
  }
}

/**
 * Main dispatcher to query AI
 */
export async function explainWord({ word, sentence, sourceUrl, config, bypassCache = false }) {
  if (!word || !word.trim()) {
    throw new Error('Selected word or phrase is invalid.');
  }

  const targetLang = config?.targetLanguage || 'Vietnamese';
  if (bypassCache) {
    await invalidateCache(word, sentence, targetLang);
  }

  const provider = config.apiProvider || 'gemini';

  if (provider === 'gemini') {
    return await queryGemini({ word, sentence, sourceUrl, config, bypassCache });
  } else if (provider === 'openai') {
    return await queryOpenAI({ word, sentence, sourceUrl, config, isCustom: false, bypassCache });
  } else if (provider === 'custom') {
    return await queryOpenAI({ word, sentence, sourceUrl, config, isCustom: true, bypassCache });
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Test AI API connection with Minimal Ping Payload & Timeout Controller
 */
export async function testAIConnection(config) {
  const provider = config.apiProvider || 'gemini';
  const apiKey = (config.apiKey || '').trim();

  if (!apiKey && provider !== 'custom') {
    return {
      ok: false,
      error: 'Please enter an API Key before testing.'
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    if (provider === 'gemini') {
      const model = config.geminiModel || PRIMARY_GEMINI_MODEL;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'ping' }] }],
          generationConfig: {
            maxOutputTokens: 2
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          return {
            ok: true,
            warning: true,
            message: `API Key is valid! Note: Model ${model} is temporarily rate-limited.`
          };
        }
        let errText = '';
        try {
          const errJson = await response.json();
          errText = errJson.error?.message || response.statusText;
        } catch {
          errText = await response.text();
        }

        return {
          ok: false,
          error: `Gemini connection error (${response.status}): ${errText}`
        };
      }

      return {
        ok: true,
        message: `Connected successfully to ${model}! Ultra-low latency.`
      };

    } else {
      const baseUrl = (provider === 'custom' ? (config.customBaseUrl || 'https://api.openai.com/v1') : 'https://api.openai.com/v1').replace(/\/+$/, '');
      const model = provider === 'custom' ? (config.customModel || 'gpt-4o-mini') : (config.openaiModel || 'gpt-4o-mini');
      const endpoint = `${baseUrl}/chat/completions`;

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 2
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          return {
            ok: true,
            warning: true,
            message: `API Key is valid! Note: Model ${model} is temporarily rate-limited.`
          };
        }
        let errText = '';
        try {
          const errJson = await response.json();
          errText = errJson.error?.message || response.statusText;
        } catch {
          errText = await response.text();
        }
        return {
          ok: false,
          error: `AI connection error (${response.status}): ${errText}`
        };
      }

      return {
        ok: true,
        message: `Connected successfully to ${model}!`
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        ok: false,
        error: 'Network connection too slow or AI server busy (Timeout after 5 seconds).'
      };
    }
    return {
      ok: false,
      error: err.message || 'Unknown error while verifying API.'
    };
  }
}
