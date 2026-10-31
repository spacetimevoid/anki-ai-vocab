/**
 * Popover UI Component Builder (Shadow DOM Encapsulated)
 * Builds lightweight, non-blocking floating card with no backdrop
 * 100% English Language Adherence & Custom Deck Dropdown Menu
 */

export const ICONS = {
  spark: `<svg viewBox="0 0 24 24"><path d="M12 2L14.39 8.26L21 9.27L16.09 13.74L17.5 20.24L12 16.9L6.5 20.24L7.91 13.74L3 9.27L9.61 8.26L12 2Z"/></svg>`,
  speaker: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`,
  undo: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  check: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  anki: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  folder: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  chevron: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
export function getPosClass(pos) {
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
export function formatPhonetic(raw) {
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
 * Creates Popover element in Initial Skeleton Loading State (2-Row Header)
 */
export function buildSkeletonPopover({ word, onClose }) {
  const popover = document.createElement('div');
  popover.className = 'anki-floating-popover popover-container';
  popover.id = 'anki-floating-popover';

  popover.innerHTML = `
    <!-- Header (2-Row Structure) -->
    <div class="anki-popover-header">
      <div class="anki-header-left">
        <div class="anki-header-row1 header-row">
          <span class="anki-word-text word-text">${escapeHtml(word)}</span>
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

    <!-- Body Skeleton -->
    <div class="anki-popover-content">
      <div class="anki-skeleton-wrap">
        <div class="anki-skeleton anki-skeleton-title"></div>
        <div class="anki-skeleton anki-skeleton-line"></div>
        <div class="anki-skeleton anki-skeleton-box"></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="anki-popover-footer">
      <span class="anki-footer-info">AI Dictionary Engine</span>
      <button class="anki-btn-add" disabled>
        <span class="anki-spinner-sm"></span>
        <span>Looking up...</span>
      </button>
    </div>
  `;

  popover.querySelector('#anki-popover-close').addEventListener('click', (e) => {
    e.stopPropagation();
    onClose();
  });

  makePopoverDraggable(popover);

  return popover;
}

/**
 * Helper to extract current live edited values from the Popover DOM
 */
export function getEditedCardData(popoverEl, originalData) {
  if (!popoverEl) return originalData;

  const getText = (field) => {
    const el = popoverEl.querySelector(`[data-field="${field}"]`);
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
  const example_sentence = getText('example_sentence') || originalData.example_sentence || originalData.sentence || '';
  const example_translation = getText('example_translation') || originalData.example_translation || originalData.example_vi || '';
  const example_vi = example_translation;

  return {
    ...originalData,
    word,
    phonetic,
    pos,
    meaning_vi,
    definition_en,
    example_sentence,
    example_translation,
    example_vi,
    context_sentence: example_sentence,
    context_translation: example_translation,
    sentence: example_sentence
  };
}

/**
 * Populates Popover with Loaded AI Data (Supports 2-Row Header, Pastel POS Badge & Custom Deck Dropdown Menu)
 */
export function populatePopoverData({
  popoverEl,
  data,
  deckName = 'Default',
  availableDecks = [],
  onClose,
  onAudio,
  onAdd
}) {
  if (!popoverEl) return;

  if (!popoverEl._originalAiData) {
    popoverEl._originalAiData = JSON.parse(JSON.stringify(data));
  }

  data.pos = normalizePos(data.pos || 'noun');
  const exampleSentence = (data.example_sentence || data.sentence || '').trim();
  const exampleTranslation = (data.example_translation || data.example_vi || '').trim();
  const posClass = getPosClass(data.pos);
  const formattedPhonetic = formatPhonetic(data.phonetic);

  // Prepare deck options
  const allDecks = Array.from(new Set([deckName, ...(availableDecks || [])])).filter(Boolean);
  if (!allDecks.length) allDecks.push('Default');

  const deckItemsHtml = allDecks.map(d => `
    <div class="anki-deck-item ${d === deckName ? 'selected' : ''}" data-deck="${escapeHtml(d)}" role="option">
      <span class="anki-deck-item-text">${escapeHtml(d)}</span>
      ${d === deckName ? `<svg class="anki-deck-item-check" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
    </div>
  `).join('');

  popoverEl.innerHTML = `
    <!-- Header: 2-Row Typography Structure -->
    <div class="anki-popover-header">
      <div class="anki-header-left">
        <!-- Row 1: Word + Part of Speech Badge -->
        <div class="anki-header-row1 header-row">
          <span class="anki-word-text word-text anki-editable" contenteditable="true" spellcheck="false" data-field="word" title="Click to edit word">${escapeHtml(data.word || '')}</span>
          <span class="anki-pos-badge pos-badge ${posClass} anki-editable" contenteditable="true" spellcheck="false" data-field="pos" title="Click to edit part of speech">${escapeHtml(data.pos || 'noun')}</span>
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

    <!-- Content (Flat & Minimalist Shadcn Style, Inline Editable) -->
    <div class="anki-popover-content">
      <div class="anki-meaning-row anki-editable" contenteditable="true" spellcheck="false" data-field="meaning_vi" title="Click to edit meaning" placeholder="Meaning in context...">
        ${escapeHtml(data.meaning_vi || '')}
      </div>

      ${data.definition_en ? `
        <div class="anki-def-row anki-editable" contenteditable="true" spellcheck="false" data-field="definition_en" title="Click to edit English definition">
          ${escapeHtml(data.definition_en)}
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
          <span class="anki-deck-current-label" id="anki-deck-current-label">${escapeHtml(deckName)}</span>
          ${ICONS.chevron}
        </button>
        <div class="anki-deck-menu deck-menu" id="anki-deck-menu" role="listbox" style="display: none;">
          ${deckItemsHtml}
        </div>
      </div>
      <button class="anki-btn-add" id="anki-btn-push">
        <span>+ Add to Anki</span>
      </button>
    </div>
  `;

  // Close Popover Listener
  popoverEl.querySelector('#anki-popover-close').addEventListener('click', (e) => {
    e.stopPropagation();
    onClose();
  });

  // Reset Button Listener
  const btnReset = popoverEl.querySelector('#anki-btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      e.stopPropagation();
      if (popoverEl._originalAiData) {
        populatePopoverData({
          popoverEl,
          data: popoverEl._originalAiData,
          deckName: popoverEl._selectedDeck || deckName,
          availableDecks,
          onClose,
          onAudio,
          onAdd
        });
      }
    });
  }

  // Audio Playback Listener
  popoverEl.querySelector('#anki-btn-audio').addEventListener('click', (e) => {
    e.stopPropagation();
    const currentWord = popoverEl.querySelector('[data-field="word"]')?.innerText?.trim() || data.word;
    onAudio(currentWord);
  });

  // Custom Deck Dropdown Controller
  let selectedDeck = deckName;
  popoverEl._selectedDeck = selectedDeck;
  const triggerBtn = popoverEl.querySelector('#anki-deck-trigger');
  const menuEl = popoverEl.querySelector('#anki-deck-menu');
  const labelEl = popoverEl.querySelector('#anki-deck-current-label');

  const bindDeckMenuItems = (decksList, currentDeck) => {
    if (!menuEl) return;
    const uniqDecks = Array.from(new Set([currentDeck, ...(decksList || [])])).filter(Boolean);
    if (!uniqDecks.length) uniqDecks.push('Default');

    menuEl.innerHTML = uniqDecks.map(d => `
      <div class="anki-deck-item ${d === currentDeck ? 'selected' : ''}" data-deck="${escapeHtml(d)}" role="option">
        <span class="anki-deck-item-text">${escapeHtml(d)}</span>
        ${d === currentDeck ? `<svg class="anki-deck-item-check" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
      </div>
    `).join('');

    menuEl.querySelectorAll('.anki-deck-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const deckVal = item.dataset.deck;
        selectedDeck = deckVal;
        popoverEl._selectedDeck = deckVal;
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
        try {
          chrome.storage?.sync?.set({ deckName: deckVal });
        } catch {}
      });
    });
  };

  popoverEl._updateDeckMenu = (freshDecks) => {
    if (menuEl && Array.isArray(freshDecks) && freshDecks.length > 0) {
      const cur = popoverEl._selectedDeck || selectedDeck;
      bindDeckMenuItems(freshDecks, cur);
    }
  };

  if (triggerBtn && menuEl) {
    bindDeckMenuItems(allDecks, selectedDeck);

    // Silently fetch and update live Anki decks in background
    const requestLiveDecksUpdate = () => {
      try {
        chrome.runtime?.sendMessage?.({ action: 'FETCH_LIVE_DECKS' }, (res) => {
          if (res?.success && Array.isArray(res.decks) && res.decks.length > 0) {
            popoverEl?._updateDeckMenu?.(res.decks);
          }
        });
      } catch {}
    };

    // Immediate live check
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
        // Refresh live decks on dropdown expansion in case user just added a deck in Anki
        requestLiveDecksUpdate();
      }
    });

    // Close menu when clicking outside dropdown container inside popover
    popoverEl.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.anki-deck-dropdown-container')) {
        triggerBtn.classList.remove('active');
        triggerBtn.setAttribute('aria-expanded', 'false');
        menuEl.style.display = 'none';
      }
    });
  }

  // Push to Anki Button Listener
  const btnPush = popoverEl.querySelector('#anki-btn-push');
  btnPush.addEventListener('click', (e) => {
    e.stopPropagation();
    const liveEditedData = getEditedCardData(popoverEl, data);
    onAdd(btnPush, liveEditedData, popoverEl._selectedDeck || selectedDeck);
  });

  // Dynamic POS badge style updater when user edits part of speech
  const posBadgeEl = popoverEl.querySelector('[data-field="pos"]');
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

  // Inline Editable Listeners
  popoverEl.querySelectorAll('.anki-editable').forEach(el => {
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

  makePopoverDraggable(popoverEl);
}

/**
 * Renders Error State inside Popover
 */
export function populatePopoverError({ popoverEl, errorMessage, onClose, onRetry }) {
  if (!popoverEl) return;

  const contentEl = popoverEl.querySelector('.anki-popover-content');
  const footerEl = popoverEl.querySelector('.anki-popover-footer');

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
      <span style="font-size:11.5px; color:var(--text-muted);">Check API Key in Settings</span>
      ${onRetry ? `<button class="anki-btn-add" id="anki-btn-retry"><span>Retry</span></button>` : ''}
    `;

    const btnRetry = footerEl.querySelector('#anki-btn-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', (e) => {
        e.stopPropagation();
        onRetry();
      });
    }
  }

  const closeBtn = popoverEl.querySelector('#anki-popover-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClose();
    });
  }

  makePopoverDraggable(popoverEl);
}

/**
 * Enables smooth dragging of Popover via header while protecting interactive controls
 */
export function makePopoverDraggable(popoverEl) {
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

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;
    popoverEl.classList.remove('anki-is-dragging');
    document.body.style.userSelect = '';
    window.removeEventListener('pointermove', onPointerMove, true);
    window.removeEventListener('pointerup', onPointerUp, true);
    window.removeEventListener('pointercancel', onPointerUp, true);
  };

  popoverEl.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const header = e.target.closest('.anki-popover-header');
    if (!header) return;

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
