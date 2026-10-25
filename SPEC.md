# SPEC.md: Đặc tả Kỹ thuật Dữ liệu, Giao thức & Xử lý Lỗi

Tài liệu quy định chi tiết về Schema dữ liệu trao đổi, Cấu hình Mô hình AI, Ánh xạ Thẻ Anki, và Bộ Mã Lỗi của ứng dụng.

---

## 1. Đặc tả Schema Dữ liệu AI (Structured Output JSON)

### 1.1. Schema Định dạng Chuẩn

Google Gemini Flash Lite được cấu hình ép trả về JSON cấu trúc theo schema sau:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "VocabCardData",
  "type": "object",
  "properties": {
    "word": {
      "type": "string",
      "description": "Dạng nguyên thể (lemma/base form) của từ hoặc cụm từ được tra cứu"
    },
    "phonetic": {
      "type": "string",
      "description": "Phiên âm quốc tế IPA chính xác, kèm dấu ngoặc gạch chéo, vd: /jʊˈbɪk.wɪ.təs/"
    },
    "pos": {
      "type": "string",
      "enum": ["noun", "verb", "adjective", "adverb", "phrasal verb", "idiom", "preposition", "conjunction"],
      "description": "Từ loại chính xác của từ trong ngữ cảnh của câu được chọn"
    },
    "meaning_vi": {
      "type": "string",
      "description": "Nghĩa tiếng Việt ngắn gọn, tự nhiên, sát nghĩa nhất theo ngữ cảnh câu văn đang đọc"
    },
    "definition_en": {
      "type": "string",
      "description": "Định nghĩa tóm tắt bằng tiếng Anh đơn giản, dễ nhớ để ôn tập flashcard"
    },
    "example_sentence": {
      "type": "string",
      "description": "Câu văn gốc trích xuất từ trang web có chứa từ vựng (đã làm sạch khoảng trắng)"
    },
    "example_translation": {
      "type": "string",
      "description": "Bản dịch nghĩa tiếng Việt tự nhiên và chuẩn xác của cả câu văn ví dụ"
    },
    "collocations": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Danh sách từ 2 đến 4 cụm từ/collocation phổ biến đi kèm với từ vựng này"
    }
  },
  "required": [
    "word",
    "phonetic",
    "pos",
    "meaning_vi",
    "definition_en",
    "example_sentence",
    "example_translation",
    "collocations"
  ],
  "additionalProperties": false
}
```

### 1.2. Mẫu Phản hồi JSON Mẫu (Example Response)

```json
{
  "word": "ubiquitous",
  "phonetic": "/juːˈbɪk.wə.t̬əs/",
  "pos": "adjective",
  "meaning_vi": "phổ biến ở khắp mọi nơi",
  "definition_en": "present, appearing, or found everywhere",
  "example_sentence": "Smartphones have become ubiquitous in modern everyday life.",
  "example_translation": "Điện thoại thông minh đã trở nên phổ biến ở khắp mọi nơi trong đời sống hiện đại.",
  "collocations": ["ubiquitous presence", "become ubiquitous", "ubiquitous access"]
}
```

---

## 2. Cấu hình AI Engine & Prompt Constraints

### 2.1. Cấu hình Mô hình (Engine Configuration)
- **Primary Model:** `gemini-3.5-flash-lite`
- **Fallback Model:** `gemini-3.1-flash-lite`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}`
- **Generation Config:**
  ```json
  {
    "responseMimeType": "application/json",
    "temperature": 0.1,
    "maxOutputTokens": 500,
    "thinkingConfig": {
      "thinkingBudget": 0
    }
  }
  ```
  *(Tắt hoàn toàn suy nghĩ thinkingBudget: 0 giúp tốc độ phản hồi siêu tốc dưới 0.5s và loại bỏ hiện tượng tràn văn bản suy nghĩ "Wait, let me...").*

### 2.2. Prompt Tối ưu hóa Token (Prompt Engineering)
Prompt được tinh giản tối đa để tiết kiệm tokens (duy trì dưới 250K TPM):

```text
You are a precision lexicographer. Analyze the target word in the context of the given sentence.
Return a STRICT JSON object matching the required schema. No markdown formatting, no commentary.

Target Word: "{{word}}"
Sentence Context: "{{sentence}}"
Target Translation Language: {{target_lang}}
```

---

## 3. Quy chuẩn Ánh xạ Thẻ Anki (Anki Field Mapping)

### 3.1. Đối với Note Type `Basic` chuẩn (2 trường Front / Back)
- **Trường Front:**
  ```html
  <div class="anki-word">{{word}}</div>
  <div class="anki-ipa">[{{phonetic}}]</div>
  ```
- **Trường Back:**
  ```html
  <div class="anki-card-back">
    <div class="anki-meaning">
      <span class="anki-pos-badge">{{pos}}</span>
      <strong>{{meaning_vi}}</strong>
    </div>
    <div class="anki-en-def"><i>{{definition_en}}</i></div>
    <hr class="anki-divider" />
    <div class="anki-example-box">
      <div class="anki-ex-en"><b>Ex:</b> {{example_sentence}}</div>
      <div class="anki-ex-vi"><i>{{example_translation}}</i></div>
    </div>
    <div class="anki-collocations"><b>Collocations:</b> {{collocations}}</div>
    <div class="anki-source"><a href="{{source_url}}">Source Context</a></div>
  </div>
  ```

### 3.2. Đối với Custom Note Type (Thẻ vựng chuyên sâu nhiều trường)
Hệ thống cho phép ánh xạ 1-1 qua biến thay thế:
- `Word` ➔ `{{word}}`
- `Phonetic` ➔ `{{phonetic}}`
- `POS` ➔ `{{pos}}`
- `Vietnamese_Meaning` ➔ `{{meaning_vi}}`
- `English_Definition` ➔ `{{definition_en}}`
- `Example_Sentence` ➔ `{{example_sentence}}`
- `Example_Translation` ➔ `{{example_translation}}`
- `Collocations` ➔ `{{collocations}}`
- `Source_URL` ➔ `{{source_url}}`

---

## 4. Đặc tả UI/UX: Compact Floating Popover (Tuyệt đối Không che tab)

### 4.1. Kích thước & Trọng lượng Giao diện
- **Chiều rộng (Width):** `340px` cố định (tối đa `90vw` trên màn hình nhỏ).
- **Chiều cao tối đa (Max-Height):** `450px`.
- **Cuộn nội dung:** `overflow-y: auto`, thanh cuộn mảnh (custom slim scrollbar).
- **Shadow:** `box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08)`.
- **Bo góc (Border Radius):** `12px`.
- **Tuyệt đối không sử dụng Backdrop/Overlay:** Không có lớp phủ làm tối màn hình hay cản trở đọc bài viết. Trang web phía sau hoàn toàn cuộn và nhấp chuột được bình thường.

### 4.2. Thuật toán Tính Tọa độ Động & Chống Va chạm Viewport (Collision Detection)
Vị trí popover tính từ `rect = selection.getRangeAt(0).getBoundingClientRect()`:
1. **Trục Y (Mặc định hiển thị bên dưới):**
   - Khoảng cách offset: `top = rect.bottom + 8px`.
   - **Flip Collision Check:** Nếu `top + popoverHeight > window.innerHeight - 10px` (sát đáy màn hình), tự động lật popover lên phía trên:
     `top = rect.top - popoverHeight - 8px`.
2. **Trục X (Căn giữa vùng bôi đen):**
   - `left = rect.left + (rect.width / 2) - (popoverWidth / 2)`.
   - **Boundary Clamping:**
     - Nếu `left < 10px` ➔ ép về `10px`.
     - Nếu `left + popoverWidth > window.innerWidth - 10px` ➔ ép về `window.innerWidth - popoverWidth - 10px`.
3. **Đóng Popover:**
   - Khi bấm phím `Escape`.
   - Khi người dùng click chuột ra ngoài vùng popover (`pointerdown` ngoài popover element).
   - Khi bấm nút `×` ở góc phải header.

---

## 5. Đặc tả Xử lý Lỗi Toàn diện (Error Handling Matrix)

| Mã lỗi / Tình huống | Nguồn phát sinh | Nguyên nhân | Chiến lược xử lý & Thông báo người dùng |
|---|---|---|---|
| **HTTP 429** | Gemini API | Rate limit (>15 RPM) hoặc Hết quota ngày (500 RPD) | 1. Tự động đợi 1.5s và thử lại một lần.<br>2. Nếu vẫn bị 429, tự động fallback sang `gemini-3.1-flash-lite`.<br>3. Nếu cả hai đều hết quota: Báo toast thông minh: *"Đã vượt hạn mức gọi API miễn phí trong phút này. Vui lòng thử lại sau 30 giây."* |
| **HTTP 503** | Gemini API | Máy chủ Google quá tải tức thời | 1. Tự động áp dụng Exponential Backoff (1.2s delay).<br>2. Tự động chuyển mô hình dự phòng.<br>3. Thông báo: *"Máy chủ AI đang chịu tải cao, tiện ích đã thử kết nối lại."* |
| **HTTP 400 / 401 / 403** | Gemini API | API Key sai, để trống, hoặc không có quyền truy cập | Dừng retry ngay lập tức. Hiển thị nút *"Mở Cài đặt"* kèm thông báo: *"API Key không hợp lệ. Vui lòng kiểm tra lại trong Options."* |
| **Connection Refused** | AnkiConnect (`127.0.0.1:8765`) | Phần mềm Anki chưa bật hoặc cổng 8765 bị chặn | Hiển thị thông báo hướng dẫn: *"Không thể kết nối Anki. Hãy bật ứng dụng Anki trên máy tính và đảm bảo đã cài add-on AnkiConnect."* |
| **CORS Blocked** | AnkiConnect | Thiếu cấu hình `webCorsOriginList` | Hiển thị nút copy snippet cấu hình: *"Cần cấu hình webCorsOriginList: [\"*\"] trong AnkiConnect Config."* |
| **Duplicate Note** | AnkiConnect | Thẻ từ này đã có trong bộ bài Anki | Chuyển nút bấm sang cảnh báo màu vàng: *"Thẻ từ vựng này đã tồn tại trong bộ bài Anki."* |
| **Selection rỗng / Ký tự đặc biệt** | Content Script | Người dùng click chuột hoặc bôi đen khoảng trắng/số | Tự động bỏ qua, không kích hoạt popover gây phiền nhiễu khi đọc. |

