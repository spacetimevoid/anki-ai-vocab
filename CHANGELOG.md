# CHANGELOG.md: Lịch sử Thay đổi Dự án Anki AI Vocab

Tất cả các thay đổi đáng chú ý của dự án Anki AI Vocab Chrome Extension sẽ được ghi nhận chi tiết tại tệp tin này theo chuẩn [Keep a Changelog](https://keepachangelog.com/).

---

## [3.12.0] - 2026-10-29

### Screen Crop & Look Up (Hybrid OCR + Vocab Selection + Interactive Chips)
- **Screen Cropping UI Overlay (`Alt + S`):**
  - Added an intuitive fullscreen cropping overlay with crosshair cursor and instruction banner (`content/content.js`).
  - Supports dragging a dashed selection box over YouTube video subtitles, Netflix frames, image infographics, and PDF pages.
  - Automatically scales coordinates by `window.devicePixelRatio` for high-DPI (Retina / 4K) precision.
  - Cancelable anytime via `Escape` key without side-effects or leftover overlay DOM nodes.
  - Accessible via global shortcut `Alt + S`, right-click context menu "Crop & Look Up (Alt+S)", and dedicated Crop icon in the extension popup header.
- **Multimodal AI Vision & OffscreenCanvas Background Pipeline:**
  - Service worker takes clean visible tab screenshots using `chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 95 })`.
  - Seamlessly crops exact selection coordinates inside Service Worker MV3 using native `OffscreenCanvas` and `createImageBitmap` without needing DOM access.
  - Leverages Google Gemini Multimodal Vision API (`gemini-3.5-flash-lite`, `gemini-2.5-flash`, `gemini-3.1-flash-lite`) with structured JSON schema to OCR all text into `detected_sentence` while automatically picking the most relevant vocabulary word/phrase (`word`) in lemmatized dictionary base form.
  - Comprehensive fallback support for OpenAI multimodal models (`gpt-4o-mini`).
- **Interactive Vocabulary Context Chips on Popover:**
  - Popover cleanly displays the captured sentence as interactive token chips (`.anki-context-chips-container`) directly above the meaning definition.
  - Tokenized into word chips (`.anki-chip-word`) and punctuation separators (`.anki-chip-sep`).
  - Active vocabulary is highlighted with vibrant cyan badge styling (`.active-chip`).
  - Clicking any other word chip instantly triggers sub-0.5s text-based AI lookup (`EXPLAIN_WORD`) in the exact context of the captured sentence without re-cropping or re-running OCR.
  - Full inline editing, audio pronunciation matching selected voice, and sticky target deck selection supported.

---

## [3.11.0] - 2026-10-26

### Selection Popover Toggle in Popup, Sticky Deck Memory & Emerald Green Auto Button
- **Manual Lookup Selection Popover Toggle:**
  - Added a responsive, compact toggle switch (`#toggle-selection-popover` with `.mini-switch`) directly inside the Manual Lookup header in `popup/popup.html`.
  - Enables users to instantly enable or disable the floating trigger/popover when highlighting text on any webpage without having to open the Options page.
  - Automatically synchronizes across all open web tabs in real time via dual storage (`chrome.storage.local` and `chrome.storage.sync`).
- **Sticky Anki Deck Memory (Last Used Deck):**
  - Popovers now automatically remember and pre-select the target deck chosen during previous additions or dropdown selections (`lastUsedDeck` / `deckName`).
  - Eliminates repetitive deck re-selection on every lookup.
  - Seamlessly keeps both Popover and Popup deck dropdowns synchronized.
- **Emerald Green Auto Token Budget Button:**
  - Updated the Auto token budget toggle pill and status indicator to a vibrant, polished Emerald Green palette (`var(--success)` / `#10B981`) in `options/options.css` and `options/options.js`.
  - Communicates optimal automated configuration with a clean, modern aesthetic.

---

## [3.10.1] - 2026-10-26

### Refined UI/UX Sliders, Seamless Auto Pill Toggle, English Voice Labels & Storage Persistence Fix
- **Refined Range Slider & Auto Toggle UI/UX:**
  - Redesigned the token budget toggle into a modern Zinc/Shadcn pill switch with dynamic glow indicator and "Recommended" badge pill (`.auto-badge-toggle`).
  - Added smooth dynamic CSS track progression (`--slider-progress`) on `.custom-range-slider` for real-time visual fill feedback on both Token Budget and Auto-dismiss delay sliders.
  - Enhanced slider thumbs with smooth grabbing cursor, hover scale elevation (1.18x), active grab scale (1.25x), and focus-visible glow rings.
  - Added smooth cubic-bezier transitions for disabled states when toggling between Auto and manual limits.
- **Synchronized English Audio Pronunciation Voice Labels:**
  - Removed Vietnamese parenthetical labels `"(Giọng Nam)"` and `"(Giọng Nữ)"` from `options/options.html` to maintain 100% English interface consistency (`Male Voice`, `Female Voice`).
- **Fixed Options Page Refresh Bug (Settings Reverting to Defaults & Empty System Prompt):**
  - **Root Cause 1 (Scope ReferenceError):** The function `updateTokenBudgetUI` was declared inside `setupEventListeners()`, causing calling it from `populateForm()` to throw an uncaught `ReferenceError: updateTokenBudgetUI is not defined` whenever the page loaded or refreshed. This halted execution at line 269, leaving all subsequent settings at HTML defaults and leaving `customPrompt` completely blank.
  - **Root Cause 2 (ES Module Lifecycle):** Script execution via `<script type="module">` was relying solely on `DOMContentLoaded`, which could miss execution if the document was already parsed. Added `document.readyState` check so `init()` runs reliably on cold start and reloads.
  - **Root Cause 3 (HTML Blank Textarea):** Pre-populated the default prompt inside `<textarea id="customPrompt">` in HTML, ensuring it is never visually blank even before JavaScript hydration.
  - **Dual-Storage Resilience (local + sync):** Upgraded `background/config.js` to prioritize `chrome.storage.local` (10MB quota, no per-item limits) as the authoritative persistence layer with best-effort mirroring to `chrome.storage.sync`. Added strict safeguards against empty or whitespace prompt strings.

---

## [3.10.0] - 2026-10-26

### 🚀 Chế Độ Auto Token Budget, Chuẩn Hóa Từ Gốc (Lemmatization) & Tra Lại Câu Ngữ Cảnh Đã Sửa
- **Chế Độ Auto Output Token Budget (Ngăn Chặn Cắt Cụt Dữ Liệu):**
  - **Vấn đề đã xử lý:** Giới hạn token đầu ra cố định quá thấp (250 tokens) khiến các câu văn dài hoặc phần `definition_en`/`meaning_vi` bị cắt cụt ngang chừng do hết quota token khi AI đang sinh JSON.
  - **Giải pháp:** Bổ sung tùy chọn `autoTokenBudget: true` (Auto - Recommended) trong `DEFAULT_CONFIG` và giao diện `options/options.html`. Khi bật chế độ Auto, extension tự động cấp phát token headroom an toàn (1024 tokens cho Gemini và 1000 tokens cho OpenAI), bảo đảm toàn bộ các trường JSON luôn được hoàn thiện 100%. Thanh trượt thủ công được làm mờ nhẹ và tự động kích hoạt lại khi người dùng bỏ chọn Auto.
- **Chuẩn Hóa Từ Vựng Về Dạng Từ Gốc (Lemmatization / Base Form):**
  - **Vấn đề đã xử lý:** Khi người dùng bôi đen từ ở dạng chia thì, số nhiều hoặc so sánh hơn (e.g. `families`, `studied`, `running`, `better`, `caught up`), thẻ Anki nên lưu từ gốc để học theo dạng từ điển chuẩn (`family`, `study`, `run`, `good`, `catch up`).
  - **Giải pháp:** Cập nhật System Instruction nghiêm ngặt trong `lookupGeminiFast`, `queryOpenAI` và `DEFAULT_PROMPT`, bắt buộc trường `word` luôn là từ điển gốc viết thường (lemma), đồng thời trường `phonetic` và `pos` phải tương ứng với từ gốc này, trong khi câu ví dụ ngữ cảnh `example_sentence` và bản dịch `example_vi` vẫn bảo toàn nguyên vẹn ngữ cảnh ban đầu.
  - **Dual Cache:** Tự động lưu cache cho cả từ bôi đen gốc và từ gốc chuẩn hóa, mang lại phản hồi 0ms tức thì cho cả hai trường hợp.
- **Nút "Tra lại" (Re-analyze) Đọc Trực Tiếp Context Người Dùng Đã Chỉnh Sửa:**
  - **Vấn đề đã xử lý:** Khi câu ngữ cảnh được trích xuất tự động bị thừa nhãn hoặc thiếu chữ, người dùng chỉnh sửa lại câu văn trong khung context của Popover nhưng khi bấm nút "Tra lại" (`#anki-btn-relookup`), hệ thống lại dùng lại câu cũ hoặc quét lại từ trang web.
  - **Giải pháp:** Cập nhật sự kiện click của nút Re-analyze trong `content/content.js`: trích xuất trực tiếp giá trị text hiện tại từ ô `[data-field="example_sentence"]` / `.anki-example-en` và `[data-field="word"]` ngay trước khi hiển thị skeleton loading. Truyền câu ngữ cảnh mới vào `EXPLAIN_WORD` với cờ `bypassCache = true`, đồng thời cập nhật `context.sentence` để bảo toàn nội dung khi người dùng lưu thẻ Anki hoặc bấm Reset.

---

## [3.9.0] - 2026-10-25

### 🎯 Dịch Trọn Vẹn 100% Câu Ngữ Cảnh & Tự Động Sinh Ví Dụ Khi Tra Từ Đơn Lập
- **Khắc Phục Triệt Để Lỗi Dịch Thiếu Mệnh Đề Trong Câu Dài (Full Context Translation):**
  - **Vấn đề đã xử lý:** Khi người dùng tra cứu câu phức/câu ghép dài (ví dụ: *"Being read to is a magical experience for kids, and is a crucial stepping stone for language learning."*), AI từng có xu hướng chỉ dịch vế trước và cắt bỏ hoàn toàn vế thứ hai.
  - **Chỉ thị nghiêm ngặt:** Bổ sung quy tắc bắt buộc vào `DEFAULT_PROMPT` và `systemInstruction`: dịch toàn diện 100% toàn bộ câu ngữ cảnh sang ngôn ngữ đích (`example_vi`), tuyệt đối không được tóm tắt, cắt xén, hoặc bỏ sót bất kỳ mệnh đề phụ/liên từ nào (kể cả "and", "but", "because", "so", mệnh đề quan hệ).
  - **Tăng giới hạn Output Tokens:** Mở rộng `maxOutputTokens` từ `250` lên `450` tokens (và `500` tokens cho OpenAI/Custom), đảm bảo văn phong tiếng Việt (vốn chiếm 2-4 tokens/từ sau BPE subword) không bị nghẽn hoặc ngắt giữa chừng.
- **Tự Động Sinh Câu Ví Dụ Tiếng Anh Khi Tra Từ Đơn Lập (Standalone Word Auto-Example):**
  - **Vấn đề đã xử lý:** Khi người dùng chỉ bôi đen duy nhất 1 từ (ví dụ: `"definition"`) hoặc gõ tay từ vựng vào popup mà không có câu ngữ cảnh kèm theo, hộp ví dụ từng bị bỏ trống hoặc hiển thị từ đơn lẻ đó gây mất thẩm mỹ.
  - **Cơ chế nhận diện:** Tích hợp hàm kiểm tra `isRealContext = rawSentence && rawSentence.toLowerCase() !== cleanWord.toLowerCase() && rawSentence.split(/\s+/).length >= 3`.
  - **Sinh ví dụ & Bản dịch đầy đủ:** Khi `isRealContext` là false, AI tự động sinh một câu ví dụ tiếng Anh tự nhiên, thực tế (chuẩn B1-B2) vào trường `example_en`, đồng thời dịch 100% câu ví dụ đó sang tiếng Việt vào `example_vi`.
  - **Bổ sung `example_en` vào Schema:** Mở rộng `responseSchema` của Gemini với `example_en: { type: "STRING" }` và đưa vào danh sách `required` trường bắt buộc cùng `example_vi`.
- **Đồng Bộ Giao Diện & Thẻ Anki:**
  - Cập nhật `renderPopoverLoadedData` (Popover) và `renderQuickResult` (Popup) để luôn hiển thị mượt mà cả câu ví dụ tiếng Anh và câu dịch tiếng Việt.
  - Cập nhật hàm `getEditedCardData`, `handleAddToAnki` và nút `btn-popup-add-anki` để lưu trọn vẹn câu ví dụ và bản dịch vào Flashcard Anki.
- **Nâng Cấp Phiên Bản:**
  - Nâng version lên `3.9.0` trong `manifest.json`, hiển thị `v3.9` trên `popup/popup.html`.

---

## [3.8.0] - 2026-10-25

### 🚀 Tái Thiết Kế Popup UX, Tự Động Điền Văn Bản Bôi Đen & Đồng Bộ Tính Năng Popover
- **Tự Động Phát Hiện & Điền Từ Vựng Từ Tab Đang Mở (Auto-Fill Active Selection):**
  - Khi người dùng bôi đen từ vựng (và câu văn) trên bất kỳ trang web nào rồi nhấn vào icon Extension trên thanh công cụ Chrome, Popup sẽ tự động lấy đoạn bôi đen qua `chrome.scripting.executeScript`, điền sẵn vào ô `quick-word` & `quick-sentence` và tự động kích hoạt tra cứu ngay lập tức.
- **Loại Bỏ Khoảng Đen Trống Rỗng Khi Chưa Tra Từ:**
  - Thay thế `min-height: 480px` bằng kích thước tự co giãn `min-height: auto; max-height: 580px;`, giúp popup khi chưa tra từ có tỉ lệ gọn gàng, vừa vặn (~260px) không còn khoảng đen trống rỗng vô nghĩa.
  - Bổ sung khối hướng dẫn tinh tế `#popup-idle-guide` khi đang ở trạng thái rảnh (idle), tự động ẩn đi khi có kết quả tra cứu.
- **Xóa Nút Settings Dưới Cùng:**
  - Loại bỏ hoàn toàn thanh footer thừa thãi có liên kết `Settings ↗`, tập trung toàn bộ điều hướng cài đặt vào icon bánh răng trên Header.
- **Tái Cấu Trúc Khu Vực "Add to Anki" Theo Chuẩn Shadcn/Zinc:**
  - Thay thế nút HTML thô hiển thị `+ + Add to Anki (Passive)` bằng Action Bar hiện đại:
    - Bổ sung bộ chọn **Target Deck Selector** (`#popup-deck-select`) cho phép đổi bộ bài trực tiếp trong popup và tự động lưu lựa chọn vào `chrome.storage.sync`.
    - Thiết kế nút **Add to Anki** (`.btn-add-anki`) chuẩn UI/UX Pro Max với icon SVG, hiệu ứng hover, spinner khi lưu và dấu tích xanh khi hoàn tất.
- **Cho Phép Chỉnh Sửa Trực Tiếp Trên Thẻ Kết Quả Popup (Inline Editing):**
  - Kích hoạt `contenteditable="true"` (class `.result-editable`) cho tất cả các trường: từ vựng, phiên âm IPA, từ loại, nghĩa tiếng Việt, định nghĩa tiếng Anh, câu ngữ cảnh, bản dịch.
  - Tự động thu thập dữ liệu người dùng đã chỉnh sửa khi bấm "Add to Anki".
- **Khớp Giọng Đọc Âm Thanh Với Cài Đặt (Audio Voice Match):**
  - Cập nhật hàm `playAudioPronunciation` trong `popup.js` với thuật toán nhận diện và gán voice gender (`male`/`female`) theo đúng cấu hình `audioVoice` trong trang Options.
- **Bổ Sung Nút "Tra Lại" (Re-lookup) & "Hoàn Tác" (Reset) Trên Thẻ Kết Quả:**
  - Thêm `#btn-popup-relookup` (gửi request với `bypassCache = true`, xoay icon) và `#btn-popup-reset` khôi phục dữ liệu gốc AI.
  - Cập nhật phiên bản hiển thị trên popup thành `v3.7` / `v3.8`.

---

## [3.7.0] - 2026-10-25

### ⚡ Context-Aware Cache, Nút "Tra Lại" (Re-lookup) & Tinh Chỉnh Bo Tròn Popover
- **Cơ Chế Cache Nhận Biết Ngữ Cảnh (Context-Aware Cache Key):**
  - Khắc phục triệt để lỗi từ đa nghĩa (polysemous words như "bank", "charge", "lead") bị trả về nghĩa cũ không phù hợp khi gặp trong câu văn mới.
  - Tích hợp thuật toán băm 32-bit FNV-1a trên chuỗi câu ngữ cảnh đã được chuẩn hóa (`cleanSentence = sentence.toLowerCase().replace(/\s+/g, ' ').trim()`).
  - Định dạng key: `vocab_${cleanWord}_${cleanLang}_${ctxHash}` (hoặc `_nocontext` nếu tra từ đơn lẻ). Đảm bảo 0ms cho câu trùng khớp nhưng phân tách hoàn toàn các ngữ cảnh khác nhau.
- **Nút "Tra lại / Phân tích lại" (Re-analyze / Re-lookup Button):**
  - Bổ sung nút bấm `#anki-btn-relookup` với icon SVG vector xoay tròn trong thanh điều khiển Header (cạnh nút loa phát âm).
  - Tích hợp hiệu ứng xoay hover (`transform: rotate(45deg)`) và xoay vô tận khi đang tải (`.anki-spinning`).
  - Khi click: tự động xóa cache tương ứng, kích hoạt trạng thái Skeleton Shimmer nhẹ tại khung nội dung, tạm khóa nút Add to Anki ("Re-analyzing..."), và gửi yêu cầu lên AI với cờ `bypassCache = true`.
  - Cập nhật dữ liệu phân tích ngữ cảnh mới vào giao diện và làm mới điểm hoàn tác `_originalAiData`.
- **Bo Tròn Tinh Tế & Xử Lý Triệt Để Lỗi Viền Dưới Bị Vuông:**
  - Nâng cấp bán kính góc `--radius` lên `12px` chuẩn Shadcn / Modern UI cao cấp cùng hệ thống đổ bóng đa tầng.
  - Sửa lỗi viền đáy popover bị vuông khi bật `overflow: visible;`: gán bán kính góc đồng bộ `border-bottom-left-radius: calc(var(--radius) - 1px)` và `border-bottom-right-radius: calc(var(--radius) - 1px)` kèm `background-clip: padding-box` cho `.anki-popover-footer` (và tương tự cho `.anki-popover-header`), ngăn chặn nền con đè lên đường cong 1px của container cha.

---

## [3.6.0] - 2026-10-25

### 📌 Chế Độ Giữ Popover Luôn Mở (Pin Mode / Close Only via Close Button)
- **Tùy Chọn Mới Trong Trang Cài Đặt (Options Settings):**
  - Bổ sung switch toggle thứ 4 trong mục Preferences & Performance của trang Options:
    - **Tiêu đề:** `Close Only via Close Button ('×')`
    - **Mô tả:** `Keep popover open when clicking outside on the page. Only dismiss when clicking the '×' button or pressing Esc.`
    - **Giá trị mặc định:** `false` (đảm bảo trải nghiệm trực quan quen thuộc cho người dùng mới).
  - Tự động lưu cấu hình `closeOnlyOnX` vào `chrome.storage.sync`.
- **Cơ Chế Khóa Đóng Ngoài Ý Muốn (Prevent Unwanted Outside-Click Dismissal):**
  - Khi bật `closeOnlyOnX: true`, trình lắng nghe sự kiện `pointerdown` trên toàn trang sẽ bỏ qua lệnh đóng popover khi người dùng click chuột ra ngoài.
  - Người dùng có thể thoải mái đọc tiếp bài báo, ghi chép, cuộn trang hoặc chọn văn bản khác mà không sợ popover bị biến mất đột ngột.
- **Phương Thức Đóng Rõ Ràng & Tiện Lợi:**
  - Popover chỉ đóng khi:
    1. Người dùng click trực tiếp vào nút đóng dấu `×` (`#anki-popover-close`) ở góc trên bên phải popover.
    2. Người dùng nhấn phím `Escape` trên bàn phím (trừ khi đang chỉnh sửa nội dung văn bản).
    3. Thẻ được tạo thành công trong Anki (khi bật `autoCloseOnSuccess`).
    4. Người dùng bôi đen từ mới và tra cứu tiếp từ khác (tự động thay thế nội dung thẻ).
- **Đồng Bộ Hóa Thời Gian Thực (Real-Time Storage Sync):**
  - `chrome.storage.onChanged` trong `content.js` tự động cập nhật ngay lập tức giá trị `closeOnlyOnX` vào bộ nhớ trên tất cả các tab trình duyệt mà không cần người dùng phải tải lại trang (F5).

---

## [3.5.0] - 2026-10-25

### 🖱️ Tính Năng Kéo Thả Popover Tự Do (Draggable Popover & Viewport Boundary)
- **Vùng Kéo Thả Trực Quan (Header Drag Handle):**
  - Cho phép người dùng nhấp giữ chuột vào thanh tiêu đề (Header Popover) để di chuyển thẻ từ vựng tự do trên màn hình khi cần đọc phần văn bản bị che khuất.
  - Tự động chuyển đổi con trỏ chuột: hiển thị `cursor: grab;` khi rê vào khoảng trống header và `cursor: grabbing;` khi đang nhấn giữ kéo.
  - Hiệu ứng đổ bóng nổi cao cấp (`box-shadow: 0 18px 42px rgba(0,0,0,0.55)`) trong suốt quá trình kéo.
- **Cách Ly Triệt Để Các Nút Bấm & Vùng Sửa Văn Bản:**
  - Không kích hoạt sự kiện kéo khi người dùng click vào các phần tử tương tác: nút Loa phát âm (`#anki-btn-audio`), nút Reset (`#anki-btn-reset`), nút Đóng (`#anki-popover-close`), các ô chỉnh sửa text inline (`.anki-editable`), hoặc menu chọn deck.
  - Trải nghiệm click nút và chỉnh sửa văn bản giữ nguyên độ mượt mà 100%.
- **Ràng Buộc Giới Hạn Màn Hình (Viewport Boundary Constraints):**
  - Thuật toán tính toán thời gian thực giới hạn tọa độ của Popover luôn nằm gọn trong khung nhìn màn hình (cách các mép trên, dưới, trái, phải tối thiểu 8px có tính đến độ cuộn trang `scrollX`, `scrollY`), ngăn ngừa việc kéo popover trôi mất ra ngoài tầm nhìn.
- **Chống Xung Đột Bôi Đen Văn Bản (Anti-Selection):**
  - Tự động kích hoạt `document.body.style.userSelect = 'none'` khi bắt đầu kéo và khôi phục lại trạng thái bình thường ngay khi nhả chuột, loại bỏ hoàn toàn hiện tượng bôi đen ngoài ý muốn trên trang web chủ.
- **Bảo Lưu Tọa Độ Khi Dữ Liệu Tải Xong (`_hasBeenDragged`):**
  - Sau khi người dùng đã kéo popover, vị trí mới sẽ được ghi nhớ cố định, không bị thuật toán tự động căn chỉnh vị trí của AI ghi đè lên vị trí vừa kéo.

---

## [3.4.0] - 2026-10-24

### 🎙️ Phiên Âm IPA Font Times New Roman & Tùy Chọn Giọng Đọc Âm Thanh (Audio Voice Selection)
- **Đổi Riêng Font Dòng Phiên Âm Sang Times New Roman:**
  - Áp dụng font `"Times New Roman", Times, serif !important` riêng cho các class phiên âm (`.phonetic-text`, `.anki-ipa-text`, `.ipa`) trong Shadow DOM Popover.
  - Các ký tự ngữ âm quốc tế (IPA), dấu trọng âm (`ˈ`, `ˌ`), nguyên âm (`æ`, `ə`, `ɪ`) hiển thị sắc nét, thanh lịch và chuẩn mực như từ điển in Oxford/Cambridge.
  - Toàn bộ các phần nội dung khác (từ gốc, nghĩa tiếng Việt, định nghĩa tiếng Anh, câu ngữ cảnh) vẫn giữ nguyên font Modern Sans-serif hiện đại.
  - Cập nhật `.card-phonetic` trong `ANKI_TEMPLATE.md` để thẻ flashcard trong Anki Desktop cũng sở hữu typography đồng bộ.
- **Tùy Chọn Giọng Đọc (Audio Pronunciation Voice) Trong Options:**
  - Thêm mục cài đặt **Audio Pronunciation Voice** (`<select id="audioVoice">`) trong trang Options (Section 3: Preferences & Performance) với 3 tùy chọn:
    - `Random (Male or Female)` (Mặc định): Tự động luân chuyển ngẫu nhiên giữa giọng nam và giọng nữ.
    - `Male Voice (Giọng Nam)`: Cố định giọng đọc nam chuẩn US (American English).
    - `Female Voice (Giọng Nữ)`: Cố định giọng đọc nữ chuẩn US/UK.
  - Lưu trữ và đồng bộ hóa qua `chrome.storage.sync` với key `audioVoice`.
- **Cơ Chế Tải File Âm Thanh Theo Giọng Vào Anki:**
  - Bổ sung hàm `getAudioVoiceUrl(word, voiceSetting)` trong `background/anki-service.js` tự động phân tách endpoint giọng nam (`type=2`) và giọng nữ (`type=1`).
  - Đặt tên file phát âm độc nhất kèm nhãn giọng: `vocab_${cleanWordName}_${voiceType}_${Date.now()}.mp3` và lưu trữ qua AnkiConnect `storeMediaFile`.
  - Cập nhật tính năng nghe phát âm trực tiếp trên Popover (`playAudioPronunciation` qua Web Speech API) tự động ưu tiên giọng nam/nữ theo đúng cấu hình người dùng.

---

## [3.3.3] - 2026-10-24

### 💎 Thiết Kế Lại Bộ Icon Thương Hiệu & Đồng Bộ Nhận Diện Toàn Diện (UI/UX Pro Max)
- **Thiết Kế Lại Biểu Tượng Nhận Diện ("The Luminary Flashcard"):**
  - Chuyển đổi từ gradient tím cũ sang thiết kế tối giản, sắc nét theo chuẩn **Modern Linear / Shadcn UI**.
  - **Khung nền Squircle:** Bo góc tỉ lệ vàng 28%, gradient chiều sâu Zinc sẫm (`#1E1F28` tới `#090A0E`) kết hợp đường viền phản chiếu ánh sáng mảnh `1px`.
  - **Biểu tượng thẻ Anki xếp lớp:** Thẻ phía sau nghiêng -7° viền xanh cyan điện (`#38BDF8`), thẻ chính nổi bật với bề mặt sẫm sang trọng và đường kẻ flashcard tinh tế.
  - **Ngôi sao trí tuệ nhân tạo (AI Star):** Đường cong astroid 4 cánh chuẩn xác bằng màu trắng tinh khiết (`#FFFFFF`) kết hợp lõi phát sáng Cyan và ngôi sao vệ tinh kích thích ghi nhớ chủ động.
- **Tạo Lập Bộ Asset Icon Đa Kích Thước:**
  - Nâng cấp `generate_icons.js` với bộ render khử răng cưa đa mẫu subpixel (4x4 = 16 mẫu/pixel), tạo ra các file PNG siêu sắc nét: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png` cùng vector gốc `icon.svg`.
- **Đồng Bộ Nhận Diện Thương Hiệu Ở Mọi Nơi:**
  - **Trang Cài Đặt (`options/options.html`):** Thay thế icon chữ P đơn điệu bằng biểu tượng thương hiệu vector 38px sắc nét, có hiệu ứng zoom vi mô khi hover.
  - **Popup Tiện Ích (`popup/popup.html`):** Thay thế biểu tượng tam giác cảnh báo bằng badge thương hiệu vector 24px cao cấp, đồng bộ phiên bản `Anki AI Vocab v3.3`.
  - Cập nhật tài liệu thiết kế `DESIGN.md` (Mục 8).

---

## [3.3.2] - 2026-10-24

### 🎯 Sửa Triệt Để Vị Trí Nút Bấm "Explain" & Khóa Chiều Mở Xuống Phía Dưới Của Popover
- **Sửa Vị Trí Nút Quick Trigger ("✨ Explain"):**
  - Khắc phục lỗi nút tooltip "Explain" xuất hiện ở phía trên từ (`rect.top + scrollY - 34`) sau khi bôi đen văn bản.
  - Chuyển sang vị trí chuẩn nằm ngay **phía dưới từ** (`rect.bottom + scrollY + 8`), căn giữa theo chiều ngang của vùng bôi đen, chỉ lật lên trên nếu mép dưới viewport sát viền màn hình (`spaceBelow < 40px`).
- **Hạ Ngưỡng Kiểm Tra Collision Của Popover Chính:**
  - Thay vì ngưỡng quá rộng `320px` (khiến mọi từ nằm ở nửa dưới màn hình bị lật ngược lên trên), điều chỉnh ngưỡng thành `160px` kết hợp `spaceAbove > 260px`.
  - Popover luôn mở tự nhiên xuống dưới từ (`top = targetRect.bottom + scrollY + 8`) trong hầu hết mọi ngữ cảnh đọc văn bản thông thường.
- **Duy Trì Vị Trí Ổn Định Khi Tải Dữ Liệu:**
  - Khi nội dung AI tải xong (`renderPopoverLoadedData`), hệ thống giữ nguyên tọa độ đỉnh (`targetRect.bottom + scrollY + 8`) để popover mở rộng xuống dưới mượt mà, không bị nhảy ngược lên trên.

---

## [3.3.1] - 2026-10-24

### 📐 Đồng Bộ Kích Thước Typography (Word & Phonetic IPA), Downward Positioning & Chuẩn Font Sans-Serif
- **Đồng Bộ Typography Visual Harmony (Từ Vựng & Phiên Âm IPA):**
  - **Hàng 1 (Word + POS Badge):** Từ vựng kích thước chuẩn `19px !important` (`font-weight: 700 !important`, `letter-spacing: -0.02em`, `color: #FAFAFA !important`, `line-height: 1.2`). Badge từ loại `font-size: 11px !important`, `font-weight: 600 !important`, `padding: 2px 7px`, bo tròn 4px, cách từ vựng `gap: 12px` và `margin-bottom: 2px`.
  - **Hàng 2 (Phonetic IPA):** Kích thước phiên âm được nâng lên `17px !important` (`font-weight: 500 !important`, `color: #A1A1AA !important`, `letter-spacing: 0.01em`, `line-height: 1.2`), tương đương và hài hòa với kích thước 19px của từ gốc, loại bỏ hoàn toàn sự mất cân đối thị giác.
  - Khoảng cách trên: `margin-top: 2px; margin-bottom: 12px;`.
- **Ép Chặt Font Modern Sans-Serif Trên Toàn Bộ Shadow DOM:**
  - Áp dụng triệt để font không chân: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif !important` kết hợp `-webkit-font-smoothing: antialiased` trên `:host, .popover-container, *`.
- **Đảm Bảo Positioning Ưu Tiên Mở Xuống Dưới (Downward Orientation):**
  - **Floating Popover:** Luôn ưu tiên hiển thị ngay phía dưới vùng bôi đen (`top = targetRect.bottom + window.scrollY + 8`). Chỉ lật lên trên nếu mép dưới viewport còn trống `< 320px` và phía trên rộng hơn.
  - **Dropdown Menu Chọn Deck:** Thiết lập cố định `top: calc(100% + 6px) !important; bottom: auto !important; left: 0 !important;` giúp menu danh sách deck luôn trượt xuống phía dưới trigger button một cách tự nhiên.
- **Đồng Bộ Hệ Thống:**
  - Đồng bộ đầy đủ các class `.header-row`, `.word-text`, `.pos-badge`, `.header-row-2`, `.phonetic-text`, `.deck-menu` và các class kế thừa `.anki-*` trong `content/content.css`, `content/content.js`, `content/popover-ui.js`, và `content/position-calculator.js`.

---

## [3.3.0] - 2026-10-24

### 🎨 Tái Cấu Trúc Typography 2 Hàng, Badge Màu Pastel Dịu Mắt, Custom Floating Deck Menu & Sửa Lỗi Thẻ AI Provider
- **Tái Cấu Trúc Header Popover Thành 2 Hàng Độc Lập:**
  - Chấm dứt tình trạng dồn cục trên 1 hàng ngang chen chúc.
  - **Hàng 1:** Từ vựng `word` (19px, đậm `font-weight: 700`) đặt cạnh badge từ loại `part of speech` với khoảng cách `8px`, căn giữa theo chiều dọc.
  - **Hàng 2:** Phiên âm IPA `phonetic` nằm ngay phía dưới Hàng 1, định dạng chuẩn `/ phonetic /` với màu xám dịu mắt (`#A1A1AA`), kích thước 13px và khoảng cách trên `margin-top: 3px-4px`.
  - Cụm nút công cụ góc phải (Loa phát âm, Hoàn tác/Reset, Nút đóng `×`) giữ cố định ở góc trên bên phải.
- **Hệ Thống Badge Màu Pastel Muted Theo Từng Loại Từ (Part of Speech):**
  - **Verb (Động từ):** Nền xanh lam nhạt dịu (`rgba(59, 130, 246, 0.12)` / `#EFF6FF`), chữ xanh lam sáng (`#60A5FA` / `#2563EB`), viền mảnh `rgba(59, 130, 246, 0.22)`.
  - **Noun (Danh từ):** Nền tím chàm dịu (`rgba(99, 102, 241, 0.12)` / `#EEF2FF`), chữ tím indigo (`#818CF8` / `#4F46E5`).
  - **Adjective (Tính từ):** Nền xanh ngọc / bạc hà (`rgba(16, 185, 129, 0.12)` / `#ECFDF5`), chữ ngọc mint (`#34D399` / `#059669`).
  - **Adverb / Other (Trạng từ & Khác):** Nền cam hổ phách (`rgba(245, 158, 11, 0.12)` / `#FFFBEB`), chữ cam ấm (`#FBBF24` / `#D97706`).
  - Tự động nhận diện và cập nhật màu badge ngay trong lúc người dùng chỉnh sửa inline từ loại.
- **Bộ Chọn Target Deck Dạng Custom Floating Dropdown Menu:**
  - Thay thế thẻ `<select>` mặc định của trình duyệt bằng custom dropdown nổi hiện đại chuẩn Shadcn UI.
  - Nút trigger màu xám sẫm `#18181B`, viền `1px solid #27272A`, bo góc 6px, icon thư mục Folder 14px bên trái, tên deck ở giữa và mũi tên Chevron 12px bên phải.
  - Menu nổi (`#anki-deck-menu`) mở hướng lên trên (`bottom: calc(100% + 6px)`), nền `#121215`, đổ bóng `0 10px 25px rgba(0,0,0,0.55)`, giới hạn chiều cao tối đa 180px với thanh cuộn mỏng, mục được chọn có icon checkmark `✓`.
  - Tự động đóng menu khi chọn mục hoặc khi click ra ngoài dropdown.
- **Sửa Triệt Để Lỗi Thẻ AI Provider Bị Trắng Xóa trong Options (Dark Mode):**
  - Loại bỏ hoàn toàn nền trắng xóa chói lóa (`bg-white`) khi chọn provider trong Dark Mode.
  - Khi chưa chọn: Nền xám `#18181B`, viền `1px solid #27272A`, tiêu đề xám Zinc-400 `#A1A1AA`.
  - Khi được chọn: Nền xám đen tinh tế `#202026`, viền trắng mảnh sắc nét `1px solid #FAFAFA` kết hợp outer ring `0 0 0 1px rgba(250, 250, 250, 0.15)`, tiêu đề trắng sáng `#FAFAFA` (`font-weight: 600`).
  - Badge "Recommended" của Gemini được thiết kế dạng pill xanh ngọc dịu mắt (`rgba(16, 185, 129, 0.12)` / `#34D399`).

---

## [3.2.0] - 2026-10-24

### 🎯 Tối Giản Layout Options 1 Cột, Chuẩn Hóa 100% Tiếng Anh, Bổ Sung Deck Picker & Nâng Cấp Typography
- **Xóa Bỏ Hoàn Toàn Sidebar Dọc trong Trang Options:**
  - Loại bỏ hoàn toàn thanh `<aside class="app-sidebar">` chiếm dụng diện tích, chuyển sang layout **Single Column centered (`max-width: 680px`, `margin: 0 auto`, `padding: 40px 20px 120px`)** sạch sẽ, tinh gọn như các trang cài đặt hiện đại (Linear / Vercel Settings).
  - Trình bày cài đặt dạng cuộn liền mạch với 3 Section chính được phân định bằng viền mảnh `1px solid var(--border-hairline)`:
    - **Section 1: AI Provider:** Chọn nhà cung cấp (Gemini / OpenAI / Custom), Target Language, Tags, API Key với nút ẩn/hiện mắt SVG, chọn Model Gemini/OpenAI, nút Test API Key inline.
    - **Section 2: Anki Configuration:** AnkiConnect URL, API Key, Target Deck (kèm nút Refresh), Target Note Type, nút kiểm tra kết nối Anki, hộp cấu hình CORS có nút sao chép JSON, bảng ánh xạ trường (Card Field Mapping).
    - **Section 3: Preferences & Performance:** Sliders tinh chỉnh token budget và auto-dismiss timer, 3 công tắc toggle (Quick Add, Auto-Pronounce, Auto-Close), System Prompt tùy chỉnh và nút Reset Prompt.
  - Đặt viên thuốc chuyển đổi giao diện Sun ☀️ / Moon 🌙 ngay trên Header chính.
  - Giữ lại thanh lưu trạng thái nổi (Sticky Bottom Bar) căn giữa 680px với nút "Save Changes" và chấm trạng thái trực quan.
- **Chuẩn Hóa 100% Tiếng Anh (English Only System-Wide):**
  - Chuyển đổi toàn bộ ngôn ngữ trên Extension sang tiếng Anh ngắn gọn, tự nhiên và chuyên nghiệp:
    - Trang Options: tiêu đề, phụ đề, nhãn input, placeholder, tooltip, thông báo lưu, chip trạng thái.
    - Toolbar Popup: "Manual Lookup", "Look up with AI", "AnkiConnect Online", "Checking...", "Settings".
    - Floating Popover: "Click to edit word", "Listen pronunciation", "Reset to original AI content", "Close (Esc)", "+ Add to Anki", "Adding...", "Added".
    - Hệ thống thông báo lỗi & Backend services: "Unable to connect to AnkiConnect", "Request timed out", "Invalid JSON response from AI", "API rate limit reached".
    - Cập nhật trường `description` trong `manifest.json`.
- **Bổ Sung Bộ Chọn Target Deck Trực Tiếp Trên Popover Tra Từ:**
  - Bố trí bộ chọn `<select class="anki-deck-select" id="anki-popover-deck-select">` gọn gàng ngay tại chân trang (footer) của Popover tra từ bên cạnh nút "+ Add to Anki".
  - Hiển thị danh sách các bộ bài hiện có từ Anki (`config.availableDecks`), mặc định chọn bộ bài hiện hành.
  - Khi người dùng đổi bộ bài trên Popover và bấm "Add to Anki", extension sẽ gửi `targetDeck` được chọn sang background worker để lưu đúng bộ bài đó, đồng thời tự động lưu lại làm deck mặc định cho các lần tra tiếp theo.
- **Nâng Cấp Độ Rõ Nét & Kích Thước Typography:**
  - Chuẩn hóa typography không chân hiện đại: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`.
  - Tăng độ rộng Popover từ `340px` lên `375px` (`POPOVER_WIDTH = 375`) giúp nội dung hiển thị thoáng đãng, không bị chèn ép.
  - Cỡ chữ từ vựng mục tiêu: **19px, font-weight: 700**, sắc nét, nổi bật.
  - Phiên âm IPA: **13px monospace**, Part of speech badge: **11.5px bold**.
  - Nghĩa tiếng Việt ngữ cảnh: **15px, font-weight: 600, line-height: 1.5**, dễ đọc vượt trội.
  - Định nghĩa Anh ngữ: **13.5px, line-height: 1.5**, màu xám trung tính có độ tương phản cao.
  - Câu ngữ cảnh trích xuất: **13.5px, line-height: 1.6**, bố trí trong khung hộp riêng biệt với viền trái 2px và padding rộng rãi (`padding: 8px 12px`).
  - Toàn bộ các trường inline editable duy trì kích thước chữ đồng nhất (`font-size: inherit`), loại bỏ hoàn toàn hiện tượng layout jump hoặc zoom trang web khi click chỉnh sửa.

---

## [3.1.0] - 2026-10-24

### 🎴 Tái Thiết Kế Thẻ Anki Theo Phong Cách Prettify / Minimalist & Nút Âm Thanh Tối Giản
- **Phong Cách Thẻ Prettify / Minimalist:**
  - Card dạng hộp nổi (Floating Card) bo góc 12px, nền trắng tinh tế trên nền bàn học xám nhạt (`#CFD6DC` Light / `#111216` Dark), đổ bóng dịu nhẹ.
  - Tên bộ bài hiển thị dưới dạng breadcrumb tối giản ở đầu thẻ (`{{Deck}}`).
  - Phân tách mặt trước và mặt sau bằng **vạch kẻ nét đứt siêu mảnh (`1px dashed #D1D5DB`)** đúng như ảnh mẫu.
- **Đảo Thứ Tự: Nghĩa Của Từ Lên Trước Ngữ Cảnh (Meaning First, Context After):**
  - Mặt sau hiển thị ngay nghĩa tiếng Việt (`{{Meaning}}`) với cỡ chữ 17.5px đậm nét, dễ nhớ ngay dưới vạch nét đứt.
  - Định nghĩa tiếng Anh (`{{DefinitionEN}}`) nằm phụ đề bên dưới nghĩa tiếng Việt.
  - Câu ngữ cảnh (`{{ContextSentence}}`) và bản dịch (`{{ContextTranslation}}`) được bố trí ở phía dưới nghĩa của từ với từ khóa được bôi đậm gạch chân tinh tế.
- **Tái Thiết Kế Nút Phát Âm Thanh Siêu Tối Giản:**
  - Override toàn diện `.replay-button` và `.soundLink` trong Anki: Thay thế nút xanh to mặc định bằng nút tròn nhỏ gọn `26px x 26px`, nền xám nhạt trung tính `#F3F4F6` (Light) / `#22232E` (Dark), viền mảnh 1px và icon vector SVG thanh thoát.
  - Đồng bộ hóa nút loa phát âm thanh tối giản trên cả Floating Popover (`content/content.js`, `popover-ui.js`, `content.css`) và Popup (`popup/popup.js`, `popup.css`).
- **Đồng Bộ Hóa Note Type & Fallback Mapping:**
  - Cập nhật toàn diện `ANKI_TEMPLATE.md` với Front Template, Back Template, CSS Styling và hướng dẫn cài đặt 3 bước.
  - Đồng bộ `DEFAULT_CONFIG.fieldMappings.Basic` trong `background/config.js` và hàm fallback trong `background/anki-service.js` để thẻ Basic cũng tự động nhận diện bố cục vạch nét đứt và nghĩa đặt trước ngữ cảnh.

---

## [3.0.0] - 2026-10-24

### 💎 Tái Thiết Kế Toàn Bộ UI/UX Theo Cấu Trúc PeakPlanner & Hỗ Trợ Light/Dark Mode
- **Kiến Trúc Giao Diện PeakPlanner Mới Hoàn Toàn (Sidebar + Main Content Layout):**
  - **Left Sidebar cố định (`250px`):** Thiết kế thanh điều hướng cố định bên trái mang đậm phong cách ứng dụng SaaS cao cấp (PeakPlanner):
    - App Logo với huy hiệu hình học trắng đen sắc nét và tiêu đề **AnkiVocab**.
    - Card chọn bộ bài / Workspace (`.workspace-card`) với avatar chuyển sắc và tên bộ bài Anki đang hoạt động.
    - Danh mục điều hướng trực quan với các huy hiệu đếm màu sắc (Huy hiệu đỏ "Tra cứu 4", Huy hiệu xanh "Bộ bài Anki 1", "Settings" kích hoạt thẻ viền nổi bật).
    - Thẻ hồ sơ Anki Desktop hiển thị chấm trạng thái thời gian thực (Xanh = Online, Đỏ = Offline).
    - **Theme Switcher Capsule:** Viên thuốc chuyển đổi chế độ Sáng / Tối tích hợp biểu tượng Mặt trời ☀️ và Mặt trăng 🌙, hỗ trợ chuyển đổi mượt mà và lưu vào bộ nhớ trình duyệt `chrome.storage.sync`.
  - **Main Content Area Đẳng Cấp:**
    - Tiêu đề **Settings** lớn (26px) với phụ đề xám trang nhã.
    - Thanh Sub-navigation dạng **Pill Tabs** (`rounded-full`) nằm ngang, cho phép chuyển đổi nhanh và cuộn mượt (smooth-scroll) đến từng nhóm cấu hình: Account & AI, AnkiConnect, Performance, Card Fields, Preferences, Prompt.
    - **Split-Row 2-Cột:** Mỗi section được chia làm 2 cột rõ rệt: Cột trái gồm Tiêu đề, mô tả và liên kết trợ giúp; Cột phải gồm các form controls, ngăn cách bởi đường viền hairline 1px siêu mảnh.
- **Controls & Tương Tác Hiện Đại (Interactive Polish):**
  - **Electric Focus Rings (`#3B82F6`):** Vòng hào quang xanh dương điện tử rực rỡ khi focus vào các ô nhập liệu (API Key, Target Language, Tags...).
  - **Custom Range Sliders (Motivation & Performance Setup):** Thiết kế thanh trượt tùy chỉnh cho phép điều chỉnh ngân sách token đầu ra (150 - 800 tokens) và thời gian tự động đóng Popover (0.6s - 3.0s) với núm trượt tròn và chip hiển thị giá trị trực tiếp (`250 tokens`, `1.4s`).
  - **Shadcn Switch Sliders:** Bộ công tắc gạt toggle mượt mà cho các tính năng Quick Add, Auto Pronounce và Auto Close.
  - **Sticky Action Bar:** Thanh lưu trữ cố định dưới đáy màn hình với trạng thái sẵn sàng và nút bấm "Lưu cài đặt" độ tương phản cao.
- **Đồng Bộ Hóa Toàn Diện Cho Toàn Bộ Extension (Popup & Popover):**
  - **Extension Toolbar Popup (`popup/`):** Tái thiết kế toàn bộ theo phong cách PeakPlanner, bổ sung thanh chuyển đổi theme Sun/Moon ngay trên header, Vercel-style status cards, và các ô tra từ vựng có viền focus xanh điện tử.
  - **Floating Popover (`content/`):** Shadow DOM được cấu hình để tự động lắng nghe và áp dụng thuộc tính `data-theme="dark"` / `data-theme="light"` từ cài đặt của người dùng theo thời gian thực.

---

## [2.3.0] - 2026-10-24

### 🚀 Khắc Phục Khẩn Cấp Lỗi `$ is not defined` & Nút "Add to Anki" Treo Vô Tận
- **Khắc Phục Triệt Để `ReferenceError: $ is not defined`:**
  - Xác định chính xác nguyên nhân: Chuỗi regex xóa ký tự gạch chéo đầu cuối trong `content/content.js:366` bị thiếu escape `|/+$/g`, khiến JavaScript parse cụm `+ $ / g` thành phép toán với định danh chưa khai báo `$`.
  - Chuẩn hóa thành biểu thức regex duy nhất và an toàn: `.replace(/^[\/\[\s]+|[\/\]\s]+$/g, '').trim()`, áp dụng đồng nhất cho cả `content/content.js` và `content/popover-ui.js`.
  - Khai báo bổ sung bộ DOM helpers chuẩn Vanilla JS ở đầu `content/content.js`:
    ```javascript
    const $ = (selector, context = shadowRoot || document) => (context?.querySelector ? context.querySelector(selector) : null);
    const $$ = (selector, context = shadowRoot || document) => (context?.querySelectorAll ? context.querySelectorAll(selector) : []);
    ```
- **Xử Lý Triệt Để Nút "Add to Anki" Bị Kẹt Loading Spinner Vô Tận:**
  - **Client-side Watchdog Timer (7 Giây):** Tích hợp bộ đếm giờ giám sát 7s trong `handleAddToAnki` (`content/content.js`) và `popup/popup.js`. Nếu background script hoặc AnkiConnect không phản hồi trong 7 giây, hệ thống tự động tắt spinner, mở khóa lại nút bấm, chuyển về nút "Thử lại" và hiển thị thông báo lỗi rõ ràng bên trong Popover.
  - **Try/Catch Bọc Toàn Bộ Luồng Trích Xuất Dữ Liệu:** Bọc kín hàm `getEditedCardData` và logic khởi tạo dữ liệu thẻ bằng `try...catch`, bảo đảm mọi ngoại lệ phát sinh trong quá trình đọc DOM đều được bắt giữ và lập tức mở khóa nút bấm.
  - **Tích Hợp `AbortController` (5 Giây) Cho `ankiInvoke`:** Toàn bộ request gửi đến AnkiConnect tại `background/anki-service.js` hiện được bảo vệ bằng timeout 5 giây, triệt tiêu nguy cơ Promise treo vĩnh viễn khi Anki Desktop bị đơ hoặc add-on AnkiConnect bị treo.
  - **Non-blocking Audio Fetch Với Timeout Riêng Biệt (3 Giây):** Tác vụ tải file âm thanh phát âm `storeMediaFile` được gán timeout độc lập 3 giây và khối try/catch cách ly. Dù kết nối đến máy chủ từ điển Youdao bị chậm hay mất mạng, quá trình tạo thẻ Anki (`addNote`) vẫn lập tức tiếp tục mà không hề bị gián đoạn hay nghẽn luồng.

---

## [2.2.0] - 2026-10-24

### 🛠️ Khắc Phục Triệt Để 5 Lỗi Console, Lỗi Context Trùng Tiếng Việt & Audio Phát Âm
- **Khắc Phục Lỗi Trùng Ngữ Cảnh Tiếng Việt Trong Anki:**
  - Tách biệt hoàn toàn câu tiếng Anh gốc (`ContextSentence`) và bản dịch tiếng Việt (`ContextTranslation`) trong `background/ai-service.js` `normalizeSchema`: Câu tiếng Anh trích xuất từ web không còn bị ghi đè bởi trường dịch tiếng Việt `example_vi`.
  - Trên mặt trước/Context thẻ Anki: Luôn hiển thị câu tiếng Anh gốc và bôi đậm từ mục tiêu bằng `<b>word</b>`.
  - Trên mặt sau: Hiển thị nghĩa tiếng Việt nổi bật và bản dịch tiếng Việt của câu ngữ cảnh.
- **Tự Động Tải & Lưu Trữ Audio Phát Âm Vào Anki (`storeMediaFile`):**
  - Tích hợp gọi action `storeMediaFile` của AnkiConnect tải file phát âm từ điển chuẩn (`https://dict.youdao.com/dictvoice?audio=${word}&type=2`).
  - Tự động gắn thẻ `[sound:vocab_${cleanWord}.mp3]` vào trường `Audio` của thẻ Anki, giúp thẻ phát âm tự động khi lật thẻ.
- **Sửa Lỗi `attachShadow` Khi Bôi Đen Nhiều Lần:**
  - Thay thế lệnh gọi `.attachShadow()` cưỡng bức bằng `host.shadowRoot || host.attachShadow({ mode: "open" })`, loại bỏ hoàn toàn lỗi *"Shadow root cannot be created on a host which already hosts a shadow tree"*.
- **Sửa Lỗi CSP / Cross-Origin Iframe Trên YouTube:**
  - Inline CSS trực tiếp dưới dạng thẻ `<style id="anki-vocab-inlined-styles">` bên trong Shadow DOM, loại bỏ hoàn toàn việc inject `<link rel="stylesheet">` gọi `chrome.runtime.getURL('content/content.css')`.
  - Bổ sung cấu hình `"all_frames": false` trong `manifest.json` và `chrome.scripting.executeScript` trong `background.js`, ngăn extension inject lộn xộn vào các iframe ẩn/quảng cáo của YouTube.
- **Sửa Lỗi `Extension context invalidated`:**
  - Xây dựng hàm bọc an toàn `safeSendMessage()` với cơ chế kiểm tra `chrome.runtime?.id` và try/catch bảo vệ, loại bỏ triệt để các uncaught exception khi người dùng reload extension mà chưa refresh trang web.

---

## [2.1.0] - 2026-10-24

### ✏️ Tính Năng Chỉnh Sửa Trực Tiếp Trên Popover (Inline Editing & Live Anki Sync)
- **Hỗ Trợ Inline Editing Toàn Diện:**
  - Chuyển đổi các trường thông tin trên Popover (`word`, `phonetic`, `pos`, `meaning_vi`, `definition_en`, `example_sentence`, `example_translation`) thành vùng chỉnh sửa nội dung (`contenteditable="true"`).
  - Trạng thái Focus tinh tế (`box-shadow: 0 0 0 1px var(--text-muted)`) kết hợp kỹ thuật bù lề âm (`padding: 1px 4px; margin: -1px -4px;`) đảm bảo 0% giật layout hoặc xô lệch kích thước Popover khi người dùng tương tác.
  - Tự động chặn ngắt dòng trên các trường 1 dòng (`word`, `phonetic`, `pos`) khi nhấn `Enter` và tự động lọc định dạng HTML rườm rà khi dán văn bản (Paste as plain text).
- **Thu Thập Dữ Liệu Thực Tế Khi Thêm Vào Anki (Live DOM Extraction):**
  - Hàm `handleAddToAnki` và `getEditedCardData` đọc trực tiếp giá trị text đang hiển thị trên giao diện (sau khi người dùng đã chỉnh sửa thủ công), thay vì gửi dữ liệu thô ban đầu của AI.
  - Tự động làm sạch các dấu ngoặc vuông `[...]` hoặc gạch chéo `/.../` trong trường phiên âm nếu người dùng chỉnh sửa.
  - Bộ phát âm âm thanh (Audio Web Speech API) tự động đọc theo từ vựng mới sau khi chỉnh sửa.
- **Nút Hoàn Tác / Khôi Phục Dữ Liệu Gốc AI (Undo/Reset Button):**
  - Tích hợp nút icon SVG "Hoàn tác" (`#anki-btn-reset`) cạnh nút phát âm và nút đóng trên header Popover.
  - Lưu trữ bản sao dữ liệu nguyên bản từ AI (`_originalAiData`), cho phép người dùng hoàn tác và khôi phục lại toàn bộ kết quả phân tích ban đầu chỉ với 1 cú click chuột.
- **Tối Ưu Trải Nghiệm Bàn Phím (Keyboard UX):**
  - Khi đang chỉnh sửa trong một trường editable, nhấn phím `Escape` sẽ blur trường đó trước, bảo vệ người dùng không bị đóng nhầm cả Popover khi đang gõ.

---

## [2.0.0] - 2026-10-23

### 🎨 Đặc Tả & Thiết Kế Mẫu Anki Note Type Chuẩn UI/UX Pro Max (`ANKI_TEMPLATE.md`)
- **Khởi tạo Tài Liệu `ANKI_TEMPLATE.md`:**
  - Hướng dẫn chi tiết từng bước tạo Note Type `Anki AI Vocab` trong Anki Desktop.
  - Định nghĩa chuẩn 8 fields: `Word`, `Phonetic`, `PartOfSpeech`, `Meaning`, `DefinitionEN`, `ContextSentence`, `ContextTranslation`, `Audio`.
  - Cung cấp toàn bộ mã nguồn **Front Template**, **Back Template**, và **CSS Styling** tối giản hiện đại (Shadcn UI style).
- **Thiết Kế Thẻ Mặt Trước (Front Template):**
  - Trình bày từ vựng dạng typography sắc nét (26px, font-weight 700), phiên âm IPA màu xám trung tính trong ngoặc vuông, badge từ loại viền mỏng thanh thoát.
  - Tự động bôi đậm từ khóa mục tiêu (`<b>...</b>`) trong câu ngữ cảnh với gạch chân tinh tế.
- **Thiết Kế Thẻ Mặt Sau (Back Template):**
  - Giữ nguyên header mặt trước để bảo toàn sự tập trung và ngữ cảnh của người học.
  - Phân vùng bằng vạch kẻ mỏng 1px sắc nét (`border-zinc-200` Light / `border-zinc-800` Dark).
  - Nghĩa tiếng Việt nổi bật nhất (18px, font-weight 600), định nghĩa tiếng Anh phụ đề và bản dịch câu ngữ cảnh in nghiêng bên dưới.
- **Bảng Kiểu Dáng CSS Đa Nền Tảng (Cross-Platform Responsive):**
  - Tự động thích ứng hoàn hảo cho cả Light Mode và Dark Mode (`.nightMode`) trên Anki Desktop, AnkiMobile (iOS), AnkiDroid (Android) và AnkiWeb.
  - Sử dụng typography hệ thống không chân (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`), không dùng bóng đổ nặng hay gradient lòe loẹt, bo góc nhẹ nhàng 8px.
- **Đồng Bộ Hóa Toàn Diện Field Mapping Trong Extension:**
  - Cập nhật `background/anki-service.js`: Mở rộng `dataForInterpolation` hỗ trợ cả 8 tên trường viết hoa/thường, tự động bôi đậm từ khóa trong câu ví dụ (`highlightWordInSentence`), và sắp xếp thứ tự nhận diện `translation` trước `context/sentence` để chống xung đột tên trường.
  - Cập nhật `background/config.js`: Khởi tạo cấu hình ánh xạ mặc định cho Note Type `Anki AI Vocab` trong `DEFAULT_CONFIG.fieldMappings`.
  - Cập nhật `options/options.js`: Tự động nhận diện và gán chính xác từng trường khi người dùng chọn Note Type `Anki AI Vocab`.
  - Cập nhật `content/content.js` & `popup/popup.js`: Làm giàu dữ liệu `cardData` gửi kèm câu ngữ cảnh thực tế trước khi thêm vào Anki.

---

## [1.9.0] - 2026-10-23

### ⚡ Điều Chỉnh Timeout & Đề Xuất Mô Hình Siêu Tốc (gemini-2.5-flash 0.4s)
- **Nâng Timeout Lên 14 Giây (Watchdog 16 Giây):**
  - Khắc phục tình trạng các model thế hệ 3.x phản hồi ở giây thứ 7–8 bị ngắt đột ngột bởi bộ đếm 7s cũ.
- **Áp Chế Chuỗi Suy Nghĩ Bằng System Prompt:**
  - Bổ sung chỉ dẫn đanh thép: *"Tuyệt đối không suy nghĩ nội tâm hay giải thích dài dòng. Trả về trực tiếp JSON schema"* giúp model cắt giảm thời gian reasoning.
- **Khuyến Nghị Mô Hình `gemini-2.5-flash` Cho Tốc Độ Cực Đại:**
  - `gemini-2.5-flash` hỗ trợ tắt 100% chế độ suy nghĩ bằng `thinkingBudget: 0`, cho tốc độ phản hồi thực tế từ 0.3s - 0.5s.

---

## [1.8.0] - 2026-10-23

### 🛡️ Bóc Tách JSON Đa Phần Thông Minh & Sửa Lỗi "Không Tìm Thấy Khối JSON"
- **Bộ Quét Part Thông Minh (`extractJsonFromParts`):**
  - Khắc phục triệt để lỗi model trả về nhiều parts trong đó part đầu là chuỗi suy nghĩ (Thinking text). Hàm mới quét chính xác từ cuối lên đầu tìm part có chứa cặp ngoặc `{...}` của JSON, không bao giờ nhầm lẫn với part tư duy.
- **Nâng Giới Hạn `maxOutputTokens: 800`:**
  - Ngăn ngừa tình trạng token suy nghĩ chiếm dụng dung lượng làm đứt ngang chuỗi JSON (khiến thiếu dấu ngoặc đóng `}`).
- **Khả Năng Tự Sửa Chữa JSON Bị Cắt Cụt:**
  - Bổ sung cơ chế tự động bù dấu ngoặc đóng và fallback trích xuất dữ liệu bằng Regex nếu JSON bị thiếu dấu đóng.

---

## [1.7.0] - 2026-10-23

### 🛠️ Sửa Lỗi HTTP 400 Thinking Level & Cơ Chế Tự Phục Hồi (Self-Healing)
- **Chuẩn hóa Thinking Level (`thinkingLevel: "LOW"`):**
  - Chuyển đổi từ `MINIMAL` sang `LOW` cho dòng Gemini 3.x (`gemini-3.5-flash-lite`, `gemini-3.8-flash`), khắc phục triệt để thông báo lỗi `Thinking level MINIMAL is not supported for this model`.
- **Cơ chế Tự phục hồi Tức thì (Self-Healing Retry):**
  - Trong trường hợp Google API từ chối bất kỳ thông số `thinkingConfig` nào (HTTP 400), extension sẽ tự động loại bỏ trường `thinkingConfig` và gửi lại request ngay lập tức trong 200ms mà không làm gián đoạn người dùng.
- **Đồng bộ hóa Trạng thái Kiểm tra Key (`testAIConnection`):**
  - Nâng cấp nút "Kiểm tra API Key" để tự động fallback và kiểm tra độ trễ thành công trên mọi biến thể model Gemini.

---

## [1.6.0] - 2026-10-23

### ⚡ Bộ nhớ đệm Tức thời (Instant Cache) & Client Watchdog Timer
- **Bộ nhớ đệm Kép (Dual Cache Engine):**
  - Tích hợp bộ nhớ RAM siêu tốc (`Map`) và bộ lưu trữ cục bộ (`chrome.storage.local`).
  - Khi tra cứu lại các từ đã tra hoặc cùng một cụm từ, extension trả về kết quả ngay lập tức trong **0ms** mà không tốn bất kỳ lượt gọi API hay quota mạng nào.
- **Tự động Thích ứng Thinking Config (`getThinkingConfig`):**
  - Với thế hệ Gemini 3.x (`gemini-3.5-flash-lite`, `gemini-3.8-flash`), áp dụng đúng chuẩn `thinkingConfig: { thinkingLevel: "minimal" }` thay vì `thinkingBudget: 0`, ngăn chặn model rơi vào chế độ suy nghĩ sâu ngầm.
  - Với thế hệ Gemini 2.5 (`gemini-2.5-flash`), áp dụng `thinkingBudget: 0`.
- **Rút ngắn Timeout Native Fetch xuống 6 Giây:**
  - Giảm thời gian chờ tối đa từ 8s xuống 6s với `AbortController`, fail-fast nhanh hơn khi máy chủ gặp sự cố.
- **Client-Side Safety Watchdog Timer (7.5 Giây):**
  - Bổ sung bộ đếm thời gian an toàn độc lập trong cả `content.js` và `popup.js`. Nếu quá 7.5 giây mà background không hoàn tất phản hồi, giao diện lập tức hủy trạng thái loading và hiển thị thông báo lỗi rõ ràng, chấm dứt hoàn toàn hiện tượng kẹt spinner 5 phút.
- **Bộ nhớ đệm Cấu hình Trong Background (`cachedConfig`):**
  - Tránh việc gọi I/O `chrome.storage.sync` trên mỗi message, giảm thời gian xử lý message xuống 0ms.

---

## [1.5.0] - 2026-10-23

### ⚡ Tối ưu Tốc độ Siêu Tốc (<1s) & Xóa Bỏ Hiện tượng Treo (Bottleneck Fix)
- **Triệt tiêu hoàn toàn "Retry Hell":**
  - Xóa bỏ vòng lặp duyệt qua 4 model kèm hàm `sleep` gây delay hàng phút.
  - Áp dụng nguyên tắc **Fail-Fast**: nếu model chính gặp 429/503, chỉ thử duy nhất 1 lần chuyển sang mô hình dự phòng (`gemini-3.1-flash-lite`) mà không chờ đợi, nếu vẫn lỗi thì phản hồi ngay cho người dùng.
- **Tích hợp `AbortController` Hard-Timeout 8 giây:**
  - Chấm dứt triệt để tình trạng browser `fetch` mặc định treo từ 2 đến 3 phút khi mạng gián đoạn hoặc API quá tải. Sau đúng 8 giây, kết nối lập tức bị hủy và báo lỗi timeout rõ ràng.
- **Kích hoạt Chế độ Constrained Decoding (`responseSchema`):**
  - Khai báo schema có cấu trúc (`type: "OBJECT"`, `properties: { word, phonetic, pos, meaning_vi, definition_en, example_sentence, example_translation, collocations }`).
  - Ép mô hình Gemini Flash sinh raw JSON chuẩn xác theo cú pháp ràng buộc, loại bỏ hoàn toàn chi phí đàm phán định dạng.
- **Khóa Cứng `thinkingBudget: 0` & `maxOutputTokens: 300`:**
  - Tắt 100% Chain-of-Thought (CoT reasoning tokens), ngăn chặn model sinh hàng nghìn token suy nghĩ ngầm.
  - Giới hạn output ở mức 300 tokens, giảm thiểu thời gian stream dữ liệu qua mạng.
- **Ghi nhận Hiệu năng (Performance Logging):**
  - Tích hợp `performance.now()` ghi log độ trễ chính xác dạng `[Timer] Tra từ (gemini-3.5-flash-lite) thành công trong: ...ms`.

---

## [1.4.0] - 2026-10-23

### 💎 Chuẩn hóa Toàn diện UI/UX (UI/UX Pro Max Standard)
- **Thiết kế lại Toàn diện Extension Popup (`popup/`):**
  - Đồng bộ hóa 100% sang bảng màu Zinc chuẩn mực (`#FFFFFF` Light / `#09090B` Dark, không còn nền xanh tím hay gradient tím-hồng).
  - Header thương hiệu phẳng: Huy hiệu chữ `A` vuông vức, version tag `v1.0.0`, nút cài đặt icon bánh răng SVG tinh tế.
  - Vercel-style Status Grid: 2 card hiển thị trạng thái kết nối AnkiConnect và Model AI với chấm trạng thái sống động (🟢 Online, 🔴 Lỗi, 🟡 Đang kiểm tra).
  - Hỗ trợ phím tắt `Enter` trên cả 2 ô input (từ vựng và ngữ cảnh) để kích hoạt tra cứu tức thì.
  - Nút tra cứu có trạng thái loading spinner thanh thoát, không giật màn hình.
  - Thẻ kết quả tra cứu: Phân cấp rõ ràng (Từ gốc, IPA, POS badge), tích hợp nút loa phát âm âm thanh giọng chuẩn qua Web Speech API.
  - Nút thêm vào Anki trực tiếp hiển thị tên Deck mục tiêu, phản hồi checkmark xanh tức thì khi lưu thành công.
- **Loại bỏ 100% Emoji theo Tiêu chuẩn UI/UX Chuyên nghiệp:**
  - Thay thế toàn bộ các emoji cấu trúc và chỉ dẫn (`💡`, `⚠️`, `↗`) bằng các biểu tượng vector SVG thuần túy trên toàn bộ Options Page, Extension Popup, và Floating Popover.
- **Bổ sung UI/UX Pro Max Pre-Delivery Checklist vào [`DESIGN.md`](file:///c:/Users/thail/Downloads/Ex/DESIGN.md):**
  - Kiểm định độ tương phản (Contrast Ratio ≥ 4.5:1 WCAG AA) cho cả hai chế độ Light và Dark.
  - Đảm bảo tính khả dụng bàn phím (Keyboard accessibility) và tiêu chuẩn kích thước vùng nhấn (Hit target sizing).

---

## [1.3.0] - 2026-10-23

### 🎨 Tái cấu trúc Toàn bộ Trang Cài đặt (Options UI - Shadcn / Vercel Settings)
- **Chuẩn hóa Design Tokens & Tài liệu Thiết kế (`DESIGN.md`):**
  - Khởi tạo tài liệu đặc tả `DESIGN.md` quy chuẩn hệ thống Design Tokens (bảng màu Zinc cho Light & Dark modes, typography scale 11px–20px, spacing, radius 6px/8px, component specs).
  - Loại bỏ 100% "AI Slop" trên trang Options: bỏ hoàn toàn nền xanh tím đậm, gradient neon, bo góc 12px-24px, và các khối thẻ card lồng card (card-ception).
- **Layout Đơn cột Căn giữa (Single-column Centered):**
  - Chuyển đổi toàn bộ bố cục `options/options.html` sang dạng đơn cột phẳng chuẩn mực (`max-width: 680px`), căn giữa trang.
  - Phân cách các nhóm cấu hình bằng đường kẻ mảnh 1px (`border-t border-zinc-200 dark:border-zinc-800`) thay vì nhét vào các hộp card đóng khung.
- **Header Tối giản & Tinh tế:**
  - Tiêu đề gọn gàng: "Cài đặt" (20px, font-weight 600, `zinc-900` / `zinc-100`).
  - Phụ đề tinh gọn (13px, `zinc-500`).
  - Badge phiên bản nhỏ tinh xảo (`v1.0.0 • Manifest V3`) với viền mỏng 1px và nền `zinc-100` / `zinc-900`.
- **Cấu hình Trí tuệ Nhân tạo (AI Engine):**
  - Bộ chọn nhà cung cấp AI chuyển sang dạng Segmented Control phẳng (Radio pills tinh gọn).
  - Input API Key tích hợp nút con mắt SVG sắc nét (Eye / EyeOff) để ẩn/hiện mật khẩu thay cho nút text "Hiện" cũ.
  - Dropdown chọn mô hình mặc định `gemini-3.5-flash-lite`, kèm thông tin Quota Free nhẹ nhàng dưới dạng callout trung tính.
  - Nút "Kiểm tra API Key" kết hợp huy hiệu trạng thái inline (loading / success checkmark / error badge) ngay cạnh nút, **loại bỏ triệt để modal `alert()` của trình duyệt**.
- **Cấu hình Anki (AnkiConnect):**
  - Chấm tròn trạng thái Vercel-style (🟢 Online, 🔴 Lỗi, 🟡 Đang kiểm tra) hiển thị trực tiếp trên tiêu đề phần.
  - Bộ chọn Bộ bài (Deck) tích hợp nút icon refresh SVG tinh tế.
  - Bảng Ánh xạ trường thẻ (Field Mapping Table) thiết kế phẳng, viền mảnh 1px, select và input vừa khít ô, không gây tràn ngang.
  - Khối hướng dẫn CORS tối giản kèm nút bấm sao chép JSON một chạm.
- **Tùy chọn Trải nghiệm (Preferences) & Switch Toggles:**
  - Triển khai công tắc gạt chuẩn Shadcn UI (`width: 36px`, `height: 20px`, nút trượt tròn 16px chuyển động êm ái).
  - Bổ sung tùy chọn mới: **"Tự động phát âm từ vựng khi mở thẻ tra"** (`autoPronounce`), tích hợp liền mạch với Web Speech API trong content script.
- **Thanh Hành động Đáy Cố định (Sticky Bottom Action Bar):**
  - Nền mờ kính viền mỏng (`backdrop-filter: blur(12px)`).
  - Nút "Lưu cài đặt" chuẩn Shadcn Primary (`bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900`, radius 6px).
  - Thông báo phản hồi lưu cài đặt dạng inline toast tự động mờ dần sau 2 giây một cách nhẹ nhàng.

---

## [1.2.0] - 2026-10-23

### 🎨 Tái thiết kế Giao diện (UI/UX Redesign - Production-Grade Shadcn Style)
- **Loại bỏ triệt để "AI Vibe":**
  - Xóa bỏ nền tím/xanh đen bóng bẩy (`#0B0F19`, `#1E1B4B`), các hiệu ứng neon glow và heavy glassmorphism.
  - Loại bỏ kiến trúc lồng khối "card-ception" với các mảng nền xám xịt dày đặc.
  - Loại bỏ bo góc quá mức (`rounded-2xl`, `rounded-3xl`), chuẩn hóa toàn bộ về góc bo tinh tế `border-radius: 8px` (button `6px`).
- **Áp dụng Bảng Design Tokens chuẩn Shadcn / Zinc Palette:**
  - **Light Mode:** Nền `#FFFFFF`, viền mỏng sắc nét `1px solid #E4E4E7` (Zinc-200), chữ tiêu đề `#09090B` (Zinc-950), chữ phụ `#71717A` (Zinc-500). Nút bấm "Add to Anki" nền đen `#18181B` chữ trắng `#FAFAFA`.
  - **Dark Mode:** Tự động thích ứng `@media (prefers-color-scheme: dark)` với nền `#09090B` (Zinc-950), viền `#27272A` (Zinc-800), chữ `#F4F4F5` (Zinc-100), nút bấm `#FAFAFA` chữ đen `#18181B`.
- **Phân cấp Thông tin bằng Typography (Flat Hierarchy):**
  - Nghĩa tiếng Việt hiển thị phẳng, trực tiếp và thoáng đãng (14px, weight 500), bỏ ký tự mũi tên màu mè `▸`.
  - Định nghĩa tiếng Anh mỏng nhẹ (12.5px Zinc-500).
  - Khối ví dụ (Example) thiết kế dạng trích dẫn tối giản với đường gạch đứng sắc nét `border-left: 2px solid var(--border)`, padding-left 10px, câu tiếng Anh in nghiêng và bản dịch tiếng Việt phía dưới.
  - Nhãn Collocations trình bày dạng văn bản nội dòng tinh tế (11.5px).
- **Trạng thái Tải Shimmer (Skeleton Loader):**
  - Thay thế khối loader cũ bằng các đường skeleton mỏng nhẹ nhấp nháy êm ái (`zinc-100` / `zinc-800`), giữ nguyên form của popover trước khi dữ liệu đổ về.
- **Tối ưu Nút Hành động & Nút Đóng:**
  - Nút "Add to Anki" thu gọn chiều cao 32px, hiển thị spinner thanh mảnh khi lưu và chuyển sang tick xanh tối giản khi lưu thành công.
  - Nút đóng `×` tối giản 14px, không viền, đổi màu êm dịu khi hover.

---

## [1.1.0] - 2026-10-23

### ⚡ Tối ưu Tốc độ & Sửa lỗi Gemini AI Engine
- **Tắt hoàn toàn Thinking Process:** Bổ sung cấu hình `thinkingConfig: { thinkingBudget: 0 }` và `temperature: 0.1` trong `generationConfig`, giảm độ trễ phản hồi từ 3s–8s xuống dưới 0.5 giây.
- **Sửa lỗi `Unexpected token 'W'`:** Lọc bỏ các part suy nghĩ (`thought: true`) trong mảng `candidates[0].content.parts`, chỉ lấy phần dữ liệu JSON thực thi.
- **Bộ lọc JSON siêu bền (`safeParseAIJson`):** Tự động bóc tách `{ ... }`, chuẩn hóa nháy kép property names, dọn dẹp trailing commas và xử lý control characters.
- **Minimal Ping Payload:** Tối ưu hóa nút "Kiểm tra API" (Test API Key) chỉ gửi `{ text: "ping" }` với `maxOutputTokens: 2` và `AbortController` 6 giây, giải quyết triệt để lỗi treo và lỗi 429.
- **Default Model `gemini-3.5-flash-lite`:** Tối ưu quota bản Free (500 RPD, 15 RPM, 250K TPM) và tích hợp cơ chế tự động chuyển dự phòng sang `gemini-3.1-flash-lite`.

---

## [1.0.0] - 2026-10-22

### 🚀 Khởi tạo Hệ thống (Initial Release)
- Kiến trúc Chrome Extension chuẩn Manifest V3.
- Bóc tách từ vựng và câu văn ngữ cảnh xung quanh từ trang web.
- Tích hợp Shadow DOM cô lập 100% CSS.
- Thuật toán Chống va chạm Viewport (Viewport Collision Detection).
- Giao tiếp AnkiConnect HTTP POST cục bộ (`127.0.0.1:8765`), hỗ trợ Dynamic Field Mapping và kiểm tra thẻ trùng lặp.

