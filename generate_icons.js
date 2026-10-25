const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Anki AI Vocab - Modern Linear / Shadcn Style Icon Generator
 * Generates both SVG vector icon and supersampled PNG icons (16, 32, 48, 128)
 */

function generateIconPNG(size) {
  const width = size;
  const height = size;
  const buffer = Buffer.alloc(height * (1 + width * 4));
  
  // Supersampling grid (4x4 = 16 samples per pixel for buttery subpixel antialiasing)
  const SAMPLES = 4;
  const sampleStep = 1.0 / SAMPLES;
  
  const cx = size / 2.0;
  const cy = size / 2.0;
  const maxR = size / 2.0 - 0.5;
  const cornerR = size * 0.24;
  
  // Front Flashcard geometry
  const cardW = size * 0.54;
  const cardH = size * 0.66;
  const cardCx = cx;
  const cardCy = cy + size * 0.03;
  const cardCornerR = size * 0.08;
  
  // Back Flashcard geometry (slight angle/offset)
  const backCardW = cardW * 0.96;
  const backCardH = cardH * 0.98;
  const backCardCx = cx - size * 0.02;
  const backCardCy = cy - size * 0.02;
  const backAngle = -7.0 * (Math.PI / 180.0);
  const cosA = Math.cos(-backAngle);
  const sinA = Math.sin(-backAngle);
  
  // Main Star geometry
  const starCx = cardCx;
  const starCy = cardCy + size * 0.05;
  const starR = size * 0.19;
  
  // Satellite Star geometry
  const satCx = cx + size * 0.22;
  const satCy = cy - size * 0.23;
  const satR = size * 0.08;
  
  // Guideline geometry
  const lineY1 = cardCy - size * 0.20;
  const lineY2 = cardCy - size * 0.16;
  const lineX1 = cardCx - size * 0.16;
  const lineX2 = cardCx + size * 0.16;

  let byteOffset = 0;

  for (let py = 0; py < height; py++) {
    buffer[byteOffset++] = 0; // Filter 0 (None)

    for (let px = 0; px < width; px++) {
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let totalA = 0;

      for (let sy = 0; sy < SAMPLES; sy++) {
        const subY = py + (sy + 0.5) * sampleStep;
        for (let sx = 0; sx < SAMPLES; sx++) {
          const subX = px + (sx + 0.5) * sampleStep;

          // 1. Check if inside outer squircle
          const rx = Math.abs(subX - cx);
          const ry = Math.abs(subY - cy);
          let inSquircle = true;
          let distToEdge = 0;

          if (rx > maxR || ry > maxR) {
            inSquircle = false;
          } else if (rx > maxR - cornerR && ry > maxR - cornerR) {
            const d = Math.hypot(rx - (maxR - cornerR), ry - (maxR - cornerR));
            if (d > cornerR) {
              inSquircle = false;
            } else {
              distToEdge = cornerR - d;
            }
          } else {
            distToEdge = Math.min(maxR - rx, maxR - ry);
          }

          if (!inSquircle) {
            continue; // transparent background outside squircle
          }

          // Squircle Base color: Modern Deep Zinc Gradient
          const tGrad = (subX + subY) / (width + height);
          let r = Math.round(31 * (1 - tGrad) + 10 * tGrad); // #1F2028 to #0A0A0E
          let g = Math.round(32 * (1 - tGrad) + 11 * tGrad);
          let b = Math.round(40 * (1 - tGrad) + 14 * tGrad);
          let a = 255;

          // Subtle 1px Squircle Border Highlight
          if (distToEdge < 1.0) {
            r = Math.round(r * 0.55 + 75 * 0.45);
            g = Math.round(g * 0.55 + 78 * 0.45);
            b = Math.round(b * 0.55 + 90 * 0.45);
          }

          // 2. Check Back Tilted Card (Deck depth) if size >= 32
          if (size >= 32) {
            const bdx = subX - backCardCx;
            const bdy = subY - backCardCy;
            const rotX = Math.abs(bdx * cosA - bdy * sinA);
            const rotY = Math.abs(bdx * sinA + bdy * cosA);
            const halfBW = backCardW / 2.0;
            const halfBH = backCardH / 2.0;
            
            if (rotX <= halfBW && rotY <= halfBH) {
              const bDist = Math.min(halfBW - rotX, halfBH - rotY);
              if (bDist <= Math.max(0.8, size * 0.025)) {
                // Subtle cyan border for back card
                r = Math.round(r * 0.65 + 56 * 0.35);
                g = Math.round(g * 0.65 + 189 * 0.35);
                b = Math.round(b * 0.65 + 248 * 0.35);
              }
            }
          }

          // 3. Check Front Card
          const cardRx = Math.abs(subX - cardCx);
          const cardRy = Math.abs(subY - cardCy);
          const halfCardW = cardW / 2.0;
          const halfCardH = cardH / 2.0;
          let inCard = false;
          let cardEdgeDist = 0;

          if (cardRx <= halfCardW && cardRy <= halfCardH) {
            if (cardRx > halfCardW - cardCornerR && cardRy > halfCardH - cardCornerR) {
              const cd = Math.hypot(cardRx - (halfCardW - cardCornerR), cardRy - (halfCardH - cardCornerR));
              if (cd <= cardCornerR) {
                inCard = true;
                cardEdgeDist = cardCornerR - cd;
              }
            } else {
              inCard = true;
              cardEdgeDist = Math.min(halfCardW - cardRx, halfCardH - cardRy);
            }
          }

          if (inCard) {
            // Card surface: sleek dark surface #161720
            r = 22;
            g = 23;
            b = 30;

            // Card border stroke (~1px)
            if (cardEdgeDist < Math.max(0.8, size * 0.025)) {
              r = 75;
              g = 78;
              b = 92;
            }

            // Guideline (if size >= 32)
            if (size >= 32 && subY >= lineY1 && subY <= lineY2 && subX >= lineX1 && subX <= lineX2) {
              r = 95;
              g = 100;
              b = 120;
            }
          }

          // 4. Check Main AI Star (Astroid / 4-point sparkle curve)
          const starDx = Math.abs(subX - starCx) / starR;
          const starDy = Math.abs(subY - starCy) / starR;
          if (starDx <= 1.0 && starDy <= 1.0) {
            const astroid = Math.pow(starDx, 0.65) + Math.pow(starDy, 0.65);
            if (astroid <= 1.0) {
              const centerDist = Math.hypot(starDx, starDy);
              if (centerDist < 0.24 && size >= 32) {
                // Electric Cyan Core
                r = 56;
                g = 189;
                b = 248;
              } else {
                // Crisp White
                r = 254;
                g = 254;
                b = 255;
              }
            }
          }

          // 5. Check Satellite Star (top-right)
          if (size >= 24) {
            const satDx = Math.abs(subX - satCx) / satR;
            const satDy = Math.abs(subY - satCy) / satR;
            if (satDx <= 1.0 && satDy <= 1.0) {
              const satAstroid = Math.pow(satDx, 0.65) + Math.pow(satDy, 0.65);
              if (satAstroid <= 1.0) {
                // Vibrant Cyan / Sky Blue
                r = 56;
                g = 189;
                b = 248;
              }
            }
          }

          totalR += r;
          totalG += g;
          totalB += b;
          totalA += a;
        }
      }

      const totalSamples = SAMPLES * SAMPLES;
      buffer[byteOffset++] = Math.round(totalR / totalSamples);
      buffer[byteOffset++] = Math.round(totalG / totalSamples);
      buffer[byteOffset++] = Math.round(totalB / totalSamples);
      buffer[byteOffset++] = Math.round(totalA / totalSamples);
    }
  }

  const idatData = zlib.deflateSync(buffer);

  function crc32(buf) {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      table[n] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// 1. Generate PNG Icons (16, 32, 48, 128)
[16, 32, 48, 128].forEach(size => {
  const png = generateIconPNG(size);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Generated icon${size}.png (${png.length} bytes)`);
});

// 2. Generate Master SVG Icon (128x128)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <!-- Deep Zinc Gradient Base -->
    <linearGradient id="ankiAiBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1F28" />
      <stop offset="50%" stop-color="#14151C" />
      <stop offset="100%" stop-color="#090A0E" />
    </linearGradient>

    <!-- Outer Squircle Rim -->
    <linearGradient id="ankiAiRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3F3F46" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#27272A" stop-opacity="0.3" />
    </linearGradient>

    <!-- Elevated Flashcard Gradient -->
    <linearGradient id="ankiAiCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1C1D26" />
      <stop offset="100%" stop-color="#12131A" />
    </linearGradient>

    <!-- AI Luminary Glow -->
    <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#38BDF8" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Squircle Canvas (Radius 28px) -->
  <rect x="2" y="2" width="124" height="124" rx="28" fill="url(#ankiAiBg)" stroke="url(#ankiAiRim)" stroke-width="1.5" />

  <!-- Back Knowledge Card (Angled / Layered Deck Symbolism) -->
  <rect x="36" y="23" width="56" height="74" rx="8" fill="rgba(56, 189, 248, 0.05)" stroke="rgba(56, 189, 248, 0.28)" stroke-width="1.6" transform="rotate(-7 64 60)" />

  <!-- Front Knowledge Card (Primary Floating Flashcard) -->
  <rect x="35" y="27" width="58" height="74" rx="8" fill="url(#ankiAiCard)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1.8" />

  <!-- Flashcard Title Bar (Minimalist Line) -->
  <line x1="45" y1="40" x2="83" y2="40" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2" stroke-linecap="round" />

  <!-- Luminary 4-Point AI Star (Astroid Curve) -->
  <path d="M64 47 C64 57, 55 64, 45 64 C55 64, 64 71, 64 81 C64 71, 73 64, 83 64 C73 64, 64 57, 64 47 Z" fill="#FFFFFF" filter="url(#aiGlow)" />

  <!-- AI Neural Core (Electric Cyan) -->
  <circle cx="64" cy="64" r="2.2" fill="#38BDF8" />

  <!-- Satellite Micro-Sparkle (Active Learning Intelligence) -->
  <path d="M85 30 C85 34, 82 37, 78 37 C82 37, 85 40, 85 44 C85 40, 88 37, 92 37 C88 37, 85 34, 85 30 Z" fill="#38BDF8" />
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf8');
console.log('Generated icon.svg successfully.');
