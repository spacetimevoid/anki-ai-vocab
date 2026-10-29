/**
 * Main Background Service Worker (Manifest V3)
 * Orchestrates AI API requests, AnkiConnect calls, context menus, and storage
 */

import { getConfig, saveConfig, DEFAULT_CONFIG } from './config.js';
import { explainWord, testAIConnection, cropImageData, analyzeCroppedImage } from './ai-service.js';
import {
  checkAnkiConnection,
  getDeckNames,
  getModelNames,
  getModelFieldNames,
  addAnkiNote
} from './anki-service.js';

const CONTEXT_MENU_ID = 'anki_ai_explain_selection';
const CROP_CONTEXT_MENU_ID = 'anki_ai_crop_lookup';

// 1. Initialize Extension and Context Menus
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Explain & Add to Anki: "%s"',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: CROP_CONTEXT_MENU_ID,
      title: 'Crop & Look Up (Alt+S)',
      contexts: ['all']
    });
  });

  // Auto-inject content script into all currently open tabs so user doesn't need to refresh them
  try {
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: false },
          files: ['content/content.js']
        }).catch(() => {
          // Ignore tabs that are discarded or restricted
        });
      }
    }
  } catch (err) {
    // Non-critical background init error
  }

  console.log('[Anki AI Vocab] Extension installed & active on open tabs.');
});

// 2. Handle Context Menu Click with Auto-Injection Fallback
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  const url = tab.url || '';
  if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('view-source:')) {
    console.warn('[Anki AI Vocab] Cannot run extension on internal browser pages.');
    return;
  }

  const payload = info.menuItemId === CROP_CONTEXT_MENU_ID
    ? { action: 'TRIGGER_CROP_MODE' }
    : (info.menuItemId === CONTEXT_MENU_ID
        ? { action: 'TRIGGER_LOOKUP_FROM_CONTEXT_MENU', selectedText: info.selectionText || '' }
        : null);

  if (!payload) return;

  try {
    // 1. Try sending message to existing content script
    await chrome.tabs.sendMessage(tab.id, payload);
  } catch (err) {
    // 2. If content script is missing (e.g. tab opened before extension reload), inject it dynamically
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: ['content/content.js']
      });

      // 3. Resend message after short delay for content script to attach listener
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, payload).catch(retryErr => {
          console.warn('[Anki AI Vocab] Vẫn chưa thể gửi message sau khi inject:', retryErr);
        });
      }, 150);
    } catch (injectErr) {
      console.warn('[Anki AI Vocab] Không thể inject content script vào tab này:', injectErr);
    }
  }
});

// In-memory cached config for instant 0ms access
let cachedConfig = null;

async function getCachedConfig() {
  if (!cachedConfig) {
    cachedConfig = await getConfig();
  }
  return cachedConfig;
}

chrome.storage.onChanged.addListener(() => {
  cachedConfig = null;
});

// 3. Central Message Dispatcher
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, payload } = request;

  // Asynchronous message handling
  (async () => {
    try {
      const config = await getCachedConfig();

      switch (action) {
        case 'GET_CONFIG': {
          sendResponse({ success: true, config });
          break;
        }

        case 'SAVE_CONFIG': {
          await saveConfig(payload.config);
          cachedConfig = payload.config;
          sendResponse({ success: true });
          break;
        }

        case 'EXPLAIN_WORD': {
          const { word, sentence, sourceUrl, bypassCache, existingTranslation, reuseTranslation } = payload;
          const result = await explainWord({ word, sentence, sourceUrl, config, bypassCache, existingTranslation, reuseTranslation });
          sendResponse({ success: true, data: result });
          break;
        }

        case 'CAPTURE_AND_LOOKUP_HYBRID': {
          const { cropArea, sourceUrl } = payload;
          const windowId = sender.tab?.windowId || null;

          // 1. Capture visible tab at high quality
          const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 95 });

          // 2. Crop area using OffscreenCanvas
          const base64Image = await cropImageData(dataUrl, cropArea);

          // 3. Process with Gemini Vision OCR + Vocab Extractor
          const result = await analyzeCroppedImage({ base64Image, sourceUrl, config });
          sendResponse({ success: true, data: result });
          break;
        }

        case 'ADD_ANKI_NOTE': {
          const { cardData, targetDeck, targetModel } = payload;
          const result = await addAnkiNote({
            cardData,
            config,
            targetDeck,
            targetModel
          });
          sendResponse({ success: true, ...result });
          break;
        }

        case 'CHECK_ANKI_STATUS': {
          const ankiStatus = await checkAnkiConnection(payload?.config || config);
          sendResponse({ success: ankiStatus.ok, ...ankiStatus });
          break;
        }

        case 'FETCH_ANKI_DECKS_AND_MODELS': {
          const currentConfig = payload?.config || config;
          const [decks, models] = await Promise.all([
            getDeckNames(currentConfig),
            getModelNames(currentConfig)
          ]);
          sendResponse({ success: true, decks, models });
          break;
        }

        case 'FETCH_ANKI_FIELDS': {
          const { modelName } = payload;
          const currentConfig = payload?.config || config;
          const fields = await getModelFieldNames(modelName, currentConfig);
          sendResponse({ success: true, fields });
          break;
        }

        case 'TEST_AI_KEY': {
          const testConfig = payload?.config || config;
          const result = await testAIConnection(testConfig);
          sendResponse({ success: result.ok, ...result });
          break;
        }

        case 'OPEN_OPTIONS_PAGE': {
          chrome.runtime.openOptionsPage();
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ success: false, error: `Unknown action: ${action}` });
          break;
      }
    } catch (err) {
      console.error(`[Anki AI Vocab Error] Action: ${action}:`, err);
      sendResponse({ success: false, error: err.message || 'Unknown error' });
    }
  })();

  // Return true to indicate asynchronous response
  return true;
});

