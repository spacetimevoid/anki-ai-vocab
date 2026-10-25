# ANKI_TEMPLATE.md - Đặc Tả Mẫu Thẻ Anki Tối Giản Hiện Đại (Prettify / Minimalist Style)

Tài liệu này cung cấp toàn bộ hướng dẫn, mã nguồn mẫu thẻ (**Front Template**, **Back Template**) và bảng kiểu dáng (**CSS Styling**) theo phong cách thiết kế tối giản (**Prettify / Minimalist Style**), lấy nghĩa của từ lên trước ngữ cảnh và thiết kế lại nút phát âm thanh tối giản, tinh tế.

---

## 1. Triết Lý Thiết Kế: Càng Đơn Giản Càng Tốt (Ultra-Minimalist)

- **Cảm hứng thiết kế:** Prettify / Minimalist Flashcard Theme (như trong ảnh mẫu).
- **Trình bày thẻ nổi (Floating Card):** Thẻ được đóng khung trang nhã, bo góc 12px, nền trắng tinh tế trên nền bàn học xám nhạt (`#CFD6DC` ở Light Mode) hoặc nền than chì (`#181920` ở Dark Mode).
- **Vạch kẻ nét đứt (Dashed Divider):** Sử dụng đường kẻ nét đứt `1px dashed` thanh thoát chia tách mặt trước và mặt sau thay cho các thanh vạch cứng nhắc.
- **Thứ tự nội dung tối ưu:**
  1. **Mặt trước:** Tên bộ bài (Breadcrumb) ➔ Từ vựng ➔ Phiên âm IPA ➔ Nút loa phát âm tối giản.
  2. **Mặt sau:** Giữ nguyên Header ➔ Vạch nét đứt ➔ **NGHĨA TIẾNG VIỆT & ĐỊNH NGHĨA (Đặt lên đầu)** ➔ **Câu ngữ cảnh & Bản dịch câu (Đặt bên dưới)** ➔ Tags ở đáy thẻ.
- **Nút phát âm thanh tối giản (Minimalist Audio Button):**
  - Loại bỏ hoàn toàn nút bấm màu xanh thô kệch mặc định của Anki.
  - Tái thiết kế thành nút tròn nhỏ gọn `26px x 26px`, viền mảnh, màu sắc trung tính, icon loa vector SVG sắc nét và hiệu ứng hover nhẹ nhàng.
- **Tương thích toàn diện:** Tự động hỗ trợ Light Mode và Dark Mode (`.nightMode`) trên:
  * Anki Desktop (Windows / macOS / Linux)
  * AnkiMobile (iOS)
  * AnkiDroid (Android)
  * AnkiWeb

---

## 2. Danh Sách 8 Fields Cần Tạo Trong Anki

Khi tạo mới Note Type (ví dụ tên `Anki AI Vocab`) trong Anki Desktop (**Tools ➔ Manage Note Types ➔ Add**), hãy tạo đủ 8 trường dữ liệu sau:

| STT | Tên Field | Kiểu nội dung | Mô tả |
| :---: | :--- | :--- | :--- |
| **1** | `Word` | Text | Từ vựng hoặc cụm từ tiếng Anh nguyên mẫu |
| **2** | `Phonetic` | Text | Phiên âm quốc tế IPA (VD: `[məˈmen.təs]`) |
| **3** | `PartOfSpeech` | Text | Từ loại (noun, verb, adjective, adverb...) |
| **4** | `Meaning` | Text | **Nghĩa tiếng Việt theo ngữ cảnh (Hiển thị đầu tiên)** |
| **5** | `DefinitionEN` | Text | Định nghĩa tóm tắt bằng tiếng Anh |
| **6** | `ContextSentence` | HTML / Text | Câu ngữ cảnh (từ khóa được bôi đậm `<b>...</b>`) |
| **7** | `ContextTranslation`| Text | Bản dịch nghĩa tiếng Việt của câu ngữ cảnh |
| **8** | `Audio` | Âm thanh | Tự động chứa thẻ âm thanh `[sound:vocab_...mp3]` |

---

## 3. Mã Nguồn Front Template (Mặt Trước)

Sao chép toàn bộ đoạn mã HTML dưới đây vào ô **Front Template**:

```html
<div class="card-wrap">
  <div class="card-box">
    <!-- Breadcrumb: Tên bộ bài theo phong cách Prettify / Minimal -->
    {{#Deck}}
    <div class="card-breadcrumb">{{Deck}}</div>
    {{/Deck}}

    <!-- Nội dung mặt trước: Từ vựng & Âm thanh -->
    <div class="card-front-content">
      <div class="card-word-row">
        <span class="card-word">{{Word}}</span>
        {{#PartOfSpeech}}
        <span class="card-pos">{{PartOfSpeech}}</span>
        {{/PartOfSpeech}}
        {{#Audio}}
        <span class="card-audio-pill">{{Audio}}</span>
        {{/Audio}}
      </div>

      {{#Phonetic}}
      <div class="card-phonetic">[{{Phonetic}}]</div>
      {{/Phonetic}}
    </div>
  </div>
</div>
```

---

## 4. Mã Nguồn Back Template (Mặt Sau)

> [!IMPORTANT]
> Theo tiêu chuẩn **"càng đơn giản càng tốt"** và yêu cầu **"nghĩa của từ lên trước context"**, mặt sau trình bày nghĩa tiếng Việt ngay dưới vạch nét đứt, sau đó mới tới câu ví dụ ngữ cảnh.

Sao chép toàn bộ đoạn mã HTML dưới đây vào ô **Back Template**:

```html
<div class="card-wrap">
  <div class="card-box">
    <!-- Breadcrumb: Tên bộ bài -->
    {{#Deck}}
    <div class="card-breadcrumb">{{Deck}}</div>
    {{/Deck}}

    <!-- Header: Từ vựng & Nút phát âm -->
    <div class="card-front-content">
      <div class="card-word-row">
        <span class="card-word">{{Word}}</span>
        {{#PartOfSpeech}}
        <span class="card-pos">{{PartOfSpeech}}</span>
        {{/PartOfSpeech}}
        {{#Audio}}
        <span class="card-audio-pill">{{Audio}}</span>
        {{/Audio}}
      </div>

      {{#Phonetic}}
      <div class="card-phonetic">[{{Phonetic}}]</div>
      {{/Phonetic}}
    </div>

    <!-- Vạch nét đứt phân cách siêu mảnh (Dashed Divider) -->
    <div class="card-dashed-line"></div>

    <!-- LỜI GIẢI: NGHĨA CỦA TỪ ĐẶT TRƯỚC (MEANING FIRST) -->
    <div class="card-answer-body">
      {{#Meaning}}
      <div class="card-meaning">{{Meaning}}</div>
      {{/Meaning}}

      {{#DefinitionEN}}
      <div class="card-definition-en">{{DefinitionEN}}</div>
      {{/DefinitionEN}}

      <!-- CÂU NGỮ CẢNH ĐẶT PHÍA DƯỚI NGHĨA (CONTEXT AFTER MEANING) -->
      {{#ContextSentence}}
      <div class="card-context-block">
        <div class="card-sentence">{{ContextSentence}}</div>
        {{#ContextTranslation}}
        <div class="card-translation">{{ContextTranslation}}</div>
        {{/ContextTranslation}}
      </div>
      {{/ContextSentence}}
    </div>

    <!-- Tags tối giản ở đáy thẻ (như prettify / minimal / basic) -->
    {{#Tags}}
    <div class="card-tags-row">
      <span class="card-tag">{{Tags}}</span>
    </div>
    {{/Tags}}
  </div>
</div>
```

---

## 5. Mã Nguồn Styling (CSS Đa Nền Tảng)

Sao chép toàn bộ đoạn mã CSS dưới đây vào ô **Styling**:

```css
/* ========================================================
   Prettify / Minimalist Flashcard Theme for Anki
   Thiết kế: Nền thẻ nổi, vạch nét đứt, loa tròn tối giản
   Tương thích: Anki Desktop, AnkiMobile, AnkiDroid, AnkiWeb
   ======================================================== */

:root {
  /* Light Mode Palette */
  --card-outer-bg: #CFD6DC;
  --card-bg: #FFFFFF;
  --text-main: #111827;
  --text-sub: #6B7280;
  --text-muted: #9CA3AF;
  --divider-dashed: #D1D5DB;
  --border-card: transparent;
  --badge-bg: #F3F4F6;
  --badge-text: #4B5563;
  --badge-border: #E5E7EB;
  --audio-btn-bg: #F3F4F6;
  --audio-btn-border: #E5E7EB;
  --audio-btn-color: #4B5563;
  --audio-btn-hover: #E5E7EB;
  --context-border: #F3F4F6;
  --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.04);
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Dark Mode (.nightMode trên Anki Desktop/Mobile) */
.nightMode,
.card.nightMode,
body.nightMode {
  --card-outer-bg: #111216;
  --card-bg: #181920;
  --text-main: #FFFFFF;
  --text-sub: #9698A6;
  --text-muted: #646675;
  --divider-dashed: #2A2B37;
  --border-card: #242530;
  --badge-bg: #22232E;
  --badge-text: #A1A1AA;
  --badge-border: #2F313E;
  --audio-btn-bg: #22232E;
  --audio-btn-border: #2F313E;
  --audio-btn-color: #A1A1AA;
  --audio-btn-hover: #2D2F3C;
  --context-border: #22232E;
  --shadow-card: 0 12px 36px rgba(0, 0, 0, 0.5);
}

@media (prefers-color-scheme: dark) {
  :root:not(.lightMode) {
    --card-outer-bg: #111216;
    --card-bg: #181920;
    --text-main: #FFFFFF;
    --text-sub: #9698A6;
    --text-muted: #646675;
    --divider-dashed: #2A2B37;
    --border-card: #242530;
    --badge-bg: #22232E;
    --badge-text: #A1A1AA;
    --badge-border: #2F313E;
    --audio-btn-bg: #22232E;
    --audio-btn-border: #2F313E;
    --audio-btn-color: #A1A1AA;
    --audio-btn-hover: #2D2F3C;
    --context-border: #22232E;
    --shadow-card: 0 12px 36px rgba(0, 0, 0, 0.5);
  }
}

/* Toàn bộ vùng hiển thị thẻ */
.card {
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-main);
  background-color: var(--card-outer-bg);
  margin: 0;
  padding: 24px 16px;
  min-height: 100vh;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

.card-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

/* Khung Card nổi (Floating Card) */
.card-box {
  width: 100%;
  max-width: 580px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 38px 36px 32px;
  box-sizing: border-box;
  text-align: left;
}

/* Breadcrumb: Tên bộ bài tối giản */
.card-breadcrumb {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-sub);
  margin-bottom: 24px;
  letter-spacing: 0.02em;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Header Từ vựng */
.card-front-content {
  margin-bottom: 6px;
}

.card-word-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.card-word {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-main);
  line-height: 1.25;
}

/* Badge từ loại */
.card-pos {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 4px;
  background-color: var(--badge-bg);
  color: var(--badge-text);
  border: 1px solid var(--badge-border);
  line-height: 1.3;
}

/* Phiên âm IPA (Times New Roman thanh lịch, sắc nét) */
.card-phonetic {
  font-family: "Times New Roman", Times, serif;
  font-size: 15px;
  letter-spacing: 0.02em;
  color: var(--text-sub);
  margin-top: 4px;
}

/* ========================================================
   THIẾT KẾ NÚT PHÁT ÂM THANH TỐI GIẢN (REPLAY BUTTON)
   Loại bỏ nút xanh to mặc định, biến thành nút tròn thanh lịch
   ======================================================== */
.card-audio-pill {
  display: inline-flex;
  align-items: center;
}

/* Override toàn bộ nút phát âm thanh của Anki */
.replay-button,
.soundLink {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  background-color: var(--audio-btn-bg) !important;
  border: 1px solid var(--audio-btn-border) !important;
  color: var(--audio-btn-color) !important;
  text-decoration: none !important;
  vertical-align: middle !important;
  margin: 0 !important;
  padding: 0 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
}

.replay-button:hover,
.soundLink:hover {
  background-color: var(--audio-btn-hover) !important;
  color: var(--text-main) !important;
  transform: scale(1.08) !important;
}

.replay-button svg,
.soundLink svg {
  width: 13px !important;
  height: 13px !important;
  fill: currentColor !important;
  stroke: none !important;
}

/* ========================================================
   VẠCH PHÂN CÁCH NÉT ĐỨT (DASHED DIVIDER)
   ======================================================== */
.card-dashed-line {
  border-top: 1px dashed var(--divider-dashed);
  margin: 22px 0 20px 0;
  width: 100%;
}

/* ========================================================
   KHU VỰC LỜI GIẢI (ANSWER BODY)
   Nghĩa đặt TRƯỚC, Câu ví dụ đặt SAU
   ======================================================== */
.card-answer-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 1. Nghĩa tiếng Việt (Đặt lên đầu, chữ to rõ nét) */
.card-meaning {
  font-size: 17.5px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.45;
}

/* 2. Định nghĩa tiếng Anh */
.card-definition-en {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.45;
}

/* 3. Khung câu ví dụ ngữ cảnh (Đặt phía dưới nghĩa) */
.card-context-block {
  margin-top: 6px;
  padding-top: 14px;
  border-top: 1px solid var(--context-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-sentence {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-main);
}

/* Bôi đậm từ khóa mục tiêu trong câu ngữ cảnh */
.card-sentence b,
.card-sentence strong {
  font-weight: 700;
  color: var(--text-main);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
}

.card-translation {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-sub);
  font-style: italic;
}

/* Tags tối giản ở đáy thẻ */
.card-tags-row {
  margin-top: 26px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--badge-bg);
  color: var(--badge-text);
  border: 1px solid var(--badge-border);
}
```

---

## 6. Hướng Dẫn Cài Đặt Vào Anki Desktop (3 Bước Nhanh)

1. Mở phần mềm **Anki Desktop**.
2. Trên thanh menu, chọn **Tools (Công cụ) ➔ Manage Note Types (Quản lý loại thẻ)**.
3. Chọn Note Type `Anki AI Vocab` (hoặc nhấn **Add** để tạo mới với 8 fields ở Mục 2), sau đó nhấn nút **Cards (Các thẻ...)**:
   - Dán mã nguồn ở Mục 3 vào ô **Front Template**.
   - Dán mã nguồn ở Mục 4 vào ô **Back Template**.
   - Dán mã nguồn ở Mục 5 vào ô **Styling**.
   - Nhấn **Save (Lưu)**.

Từ lúc này, mọi thẻ bạn tạo từ Chrome Extension sẽ tự động hiển thị với giao diện chuẩn Prettify / Minimalist, nút phát âm thanh hình tròn tinh tế và nghĩa của từ luôn nằm trước ngữ cảnh!
