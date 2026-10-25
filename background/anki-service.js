/**
 * AnkiConnect Service for Chrome Extension (Manifest V3)
 * Communicates with Anki via HTTP POST at http://127.0.0.1:8765
 */

/**
 * Generic AnkiConnect Invocation function with AbortController timeout
 */
export async function ankiInvoke(action, params = {}, config = {}, timeoutMs = 5000) {
  const url = (config.ankiUrl || 'http://127.0.0.1:8765').replace(/\/+$/, '');
  const payload = {
    action,
    version: 6,
    params
  };

  if (config.ankiApiKey) {
    payload.key = config.ankiApiKey;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.result;
  } catch (err) {
    clearTimeout(timer);

    const message = err.message || '';
    if (err.name === 'AbortError' || message.includes('aborted') || message.includes('AbortError')) {
      throw new Error(`AnkiConnect connection timed out (> ${Math.round(timeoutMs / 1000)}s). Anki responded too slowly.`);
    }

    if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('ECONNREFUSED')) {
      throw new Error(
        'Unable to connect to AnkiConnect (127.0.0.1:8765).\n' +
        '1. Ensure Anki Desktop is running on your computer.\n' +
        '2. Verify AnkiConnect add-on (Code: 2055492159) is installed.\n' +
        '3. Ensure AnkiConnect configuration has webCorsOriginList: ["*"].'
      );
    }

    if (message.toLowerCase().includes('duplicate')) {
      throw new Error('This card already exists in your Anki deck (Duplicate Note).');
    }

    if (message.toLowerCase().includes('deck was not found')) {
      throw new Error('Target deck was not found in Anki. Please check your deck configuration.');
    }

    if (message.toLowerCase().includes('model was not found')) {
      throw new Error('Note Type (Model) was not found in Anki. Please select a valid note type.');
    }

    throw err;
  }
}

/**
 * Test connection and return AnkiConnect version
 */
export async function checkAnkiConnection(config) {
  try {
    const version = await ankiInvoke('version', {}, config);
    return { ok: true, version };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Fetch all available decks
 */
export async function getDeckNames(config) {
  return await ankiInvoke('deckNames', {}, config);
}

/**
 * Fetch all available note types (models)
 */
export async function getModelNames(config) {
  return await ankiInvoke('modelNames', {}, config);
}

/**
 * Fetch field names for a specific note type (model)
 */
export async function getModelFieldNames(modelName, config) {
  return await ankiInvoke('modelFieldNames', { modelName }, config);
}

/**
 * Helper to auto-bold target word in sentence context
 */
function highlightWordInSentence(sentence, word) {
  if (!sentence || !word) return sentence || '';
  if (sentence.includes('<b>') || sentence.includes('<strong>')) return sentence;
  try {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${escaped})\\b`, 'i');
    if (regex.test(sentence)) {
      return sentence.replace(regex, '<b>$1</b>');
    }
  } catch {
    // regex fallback
  }
  return sentence;
}

/**
 * Helper to interpolate template placeholders like {{word}}, {{meaning_vi}}, {{ContextSentence}}, etc.
 * Supports exact matching and case-insensitive fallback matching.
 */
function interpolateTemplate(template, data) {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    // 1. Direct match
    if (data[key] !== undefined && data[key] !== null) {
      return Array.isArray(data[key]) ? data[key].join(', ') : String(data[key]);
    }
    // 2. Case-insensitive fallback match
    const lowerKey = key.toLowerCase();
    for (const [k, v] of Object.entries(data)) {
      if (k.toLowerCase() === lowerKey && v !== undefined && v !== null) {
        return Array.isArray(v) ? v.join(', ') : String(v);
      }
    }
    return '';
  });
}

/**
 * Resolves Audio Pronunciation URL based on voice preference
 * Supports Male (US Male, type=2), Female (US/UK Female, type=1), or Random
 */
export function getAudioVoiceUrl(word, voiceSetting = 'random') {
  let voiceType = voiceSetting || 'random';
  if (voiceType === 'random') {
    voiceType = Math.random() < 0.5 ? 'male' : 'female';
  }

  // Youdao / standard dictionary voice endpoints:
  // type=2: American English Male voice
  // type=1: British / American English Female voice
  const audioUrl = voiceType === 'male'
    ? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`
    : `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`;

  return { audioUrl, voiceType };
}

/**
 * Add a note to Anki
 */
export async function addAnkiNote({ cardData, config, targetDeck, targetModel }) {
  const deck = targetDeck || config.deckName || 'Default';
  const model = targetModel || config.noteType || 'Basic';

  // Get field mapping for this note type, or fall back to default logic
  const mapping = (config.fieldMappings && config.fieldMappings[model]) || null;

  let fields = {};

  // 1. Fetch & Store Pronunciation Audio via AnkiConnect
  const targetWord = (cardData.word || '').trim();
  const cleanWordName = targetWord.toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
  let audioFieldVal = cardData.audio || '';

  if (targetWord && cleanWordName) {
    const { audioUrl, voiceType } = getAudioVoiceUrl(targetWord, config.audioVoice);
    const audioFileName = `vocab_${cleanWordName}_${voiceType}_${Date.now()}.mp3`;

    try {
      // Isolated 3s timeout for media download to avoid blocking card creation
      await ankiInvoke('storeMediaFile', {
        filename: audioFileName,
        url: audioUrl
      }, config, 3000);
      audioFieldVal = `[sound:${audioFileName}]`;
      console.log(`[AnkiConnect] Stored audio "${audioFileName}" (${voiceType}) successfully.`);
    } catch (audioErr) {
      console.warn(`[AnkiConnect] Could not store audio file (${audioErr.message}). Using fallback audio.`);
      if (!audioFieldVal) {
        audioFieldVal = `[sound:${audioFileName}]`;
      }
    }
  }

  // Normalize collocations
  const collocationsStr = Array.isArray(cardData.collocations) 
    ? cardData.collocations.join(', ') 
    : (cardData.collocations || '');

  // English sentence (ContextSentence) - prioritize original English sentence from webpage
  const rawSentence = cardData.context_sentence || cardData.example_sentence || cardData.sentence || '';
  const highlightedSentence = highlightWordInSentence(rawSentence, cardData.word);

  // Vietnamese translation (ContextTranslation)
  const rawTranslation = cardData.context_translation || cardData.example_translation || cardData.example_vi || '';

  const dataForInterpolation = {
    // Standard keys
    word: cardData.word || '',
    phonetic: cardData.phonetic || '',
    pos: cardData.pos || '',
    meaning_vi: cardData.meaning_vi || '',
    definition_en: cardData.definition_en || '',
    example_sentence: highlightedSentence,
    example_translation: rawTranslation,
    example_vi: rawTranslation,
    collocations: collocationsStr,
    source_url: cardData.source_url || '',
    audio: audioFieldVal,

    // Exact note-type field names (for {{Word}}, {{Meaning}}, {{PartOfSpeech}}, etc.)
    Word: cardData.word || '',
    Phonetic: cardData.phonetic || '',
    PartOfSpeech: cardData.pos || '',
    Meaning: cardData.meaning_vi || '',
    DefinitionEN: cardData.definition_en || '',
    ContextSentence: highlightedSentence,
    ContextTranslation: rawTranslation,
    Audio: audioFieldVal,

    // Convenient snake_case aliases
    context_sentence: highlightedSentence,
    context_translation: rawTranslation,
    part_of_speech: cardData.pos || '',
    meaning: cardData.meaning_vi || '',
    definition: cardData.definition_en || ''
  };

  if (mapping && Object.keys(mapping).length > 0) {
    // Map fields according to user configuration
    for (const [ankiFieldName, templateOrKey] of Object.entries(mapping)) {
      if (templateOrKey.includes('{{')) {
        fields[ankiFieldName] = interpolateTemplate(templateOrKey, dataForInterpolation);
      } else if (dataForInterpolation[templateOrKey] !== undefined) {
        fields[ankiFieldName] = dataForInterpolation[templateOrKey];
      } else {
        fields[ankiFieldName] = templateOrKey;
      }
    }
    // Ensure Audio field is populated if Note Type contains an Audio field
    for (const key of Object.keys(fields)) {
      if (key.toLowerCase() === 'audio' && !fields[key] && audioFieldVal) {
        fields[key] = audioFieldVal;
      }
    }
  } else {
    // Smart fallback if no custom mapping is set
    const modelFields = await getModelFieldNames(model, config);

    if (modelFields.length === 2 && modelFields[0] === 'Front' && modelFields[1] === 'Back') {
      // Standard Basic Note Type (Prettify / Minimalist Style)
      fields['Front'] = `${dataForInterpolation.word} <span style="color:#71717a;font-size:0.95em;margin-left:6px;font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;">[${dataForInterpolation.phonetic}]</span> ${dataForInterpolation.audio || ''}`.trim();
      fields['Back'] = `
        <div style="font-size:17px;font-weight:600;color:#111827;line-height:1.45;">
          <span style="font-size:11px;font-weight:500;padding:2px 7px;border-radius:4px;background:#f3f4f6;color:#4b5563;border:1px solid #e5e7eb;margin-right:6px;vertical-align:middle;">${dataForInterpolation.pos}</span>
          ${dataForInterpolation.meaning_vi}
        </div>
        ${dataForInterpolation.definition_en ? `<div style="font-size:13px;color:#6b7280;margin-top:4px;line-height:1.45;">${dataForInterpolation.definition_en}</div>` : ''}

        <div style="border-top:1px dashed #d1d5db;margin:16px 0 14px 0;"></div>

        <div style="font-size:14px;color:#374151;line-height:1.6;">
          <div>${dataForInterpolation.example_sentence}</div>
          ${dataForInterpolation.example_translation ? `<div style="font-size:12.5px;color:#6b7280;font-style:italic;margin-top:4px;">${dataForInterpolation.example_translation}</div>` : ''}
        </div>
        ${collocationsStr ? `<div style="margin-top:10px;font-size:12px;color:#6b7280;"><b>Collocations:</b> ${collocationsStr}</div>` : ''}
        ${dataForInterpolation.source_url ? `<div style="margin-top:12px;font-size:11px;color:#9ca3af;text-align:right;">Source: <a href="${dataForInterpolation.source_url}" style="color:#9ca3af;text-decoration:none;">web context</a></div>` : ''}
      `.trim();
    } else {
      // Direct name matching for multi-field custom Note Types
      for (const f of modelFields) {
        const lower = f.toLowerCase().replace(/[\s_-]+/g, '');
        if (lower === 'word' || lower === 'front' || lower === 'term') {
          fields[f] = dataForInterpolation.word;
        } else if (lower.includes('phonetic') || lower.includes('ipa') || lower.includes('pronunciation')) {
          fields[f] = dataForInterpolation.phonetic;
        } else if (lower === 'pos' || lower.includes('partofspeech') || lower.includes('type')) {
          fields[f] = dataForInterpolation.pos;
        } else if (lower.includes('meaning') || lower.includes('vietnamese') || lower.includes('nghia') || lower === 'back') {
          fields[f] = dataForInterpolation.meaning_vi;
        } else if (lower.includes('definition') || lower.includes('def') || lower.includes('english')) {
          fields[f] = dataForInterpolation.definition_en;
        } else if (lower.includes('translation') || lower.includes('dich')) {
          // Check translation FIRST before generic context/sentence
          fields[f] = dataForInterpolation.example_translation;
        } else if (lower.includes('example') || lower.includes('sentence') || lower.includes('context')) {
          fields[f] = dataForInterpolation.example_sentence;
        } else if (lower.includes('audio') || lower.includes('sound') || lower.includes('voice')) {
          fields[f] = dataForInterpolation.audio;
        } else if (lower.includes('collocation')) {
          fields[f] = collocationsStr;
        } else if (lower.includes('source') || lower.includes('url')) {
          fields[f] = dataForInterpolation.source_url;
        } else {
          fields[f] = '';
        }
      }
    }
  }

  // Parse tags
  const tagsList = (config.tags || 'anki-ai-vocab')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const notePayload = {
    note: {
      deckName: deck,
      modelName: model,
      fields,
      options: {
        allowDuplicate: false,
        duplicateScope: 'deck'
      },
      tags: tagsList
    }
  };

  const noteId = await ankiInvoke('addNote', notePayload, config);
  return { ok: true, noteId, deck, model };
}

