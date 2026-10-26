# ANKI_TEMPLATE.md - Bộ Đặc Tả 3 Mẫu Thẻ Anki Tối Giản Hiện Đại (Prettify / Minimalist Style)

Tài liệu này cung cấp toàn bộ hướng dẫn, mã nguồn mẫu thẻ (**Front Template**, **Back Template**) cho **3 chế độ học tập toàn diện** và bảng kiểu dáng (**CSS Styling**) hợp nhất theo phong cách thiết kế tối giản (**Prettify / Minimalist Style**), chuẩn **UI/UX Pro Max**:

1. **Card 1: Recognition (Nhận diện từ vựng: Từ ➔ Nghĩa & Nghe)**
2. **Card 2: Typing from Meaning (Đánh chữ từ nghĩa: Nghĩa ➔ Gõ từ vựng)**
3. **Card 3: Listening & Dictation (Nghe rồi đánh chữ: Nghe phát âm ➔ Gõ từ vựng)**

---

## 1. Triết Lý Thiết Kế & 3 Chế Độ Học Tập Bổ Trợ (1 Note Sinh 3 Thẻ)

- **Cảm hứng thiết kế:** Prettify / Minimalist Flashcard Theme kết hợp bảng màu Zinc / Shadcn cao cấp.
- **Trình bày thẻ nổi (Floating Card):** Thẻ được đóng khung trang nhã, bo góc 12px, nền trắng tinh tế trên nền bàn học xám nhạt (`#CFD6DC` ở Light Mode) hoặc nền than chì (`#181920` ở Dark Mode).
- **Vạch kẻ nét đứt (Dashed Divider):** Đường kẻ nét đứt `1px dashed` thanh thoát chia tách câu hỏi và lời giải.
- **Tối ưu hóa khả năng ghi nhớ đa giác quan (Multi-Modal Memory):**
  * **Card 1 (Đọc - Nhận diện):** Giúp não bộ nhận diện mặt chữ, phiên âm và liên kết nhanh với nghĩa tiếng Việt ngữ cảnh.
  * **Card 2 (Gợi nhớ - Đánh chữ):** Rèn luyện khả năng chủ động truy hồi từ (Active Recall) và kiểm tra chính tả (Spelling) khi chỉ nhìn thấy nghĩa tiếng Việt và định nghĩa.
  * **Card 3 (Nghe - Chính tả):** Rèn luyện phản xạ đôi tai (Dictation), nhận biết ngữ âm và gõ chính xác từ vựng nghe được mà không cần nhìn chữ.
- **Tái thiết kế Input gõ chữ & Bảng so sánh Diff:**
  * Loại bỏ hoàn toàn ô gõ thô sơ và màu chữ xanh/đỏ chói mắt mặc định của Anki.
  * Ô nhập liệu `input#typeans` bo tròn hiện đại, căn giữa, font chữ monospace sang trọng, viền focus ring xanh dịu.
  * Bảng kết quả `code#typeans` so khớp từng ký tự với nền pastel tinh tế: Xanh ngọc (`.typeGood` - ký tự đúng), Đỏ san hô (`.typeBad` - ký tự gõ sai có gạch ngang), Cam hổ phách (`.typeMissed` - ký tự bị thiếu).
- **Tương thích toàn diện:** Tự động hỗ trợ Light Mode và Dark Mode (`.nightMode`) trên:
  * Anki Desktop (Windows / macOS / Linux)
  * AnkiMobile (iOS)
  * AnkiDroid (Android)
  * AnkiWeb

---

## 2. Danh Sách 8 Fields Chuẩn Trong Anki (Tương Thích 100% Với Extension)

Note Type `Anki AI Vocab` sử dụng đúng 8 trường dữ liệu dưới đây. Khi extension tạo thẻ vào Anki, cả 3 loại thẻ sẽ tự động được sinh ra và chia sẻ chung dữ liệu này:

| STT | Tên Field | Kiểu nội dung | Mô tả |
| :---: | :--- | :--- | :--- |
| **1** | `Word` | Text | Từ vựng hoặc cụm từ tiếng Anh nguyên mẫu (base lemma) |
| **2** | `Phonetic` | Text | Phiên âm quốc tế IPA (font Times New Roman chuẩn mực) |
| **3** | `PartOfSpeech` | Text | Từ loại (noun, verb, adjective, adverb...) |
| **4** | `Meaning` | Text | **Nghĩa tiếng Việt theo ngữ cảnh (Đặt lên đầu)** |
| **5** | `DefinitionEN` | Text | Định nghĩa tóm tắt bằng tiếng Anh |
| **6** | `ContextSentence` | HTML / Text | Câu ngữ cảnh (từ khóa được bôi đậm `<b>...</b>`) |
| **7** | `ContextTranslation`| Text | Bản dịch nghĩa tiếng Việt của câu ngữ cảnh |
| **8** | `Audio` | Âm thanh | Tự động chứa thẻ âm thanh `[sound:vocab_...mp3]` |

---

## 3. Card 1: Recognition (Nhận Diện Từ Vựng)

> Chế độ học nhận diện thụ động: Thấy từ vựng tiếng Anh ➔ Tự gợi nhớ nghĩa tiếng Việt và phát âm.

### 3.1. Front Template (Mặt Trước Card 1)
```html
<div class="card-wrap">
  <div class="card-box">
    <!-- Breadcrumb: Tên bộ bài & Badge phân loại -->
    <div class="card-top-bar">
      {{#Deck}}
      <span class="card-breadcrumb">{{Deck}}</span>
      {{/Deck}}
      <span class="card-mode-badge mode-recognition">Recognition</span>
    </div>

    <!-- Nội dung mặt trước: Từ vựng, Từ loại, Phát âm & Phiên âm -->
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

### 3.2. Back Template (Mặt Sau Card 1)
```html
<div class="card-wrap">
  <div class="card-box">
    <!-- Breadcrumb: Tên bộ bài & Badge phân loại -->
    <div class="card-top-bar">
      {{#Deck}}
      <span class="card-breadcrumb">{{Deck}}</span>
      {{/Deck}}
      <span class="card-mode-badge mode-recognition">Recognition</span>
    </div>

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

    <!-- Vạch nét đứt phân cách siêu mảnh -->
    <div class="card-dashed-line"></div>

    <!-- LỜI GIẢI: NGHĨA CỦA TỪ ĐẶT TRƯỚC (MEANING FIRST) -->
    <div class="card-answer-body">
      {{#Meaning}}
      <div class="card-meaning">{{Meaning}}</div>
      {{/Meaning}}

      {{#DefinitionEN}}
      <div class="card-definition-en">{{DefinitionEN}}</div>
      {{/DefinitionEN}}

      <!-- CÂU NGỮ CẢNH ĐẶT PHÍA DƯỚI NGHĨA -->
      {{#ContextSentence}}
      <div class="card-context-block">
        <div class="card-sentence">{{ContextSentence}}</div>
        {{#ContextTranslation}}
        <div class="card-translation">{{ContextTranslation}}</div>
        {{/ContextTranslation}}
      </div>
      {{/ContextSentence}}
    </div>

    <!-- Tags tối giản ở đáy thẻ -->
    {{#Tags}}
    <div class="card-tags-row">
      <span class="card-tag">{{Tags}}</span>
    </div>
    {{/Tags}}
  </div>
</div>
```

---

## 4. Card 2: Typing from Meaning (Đánh Chữ Từ Nghĩa)

> Chế độ học chủ động (Active Recall): Hiển thị nghĩa tiếng Việt, định nghĩa và ngữ cảnh ➔ Người học gõ đúng chính tả từ tiếng Anh vào ô nhập liệu.

### 4.1. Front Template (Mặt Trước Card 2)
```html
<div class="card-wrap">
  <div class="card-box">
    <!-- Breadcrumb & Badge phân loại chế độ học -->
    <div class="card-top-bar">
      {{#Deck}}
      <span class="card-breadcrumb">{{Deck}}</span>
      {{/Deck}}
      <span class="card-mode-badge mode-typing">Type from Meaning</span>
    </div>

    <!-- Nội dung câu hỏi: Nghĩa tiếng Việt & Định nghĩa tiếng Anh -->
    <div class="card-prompt-body">
      {{#Meaning}}
      <div class="card-target-meaning">{{Meaning}}</div>
      {{/Meaning}}

      <div class="card-meta-row">
        {{#PartOfSpeech}}
        <span class="card-pos">{{PartOfSpeech}}</span>
        {{/PartOfSpeech}}
        {{#DefinitionEN}}
        <span class="card-target-def">{{DefinitionEN}}</span>
        {{/DefinitionEN}}
      </div>

      <!-- Gợi ý ngữ cảnh câu tiếng Việt -->
      {{#ContextTranslation}}
      <div class="card-cloze-hint">
        <span class="card-hint-label">Sentence Context:</span>
        <div class="card-hint-text">{{ContextTranslation}}</div>
      </div>
      {{/ContextTranslation}}
    </div>

    <!-- Vạch nét đứt phân cách -->
    <div class="card-dashed-line"></div>

    <!-- Ô gõ chữ của Anki (Type-in Field) -->
    <div class="card-type-area">
      <div class="card-type-prompt">Type the English word:</div>
      {{type:Word}}
    </div>
  </div>
</div>
```

### 4.2. Back Template (Mặt Sau Card 2)
```html
<div class="card-wrap">
  <div class="card-box">
    <!-- Breadcrumb & Badge -->
    <div class="card-top-bar">
      {{#Deck}}
      <span class="card-breadcrumb">{{Deck}}</span>
      {{/Deck}}
      <span class="card-mode-badge mode-typing">Type from Meaning</span>
    </div>

    <!-- Header Từ vựng chuẩn, Phiên âm IPA & Loa phát âm -->
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

    <!-- Vạch nét đứt phân cách -->
    <div class="card-dashed-line"></div>

    <!-- KHUNG SO SÁNH KẾT QUẢ GÕ CHỮ CỦA BẠN (TYPED COMPARISON) -->
    <div class="card-comparison-section">
      <div class="card-comparison-label">Your Typing:</div>
      {{type:Word}}
    </div>

    <!-- LỜI GIẢI CHI TIẾT (NGHĨA TRƯỚC, NGỮ CẢNH SAU) -->
    <div class="card-answer-body">
      {{#Meaning}}
      <div class="card-meaning">{{Meaning}}</div>
      {{/Meaning}}

      {{#DefinitionEN}}
      <div class="card-definition-en">{{DefinitionEN}}</div>
      {{/DefinitionEN}}

      <!-- CÂU NGỮ CẢNH ĐẦY ĐỦ -->
      {{#ContextSentence}}
      <div class="card-context-block">
        <div class="card-sentence">{{ContextSentence}}</div>
        {{#ContextTranslation}}
        <div class="card-translation">{{ContextTranslation}}</div>
        {{/ContextTranslation}}
      </div>
      {{/ContextSentence}}
    </div>

    <!-- Tags tối giản ở đáy thẻ -->
    {{#Tags}}
    <div class="card-tags-row">
      <span class="card-tag">{{Tags}}</span>
    </div>
    {{/Tags}}
  </div>
</div>
```

---

## 5. Card 3: Listening & Dictation (Nghe Rồi Đánh Chữ)

> Chế độ luyện tai và chính tả (Dictation): Tự động phát âm thanh hoặc bấm nút loa ➔ Người học nghe và gõ đúng từ vựng.

### 5.1. Front Template (Mặt Trước Card 3)
```html
<div class="card-wrap">
  <div class="card-box">
    <!-- Breadcrumb & Badge -->
    <div class="card-top-bar">
      {{#Deck}}
      <span class="card-breadcrumb">{{Deck}}</span>
      {{/Deck}}
      <span class="card-mode-badge mode-audio">Listen & Type</span>
    </div>

    <!-- Khối phát âm thanh trung tâm (Hero Audio Player) -->
    <div class="card-listen-hero">
      <div class="card-listen-pill">
        {{#Audio}}
        {{Audio}}
        {{/Audio}}
      </div>
      <div class="card-listen-desc">Click speaker or press <kbd class="card-kbd">R</kbd> to listen</div>

      {{#PartOfSpeech}}
      <div class="card-listen-hint">
        <span class="card-pos">{{PartOfSpeech}}</span>
      </div>
      {{/PartOfSpeech}}
    </div>

    <!-- Vạch nét đứt phân cách -->
    <div class="card-dashed-line"></div>

    <!-- Ô gõ chữ của Anki (Type-in Field) -->
    <div class="card-type-area">
      <div class="card-type-prompt">Type what you hear:</div>
      {{type:Word}}
    </div>
  </div>
</div>
```

### 5.2. Back Template (Mặt Sau Card 3)
```html
<div class="card-wrap">
  <div class="card-box">
    <!-- Breadcrumb & Badge -->
    <div class="card-top-bar">
      {{#Deck}}
      <span class="card-breadcrumb">{{Deck}}</span>
      {{/Deck}}
      <span class="card-mode-badge mode-audio">Listen & Type</span>
    </div>

    <!-- Header Từ vựng chuẩn, Phiên âm IPA & Loa nghe lại -->
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

    <!-- Vạch nét đứt phân cách -->
    <div class="card-dashed-line"></div>

    <!-- KHUNG SO SÁNH KẾT QUẢ GÕ CHỮ CỦA BẠN (TYPED COMPARISON) -->
    <div class="card-comparison-section">
      <div class="card-comparison-label">Your Typing:</div>
      {{type:Word}}
    </div>

    <!-- LỜI GIẢI CHI TIẾT (NGHĨA TRƯỚC, NGỮ CẢNH SAU) -->
    <div class="card-answer-body">
      {{#Meaning}}
      <div class="card-meaning">{{Meaning}}</div>
      {{/Meaning}}

      {{#DefinitionEN}}
      <div class="card-definition-en">{{DefinitionEN}}</div>
      {{/DefinitionEN}}

      <!-- CÂU NGỮ CẢNH ĐẦY ĐỦ -->
      {{#ContextSentence}}
      <div class="card-context-block">
        <div class="card-sentence">{{ContextSentence}}</div>
        {{#ContextTranslation}}
        <div class="card-translation">{{ContextTranslation}}</div>
        {{/ContextTranslation}}
      </div>
      {{/ContextSentence}}
    </div>

    <!-- Tags tối giản ở đáy thẻ -->
    {{#Tags}}
    <div class="card-tags-row">
      <span class="card-tag">{{Tags}}</span>
    </div>
    {{/Tags}}
  </div>
</div>
```

---

## 6. Mã Nguồn Styling Hợp Nhất (CSS Đa Nền Tảng Cho Cả 3 Loại Thẻ)

Sao chép toàn bộ đoạn mã CSS dưới đây vào ô **Styling** trong Anki (tất cả các loại thẻ trong Note Type sẽ tự động dùng chung tệp CSS này):

```css
/* ========================================================
   Prettify / Minimalist Flashcard Theme for Anki (v3.11)
   Hỗ trợ hoàn hảo: Card 1 (Recognition), Card 2 (Typing from Meaning), Card 3 (Listen & Type)
   Tương thích: Anki Desktop, AnkiMobile (iOS), AnkiDroid (Android), AnkiWeb
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

  /* Modern Input & Typing Diff (Light) */
  --accent-blue: #2563EB;
  --focus-ring: rgba(37, 99, 235, 0.2);
  --input-bg: #F9FAFB;
  --input-border: #D1D5DB;
  --diff-good-bg: #DCFCE7;
  --diff-good-text: #15803D;
  --diff-bad-bg: #FEE2E2;
  --diff-bad-text: #B91C1C;
  --diff-missed-bg: #FEF3C7;
  --diff-missed-text: #B45309;
}

/* Dark Mode (.nightMode trên Anki Desktop, iOS, Android) */
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

  /* Modern Input & Typing Diff (Dark) */
  --accent-blue: #3B82F6;
  --focus-ring: rgba(59, 130, 246, 0.25);
  --input-bg: #14151C;
  --input-border: #2E303E;
  --diff-good-bg: rgba(16, 185, 129, 0.2);
  --diff-good-text: #34D399;
  --diff-bad-bg: rgba(239, 68, 68, 0.2);
  --diff-bad-text: #F87171;
  --diff-missed-bg: rgba(245, 158, 11, 0.2);
  --diff-missed-text: #FBBF24;
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

    --accent-blue: #3B82F6;
    --focus-ring: rgba(59, 130, 246, 0.25);
    --input-bg: #14151C;
    --input-border: #2E303E;
    --diff-good-bg: rgba(16, 185, 129, 0.2);
    --diff-good-text: #34D399;
    --diff-bad-bg: rgba(239, 68, 68, 0.2);
    --diff-bad-text: #F87171;
    --diff-missed-bg: rgba(245, 158, 11, 0.2);
    --diff-missed-text: #FBBF24;
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
  padding: 34px 34px 28px;
  box-sizing: border-box;
  text-align: left;
}

/* Top bar: Breadcrumb & Mode Badge */
.card-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  gap: 10px;
}

.card-breadcrumb {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-sub);
  letter-spacing: 0.02em;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.card-mode-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.mode-recognition {
  background-color: var(--badge-bg);
  color: var(--text-sub);
  border: 1px solid var(--badge-border);
}

.mode-typing {
  background-color: rgba(59, 130, 246, 0.12);
  color: var(--accent-blue);
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.mode-audio {
  background-color: rgba(16, 185, 129, 0.12);
  color: var(--diff-good-text);
  border: 1px solid rgba(16, 185, 129, 0.25);
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

/* Phiên âm IPA (Times New Roman sắc nét, thanh thoát) */
.card-phonetic {
  font-family: "Times New Roman", Times, serif;
  font-size: 16px;
  letter-spacing: 0.02em;
  color: var(--text-sub);
  margin-top: 4px;
}

/* ========================================================
   NÚT PHÁT ÂM THANH TỐI GIẢN (REPLAY BUTTON)
   ======================================================== */
.card-audio-pill {
  display: inline-flex;
  align-items: center;
}

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
  margin: 20px 0 18px 0;
  width: 100%;
}

/* ========================================================
   CARD 2 & 3: KHỐI CÂU HỎI & VÙNG GÕ TỪ (TYPING REGION)
   ======================================================== */
.card-prompt-body {
  margin-bottom: 4px;
}

.card-target-meaning {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-main);
  margin-bottom: 6px;
}

.card-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.card-target-def {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.4;
}

.card-cloze-hint {
  padding: 10px 14px;
  background-color: var(--input-bg);
  border-left: 3px solid var(--accent-blue);
  border-radius: 0 6px 6px 0;
  margin: 10px 0 14px;
}

.card-hint-label {
  display: block;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}

.card-hint-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-main);
  font-style: italic;
}

.card-type-area {
  margin-top: 14px;
}

.card-type-prompt {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

/* ========================================================
   ANKI TYPE-IN INPUT FIELD STYLING (SHADCN MODERN)
   ======================================================== */
input#typeans {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  height: 44px !important;
  background-color: var(--input-bg) !important;
  border: 1.5px solid var(--input-border) !important;
  border-radius: 8px !important;
  padding: 0 16px !important;
  font-family: var(--font-mono) !important;
  font-size: 17px !important;
  font-weight: 600 !important;
  color: var(--text-main) !important;
  text-align: center !important;
  letter-spacing: 0.04em !important;
  box-sizing: border-box !important;
  outline: none !important;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

input#typeans:focus {
  border-color: var(--accent-blue) !important;
  box-shadow: 0 0 0 3px var(--focus-ring) !important;
  background-color: var(--card-bg) !important;
}

/* ========================================================
   ANKI TYPED DIFF COMPARISON (MẶT SAU: KẾT QUẢ SO KHỚP)
   ======================================================== */
.card-comparison-section {
  margin-bottom: 20px;
}

.card-comparison-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

#typeans,
code#typeans {
  display: block !important;
  background-color: var(--input-bg) !important;
  border: 1px solid var(--badge-border) !important;
  border-radius: 8px !important;
  padding: 12px 16px !important;
  font-family: var(--font-mono) !important;
  font-size: 16px !important;
  line-height: 1.6 !important;
  text-align: center !important;
  letter-spacing: 0.03em !important;
  box-sizing: border-box !important;
  word-break: break-word !important;
}

/* Ký tự gõ ĐÚNG */
.typeGood {
  background-color: var(--diff-good-bg) !important;
  color: var(--diff-good-text) !important;
  padding: 2px 4px !important;
  border-radius: 4px !important;
  font-weight: 700 !important;
}

/* Ký tự gõ SAI */
.typeBad {
  background-color: var(--diff-bad-bg) !important;
  color: var(--diff-bad-text) !important;
  padding: 2px 4px !important;
  border-radius: 4px !important;
  text-decoration: line-through !important;
  font-weight: 700 !important;
}

/* Ký tự bị THIẾU (bỏ quên) */
.typeMissed {
  background-color: var(--diff-missed-bg) !important;
  color: var(--diff-missed-text) !important;
  padding: 2px 4px !important;
  border-radius: 4px !important;
  font-weight: 700 !important;
}

/* Ký tự THỪA */
.typeExtra {
  background-color: var(--diff-bad-bg) !important;
  color: var(--diff-bad-text) !important;
  padding: 2px 4px !important;
  border-radius: 4px !important;
  text-decoration: line-through !important;
  font-weight: 700 !important;
}

/* ========================================================
   CARD 3: HERO AUDIO LISTENING PLAYER
   ======================================================== */
.card-listen-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 18px;
  background-color: var(--input-bg);
  border: 1px solid var(--badge-border);
  border-radius: 10px;
  margin: 10px 0 16px;
  text-align: center;
}

.card-listen-hero .replay-button,
.card-listen-hero .soundLink {
  width: 52px !important;
  height: 52px !important;
  border-radius: 50% !important;
  background-color: var(--accent-blue) !important;
  border: 2px solid var(--accent-blue) !important;
  color: #FFFFFF !important;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35) !important;
  transition: transform 0.16s ease, box-shadow 0.16s ease !important;
}

.card-listen-hero .replay-button:hover,
.card-listen-hero .soundLink:hover {
  transform: scale(1.08) !important;
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.45) !important;
}

.card-listen-hero .replay-button svg,
.card-listen-hero .soundLink svg {
  width: 22px !important;
  height: 22px !important;
  fill: #FFFFFF !important;
}

.card-listen-desc {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-sub);
  margin-top: 12px;
}

.card-kbd {
  display: inline-block;
  padding: 1px 5px;
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-main);
  background-color: var(--card-bg);
  border: 1px solid var(--badge-border);
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.card-listen-hint {
  margin-top: 8px;
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

/* 1. Nghĩa tiếng Việt */
.card-meaning {
  font-size: 18px;
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

/* 3. Khung câu ví dụ ngữ cảnh */
.card-context-block {
  margin-top: 4px;
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
  margin-top: 24px;
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

## 7. Hướng Dẫn Cài Đặt Chi Tiết Vào Anki Desktop (Thiết Lập 3 Loại Thẻ)

Để một từ vựng tra bằng Chrome Extension tự động sinh ra **cả 3 loại thẻ** thông minh, bạn thực hiện thiết lập 1 lần duy nhất trong Anki Desktop theo các bước sau:

### Bước 1: Mở Trình Quản Lý Loại Thẻ
1. Mở **Anki Desktop**.
2. Trên thanh menu, chọn **Tools (Công cụ) ➔ Manage Note Types (Quản lý loại thẻ)** (hoặc phím tắt `Ctrl + Shift + N` / `Cmd + Shift + N`).
3. Chọn Note Type **`Anki AI Vocab`** (nếu chưa có, nhấn **Add** và thêm đủ 8 trường ở Mục 2).
4. Nhấn nút **Cards... (Các thẻ...)** ở góc phải để mở cửa sổ chỉnh sửa giao diện thẻ.

### Bước 2: Dán Mã Nguồn Cho Card 1 (Recognition)
1. Ở tab thẻ đầu tiên (mặc định tên `Card 1`):
   - Đổi tên thẻ thành `1: Recognition` (bằng cách nhấn **Options ➔ Rename Card Type**).
   - Sao chép mã nguồn ở **Mục 3.1** dán vào ô **Front Template**.
   - Sao chép mã nguồn ở **Mục 3.2** dán vào ô **Back Template**.
   - Sao chép toàn bộ mã nguồn CSS ở **Mục 6** dán vào ô **Styling**.

### Bước 3: Thêm Card 2 (Typing from Meaning)
1. Ở góc trên bên phải cửa sổ Cards, nhấn **Options (Tùy chọn) ➔ Add Card Type (Thêm loại thẻ)**.
2. Anki sẽ hỏi xác nhận tạo thêm thẻ cho các note hiện có, nhấn **OK**.
3. Đổi tên thẻ mới này thành `2: Type from Meaning` (**Options ➔ Rename Card Type**).
4. Sao chép mã nguồn ở **Mục 4.1** dán vào ô **Front Template**.
5. Sao chép mã nguồn ở **Mục 4.2** dán vào ô **Back Template**.
*(Lưu ý: Ô Styling đã tự động đồng bộ từ Card 1, bạn không cần dán lại).*

### Bước 4: Thêm Card 3 (Listening & Dictation)
1. Tiếp tục nhấn **Options (Tùy chọn) ➔ Add Card Type (Thêm loại thẻ)**.
2. Đổi tên thẻ mới thành `3: Listen & Type`.
3. Sao chép mã nguồn ở **Mục 5.1** dán vào ô **Front Template**.
4. Sao chép mã nguồn ở **Mục 5.2** dán vào ô **Back Template**.
5. Nhấn **Save (Lưu)** để hoàn tất.

---

## 8. Mẹo Sử Dụng Thực Tế (Pro Tips)

- **Bật / Tắt Linh Hoạt:** Nếu bạn chỉ muốn học dạng Đọc và Nghe gõ chữ mà không muốn học dạng Đánh chữ từ nghĩa, bạn chỉ cần vào **Browse (Trình duyệt thẻ)** trong Anki, tìm `card:2` và nhấn `Suspend (Tạm dừng)` mà không cần sửa code.
- **Tự Động Phát Âm Thanh:** Trong cài đặt Deck (Deck Options) của Anki, hãy bật tính năng *"Don't play audio automatically"* nếu bạn muốn tự bấm nghe trên Card 3, hoặc tắt đi nếu muốn vừa mở thẻ là nghe phát âm ngay.
- **1-Click Tạo 3 Thẻ:** Từ Chrome Extension, mỗi khi bạn nhấn **Add to Anki**, Anki sẽ tự động tạo đủ cả 3 thẻ học cho từ vựng đó mà không tốn thêm bất kỳ thao tác nào!
