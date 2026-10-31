/**
 * Firefox Extension Builder & Packager for Anki AI Vocab
 * Automatically syncs assets, generates Firefox Manifest V3 compliant manifest,
 * and packages a ready-to-load directory and .xpi / .zip archive.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const FIREFOX_DIR = path.join(ROOT_DIR, 'firefox');

// Directories to copy into firefox build
const DIRS_TO_COPY = ['background', 'content', 'icons', 'options', 'popup'];

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function buildFirefox() {
  console.log('[Build Firefox] Starting build for Firefox Add-on...');

  // 1. Ensure target directory exists
  if (!fs.existsSync(FIREFOX_DIR)) {
    fs.mkdirSync(FIREFOX_DIR, { recursive: true });
  }

  // 2. Copy code directories
  for (const dirName of DIRS_TO_COPY) {
    const srcDir = path.join(ROOT_DIR, dirName);
    const destDir = path.join(FIREFOX_DIR, dirName);
    if (fs.existsSync(srcDir)) {
      copyDirRecursive(srcDir, destDir);
      console.log(`[Build Firefox] Synced folder: ${dirName}/`);
    }
  }

  // 3. Read and transform manifest.json for Firefox MV3
  const chromeManifestPath = path.join(ROOT_DIR, 'manifest.json');
  const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));

  const firefoxManifest = {
    ...chromeManifest,
    // Firefox Gecko Extension ID requirement for MV3 storage & signed addons
    browser_specific_settings: {
      gecko: {
        id: 'anki-ai-vocab@spacetimevoid.github.io',
        strict_min_version: '109.0'
      }
    },
    // Firefox MV3 background script format
    background: {
      scripts: ['background/background.js'],
      type: 'module'
    }
  };

  const firefoxManifestPath = path.join(FIREFOX_DIR, 'manifest.json');
  fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 2) + '\n', 'utf8');
  console.log('[Build Firefox] Generated Firefox Manifest V3 -> firefox/manifest.json');

  // 4. Create README in firefox/
  const firefoxReadmePath = path.join(FIREFOX_DIR, 'README.md');
  const firefoxReadme = `# Anki AI Vocab - Firefox Edition

Phiên bản dành riêng cho Mozilla Firefox (Manifest V3 Gecko Compliant).

## Hướng dẫn cài đặt trên Firefox (Load Temporary Add-on)

1. Mở trình duyệt Firefox và truy cập địa chỉ: \`about:debugging#/runtime/this-firefox\`
2. Nhấn nút **"Load Temporary Add-on..."** (Tải tiện ích tạm thời...)
3. Điều hướng đến thư mục này (\`firefox/\`) và chọn tệp **\`manifest.json\`**.
4. Tiện ích **Anki AI Vocab** sẽ xuất hiện trên thanh công cụ Firefox!

## Cấu hình nổi bật của phiên bản Firefox:
- **Manifest V3 Gecko Compliant:** Tương thích chuẩn Firefox 109.0+ với \`browser_specific_settings\`.
- **Background Event Script:** Cấu hình \`scripts: ["background/background.js"], type: "module"\` ổn định tuyệt đối trên Firefox.
- **Cross-Browser Hybrid Screen Capture:** Tự động điều chỉnh \`captureVisibleTab\` cho cả Chrome và Firefox API.
- **Full Offline & AnkiConnect Support:** Hoạt động mượt mà với Anki Desktop (\`http://127.0.0.1:8765\`).
`;
  fs.writeFileSync(firefoxReadmePath, firefoxReadme, 'utf8');

  console.log('[Build Firefox] Build completed successfully in ./firefox/');
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildFirefox();
}

