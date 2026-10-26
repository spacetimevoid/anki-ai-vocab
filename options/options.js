/**
 * Options Page JavaScript (ES Module)
 * Single-Column Settings Architecture & Seamless Light/Dark Theme Switching
 * 100% English Language Adherence
 */

import { DEFAULT_PROMPT, DEFAULT_CONFIG, getConfig } from '../background/config.js';

// DOM Elements
const providerGemini = document.getElementById('provider-gemini');
const providerOpenai = document.getElementById('provider-openai');
const providerCustom = document.getElementById('provider-custom');

const groupGeminiModel = document.getElementById('group-gemini-model');
const groupOpenaiModel = document.getElementById('group-openai-model');
const groupCustomModel = document.getElementById('group-custom-model');

const apiKeyInput = document.getElementById('apiKey');
const btnToggleKey = document.getElementById('btn-toggle-key');
const eyeIcon = document.getElementById('eye-icon');
const eyeOffIcon = document.getElementById('eye-off-icon');
const apiKeyLink = document.getElementById('api-key-link');

const geminiModelSelect = document.getElementById('geminiModel');
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

// In-memory state
let currentConfig = { ...DEFAULT_CONFIG };
let currentModelFields = [];
let statusFadeTimeout = null;

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

/**
 * Updates UI and slider accessibility based on Auto token mode
 */
function updateTokenBudgetUI(isAuto) {
  if (autoTokenBudgetCheckbox) autoTokenBudgetCheckbox.checked = isAuto;
  if (maxOutputTokensSlider) {
    maxOutputTokensSlider.disabled = isAuto;
    const wrap = document.getElementById('token-slider-wrap') || maxOutputTokensSlider.parentElement;
    if (wrap) {
      wrap.style.opacity = isAuto ? '0.38' : '1';
      wrap.style.filter = isAuto ? 'grayscale(0.4)' : 'none';
      wrap.style.pointerEvents = isAuto ? 'none' : 'auto';
    }
    updateSliderProgress(maxOutputTokensSlider);
  }
  if (tokenBudgetVal) {
    tokenBudgetVal.textContent = isAuto ? 'Auto' : `${maxOutputTokensSlider?.value || 500} tokens`;
    tokenBudgetVal.style.color = isAuto ? 'var(--success)' : 'var(--text-primary)';
  }
  if (tokenBudgetCaption) {
    tokenBudgetCaption.textContent = isAuto
      ? 'Auto dynamically allocates token headroom, preventing definitions, meanings, and examples from being truncated. Click Auto to set a manual cap.'
      : 'Fixed token budget. Values below 400 may cause long Vietnamese translations or English definitions to be cut off.';
  }
}

/**
 * 1. Initialize Options Page
 * Synchronously populates defaults first, then hydrates from stored config
 */
async function init() {
  setupEventListeners();

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

  // Token Budget Auto Toggle
  if (autoTokenBudgetCheckbox) {
    autoTokenBudgetCheckbox.addEventListener('change', (e) => {
      updateTokenBudgetUI(e.target.checked);
    });
  }

  // Sliders Live Update & Smooth Track Progression
  if (maxOutputTokensSlider) {
    updateSliderProgress(maxOutputTokensSlider);
    maxOutputTokensSlider.addEventListener('input', (e) => {
      updateSliderProgress(e.target);
      if (!autoTokenBudgetCheckbox?.checked && tokenBudgetVal) {
        tokenBudgetVal.textContent = `${e.target.value} tokens`;
      }
    });
  }

  if (autoCloseDelaySlider) {
    updateSliderProgress(autoCloseDelaySlider);
    autoCloseDelaySlider.addEventListener('input', (e) => {
      updateSliderProgress(e.target);
      if (autocloseDelayVal) {
        autocloseDelayVal.textContent = `${(e.target.value / 1000).toFixed(1)}s`;
      }
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
    showInlineToast('Restored default mapping for ' + model, 'normal');
  });

  // Reset Prompt
  btnResetPrompt.addEventListener('click', () => {
    customPromptInput.value = DEFAULT_PROMPT;
    showInlineToast('Restored default System Prompt', 'normal');
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
  else if (provider === 'openai') providerOpenai.checked = true;
  else if (provider === 'custom') providerCustom.checked = true;
  updateProviderUI(provider);

  apiKeyInput.value = config.apiKey || '';

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

  // Sliders & Token Budget
  const isAutoTokens = config.autoTokenBudget !== false;
  const tokens = config.maxOutputTokens || 500;
  if (maxOutputTokensSlider) {
    maxOutputTokensSlider.value = tokens;
    updateSliderProgress(maxOutputTokensSlider);
  }
  updateTokenBudgetUI(isAutoTokens);

  if (autoCloseDelaySlider && autocloseDelayVal) {
    const delay = config.autoCloseDelayMs || 1400;
    autoCloseDelaySlider.value = delay;
    updateSliderProgress(autoCloseDelaySlider);
    autocloseDelayVal.textContent = `${(delay / 1000).toFixed(1)}s`;
  }

  targetLanguageInput.value = config.targetLanguage || 'Vietnamese';
  tagsInput.value = config.tags || 'anki-ai-vocab';
  showQuickTooltipInput.checked = config.showQuickTooltip !== false;
  autoPronounceInput.checked = config.autoPronounce === true;
  audioVoiceSelect.value = config.audioVoice || 'random';
  autoCloseOnSuccessInput.checked = config.autoCloseOnSuccess !== false;
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
  groupOpenaiModel.style.display = provider === 'openai' ? 'block' : 'none';
  groupCustomModel.style.display = provider === 'custom' ? 'grid' : 'none';

  if (provider === 'gemini') {
    apiKeyLink.innerHTML = `<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Free Google AI Studio Key ↗</a>`;
    apiKeyInput.placeholder = 'AIzaSy...';
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
  btnSaveSettings.textContent = 'Saving...';

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
    autoTokenBudget: autoTokenBudgetCheckbox ? autoTokenBudgetCheckbox.checked : true,
    maxOutputTokens: parseInt(maxOutputTokensSlider?.value || '500', 10),
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
    btnSaveSettings.textContent = 'Save Changes';

    if (res?.success) {
      currentConfig = newConfig;
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

  if (type === 'success') {
    saveStatusMsg.innerHTML = `<span class="status-ready-dot" style="background:var(--success);"></span> <span style="color:var(--success); font-weight:500;">${msg}</span>`;
  } else if (type === 'error') {
    saveStatusMsg.innerHTML = `<span class="status-ready-dot" style="background:var(--danger);"></span> <span style="color:var(--danger); font-weight:500;">${msg}</span>`;
  } else {
    saveStatusMsg.innerHTML = `<span class="status-ready-dot"></span> <span style="color:var(--text-primary); font-weight:500;">${msg}</span>`;
  }

  statusFadeTimeout = setTimeout(() => {
    saveStatusMsg.innerHTML = `<span class="status-ready-dot"></span> <span>Ready to save</span>`;
  }, 2200);
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
