/**
 * Options Page JavaScript (ES Module)
 * Single-Column Settings Architecture & Seamless Light/Dark Theme Switching
 * 100% English Language Adherence
 */

import { DEFAULT_PROMPT, DEFAULT_CONFIG, getConfig } from '../background/config.js';

// DOM Elements
const providerGemini = document.getElementById('provider-gemini');
const providerClaude = document.getElementById('provider-claude');
const providerOpenai = document.getElementById('provider-openai');
const providerCustom = document.getElementById('provider-custom');

const groupGeminiModel = document.getElementById('group-gemini-model');
const groupClaudeModel = document.getElementById('group-claude-model');
const groupOpenaiModel = document.getElementById('group-openai-model');
const groupCustomModel = document.getElementById('group-custom-model');

const apiKeyInput = document.getElementById('apiKey');
const btnToggleKey = document.getElementById('btn-toggle-key');
const eyeIcon = document.getElementById('eye-icon');
const eyeOffIcon = document.getElementById('eye-off-icon');
const apiKeyLink = document.getElementById('api-key-link');

const geminiModelSelect = document.getElementById('geminiModel');
const claudeBaseUrlInput = document.getElementById('claudeBaseUrl');
const claudeModelInput = document.getElementById('claudeModel');
const openaiModelSelect = document.getElementById('openaiModel');
const customBaseUrlInput = document.getElementById('customBaseUrl');
const customModelInput = document.getElementById('customModel');

const btnTestAi = document.getElementById('btn-test-ai');
const aiTestStatus = document.getElementById('ai-test-status');

const ankiUrlInput = document.getElementById('ankiUrl');
const ankiApiKeyInput = document.getElementById('ankiApiKey');
const btnTestAnki = document.getElementById('btn-test-anki');
const ankiLiveBadge = document.getElementById('anki-live-badge');
const ankiTestMessage = document.getElementById('anki-test-message');
const deckNameSelect = document.getElementById('deckName');
const noteTypeSelect = document.getElementById('noteType');
const btnRefreshDecks = document.getElementById('btn-refresh-decks');
const btnCopyAnkiConfig = document.getElementById('btn-copy-anki-config');
const copyBtnText = document.getElementById('copy-btn-text');

const fieldMappingContainer = document.getElementById('field-mapping-container');
const btnResetMapping = document.getElementById('btn-reset-mapping');

const targetLanguageInput = document.getElementById('targetLanguage');
const tagsInput = document.getElementById('tags');
const showQuickTooltipInput = document.getElementById('showQuickTooltip');
const autoPronounceInput = document.getElementById('autoPronounce');
const audioVoiceSelect = document.getElementById('audioVoice');
const autoCloseOnSuccessInput = document.getElementById('autoCloseOnSuccess');
const closeOnlyOnXInput = document.getElementById('closeOnlyOnX');
const customPromptInput = document.getElementById('customPrompt');
const btnResetPrompt = document.getElementById('btn-reset-prompt');

// Sliders & Token Budget
const autoTokenBudgetCheckbox = document.getElementById('autoTokenBudget');
const maxOutputTokensSlider = document.getElementById('maxOutputTokens');
const tokenBudgetVal = document.getElementById('token-budget-val');
const tokenBudgetCaption = document.getElementById('token-budget-caption');
const autoCloseDelaySlider = document.getElementById('autoCloseDelaySlider');
const autocloseDelayVal = document.getElementById('autoclose-delay-val');

// Theme Switcher Buttons
const themeBtnLight = document.getElementById('theme-btn-light');
const themeBtnDark = document.getElementById('theme-btn-dark');

// Save Bar
const btnSaveSettings = document.getElementById('btn-save-settings');
const saveStatusMsg = document.getElementById('save-status-msg');
const saveStatusDot = document.getElementById('save-status-dot');
const saveStatusLabel = document.getElementById('save-status-label');
const settingsForm = document.getElementById('settings-form');

// In-memory state
let currentConfig = { ...DEFAULT_CONFIG };
let currentModelFields = [];
let statusFadeTimeout = null;
let isDirty = false;
let isInitialLoad = true;

/**
 * Tab Switching Controller (Linear / Shadcn segmented style)
 */
function switchTab(tabId) {
  if (!tabId) return;

  const triggers = document.querySelectorAll('.tab-trigger');
  const panes = document.querySelectorAll('.tab-pane');

  triggers.forEach(trig => {
    const isActive = trig.getAttribute('data-tab') === tabId;
    trig.classList.toggle('active', isActive);
    trig.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  panes.forEach(pane => {
    const isActive = pane.id === tabId;
    pane.classList.toggle('active', isActive);
  });

  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', '#' + tabId);
  }
}

/**
 * Dirty State Management (Unsaved Changes Warning)
 */
function updateSaveStatusUI() {
  if (!saveStatusDot || !saveStatusLabel || !btnSaveSettings) return;

  if (isDirty) {
    saveStatusDot.className = 'status-ready-dot dot-unsaved';
    saveStatusLabel.className = 'status-unsaved-text';
    saveStatusLabel.textContent = 'Unsaved changes';
    btnSaveSettings.classList.add('has-unsaved');
  } else {
    saveStatusDot.className = 'status-ready-dot';
    saveStatusLabel.className = '';
    saveStatusLabel.textContent = 'All changes saved';
    btnSaveSettings.classList.remove('has-unsaved');
  }
}

function markDirty() {
  if (isInitialLoad) return;
  if (!isDirty) {
    isDirty = true;
    updateSaveStatusUI();
  }
}

function markClean() {
  isDirty = false;
  updateSaveStatusUI();
}

/**
 * Recalculate dynamic track fill percentage for smooth modern range slider
 */
function updateSliderProgress(slider) {
  if (!slider) return;
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value) || 0;
  const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
  slider.style.setProperty('--slider-progress', `${pct}%`);
}

const AUTO_TOKEN_VAL = 1025;

/**
 * Updates UI and slider accessibility based on Auto token mode (Integrated into Slider)
 */
function updateTokenBudgetUI(isAuto, tokens) {
  if (autoTokenBudgetCheckbox) {
    autoTokenBudgetCheckbox.checked = isAuto;
  }

  if (maxOutputTokensSlider) {
    maxOutputTokensSlider.disabled = false;
    const wrap = document.getElementById('token-slider-wrap') || maxOutputTokensSlider.parentElement;
    if (wrap) {
      wrap.style.opacity = '1';
      wrap.style.filter = 'none';
      wrap.style.pointerEvents = 'auto';
    }

    if (isAuto) {
      maxOutputTokensSlider.value = AUTO_TOKEN_VAL;
    } else if (tokens !== undefined) {
      maxOutputTokensSlider.value = Math.min(1000, Math.max(150, tokens));
    }
    updateSliderProgress(maxOutputTokensSlider);
  }

  if (tokenBudgetVal) {
    if (isAuto) {
      tokenBudgetVal.textContent = 'Auto (Recommended)';
      tokenBudgetVal.className = 'slider-value-pill pill-auto';
    } else {
      const val = maxOutputTokensSlider ? maxOutputTokensSlider.value : (tokens || 500);
      tokenBudgetVal.textContent = `${val} tokens`;
      tokenBudgetVal.className = 'slider-value-pill';
    }
  }

  if (tokenBudgetCaption) {
    tokenBudgetCaption.textContent = isAuto
      ? 'Auto dynamically allocates token headroom, preventing definitions, meanings, and examples from being truncated. Drag slider left to set a fixed manual limit.'
      : `Fixed limit: ${maxOutputTokensSlider?.value || tokens || 500} tokens. Values below 400 may cause long Vietnamese translations or definitions to be cut off. Drag all the way right to switch to Auto.`;
  }
}

/**
 * Updates UI and slider accessibility for Auto-Dismiss Card Timer
 */
function updateAutoCloseUI(isEnabled, delayMs) {
  if (autoCloseOnSuccessInput) {
    autoCloseOnSuccessInput.checked = isEnabled;
  }

  const wrap = document.getElementById('autoclose-slider-wrap') || autoCloseDelaySlider?.parentElement;
  if (wrap) {
    wrap.style.opacity = isEnabled ? '1' : '0.38';
    wrap.style.filter = isEnabled ? 'none' : 'grayscale(0.4)';
    wrap.style.pointerEvents = isEnabled ? 'auto' : 'none';
  }
  if (autoCloseDelaySlider) {
    autoCloseDelaySlider.disabled = !isEnabled;
    if (delayMs !== undefined) {
      autoCloseDelaySlider.value = delayMs;
    }
    updateSliderProgress(autoCloseDelaySlider);
  }

  if (autocloseDelayVal) {
    const curVal = autoCloseDelaySlider ? autoCloseDelaySlider.value : (delayMs || 1400);
    autocloseDelayVal.textContent = isEnabled ? `${(curVal / 1000).toFixed(1)}s` : 'Off';
    autocloseDelayVal.style.color = isEnabled ? 'var(--text-primary)' : 'var(--text-muted)';
  }

  const caption = document.getElementById('autoclose-delay-caption');
  if (caption) {
    caption.textContent = isEnabled
      ? 'Duration before the popover card automatically dismisses after successfully adding to Anki.'
      : 'Auto-dismiss is turned off in Preferences. Flashcard popovers will remain open on screen until you click outside, press Esc, or click "×".';
  }
}

/**
 * 1. Initialize Options Page
 * Synchronously populates defaults first, then hydrates from stored config
 */
async function init() {
  setupEventListeners();

  // Handle URL hash tab if specified
  const initialHash = window.location.hash?.replace('#', '');
  if (initialHash && document.getElementById(initialHash)) {
    switchTab(initialHash);
  }

  // 1. Immediately populate form synchronously with DEFAULT_CONFIG
  // Guarantees UI is never blank or missing fields on initial paint or reload
  populateForm(DEFAULT_CONFIG);

  // 2. Hydrate from storage (direct getConfig API with background fallback)
  try {
    const storedConfig = await getConfig();
    if (storedConfig) {
      currentConfig = storedConfig;
      populateForm(currentConfig);
      await checkAndFetchAnki(false);
      isInitialLoad = false;
      markClean();
      return;
    }
  } catch (err) {
    console.warn('[Options] Direct getConfig failed, falling back to message dispatch:', err);
  }

  // 3. Fallback: message service worker
  chrome.runtime.sendMessage({ action: 'GET_CONFIG' }, async (res) => {
    if (res?.success && res.config) {
      currentConfig = res.config;
      populateForm(currentConfig);
      await checkAndFetchAnki(false);
    }
    isInitialLoad = false;
    markClean();
  });
}

/**
 * 2. Setup Event Listeners
 */
function setupEventListeners() {
  // Theme Switching
  if (themeBtnLight && themeBtnDark) {
    themeBtnLight.addEventListener('click', () => setTheme('light'));
    themeBtnDark.addEventListener('click', () => setTheme('dark'));
  }

  // Sliders Live Update & Smooth Track Progression (Token Slider includes Auto at 1025)
  if (maxOutputTokensSlider) {
    updateSliderProgress(maxOutputTokensSlider);
    maxOutputTokensSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      const isAuto = val >= AUTO_TOKEN_VAL;
      updateTokenBudgetUI(isAuto, val);
      markDirty();
    });
  }

  // Token scale mark direct click (150, 300, 500, 750, 1000, Auto)
  document.querySelectorAll('.slider-scale-row span[data-tokens]').forEach(mark => {
    mark.addEventListener('click', () => {
      const targetVal = parseInt(mark.getAttribute('data-tokens'), 10);
      const isAuto = targetVal >= AUTO_TOKEN_VAL;
      updateTokenBudgetUI(isAuto, targetVal);
      markDirty();
    });
  });

  if (autoCloseDelaySlider) {
    updateSliderProgress(autoCloseDelaySlider);
    autoCloseDelaySlider.addEventListener('input', (e) => {
      updateSliderProgress(e.target);
      if (autocloseDelayVal) {
        autocloseDelayVal.textContent = `${(e.target.value / 1000).toFixed(1)}s`;
      }
    });
  }

  // Auto-Close Switch in Tab 3 (Preferences)
  if (autoCloseOnSuccessInput) {
    autoCloseOnSuccessInput.addEventListener('change', (e) => {
      updateAutoCloseUI(e.target.checked);
      markDirty();
    });
  }

  // Provider radio change
  document.querySelectorAll('input[name="apiProvider"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateProviderUI(e.target.value);
    });
  });

  // Toggle API Key visibility with Eye SVG
  btnToggleKey.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    eyeIcon.style.display = isPassword ? 'none' : 'block';
    eyeOffIcon.style.display = isPassword ? 'block' : 'none';
  });

  // Test AI Key
  btnTestAi.addEventListener('click', handleTestAI);

  // Test Anki Connection & Refresh
  btnTestAnki.addEventListener('click', () => checkAndFetchAnki(true));
  btnRefreshDecks.addEventListener('click', () => checkAndFetchAnki(true));

  // Copy Anki CORS config
  btnCopyAnkiConfig.addEventListener('click', () => {
    const text = document.getElementById('anki-cors-snippet').innerText;
    navigator.clipboard.writeText(text).then(() => {
      if (copyBtnText) copyBtnText.textContent = 'Copied JSON!';
      btnCopyAnkiConfig.style.color = 'var(--success)';
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy JSON';
        btnCopyAnkiConfig.style.color = '';
      }, 2000);
    });
  });

  // Note Type change -> update field mapping
  noteTypeSelect.addEventListener('change', () => {
    loadFieldMappingForModel(noteTypeSelect.value);
  });

  // Reset Mapping
  btnResetMapping.addEventListener('click', () => {
    const model = noteTypeSelect.value;
    if (DEFAULT_CONFIG.fieldMappings[model]) {
      currentConfig.fieldMappings[model] = { ...DEFAULT_CONFIG.fieldMappings[model] };
    } else {
      delete currentConfig.fieldMappings[model];
    }
    loadFieldMappingForModel(model);
    markDirty();
    showInlineToast('Restored default mapping for ' + model, 'normal');
  });

  // Reset Prompt
  btnResetPrompt.addEventListener('click', () => {
    customPromptInput.value = DEFAULT_PROMPT;
    markDirty();
    showInlineToast('Restored default System Prompt', 'normal');
  });

  // Segmented Tab Switching
  document.querySelectorAll('.tab-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetTab = trigger.getAttribute('data-tab');
      if (targetTab) switchTab(targetTab);
    });
  });

  // Dirty Tracking for Unsaved Changes
  if (settingsForm) {
    settingsForm.addEventListener('input', () => markDirty());
    settingsForm.addEventListener('change', () => markDirty());
  }

  // Prevent accidental tab closing when there are unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });

  // Keyboard shortcut: Ctrl+S / Cmd+S to immediately save changes
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      handleSave();
    }
  });

  // Save Settings
  btnSaveSettings.addEventListener('click', handleSave);
}

/**
 * 3. Theme Manager (Light & Dark Mode)
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'light') {
    themeBtnLight?.classList.add('active');
    themeBtnDark?.classList.remove('active');
  } else {
    themeBtnDark?.classList.add('active');
    themeBtnLight?.classList.remove('active');
  }
  currentConfig.theme = theme;
  chrome.storage.sync.set({ theme });
}

/**
 * 4. Populate Form with Configuration
 */
function populateForm(config) {
  // Apply saved theme
  const savedTheme = config.theme || 'dark';
  setTheme(savedTheme);

  // Provider
  const provider = config.apiProvider || 'gemini';
  if (provider === 'gemini') providerGemini.checked = true;
  else if (provider === 'claude' && providerClaude) providerClaude.checked = true;
  else if (provider === 'openai') providerOpenai.checked = true;
  else if (provider === 'custom') providerCustom.checked = true;
  updateProviderUI(provider);

  apiKeyInput.value = config.apiKey || '';

  if (claudeBaseUrlInput) claudeBaseUrlInput.value = config.claudeBaseUrl || 'https://1gw.gwai.cloud/v1';
  if (claudeModelInput) claudeModelInput.value = config.claudeModel || 'claude-haiku-5-5';

  // Select Gemini Model
  const storedGemini = config.geminiModel;
  if (!storedGemini || storedGemini === 'gemini-3.8-flash' || storedGemini === 'gemini-1.5-flash') {
    geminiModelSelect.value = 'gemini-3.5-flash-lite';
  } else {
    const exists = Array.from(geminiModelSelect.options).some(opt => opt.value === storedGemini);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = storedGemini;
      opt.textContent = storedGemini;
      geminiModelSelect.appendChild(opt);
    }
    geminiModelSelect.value = storedGemini;
  }

  openaiModelSelect.value = config.openaiModel || 'gpt-4o-mini';
  customBaseUrlInput.value = config.customBaseUrl || 'https://api.openai.com/v1';
  customModelInput.value = config.customModel || 'gpt-4o-mini';

  ankiUrlInput.value = config.ankiUrl || 'http://127.0.0.1:8765';
  ankiApiKeyInput.value = config.ankiApiKey || '';

  // Sliders & Token Budget (Slider reaches Auto at 1025)
  const isAutoTokens = config.autoTokenBudget !== false;
  const tokens = config.maxOutputTokens || 500;
  updateTokenBudgetUI(isAutoTokens, tokens);

  // Auto Close Delay Slider & Toggle
  const isAutoCloseEnabled = config.autoCloseOnSuccess !== false;
  const autoCloseDelay = config.autoCloseDelayMs || 1400;
  updateAutoCloseUI(isAutoCloseEnabled, autoCloseDelay);

  targetLanguageInput.value = config.targetLanguage || 'Vietnamese';
  tagsInput.value = config.tags || 'anki-ai-vocab';
  showQuickTooltipInput.checked = config.showQuickTooltip !== false;
  autoPronounceInput.checked = config.autoPronounce === true;
  audioVoiceSelect.value = config.audioVoice || 'random';
  if (closeOnlyOnXInput) {
    closeOnlyOnXInput.checked = config.closeOnlyOnX === true;
  }
  const promptVal = (config.customPrompt && typeof config.customPrompt === 'string' && config.customPrompt.trim().length > 0)
    ? config.customPrompt
    : DEFAULT_PROMPT;
  customPromptInput.value = promptVal;
}

/**
 * 5. Update UI according to Provider
 */
function updateProviderUI(provider) {
  groupGeminiModel.style.display = provider === 'gemini' ? 'block' : 'none';
  if (groupClaudeModel) groupClaudeModel.style.display = provider === 'claude' ? 'grid' : 'none';
  groupOpenaiModel.style.display = provider === 'openai' ? 'block' : 'none';
  groupCustomModel.style.display = provider === 'custom' ? 'grid' : 'none';

  if (provider === 'gemini') {
    apiKeyLink.innerHTML = `<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Free Google AI Studio Key ↗</a>`;
    apiKeyInput.placeholder = 'AIzaSy...';
  } else if (provider === 'claude') {
    apiKeyLink.innerHTML = `<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">Get Anthropic API Key ↗</a>`;
    apiKeyInput.placeholder = 'sk-ant-... or gateway key';
  } else if (provider === 'openai') {
    apiKeyLink.innerHTML = `<a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Get OpenAI API Key ↗</a>`;
    apiKeyInput.placeholder = 'sk-...';
  } else {
    apiKeyLink.innerHTML = `<span>(Enter API Key per your provider requirements)</span>`;
    apiKeyInput.placeholder = 'sk-... or custom token';
  }
}

/**
 * 6. Check and Fetch Anki Decks & Models
 */
async function checkAndFetchAnki(isManualClick = false) {
  updateAnkiStatus('checking', 'Connecting...');
  if (isManualClick && ankiTestMessage) {
    ankiTestMessage.style.display = 'inline-flex';
    ankiTestMessage.className = 'inline-status-chip status-loading';
    ankiTestMessage.textContent = 'Connecting to AnkiConnect...';
  }

  const testConfig = {
    ankiUrl: ankiUrlInput.value.trim(),
    ankiApiKey: ankiApiKeyInput.value.trim()
  };

  chrome.runtime.sendMessage({
    action: 'CHECK_ANKI_STATUS',
    payload: { config: testConfig }
  }, (statusRes) => {
    if (!statusRes || !statusRes.success) {
      updateAnkiStatus('danger', 'Offline');
      if (isManualClick && ankiTestMessage) {
        ankiTestMessage.style.display = 'inline-flex';
        ankiTestMessage.className = 'inline-status-chip status-error';
        ankiTestMessage.textContent = '✗ ' + (statusRes?.error || 'Unable to connect to Anki (Ensure Anki Desktop is running)');
      }
      return;
    }

    updateAnkiStatus('success', `Online (v${statusRes.version})`);
    if (isManualClick && ankiTestMessage) {
      ankiTestMessage.style.display = 'inline-flex';
      ankiTestMessage.className = 'inline-status-chip status-success';
      ankiTestMessage.textContent = '✓ AnkiConnect connected successfully!';
      setTimeout(() => {
        ankiTestMessage.style.display = 'none';
      }, 3500);
    }

    // Fetch Decks & Models
    chrome.runtime.sendMessage({
      action: 'FETCH_ANKI_DECKS_AND_MODELS',
      payload: { config: testConfig }
    }, (res) => {
      if (res?.success) {
        if (Array.isArray(res.decks)) {
          currentConfig.availableDecks = res.decks;
          chrome.storage.sync.set({ availableDecks: res.decks });
          populateDropdown(deckNameSelect, res.decks, currentConfig.deckName);
        }
        if (Array.isArray(res.models)) {
          populateDropdown(noteTypeSelect, res.models, currentConfig.noteType);
          loadFieldMappingForModel(noteTypeSelect.value);
        }
      }
    });
  });
}

function updateAnkiStatus(type, label) {
  if (ankiLiveBadge) {
    let dotClass = 'dot-checking';
    if (type === 'success') dotClass = 'dot-online';
    else if (type === 'danger') dotClass = 'dot-offline';

    ankiLiveBadge.innerHTML = `
      <span class="status-indicator-dot ${dotClass}" style="position:static;display:inline-block;"></span>
      <span class="status-card-text">${label}</span>
    `;
  }
}

function populateDropdown(selectEl, items, selectedValue) {
  selectEl.innerHTML = '';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    if (item === selectedValue) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

/**
 * 7. Load Dynamic Field Mapping for selected Model
 */
function loadFieldMappingForModel(modelName) {
  fieldMappingContainer.innerHTML = '<div class="table-loading-spinner">Loading field structure from Anki...</div>';

  const testConfig = {
    ankiUrl: ankiUrlInput.value.trim(),
    ankiApiKey: ankiApiKeyInput.value.trim()
  };

  chrome.runtime.sendMessage({
    action: 'FETCH_ANKI_FIELDS',
    payload: { modelName, config: testConfig }
  }, (res) => {
    if (res?.success && Array.isArray(res.fields)) {
      currentModelFields = res.fields;
      renderFieldMappingTable(modelName, res.fields);
    } else {
      // Offline fallback
      const defaultFields = ['Front', 'Back'];
      currentModelFields = defaultFields;
      renderFieldMappingTable(modelName, defaultFields);
    }
  });
}

function renderFieldMappingTable(modelName, fields) {
  const mapping = currentConfig.fieldMappings?.[modelName] || {};

  const variableOptions = [
    { label: '-- Custom / Template Expression --', value: '__custom__' },
    { label: 'Word ({{word}})', value: '{{word}}' },
    { label: 'Phonetic IPA ({{phonetic}})', value: '{{phonetic}}' },
    { label: 'Part of Speech ({{pos}})', value: '{{pos}}' },
    { label: 'Target Translation ({{meaning_vi}})', value: '{{meaning_vi}}' },
    { label: 'English Definition ({{definition_en}})', value: '{{definition_en}}' },
    { label: 'Example Context Sentence ({{example_sentence}})', value: '{{example_sentence}}' },
    { label: 'Example Translation ({{example_translation}})', value: '{{example_translation}}' },
    { label: 'Bilingual Example ({{example_vi}})', value: '{{example_vi}}' },
    { label: 'Audio Pronunciation ({{audio}})', value: '{{audio}}' },
    { label: 'Source Webpage URL ({{source_url}})', value: '{{source_url}}' }
  ];

  let html = `
    <table class="mapping-table" style="width:100%; border-collapse:collapse; margin-top:10px;">
      <thead>
        <tr style="border-bottom:1px solid var(--border-hairline); text-align:left;">
          <th style="width:24%; padding:8px 6px; font-size:12.5px; color:var(--text-secondary); font-weight:600;">Anki Field</th>
          <th style="width:36%; padding:8px 6px; font-size:12.5px; color:var(--text-secondary); font-weight:600;">Source Variable</th>
          <th style="width:40%; padding:8px 6px; font-size:12.5px; color:var(--text-secondary); font-weight:600;">Template / Placeholder</th>
        </tr>
      </thead>
      <tbody>
  `;

  fields.forEach(field => {
    let currentVal = mapping[field];
    if (currentVal === undefined) {
      if (modelName === 'Basic') {
        currentVal = DEFAULT_CONFIG.fieldMappings.Basic[field] || '';
      } else if (modelName === 'Anki AI Vocab' && DEFAULT_CONFIG.fieldMappings['Anki AI Vocab']?.[field]) {
        currentVal = DEFAULT_CONFIG.fieldMappings['Anki AI Vocab'][field];
      } else {
        const lower = field.toLowerCase().replace(/[\s_-]+/g, '');
        if (lower === 'word' || lower.includes('front') || lower.includes('term')) currentVal = '{{word}}';
        else if (lower.includes('phonetic') || lower.includes('ipa') || lower.includes('pronunciation')) currentVal = '{{phonetic}}';
        else if (lower === 'pos' || lower.includes('partofspeech') || lower.includes('type')) currentVal = '{{pos}}';
        else if (lower.includes('meaning') || lower.includes('vietnamese') || lower.includes('nghia') || lower === 'back') currentVal = '{{meaning_vi}}';
        else if (lower.includes('definition') || lower.includes('def') || lower.includes('english')) currentVal = '{{definition_en}}';
        else if (lower.includes('translation') || lower.includes('dich')) currentVal = '{{example_translation}}';
        else if (lower.includes('example') || lower.includes('sentence') || lower.includes('context')) currentVal = '{{example_sentence}}';
        else if (lower.includes('audio') || lower.includes('sound') || lower.includes('voice')) currentVal = '{{audio}}';
        else if (lower.includes('source') || lower.includes('url')) currentVal = '{{source_url}}';
        else currentVal = '';
      }
    }

    const isSimpleVar = variableOptions.some(opt => opt.value === currentVal);
    const selectValue = isSimpleVar ? currentVal : '__custom__';

    const optsHtml = variableOptions.map(opt => 
      `<option value="${opt.value}" ${opt.value === selectValue ? 'selected' : ''}>${opt.label}</option>`
    ).join('');

    html += `
      <tr data-field="${field}" style="border-bottom:1px solid var(--border-hairline);">
        <td style="padding:8px 6px;"><strong>${escapeAttr(field)}</strong></td>
        <td style="padding:8px 6px;">
          <select class="custom-select field-preset-select" style="height:32px; padding:0 8px; font-size:12px;">
            ${optsHtml}
          </select>
        </td>
        <td style="padding:8px 6px;">
          <input type="text" class="custom-input field-template-input" value="${escapeAttr(currentVal)}" style="height:32px; padding:0 8px; font-size:12px;" placeholder="{{word}}...">
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  fieldMappingContainer.innerHTML = html;

  // Add listener for preset change
  fieldMappingContainer.querySelectorAll('.field-preset-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const row = e.target.closest('tr');
      const input = row.querySelector('.field-template-input');
      if (e.target.value !== '__custom__') {
        input.value = e.target.value;
      }
    });
  });
}

/**
 * 8. Test AI Connection (Inline status without modal alert)
 */
async function handleTestAI() {
  aiTestStatus.style.display = 'inline-flex';
  aiTestStatus.className = 'inline-status-chip status-loading';
  aiTestStatus.textContent = 'Testing API Key...';
  btnTestAi.disabled = true;

  const provider = document.querySelector('input[name="apiProvider"]:checked').value;
  const draftConfig = {
    ...currentConfig,
    apiProvider: provider,
    apiKey: apiKeyInput.value.trim(),
    geminiModel: geminiModelSelect.value,
    claudeModel: (claudeModelInput?.value || '').trim() || 'claude-haiku-5-5',
    claudeBaseUrl: (claudeBaseUrlInput?.value || '').trim() || 'https://1gw.gwai.cloud/v1',
    openaiModel: openaiModelSelect.value,
    customBaseUrl: customBaseUrlInput.value.trim(),
    customModel: customModelInput.value.trim(),
    targetLanguage: targetLanguageInput.value.trim(),
    customPrompt: customPromptInput.value
  };

  chrome.runtime.sendMessage({
    action: 'TEST_AI_KEY',
    payload: { config: draftConfig }
  }, (res) => {
    btnTestAi.disabled = false;
    if (res?.success) {
      aiTestStatus.className = 'inline-status-chip chip-success';
      aiTestStatus.textContent = `✓ ${res.message || 'API Key is valid!'}`;
      setTimeout(() => {
        aiTestStatus.style.display = 'none';
      }, 4000);
    } else {
      aiTestStatus.className = 'inline-status-chip chip-error';
      aiTestStatus.textContent = `✗ ${res?.error || 'Cannot connect to AI provider'}`;
    }
  });
}

/**
 * 9. Save Settings with smooth fading inline toast
 */
async function handleSave() {
  btnSaveSettings.disabled = true;
  btnSaveSettings.innerHTML = '<span>Saving...</span>';

  const provider = document.querySelector('input[name="apiProvider"]:checked').value;
  const selectedModel = noteTypeSelect.value;

  // Collect Field Mappings from UI
  const currentModelMapping = {};
  fieldMappingContainer.querySelectorAll('tr[data-field]').forEach(row => {
    const field = row.getAttribute('data-field');
    const templateVal = row.querySelector('.field-template-input').value;
    currentModelMapping[field] = templateVal;
  });

  const updatedFieldMappings = {
    ...(currentConfig.fieldMappings || {}),
    [selectedModel]: currentModelMapping
  };

  const newConfig = {
    ...currentConfig,
    apiProvider: provider,
    apiKey: apiKeyInput.value.trim(),
    geminiModel: geminiModelSelect.value,
    claudeModel: (claudeModelInput?.value || '').trim() || 'claude-haiku-5-5',
    claudeBaseUrl: (claudeBaseUrlInput?.value || '').trim() || 'https://1gw.gwai.cloud/v1',
    openaiModel: openaiModelSelect.value,
    customBaseUrl: customBaseUrlInput.value.trim(),
    customModel: customModelInput.value.trim(),
    ankiUrl: ankiUrlInput.value.trim(),
    ankiApiKey: ankiApiKeyInput.value.trim(),
    deckName: deckNameSelect.value || 'Default',
    availableDecks: currentConfig.availableDecks || [deckNameSelect.value || 'Default'],
    noteType: selectedModel || 'Basic',
    fieldMappings: updatedFieldMappings,
    targetLanguage: targetLanguageInput.value.trim() || 'Vietnamese',
    tags: tagsInput.value.trim() || 'anki-ai-vocab',
    showQuickTooltip: showQuickTooltipInput.checked,
    autoPronounce: autoPronounceInput.checked,
    audioVoice: audioVoiceSelect.value || 'random',
    autoCloseOnSuccess: autoCloseOnSuccessInput.checked,
    closeOnlyOnX: closeOnlyOnXInput ? closeOnlyOnXInput.checked : false,
    autoTokenBudget: parseInt(maxOutputTokensSlider?.value || '1025', 10) >= AUTO_TOKEN_VAL,
    maxOutputTokens: parseInt(maxOutputTokensSlider?.value || '1025', 10) >= AUTO_TOKEN_VAL
      ? (currentConfig.maxOutputTokens || 500)
      : parseInt(maxOutputTokensSlider?.value || '500', 10),
    autoCloseDelayMs: parseInt(autoCloseDelaySlider?.value || '1400', 10),
    theme: currentConfig.theme || 'dark',
    customPrompt: (customPromptInput.value && customPromptInput.value.trim().length > 0)
      ? customPromptInput.value
      : DEFAULT_PROMPT
  };

  chrome.runtime.sendMessage({
    action: 'SAVE_CONFIG',
    payload: { config: newConfig }
  }, (res) => {
    btnSaveSettings.disabled = false;
    btnSaveSettings.innerHTML = '<span>Save Changes</span><span class="btn-kbd-hint">Ctrl+S</span>';

    if (res?.success) {
      currentConfig = newConfig;
      markClean();
      showInlineToast('✓ Settings saved successfully', 'success');
    } else {
      showInlineToast('✗ Failed to save: ' + (res?.error || 'Unknown error'), 'error');
    }
  });
}

/**
 * Inline feedback toast fading smoothly
 */
function showInlineToast(msg, type = 'normal') {
  if (statusFadeTimeout) clearTimeout(statusFadeTimeout);

  if (saveStatusDot && saveStatusLabel) {
    if (type === 'success') {
      saveStatusDot.className = 'status-ready-dot';
      saveStatusDot.style.backgroundColor = 'var(--success)';
      saveStatusLabel.className = '';
      saveStatusLabel.style.color = 'var(--success)';
      saveStatusLabel.textContent = msg;
    } else if (type === 'error') {
      saveStatusDot.className = 'status-ready-dot';
      saveStatusDot.style.backgroundColor = 'var(--danger)';
      saveStatusLabel.className = '';
      saveStatusLabel.style.color = 'var(--danger)';
      saveStatusLabel.textContent = msg;
    } else {
      saveStatusDot.className = 'status-ready-dot';
      saveStatusDot.style.backgroundColor = '';
      saveStatusLabel.className = '';
      saveStatusLabel.style.color = 'var(--text-primary)';
      saveStatusLabel.textContent = msg;
    }

    statusFadeTimeout = setTimeout(() => {
      saveStatusDot.style.backgroundColor = '';
      saveStatusLabel.style.color = '';
      updateSaveStatusUI();
    }, 2400);
  } else if (saveStatusMsg) {
    saveStatusMsg.textContent = msg;
  }
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Start on DOM ready, handling deferred ES module execution when document is already parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
