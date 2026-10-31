/**
 * Popup Script (ES Module)
 * Adhering to DESIGN.md and ui-ux-pro-max standards
 * 100% English Language Adherence, Inline Editable, Target Deck Selector, Audio Voice Match
 */

const ankiStatusIndicator = document.getElementById('anki-status-indicator');
const aiStatusIndicator = document.getElementById('ai-status-indicator');
const btnOpenOptionsIcon = document.getElementById('btn-open-options-icon');
const btnCropLookup = document.getElementById('btn-crop-lookup');

const quickWordInput = document.getElementById('quick-word');
const quickSentenceInput = document.getElementById('quick-sentence');
const btnQuickLookup = document.getElementById('btn-quick-lookup');
const quickResultBox = document.getElementById('quick-result');
const popupIdleGuide = document.getElementById('popup-idle-guide');

const toggleSelectionPopover = document.getElementById('toggle-selection-popover');
const selectionToggleLabel = document.getElementById('selection-toggle-label');
const popupSelectionToggle = document.getElementById('popup-selection-toggle');

let extensionConfig = null;
let currentAiResult = null;
let originalAiResult = null;

const themeBtnLight = document.getElementById('popup-theme-light');
const themeBtnDark = document.getElementById('popup-theme-dark');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'light') {
    themeBtnLight?.classList.add('active');
    themeBtnDark?.classList.remove('active');
  } else {
    themeBtnDark?.classList.add('active');
    themeBtnLight?.classList.remove('active');
  }
}

function setTheme(theme) {
  applyTheme(theme);
  chrome.storage?.sync?.set({ theme });
  try { chrome.storage?.local?.set({ theme }); } catch {}
}

/**
 * Persist selected deck across sessions (local + sync)
 */
function saveSelectedDeck(deck) {
  if (!deck) return;
  if (extensionConfig) {
    extensionConfig.deckName = deck;
    extensionConfig.lastUsedDeck = deck;
  }
  try {
    chrome.storage?.local?.set({ deckName: deck, lastUsedDeck: deck });
    chrome.storage?.sync?.set({ deckName: deck, lastUsedDeck: deck });
  } catch {}
}

/**
 * Update selection popover toggle UI state
 */
function updatePopoverToggleUI(isEnabled) {
  if (toggleSelectionPopover) {
    toggleSelectionPopover.checked = isEnabled;
  }
  if (selectionToggleLabel) {
    selectionToggleLabel.style.color = isEnabled ? 'var(--text-primary)' : 'var(--text-muted)';
  }
  if (popupSelectionToggle) {
    popupSelectionToggle.title = isEnabled
      ? 'Selection popover: Active (Click to disable)'
      : 'Selection popover: Disabled (Click to enable)';
  }
}

/**
 * Standardize Part of Speech (POS) to unified full lowercase dictionary categories
 * Eliminates discrepancies between abbreviations ("prep", "prep.", "n", "v", "adj", "adv")
 * and full words ("preposition", "noun", "verb", "adjective", "adverb").
 */
export function normalizePos(rawPos) {
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

/**
 * Returns pastel/muted color class according to part of speech
 */
function getPosClass(pos) {
  const p = normalizePos(pos);
  if (p === 'verb' || p === 'phrasal verb') return 'pos-verb';
  if (p === 'noun') return 'pos-noun';
  if (p === 'adjective') return 'pos-adj';
  if (p === 'adverb') return 'pos-adv';
  return 'pos-other';
}

/**
 * Formats phonetic string cleanly as / phonetic /
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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Theme buttons
  themeBtnLight?.addEventListener('click', () => setTheme('light'));
  themeBtnDark?.addEventListener('click', () => setTheme('dark'));

  // Setup options gear button
  btnOpenOptionsIcon?.addEventListener('click', () => chrome.runtime.openOptionsPage());

  // Setup Crop & Look Up button
  btnCropLookup?.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_CROP_MODE' }).catch(() => {});
        window.close();
      }
    } catch (err) {
      console.warn('Failed to trigger crop mode from popup:', err);
    }
  });

  // Load config & statuses
  chrome.runtime.sendMessage({ action: 'GET_CONFIG' }, (res) => {
    if (res?.success && res.config) {
      extensionConfig = res.config;
      applyTheme(extensionConfig.theme || 'dark');
      updatePopoverToggleUI(extensionConfig.showQuickTooltip !== false);
      updateAIStatus(extensionConfig);
      checkAnkiStatus();
    }
  });

  // Toggle selection popover listener
  toggleSelectionPopover?.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    if (extensionConfig) extensionConfig.showQuickTooltip = isEnabled;
    updatePopoverToggleUI(isEnabled);
    try {
      chrome.storage?.local?.set({ showQuickTooltip: isEnabled });
      chrome.storage?.sync?.set({ showQuickTooltip: isEnabled });
    } catch {}
  });

  // Quick lookup button & enter keys
  btnQuickLookup?.addEventListener('click', () => handleQuickLookup());
  quickWordInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleQuickLookup();
  });
  quickSentenceInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleQuickLookup();
  });

  // Auto-fill selected text from active web tab
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].id) return;
      const tab = tabs[0];
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://'))) {
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return null;
          const selectedText = selection.toString().trim();
          if (!selectedText || selectedText.length > 120 || !/[a-zA-ZÀ-ỹ0-9]/.test(selectedText)) {
            return null;
          }

          let sentence = '';
          try {
            const range = selection.getRangeAt(0);
            let container = range.commonAncestorContainer;
            if (container.nodeType === Node.TEXT_NODE) container = container.parentElement;
            const blockEl = container?.closest('p, li, h1, h2, h3, h4, article, blockquote, div, section') || container;
            const fullBlockText = (blockEl ? blockEl.innerText : container?.innerText || '').replace(/\r?\n+/g, ' ');

            if (fullBlockText && fullBlockText.includes(selectedText)) {
              const sentences = fullBlockText.match(/[^.!?]+[.!?]+|\S+/g) || [fullBlockText];
              for (const s of sentences) {
                if (s.includes(selectedText)) {
                  sentence = s.trim();
                  break;
                }
              }
            }
          } catch {}

          return {
            word: selectedText,
            sentence: sentence || ''
          };
        }
      }, (injectionResults) => {
        if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) return;
        const result = injectionResults[0].result;
        if (result && result.word) {
          quickWordInput.value = result.word;
          if (result.sentence) {
            quickSentenceInput.value = result.sentence;
          }
          // Automatically trigger lookup
          handleQuickLookup();
        }
      });
    });
  } catch (err) {
    console.warn('[Popup] Could not auto-detect active selection:', err);
  }
});

function updateAIStatus(config) {
  const hasKey = !!(config.apiKey && config.apiKey.trim());
  const provider = config.apiProvider || 'gemini';
  const modelName = provider === 'gemini' 
    ? (config.geminiModel || '3.5-flash-lite')
    : (config.openaiModel || 'gpt-4o-mini');

  const displayModel = modelName.replace('gemini-', '');

  if (hasKey) {
    aiStatusIndicator.innerHTML = `
      <span class="status-dot dot-success"></span>
      <span class="status-text">${displayModel} (Ready)</span>
    `;
  } else {
    aiStatusIndicator.innerHTML = `
      <span class="status-dot dot-danger"></span>
      <span class="status-text" style="color:var(--danger)">No API Key</span>
    `;
  }
}

function checkAnkiStatus() {
  chrome.runtime.sendMessage({ action: 'CHECK_ANKI_STATUS' }, (res) => {
    if (res?.success) {
      ankiStatusIndicator.innerHTML = `
        <span class="status-dot dot-success"></span>
        <span class="status-text">Online (v${res.version})</span>
      `;
    } else {
      ankiStatusIndicator.innerHTML = `
        <span class="status-dot dot-danger"></span>
        <span class="status-text" style="color:var(--danger)">Anki Offline</span>
      `;
    }
  });
}

async function handleQuickLookup(bypassCache = false) {
  const word = quickWordInput.value.trim();
  const sentence = quickSentenceInput.value.trim();

  if (!word) {
    quickWordInput.focus();
    return;
  }

  if (popupIdleGuide) popupIdleGuide.style.display = 'none';

  btnQuickLookup.disabled = true;
  btnQuickLookup.innerHTML = `
    <span style="display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
    <span>Looking up with AI...</span>
  `;
  quickResultBox.style.display = 'none';

  let hasResponded = false;
  const safetyTimeoutId = setTimeout(() => {
    if (!hasResponded) {
      hasResponded = true;
      btnQuickLookup.disabled = false;
      btnQuickLookup.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span>Look up with AI</span>
      `;
      quickResultBox.style.display = 'flex';
      quickResultBox.innerHTML = `
        <div style="color:var(--danger); font-weight:600;">Request timed out (> 15s):</div>
        <div style="font-size:12px; color:var(--text-secondary);">AI server did not respond in time. Please retry.</div>
      `;
    }
  }, 16000);

  chrome.runtime.sendMessage({
    action: 'EXPLAIN_WORD',
    payload: {
      word,
      sentence,
      sourceUrl: 'Manual Popup Lookup',
      bypassCache
    }
  }, (res) => {
    if (hasResponded) return;
    hasResponded = true;
    clearTimeout(safetyTimeoutId);

    btnQuickLookup.disabled = false;
    btnQuickLookup.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <span>Look up with AI</span>
    `;

    if (!res || !res.success) {
      quickResultBox.style.display = 'flex';
      quickResultBox.innerHTML = `
        <div style="color:var(--danger); font-weight:600; display:flex; align-items:center; gap:5px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Lookup failed:</span>
        </div>
        <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">${escapeHtml(res?.error || 'Please check your API Key in Settings.')}</div>
      `;
      return;
    }

    currentAiResult = res.data;
    originalAiResult = JSON.parse(JSON.stringify(res.data));
    renderQuickResult(currentAiResult);

    // Auto-pronounce if enabled in settings
    if (extensionConfig?.autoPronounce) {
      playAudioPronunciation(currentAiResult.word);
    }
  });
}

function renderQuickResult(data) {
  if (popupIdleGuide) popupIdleGuide.style.display = 'none';
  quickResultBox.style.display = 'flex';

  const currentDeck = extensionConfig?.lastUsedDeck || extensionConfig?.deckName || 'Default';
  const allDecks = Array.from(new Set([currentDeck, ...(extensionConfig?.availableDecks || [])])).filter(Boolean);
  if (!allDecks.length) allDecks.push('Default');

  const deckOptionsHtml = allDecks.map(d => `
    <option value="${escapeHtml(d)}" ${d === currentDeck ? 'selected' : ''}>${escapeHtml(d)}</option>
  `).join('');

  data.pos = normalizePos(data.pos || 'noun');
  const posClass = getPosClass(data.pos);
  const formattedPhonetic = formatPhonetic(data.phonetic);

  const inputSentence = (quickSentenceInput?.value || '').trim();
  const inputWord = (quickWordInput?.value || data.word || '').trim();
  const isRealContext = inputSentence && 
    inputSentence.toLowerCase() !== inputWord.toLowerCase() && 
    inputSentence.split(/\s+/).length >= 3;

  const exampleSentence = (isRealContext 
    ? inputSentence 
    : (data.example_sentence || data.example_en || data.sentence || '')
  ).trim();
  const exampleTranslation = (data.example_translation || data.example_vi || '').trim();

  quickResultBox.innerHTML = `
    <!-- Header: 2-Row Typography Structure & Control Buttons -->
    <div class="result-header">
      <div class="result-word-group">
        <!-- Row 1: Word + Part of Speech Badge -->
        <div class="result-row1">
          <span class="result-word result-editable" contenteditable="true" spellcheck="false" data-field="word" title="Click to edit word">${escapeHtml(data.word || '')}</span>
          <span class="result-pos-badge ${posClass} result-editable" contenteditable="true" spellcheck="false" data-field="pos" title="Click to edit part of speech">${escapeHtml(data.pos || 'noun')}</span>
        </div>
        <!-- Row 2: Phonetic IPA (Times New Roman) -->
        <div class="result-row2">
          <span class="result-ipa result-editable" contenteditable="true" spellcheck="false" data-field="phonetic" title="Click to edit phonetic" placeholder="/IPA/">${escapeHtml(formattedPhonetic || '/ IPA /')}</span>
        </div>
      </div>

      <div class="result-controls">
        <button type="button" class="btn-result-ctrl btn-result-audio" id="btn-popup-audio" title="Listen pronunciation">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </button>
        <button type="button" class="btn-result-ctrl btn-result-relookup" id="btn-popup-relookup" title="Re-analyze context with AI (Force refresh)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6"/>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
            <path d="M3 22v-6h6"/>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
        </button>
        <button type="button" class="btn-result-ctrl" id="btn-popup-reset" title="Reset to original AI content">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7v6h6"/>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Body: Meaning & English Definition (Inline Editable) -->
    <div class="result-meaning result-editable" contenteditable="true" spellcheck="false" data-field="meaning_vi" title="Click to edit meaning">
      ${escapeHtml(data.meaning_vi || '')}
    </div>

    ${data.definition_en ? `
      <div class="result-def result-editable" contenteditable="true" spellcheck="false" data-field="definition_en" title="Click to edit English definition">
        ${escapeHtml(data.definition_en)}
      </div>
    ` : ''}

    ${(exampleSentence || exampleTranslation) ? `
      <div class="result-example-box">
        ${exampleSentence ? `<div class="result-example-en result-editable" contenteditable="true" spellcheck="false" data-field="example_sentence" title="Click to edit example sentence">${escapeHtml(exampleSentence)}</div>` : ''}
        ${exampleTranslation ? `<div class="result-example-vi result-editable" contenteditable="true" spellcheck="false" data-field="example_translation" title="Click to edit translation">${escapeHtml(exampleTranslation)}</div>` : ''}
      </div>
    ` : ''}

    <!-- Action Bar: Target Deck Selector + Modern Add to Anki Button -->
    <div class="result-action-bar">
      <div class="deck-select-wrap">
        <select id="popup-deck-select" class="popup-deck-select" title="Target Anki Deck">
          ${deckOptionsHtml}
        </select>
        <svg class="deck-select-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <button type="button" class="btn-add-anki" id="btn-popup-add-anki">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add to Anki</span>
      </button>
    </div>
  `;

  // Audio Playback Listener (Pronounces current live word with preferred voice)
  const btnAudio = quickResultBox.querySelector('#btn-popup-audio');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      const currentWord = quickResultBox.querySelector('[data-field="word"]')?.innerText?.trim() || data.word;
      playAudioPronunciation(currentWord);
    });
  }

  // Re-lookup Button Listener (Force fresh AI analysis with bypassCache)
  const btnRelookup = quickResultBox.querySelector('#btn-popup-relookup');
  if (btnRelookup) {
    btnRelookup.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentWord = quickResultBox.querySelector('[data-field="word"]')?.innerText?.trim() || quickWordInput.value.trim() || data.word;
      const currentSentence = quickResultBox.querySelector('[data-field="example_sentence"]')?.innerText?.trim() || quickSentenceInput.value.trim() || '';

      if (!currentWord) return;

      btnRelookup.classList.add('result-spinning');
      const btnAdd = quickResultBox.querySelector('#btn-popup-add-anki');
      if (btnAdd) {
        btnAdd.disabled = true;
        btnAdd.innerHTML = `<span style="display:inline-block;width:11px;height:11px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;"></span> <span>Re-analyzing...</span>`;
      }

      chrome.runtime.sendMessage({
        action: 'EXPLAIN_WORD',
        payload: {
          word: currentWord,
          sentence: currentSentence,
          sourceUrl: 'Manual Popup Re-lookup',
          bypassCache: true
        }
      }, (res) => {
        btnRelookup.classList.remove('result-spinning');
        if (res?.success && res.data) {
          currentAiResult = res.data;
          originalAiResult = JSON.parse(JSON.stringify(res.data));
          if (quickWordInput && res.data.word) quickWordInput.value = res.data.word;
          if (quickSentenceInput && currentSentence) quickSentenceInput.value = currentSentence;
          renderQuickResult(res.data);
        } else {
          if (btnAdd) {
            btnAdd.disabled = false;
            btnAdd.innerHTML = `<span>Retry Re-analysis</span>`;
          }
        }
      });
    });
  }

  // Reset Button Listener (Restores original AI output)
  const btnReset = quickResultBox.querySelector('#btn-popup-reset');
  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      e.stopPropagation();
      if (originalAiResult) {
        renderQuickResult(originalAiResult);
      }
    });
  }

  // Dynamic POS badge style updater when user edits part of speech
  const posBadgeEl = quickResultBox.querySelector('[data-field="pos"]');
  if (posBadgeEl) {
    posBadgeEl.addEventListener('input', () => {
      posBadgeEl.className = `result-pos-badge ${getPosClass(posBadgeEl.innerText)} result-editable`;
    });
    posBadgeEl.addEventListener('blur', () => {
      posBadgeEl.innerText = normalizePos(posBadgeEl.innerText);
      posBadgeEl.className = `result-pos-badge ${getPosClass(posBadgeEl.innerText)} result-editable`;
    });
  }

  // Deck selector change listener
  const deckSelect = quickResultBox.querySelector('#popup-deck-select');
  if (deckSelect) {
    deckSelect.addEventListener('change', (e) => {
      const selectedDeck = e.target.value;
      saveSelectedDeck(selectedDeck);
    });
  }

  // Add to Anki Listener (Reads live edited text from DOM)
  const btnAdd = quickResultBox.querySelector('#btn-popup-add-anki');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (btnAdd.disabled) return;
      btnAdd.disabled = true;
      btnAdd.innerHTML = `
        <span style="display:inline-block;width:11px;height:11px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
        <span>Adding...</span>
      `;

      let watchdog = null;
      let settled = false;

      const fail = (errMsg) => {
        if (settled) return;
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        btnAdd.disabled = false;
        btnAdd.style.backgroundColor = 'var(--danger)';
        btnAdd.style.color = '#FFFFFF';
        btnAdd.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Failed: ${escapeHtml(errMsg || 'Anki Error')}</span>
        `;
      };

      watchdog = setTimeout(() => {
        fail('Timed out (> 7s)');
      }, 7000);

      try {
        const getText = (field) => {
          const el = quickResultBox.querySelector(`[data-field="${field}"]`);
          return el ? el.innerText.trim() : '';
        };

        const word = getText('word') || data.word || '';
        let phonetic = getText('phonetic') || data.phonetic || '';
        if (phonetic) {
          phonetic = phonetic.replace(/^[\/\[\s]+|[\/\]\s]+$/g, '').trim();
        }
        const pos = normalizePos(getText('pos') || data.pos || 'noun');
        const meaning_vi = getText('meaning_vi') || data.meaning_vi || '';
        const definition_en = getText('definition_en') || data.definition_en || '';
        const example_sentence = getText('example_sentence') || data.example_sentence || data.example_en || quickSentenceInput.value.trim() || '';
        const example_translation = getText('example_translation') || data.example_translation || data.example_vi || '';

        const targetDeck = deckSelect?.value || extensionConfig?.lastUsedDeck || extensionConfig?.deckName || 'Default';
        saveSelectedDeck(targetDeck);

        const enriched = {
          ...data,
          word,
          phonetic,
          pos,
          meaning_vi,
          definition_en,
          sentence: example_sentence,
          context_sentence: example_sentence,
          example_sentence,
          example_en: example_sentence,
          context_translation: example_translation,
          example_translation,
          example_vi: example_translation,
          source_url: 'Popup Lookup'
        };

        chrome.runtime.sendMessage({
          action: 'ADD_ANKI_NOTE',
          payload: {
            cardData: enriched,
            targetDeck,
            targetModel: extensionConfig?.noteType
          }
        }, (addRes) => {
          if (settled) return;
          if (watchdog) clearTimeout(watchdog);
          settled = true;

          if (addRes?.success) {
            btnAdd.classList.add('added');
            btnAdd.style.backgroundColor = 'var(--success)';
            btnAdd.style.color = '#FFFFFF';
            btnAdd.innerHTML = `
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Added</span>
            `;
          } else {
            fail(addRes?.error || 'Anki Error');
          }
        });
      } catch (err) {
        fail(err.message);
      }
    });
  }
}

/**
 * Audio Pronunciation via Web Speech API adhering to audioVoice setting
 */
function playAudioPronunciation(word) {
  if (!word || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

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
    // Ignore audio playback errors
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
