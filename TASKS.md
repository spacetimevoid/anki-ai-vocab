# TASKS.md: Kế hoạch Triển khai Chi tiết (Micro-Tasks Checklist)

Kế hoạch chia nhỏ công việc thành các micro-tasks (mỗi task từ 15-30 phút). Quy tắc thực hiện: Chỉ tiến hành code cho từng task một. Hoàn thành task nào thì đánh dấu `[x]` vào file này trước khi chuyển sang task kế tiếp.

---

## Giai đoạn 1: Chuẩn bị & Quản lý Kiến trúc
- [x] **Task 1.1:** Khởi tạo tài liệu kiến trúc tổng thể `ARCHITECTURE.md`.
- [x] **Task 1.2:** Khởi tạo đặc tả kỹ thuật Schema JSON, API & Ma trận xử lý lỗi `SPEC.md`.
- [x] **Task 1.3:** Xây dựng danh sách checklist micro-tasks `TASKS.md`.

---

## Giai đoạn 2: Lõi Xử lý AI & Tối ưu Quota (Background Layer)
- [x] **Task 2.1:** Cập nhật `background/config.js` với các hằng số mô hình mới: Primary `gemini-3.5-flash-lite`, Fallback `gemini-3.1-flash-lite`, và default prompt tối giản token.
- [x] **Task 2.2:** Cải tiến `background/ai-service.js` với cơ chế Exponential Backoff cho mã lỗi HTTP 429 và HTTP 503, tự động chuyển đổi sang mô hình dự phòng `gemini-3.1-flash-lite`.
- [x] **Task 2.3:** Bổ sung bộ lọc JSON siêu bền (Strict JSON Sanitizer), tự động bóc tách markdown blocks và xác thực schema đầu ra.

---

## Giai đoạn 3: Module Tính toán Tọa độ & Chống Va chạm (Collision Engine)
- [x] **Task 3.1:** Xây dựng module `content/position-calculator.js` tính toán vị trí hiển thị dựa trên `getBoundingClientRect()` của vùng bôi đen text.
- [x] **Task 3.2:** Triển khai thuật toán chống tràn viewport (Viewport Collision Detection): Tự động đảo chiều (Flip Up/Down) khi chạm đáy màn hình và ép lề an toàn (Clamp Left/Right).

---

## Giai đoạn 4: Giao diện Compact Floating Popover (Shadow DOM - Không che tab)
- [x] **Task 4.1:** Xây dựng module `content/popover-ui.js` tạo cấu trúc DOM bên trong Shadow Root (`#anki-vocab-floating-popover`). Kích thước cố định width 340px, max-height 450px.
- [x] **Task 4.2:** Tái cấu trúc `content/content.css`: Loại bỏ 100% modal backdrop/overlay toàn màn hình. Thiết kế card nổi bóng đổ nhẹ nhàng, hỗ trợ Dark/Light mode và slim scrollbar.
- [x] **Task 4.3:** Tích hợp bộ lắng nghe sự kiện đóng thông minh: `Escape` keydown, `click outside` (bắt qua `pointerdown` ngoài popover), và nút đóng `×`. Đảm bảo trang web phía sau vẫn cuộn và tương tác bình thường.
- [x] **Task 4.4:** Xây dựng trạng thái hiển thị mượt mà: Skeleton loading shimmer, Header (Word + IPA + POS badge), Content (Nghĩa tiếng Việt theo ngữ cảnh, Định nghĩa Anh ngữ, Câu ví dụ in nghiêng), và Footer.

---

## Giai đoạn 5: Tích hợp AnkiConnect & Đồng bộ Thẻ
- [x] **Task 5.1:** Cập nhật `background/anki-service.js` chuẩn hóa payload `addNote` cho AnkiConnect, hỗ trợ cả `Basic` note type và các Note Type tùy biến nhiều trường.
- [x] **Task 5.2:** Tích hợp nút bấm "Add to Anki" trên popover với trạng thái tương tác phản hồi: Idle ➔ Loading spinner ➔ Success checkmark (tự động đóng popover sau 1.4s) hoặc Error badge.
- [x] **Task 5.3:** Tích hợp bộ phát âm audio tức thời qua Web Speech API (nút loa 🔊 bên cạnh phiên âm IPA).

---

## Giai đoạn 6: Cấu hình Options & Hoàn thiện Hệ thống
- [x] **Task 6.1:** Cập nhật `options/options.html` và `options/options.js`: Bổ sung tùy chọn `gemini-3.5-flash-lite` làm mặc định, hiển thị quota tips và liên kết lấy API key miễn phí.
- [x] **Task 6.2:** Kiểm tra và hoàn thiện `manifest.json` và `background/background.js` (Context Menu & Dynamic Script Injection).
- [x] **Task 6.3:** Kiểm thử toàn diện (Edge Cases): Lỗi 429 quota, Anki chưa bật, click outside, bôi đen sát mép màn hình, cuộn trang web khi popover mở.

---

## Giai đoạn 7: Tái thiết kế Giao diện UI/UX (Production-grade Shadcn Style)
- [x] **Task 7.1:** Cập nhật bảng Design Tokens chuẩn Shadcn/Zinc trong `content/content.css`, loại bỏ gradient neon/glow/tím xanh và card-ception.
- [x] **Task 7.2:** Tái cấu trúc DOM của Popover trong `content/content.js` và `content/popover-ui.js` theo layout tinh gọn phẳng, phân cấp typography.
- [x] **Task 7.3:** Cập nhật tài liệu thiết kế trong `ARCHITECTURE.md` và tạo file `CHANGELOG.md` ghi nhận sự thay đổi giao diện.

---

## Giai đoạn 8: Tái thiết kế Giao diện Options Page (Shadcn UI & Vercel Settings)
- [x] **Task 8.1:** Khởi tạo tài liệu quy chuẩn thiết kế `DESIGN.md` (Anti-AI Slop, Zinc palette Light/Dark, Typography scale, Component specs).
- [x] **Task 8.2:** Tái cấu trúc `options/options.html`: Layout 1 cột căn giữa `max-width: 680px`, header tối giản, segmented control, SVG eye toggle, phân cách bằng `border-t`, loại bỏ triệt để card-ception.
- [x] **Task 8.3:** Tái thiết kế toàn bộ `options/options.css` theo bảng Design Tokens của `DESIGN.md` (Hỗ trợ Light/Dark mode, Vercel status dots, Shadcn switch toggles, sticky action bar).
- [x] **Task 8.4:** Nâng cấp tương tác trong `options/options.js`: Inline status badge (thay thế hoàn toàn `alert()`), icon con mắt SVG ẩn/hiện API Key, inline toast mờ dần sau 2s, và tích hợp tùy chọn `autoPronounce`.
- [x] **Task 8.5:** Cập nhật `background/config.js` và `content/content.js` hỗ trợ tùy chọn tự động phát âm (`autoPronounce`).
- [x] **Task 8.6:** Cập nhật tài liệu lịch sử thay đổi `CHANGELOG.md` và kiểm thử cú pháp toàn bộ codebase.

---

## Giai đoạn 9: Hoàn thiện Toàn diện UI/UX theo Chuẩn UI/UX Pro Max
- [x] **Task 9.1:** Tái cấu trúc giao diện Extension Popup (`popup/popup.html`, `popup/popup.css`, `popup/popup.js`) theo bảng màu Zinc, tích hợp Vercel status dots, audio pronunciation và one-click Anki sync.
- [x] **Task 9.2:** Loại bỏ 100% emojis cấu trúc trên toàn bộ giao diện (Options, Popup, Popover), thay thế bằng vector SVG thuần chuẩn thiết kế chuyên nghiệp.
- [x] **Task 9.3:** Nâng cấp và đồng bộ hóa tài liệu thiết kế `DESIGN.md` với bộ tiêu chuẩn UI/UX Pro Max Pre-Delivery Checklist.
- [x] **Task 9.4:** Cập nhật `CHANGELOG.md` ghi nhận phiên bản `v1.4.0` và kiểm thử toàn bộ hệ thống.

---

## Giai đoạn 10: Khắc phục Lỗi Treo & Tối ưu Tốc độ Tra từ (< 1 Giây)
- [x] **Task 10.1:** Triệt tiêu hoàn toàn hiện tượng "Retry Hell" và sleep loop (> 1s). Áp dụng chiến lược Fail-Fast với tối đa 1 lần fallback duy nhất sang mô hình dự phòng.
- [x] **Task 10.2:** Tích hợp bộ ngắt `AbortController` với hard-timeout 8 giây, ngăn chặn triệt để lỗi treo request 2-3 phút của fetch mặc định.
- [x] **Task 10.3:** Cấu hình native `responseSchema` và `responseMimeType: "application/json"`, ép model Gemini Flash kích hoạt chế độ Constrained Decoding sinh JSON tức thì.
- [x] **Task 10.4:** Khóa cứng `thinkingConfig: { thinkingBudget: 0 }` và `maxOutputTokens: 300` (loại bỏ hoàn toàn CoT tokens dư thừa).
- [x] **Task 10.5:** Bổ sung bộ đo thời gian thực thi `performance.now()` ghi log chính xác độ trễ từng request và cập nhật `CHANGELOG.md`.

---

## Giai đoạn 11: Kiến trúc Bộ nhớ đệm Tức thời (Instant Cache) & Client Watchdog Timer
- [x] **Task 11.1:** Tích hợp bộ nhớ đệm kép (In-memory LRU Map + `chrome.storage.local`) trả kết quả 0ms cho các từ đã từng tra cứu.
- [x] **Task 11.2:** Tự động nhận diện thế hệ mô hình để gán đúng chuẩn: `thinkingLevel: "minimal"` cho Gemini 3.x và `thinkingBudget: 0` cho Gemini 2.5 (ngăn chặn model sinh hàng nghìn reasoning tokens ngầm).
- [x] **Task 11.3:** Tích hợp Watchdog Timer (7.5s) trực tiếp trong `content.js` và `popup.js`, đảm bảo UI không bao giờ bị kẹt ở trạng thái loading spinner quá 7.5 giây.
- [x] **Task 11.4:** Tối ưu `background.js` với In-memory cached config, loại bỏ độ trễ đọc `chrome.storage.sync` trên mỗi message.
- [x] **Task 11.5:** Hướng dẫn cụ thể quy trình Reload Extension trên `chrome://extensions` và Refresh trang web để nạp code mới.

---

## Giai đoạn 12: Sửa lỗi HTTP 400 Thinking Level & Cơ chế Tự phục hồi (Self-Healing)
- [x] **Task 12.1:** Cập nhật `thinkingLevel: "LOW"` thay cho `minimal` đối với các dòng model Gemini 3.x (sửa triệt để lỗi `Thinking level MINIMAL is not supported for this model`).
- [x] **Task 12.2:** Tích hợp cơ chế tự phục hồi (Self-Healing Retry): Nếu API trả về mã lỗi 400 liên quan đến thinkingConfig, tiện ích tự động loại bỏ thinkingConfig và gửi lại request ngay lập tức trong 200ms.
- [x] **Task 12.3:** Đồng bộ hóa cơ chế kiểm tra kết nối API `testAIConnection` và cập nhật `CHANGELOG.md`.

---

## Giai đoạn 13: Xử lý Bóc tách JSON Đa phần (Multi-Part Scanning) & Tăng Token Bound
- [x] **Task 13.1:** Xây dựng hàm `extractJsonFromParts` tự động quét tìm chính xác part chứa JSON `{...}`, bỏ qua các part suy nghĩ (Thinking text).
- [x] **Task 13.2:** Tăng `maxOutputTokens` lên 800 để ngăn chặn việc token suy nghĩ làm cắt cụt chuỗi JSON giữa chừng.
- [x] **Task 13.3:** Bổ sung cơ chế tự sửa chữa chuỗi JSON bị ngắt cụt (Truncated JSON Auto-Recovery) và regex fallback trong `safeParseAIJson`.

---

## Giai đoạn 14: Điều chỉnh Thời gian Timeout & Khuyến nghị Model Siêu tốc (0.4s)
- [x] **Task 14.1:** Nâng thời gian timeout của `AbortController` từ 7s lên 14s (watchdog 16s) để tránh việc model Gemini 3.x đang hoàn tất thì bị ngắt giữa chừng.
- [x] **Task 14.2:** Thêm chỉ dẫn nghiêm ngặt trong systemInstruction: "Tuyệt đối không suy nghĩ nội tâm hay giải thích dài dòng" để triệt tiêu thời gian thinking.
- [x] **Task 14.3:** Bổ sung khuyến nghị chọn `gemini-2.5-flash` (tắt 100% suy nghĩ qua `thinkingBudget: 0`, phản hồi 0.4s) và `gemini-2.0-flash` trên trang Options.

---

## Giai đoạn 15: Tối ưu Cấu trúc Prompt & Cấu hình Zero-Latency (Sub-0.5s)
- [x] **Task 15.1:** Tối giản System Instruction và User Prompt dạng thô: `"Dictionary parser. Output strictly adhering to the schema. No thoughts. No markdown."`
- [x] **Task 15.2:** Khóa chặt `maxOutputTokens: 250` và tinh gọn schema phản hồi còn 6 trường cốt lõi (`word`, `phonetic`, `pos`, `meaning_vi`, `definition_en`, `example_vi`).
- [x] **Task 15.3:** Cập nhật renderer trên Floating Popover và Popup để hiển thị trường ví dụ mới và tương thích ngược với các trường cũ.

---

## Giai đoạn 16: Generate Anki Note Type Specs & Documentation
- [x] **Task 16.1 (Generate Anki Note Type Specs & Documentation):** Thiết kế mẫu Note Type `Anki AI Vocab` chuẩn UI/UX Pro Max với 8 trường dữ liệu (`Word`, `Phonetic`, `PartOfSpeech`, `Meaning`, `DefinitionEN`, `ContextSentence`, `ContextTranslation`, `Audio`).
- [x] **Task 16.2:** Xây dựng Front Template (mặt trước) sắc nét, badge từ loại gọn gàng, tự động bôi đậm từ khóa trong câu ngữ cảnh (`<b>...</b>`).
- [x] **Task 16.3:** Xây dựng Back Template (mặt sau) giữ nguyên header mặt trước, vạch ngăn cách 1px, nghĩa tiếng Việt nổi bật và dịch ngữ cảnh.
- [x] **Task 16.4:** Xây dựng CSS Styling tự động thích ứng Light/Dark Mode (`.nightMode`), chuẩn Zinc palette và typography không chân.
- [x] **Task 16.5:** Đồng bộ hóa Field Mapping trong `background/anki-service.js`, `background/config.js`, và `options/options.js`, tự động bôi đậm từ khóa khi đẩy thẻ vào Anki.
- [x] **Task 16.6:** Khởi tạo file hướng dẫn chi tiết `ANKI_TEMPLATE.md` tại thư mục gốc của dự án và cập nhật `CHANGELOG.md`.

---

## Giai đoạn 17: Chỉnh Sửa Trực Tiếp Trên Popover (Inline Editing & Undo)
- [x] **Task 17.1 (Enable Inline Editing on Popover):** Chuyển đổi các trường thông tin trên Popover (`word`, `phonetic`, `pos`, `meaning_vi`, `definition_en`, `example_sentence`, `example_translation`) thành các vùng chỉnh sửa trực tiếp (`contenteditable="true"`).
- [x] **Task 17.2:** Thiết kế hiệu ứng focus tinh tế (`box-shadow: 0 0 0 1px var(--text-muted)`) với margin/padding âm bù trừ, đảm bảo 0% giật layout hoặc xô lệch kích thước Popover.
- [x] **Task 17.3:** Thêm nút icon SVG "Hoàn tác / Reset" (`#anki-btn-reset`) cho phép khôi phục toàn bộ dữ liệu gốc do AI tạo ra chỉ với 1 click.
- [x] **Task 17.4:** Nâng cấp hàm gửi thẻ sang AnkiConnect (`handleAddToAnki`) để thu thập trực tiếp dữ liệu text thực tế đang hiển thị trên giao diện (sau chỉnh sửa).
- [x] **Task 17.5:** Cập nhật `CHANGELOG.md` ghi nhận phiên bản `[2.1.0]`.

---

## Giai đoạn 18: Khắc phục Triệt để 5 Lỗi Console, Lỗi Context Trùng Tiếng Việt & Audio Phát Âm
- [x] **Task 18.1:** Sửa lỗi trùng ngữ cảnh tiếng Việt trong Anki: Tách biệt rõ ràng câu tiếng Anh gốc (`ContextSentence` kèm `<b>word</b>`) và câu dịch tiếng Việt (`ContextTranslation`) trong `ai-service.js`, `content.js` và `anki-service.js`.
- [x] **Task 18.2:** Tích hợp tải & lưu trữ file audio phát âm tiếng Anh qua AnkiConnect `storeMediaFile` và tự động gắn thẻ `[sound:vocab_...mp3]` vào trường `Audio`.
- [x] **Task 18.3:** Sửa lỗi `attachShadow`: Áp dụng kiểm tra `host.shadowRoot || host.attachShadow({ mode: "open" })` ngăn chặn lỗi gọi đè shadow root trên element đã tồn tại.
- [x] **Task 18.4:** Sửa lỗi YouTube iframe cross-origin CSP: Inline CSS trực tiếp bằng `<style>` trong Shadow DOM, thêm `"all_frames": false` vào `manifest.json` và `background.js`.
- [x] **Task 18.5:** Sửa lỗi `Extension context invalidated`: Xây dựng hàm bọc `safeSendMessage` với kiểm tra `chrome.runtime?.id` và try/catch an toàn trên toàn bộ `content.js`.
- [x] **Task 18.6:** Cập nhật `CHANGELOG.md` ghi nhận phiên bản `[2.2.0]`.

---

## Giai đoạn 19: Khắc Phục Khẩn Cấp Lỗi `$ is not defined` & Nút "Add to Anki" Treo Vô Tận
- [x] **Task 19.1:** Sửa lỗi cú pháp regex làm phát sinh `ReferenceError: $ is not defined` tại `content/content.js:366` và `content/popover-ui.js:87`: chuẩn hóa bằng regex an toàn `replace(/^[\/\[\s]+|[\/\]\s]+$/g, '').trim()`.
- [x] **Task 19.2:** Khai báo sẵn các DOM query helpers thuần `$` và `$$` ở đầu scope của `content/content.js` với fallback ngữ cảnh an toàn.
- [x] **Task 19.3:** Tích hợp `AbortController` cùng cơ chế timeout (5s) vào hàm `ankiInvoke` trong `background/anki-service.js`, triệt tiêu hoàn toàn khả năng treo fetch vĩnh viễn khi kết nối Anki.
- [x] **Task 19.4:** Giới hạn timeout tải âm thanh `storeMediaFile` độc lập trong 3s với cơ chế non-blocking fallback, đảm bảo lỗi tải audio không làm chậm trễ hay phong tỏa việc lưu thẻ vào Anki.
- [x] **Task 19.5:** Tích hợp cơ chế Watchdog Timer (7s) và bao bọc toàn bộ luồng xử lý `handleAddToAnki` trong `content/content.js` và `popup/popup.js` bằng `try...catch...finally`, đảm bảo trạng thái loading spinner luôn tự mở khóa và báo lỗi rõ ràng nếu quá hạn.
- [x] **Task 19.6:** Cập nhật `CHANGELOG.md` ghi nhận phiên bản `[2.3.0]`.

---

## Giai đoạn 20: Tái Thiết Kế Toàn Bộ UI/UX Theo Cấu Trúc PeakPlanner & Hỗ Trợ Light/Dark Mode
- [x] **Task 20.1:** Cập nhật `background/config.js` bổ sung các cấu hình `theme: 'dark'`, `maxOutputTokens: 250`, và `autoCloseDelayMs: 1400`.
- [x] **Task 20.2:** Tái cấu trúc toàn bộ `options/options.html` theo layout PeakPlanner: Left Sidebar 250px (Brand logo, workspace deck selector, nav menu badges, user profile, Sun ☀️ / Moon 🌙 theme switcher capsule) và Main Content Area (Header, Horizontal Pill Tabs, 2-column split sections, electric blue focus ring, interactive range sliders, và hairline dividers).
- [x] **Task 20.3:** Tái thiết kế toàn diện `options/options.css` với bảng tokens hoàn chỉnh cho cả Dark Theme (PeakPlanner charcoal & slate `#0E0F14`) và Light Theme, custom range sliders, pill tabs, animated switches, và responsive collapse.
- [x] **Task 20.4:** Cập nhật `options/options.js`: Quản lý theme Light/Dark với `chrome.storage.sync` persistence, smooth scroll tab pills, live sliders feedback, và đồng bộ Anki status lên Sidebar.
- [x] **Task 20.5:** Tái thiết kế `popup/popup.html`, `popup/popup.css` và `popup/popup.js` theo chuẩn PeakPlanner với nút chuyển đổi theme Sun/Moon ngay trên header và electric focus rings.
- [x] **Task 20.6:** Đồng bộ hóa `content/content.css` và `content/content.js` cho Shadow DOM Floating Popover tự động kế thừa và chuyển đổi theme Light/Dark theo thời gian thực.
- [x] **Task 20.7:** Cập nhật `DESIGN.md` và `CHANGELOG.md` ghi nhận phiên bản `[3.0.0]`.

---

## Giai đoạn 21: Tái Thiết Kế Thẻ Anki Theo Phong Cách Prettify / Minimalist, Loa Tròn Tối Giản & Nghĩa Trước Context
- [x] **Task 21.1:** Cập nhật tài liệu hướng dẫn `ANKI_TEMPLATE.md` theo phong cách Prettify / Minimalist (card nổi bo góc 12px, breadcrumb tên bộ bài `{{Deck}}`, vạch kẻ nét đứt `1px dashed`).
- [x] **Task 21.2:** Đổi thứ tự hiển thị trên Back Template: Đưa nghĩa tiếng Việt (`{{Meaning}}`) và định nghĩa tiếng Anh (`{{DefinitionEN}}`) lên TRƯỚC câu ví dụ ngữ cảnh (`{{ContextSentence}}`).
- [x] **Task 21.3:** Tái thiết kế nút phát âm thanh (`.replay-button`, `.soundLink`) trên Anki thành nút tròn `26px x 26px`, nền trung tính, viền mảnh và icon SVG thanh mảnh, siêu tối giản.
- [x] **Task 21.4:** Đồng bộ hóa cấu trúc thẻ Basic trong `background/config.js` và `background/anki-service.js` với vạch nét đứt và nghĩa tiếng Việt đặt trước ngữ cảnh.
- [x] **Task 21.5:** Nâng cấp nút loa phát âm tối giản trên Floating Popover (`content/content.js`, `content/popover-ui.js`, `content/content.css`) và Popup (`popup/popup.js`, `popup/popup.css`).
- [x] **Task 21.6:** Cập nhật `CHANGELOG.md` ghi nhận phiên bản `[3.1.0]`.

---

## Giai đoạn 22: Tối Giản Layout Options 1 Cột, Chuẩn Hóa 100% Tiếng Anh, Bổ Sung Deck Picker & Nâng Cấp Typography (v3.2.0)
- [x] **Task 22.1:** Loại bỏ hoàn toàn thanh sidebar dọc (`<aside class="app-sidebar">`) khỏi `options/options.html` và `options/options.css`; chuyển sang layout 1 cột căn giữa tối giản (`max-width: 680px`, `margin: 0 auto`, `padding: 40px 20px 120px`).
- [x] **Task 22.2:** Phân tách cài đặt thành 3 section sạch sẽ: Section 1 (AI Provider), Section 2 (Anki Configuration & Field Mapping), Section 3 (Preferences & Performance). Giữ nguyên thanh Save Changes nổi ở đáy trang.
- [x] **Task 22.3:** Chuyển đổi toàn bộ ngôn ngữ của Extension sang 100% Tiếng Anh (English Only) trên toàn bộ hệ thống: Options UI, Popup UI, Floating Popover, thông báo trạng thái, lỗi mạng, tooltip, placeholder và `manifest.json`.
- [x] **Task 22.4:** Bổ sung bộ chọn Target Deck (`<select id="anki-popover-deck-select">`) trực tiếp ngay trên chân trang (footer) của Floating Popover trong `content/content.js` và `content/popover-ui.js`, hỗ trợ chọn và nhớ bộ bài mục tiêu trước khi lưu thẻ.
- [x] **Task 22.5:** Nâng cấp độ rõ nét và kích thước typography: tăng chiều rộng Popover lên `375px`, kích thước chữ từ vựng `19px (font-weight: 700)`, IPA `13px`, Nghĩa tiếng Việt `15px (font-weight: 600)`, Định nghĩa Anh ngữ `13.5px`, và câu ngữ cảnh `13.5px` kèm padding rộng rãi (`padding: 8px 12px`).
- [x] **Task 22.6:** Đồng bộ hóa Design Tokens trong `content/content.css`, `options/options.css`, cập nhật `DESIGN.md` và ghi nhận phiên bản `[3.2.0]` trong `CHANGELOG.md`.

## Phase 23: Popover Typography Restructuring, Pastel POS Badges, Custom Deck Dropdown & AI Provider Cards [DONE]
- [x] **Task 23.1:** Tái cấu trúc Header Popover thành 2 hàng rõ ràng (Hàng 1: `word` + `pos` badge cách 8px; Hàng 2: `phonetic` IPA `/ IPA /` nằm bên dưới, chữ xám 13px; cụm nút âm thanh, undo, close cố định góc phải trên).
- [x] **Task 23.2:** Phối màu pastel / muted badge dịu mắt cho các từ loại (Verb xanh lam mềm, Noun tím chàm, Adjective xanh ngọc/bạc hà, Adverb/Other cam ấm hổ phách). Hỗ trợ đổi màu real-time khi người dùng chỉnh sửa inline từ loại.
- [x] **Task 23.3:** Thiết kế bộ chọn Target Deck dạng Custom Floating Dropdown Menu (thay thế thẻ `<select>` mặc định của trình duyệt) với trigger nút bấm xám đậm bo tròn 6px, icon folder, mũi tên chevron và menu nổi lên trên kèm dấu checkmark `✓` cho deck được chọn.
- [x] **Task 23.4:** Tinh chỉnh cụm 3 thẻ chọn AI Provider trong Options Page: loại bỏ nền trắng chói (`bg-white`) ở Dark mode, chuyển sang nền xám đậm `#202026`, viền trắng tinh tế `1px solid #FAFAFA` và ring `0 0 0 1px rgba(250,250,250,0.15)`.
- [x] **Task 23.5:** Đồng bộ hóa toàn bộ code vào `content/content.js`, `content/popover-ui.js`, `content/content.css`, `options/options.css`, cập nhật `DESIGN.md` và ghi nhận phiên bản `[3.3.0]` trong `CHANGELOG.md`.

## Phase 24: Word & Phonetic IPA Visual Harmony Typography & Downward Positioning Orientation [DONE]
- [x] **Task 24.1:** Đồng bộ kích thước font chữ giữa Từ vựng (`19px`, `font-weight: 700`, `letter-spacing: -0.02em`, `line-height: 1.2`) và Phiên âm IPA (`17px`, `font-weight: 500`, `#A1A1AA`, `letter-spacing: 0.01em`, `line-height: 1.2`) đạt tỷ lệ tương đương cân đối, giảm khoảng cách chênh lệch thị giác.
- [x] **Task 24.2:** Tinh chỉnh khoảng cách hàng và badge từ loại: Row 1 gap `12px`, `margin-bottom: 2px`; Row 2 `margin-top: 2px`, `margin-bottom: 12px`; badge từ loại `font-size: 11px`, `padding: 2px 7px`, bo tròn 4px.
- [x] **Task 24.3:** Ép chặt chuẩn font Modern Sans-serif trên toàn bộ Shadow DOM (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif !important`) kèm `-webkit-font-smoothing: antialiased`, loại bỏ triệt để font có chân.
- [x] **Task 24.4:** Khóa hướng mở Popover luôn trượt xuống dưới (`top = targetRect.bottom + window.scrollY + 8`), chỉ lật lên trên khi khoảng trống mép dưới màn hình thực sự không đủ (`< 320px`).
- [x] **Task 24.5:** Thiết lập menu danh sách Target Deck luôn trượt xuống phía dưới trigger button (`top: calc(100% + 6px) !important; bottom: auto !important; left: 0 !important;`).
- [x] **Task 24.6:** Đồng bộ hóa vào `content/content.css`, `content/content.js`, `content/popover-ui.js`, `content/position-calculator.js`, cập nhật `DESIGN.md`, `TASKS.md` và ghi nhận phiên bản `[3.3.1]` trong `CHANGELOG.md`.

## Phase 25: Fix Quick Trigger "Explain" & Popover Downward Positioning [DONE]
- [x] **Task 25.1:** Sửa triệt để nút Quick Trigger ("✨ Explain") xuất hiện sau khi bôi đen từ: chuyển từ vị trí phía trên (`rect.top + scrollY - 34`) xuống vị trí phía dưới từ (`rect.bottom + scrollY + 8`), căn giữa theo từ được chọn.
- [x] **Task 25.2:** Tinh chỉnh ngưỡng lật popover trong `calculatePopoverPosition`: hạ ngưỡng từ `320px` xuống `160px` (kết hợp `spaceAbove > 260px`) để loại bỏ tình trạng popover bị lật ngược lên trên khi từ nằm ở nửa dưới màn hình.
- [x] **Task 25.3:** Khóa vị trí cố định của Popover trong `renderPopoverLoadedData` để đảm bảo khi AI trả về kết quả hoặc người dùng mở rộng nội dung thì popover vẫn giữ nguyên vị trí dưới từ (`context.targetRect.bottom + scrollY + 8`).
- [x] **Task 25.4:** Đồng bộ hóa và kiểm thử toàn bộ trên `content/content.js` và `content/position-calculator.js`, ghi log `[3.3.2]` trong `CHANGELOG.md`.

## Phase 26: Redesign Extension Icon & Cross-Platform Synchronization [DONE]
- [x] **Task 26.1:** Thiết kế lại bộ icon nhận diện thương hiệu "The Luminary Flashcard" (kết hợp biểu tượng thẻ học Flashcard đa tầng và ngôi sao AI 4 cánh tỏa sáng) theo tiêu chuẩn thiết kế cao cấp Modern Linear / Zinc.
- [x] **Task 26.2:** Cập nhật script tạo icon `generate_icons.js` với thuật toán khử răng cưa đa mẫu (4x4 supersampling), tự động xuất ra vector SVG gốc `icons/icon.svg` cùng 4 kích cỡ PNG `16x16`, `32x32`, `48x48`, `128x128`.
- [x] **Task 26.3:** Đồng bộ hóa logo SVG thương hiệu mới vào tiêu đề trang cài đặt `options/options.html` và tinh chỉnh CSS `options/options.css` kèm hiệu ứng hover vi mô.
- [x] **Task 26.4:** Đồng bộ hóa badge icon SVG thương hiệu mới vào tiêu đề popup tiện ích `popup/popup.html` và cập nhật phiên bản hiển thị `v3.3`.
- [x] **Task 26.5:** Cập nhật tài liệu thiết kế `DESIGN.md`, ghi log chi tiết phiên bản `[3.3.3]` trong `CHANGELOG.md` và nâng version trong `manifest.json`.

## Phase 27: Times New Roman IPA Typography & Audio Pronunciation Voice Selection [DONE]
- [x] **Task 27.1:** Đổi riêng font của dòng phiên âm IPA (`.phonetic-text`, `.anki-ipa-text`, `.ipa`) sang `"Times New Roman", Times, serif !important` (`font-size: 17px`, `font-weight: 400`, `letter-spacing: 0.03em`) trong Shadow DOM, giữ nguyên font Sans-serif cho toàn bộ phần còn lại.
- [x] **Task 27.2:** Cập nhật `.card-phonetic` trong `ANKI_TEMPLATE.md` và `anki-service.js` fallback sang Times New Roman để thẻ Anki hiển thị ký tự ngữ âm chuẩn xác và thanh thoát.
- [x] **Task 27.3:** Thêm trường lựa chọn giọng đọc "Audio Pronunciation Voice" (`<select id="audioVoice">`) với 3 tùy chọn: Random (Male or Female), Male Voice, Female Voice vào `options/options.html`, liên kết cấu hình `audioVoice` trong `background/config.js` và `options/options.js`.
- [x] **Task 27.4:** Tích hợp hàm `getAudioVoiceUrl(word, voiceSetting)` trong `background/anki-service.js` phân loại giọng nam (US Male, type=2) và giọng nữ (UK/US Female, type=1), sinh tên file âm thanh kèm nhãn giọng `vocab_${cleanWordName}_${voiceType}_${Date.now()}.mp3` và lưu vào Anki qua `storeMediaFile`.
- [x] **Task 27.5:** Cập nhật tính năng phát âm popover `playAudioPronunciation` trong `content/content.js` để tự động chọn giọng nam/nữ phù hợp theo cấu hình `audioVoice`.
- [x] **Task 27.6:** Cập nhật `DESIGN.md`, `CHANGELOG.md` ghi nhận phiên bản `[3.4.0]` và nâng version trong `manifest.json`.

## Phase 28: Draggable Popover with Boundary Constraints & Control Isolation [DONE]
- [x] **Task 28.1:** Thiết kế vùng nhận diện kéo thả (Drag Handle) tại Header Popover (`.anki-popover-header`) với trạng thái con trỏ trực quan `cursor: grab;` và `cursor: grabbing;` khi nhấn giữ kéo.
- [x] **Task 28.2:** Cách ly hoàn toàn các phần tử tương tác (nút Audio, Reset, Close, contenteditable text, form inputs) khỏi sự kiện drag, đảm bảo trải nghiệm click và sửa inline tự nhiên không bị nhầm lẫn với thao tác kéo.
- [x] **Task 28.3:** Triển khai cơ chế lắng nghe sự kiện chuột mượt mà (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) qua hàm `makePopoverDraggable` trong `content/content.js` và `content/popover-ui.js`.
- [x] **Task 28.4:** Ràng buộc phạm vi di chuyển trong khung nhìn Viewport (Boundary constraints với lề an toàn 8px và bù trừ tọa độ scroll) ngăn chặn popover bị trôi ra ngoài màn hình.
- [x] **Task 28.5:** Tự động vô hiệu hóa bôi đen text (`document.body.style.userSelect = 'none'`) trong suốt quá trình kéo để ngăn chặn xung đột bôi đen văn bản trên trang web cha.
- [x] **Task 28.6:** Lưu vết trạng thái `_hasBeenDragged` để bảo lưu tọa độ di chuyển do người dùng chỉ định, không bị tự động reset khi AI tải dữ liệu hoàn tất.
- [x] **Task 28.7:** Đồng bộ hóa tài liệu `DESIGN.md`, ghi log chi tiết trong `CHANGELOG.md` và nâng version lên `[3.5.0]` trong `manifest.json`.

## Phase 29: Persistent Popover Mode & Options Switch Toggle [DONE]
- [x] **Task 29.1:** Bổ sung cấu hình `closeOnlyOnX: false` vào `DEFAULT_CONFIG` trong `background/config.js`.
- [x] **Task 29.2:** Thêm switch toggle "Close Only via Close Button ('×')" vào mục Preferences & Performance trong `options/options.html` với mô tả rõ ràng, chuẩn phong cách Zinc switch.
- [x] **Task 29.3:** Liên kết dữ liệu load và save cho input `closeOnlyOnX` trong `options/options.js`.
- [x] **Task 29.4:** Cập nhật trình lắng nghe `pointerdown` trong `content/content.js`: kiểm tra `extensionConfig?.closeOnlyOnX !== true` trước khi đóng popover khi click ra ngoài.
- [x] **Task 29.5:** Đồng bộ hóa cấu hình thời gian thực qua `chrome.storage.onChanged` trong `content/content.js` để cập nhật tức thì trạng thái bật/tắt trên mọi tab đang mở mà không cần F5 lại trang.
- [x] **Task 29.6:** Bảo lưu thao tác đóng qua phím `Escape` và nút '×' (`#anki-popover-close`).
- [x] **Task 29.7:** Đồng bộ tài liệu thiết kế `DESIGN.md`, cập nhật `CHANGELOG.md` ghi nhận phiên bản `[3.6.0]` và nâng version trong `manifest.json`.

## Phase 30: Context-Aware Caching, Re-lookup Button & Popover Corner Refinement [DONE]
- [x] **Task 30.1:** Tối ưu hóa cơ chế Cache với Context-Aware Key: áp dụng thuật toán băm FNV-1a trên câu ngữ cảnh chuẩn hóa (`vocab_${cleanWord}_${cleanLang}_${ctxHash}`), giải quyết triệt để vấn đề từ đa nghĩa bị dính nghĩa cũ giữa các ngữ cảnh khác nhau.
- [x] **Task 30.2:** Triển khai hàm `invalidateCache` xóa đồng thời bộ nhớ đệm in-memory Map và `chrome.storage.local` khi người dùng yêu cầu force refresh.
- [x] **Task 30.3:** Thêm cờ `bypassCache` trong `EXPLAIN_WORD` tại `background/background.js` và `background/ai-service.js`, hỗ trợ gọi thẳng AI không qua cache.
- [x] **Task 30.4:** Bổ sung Nút "Tra lại / Phân tích lại" (`#anki-btn-relookup` với icon SVG refresh) trên Header Popover, hỗ trợ hiệu ứng xoay hover và icon loading spin khi re-analyzing.
- [x] **Task 30.5:** Tích hợp luồng Re-lookup mượt mà trên Popover: hiển thị skeleton loading trong phần nội dung, khóa tạm nút Add, cập nhật kết quả mới và làm mới cache gốc `_originalAiData`.
- [x] **Task 30.6:** Tinh chỉnh bo tròn Popover (`--radius: 12px;` và shadow cao cấp), sửa triệt để lỗi viền dưới bị vuông bằng cách gán `border-bottom-left-radius` và `border-bottom-right-radius` cho `.anki-popover-footer` (và tương tự cho `.anki-popover-header`), ngăn background con tràn ra ngoài viền 1px bo tròn.
- [x] **Task 30.7:** Đồng bộ hóa `content/content.js`, `content/content.css`, `content/popover-ui.js`, cập nhật `DESIGN.md`, `CHANGELOG.md` và nâng version lên `[3.7.0]` trong `manifest.json`.

## Phase 31: Popup UX Overhaul, Auto-Fill Active Selection & Feature Parity [DONE]
- [x] **Task 31.1:** Tự động phát hiện và điền văn bản bôi đen từ tab đang mở: sử dụng `chrome.scripting.executeScript` trên active tab khi mở popup, trích xuất từ vựng và câu ngữ cảnh, tự động điền vào các ô input và kích hoạt tra cứu tức thì.
- [x] **Task 31.2:** Tinh chỉnh bố cục Popup khi chưa tra từ: chuyển `min-height: 480px` thành `min-height: auto; max-height: 580px;`, loại bỏ hoàn toàn khoảng đen trống rỗng vô nghĩa ở nửa dưới giao diện.
- [x] **Task 31.3:** Bổ sung khối gợi ý tinh tế `#popup-idle-guide` khi chưa tra từ, tạo cảm giác giao diện có chủ đích và hướng dẫn người dùng trực quan.
- [x] **Task 31.4:** Xóa bỏ hoàn toàn thanh footer chứa nút `Settings ↗` thừa thãi ở dưới cùng vì đã có icon bánh răng cài đặt ở góc trên bên phải header.
- [x] **Task 31.5:** Tái thiết kế toàn diện khu vực Add to Anki trên Popup: thay thế nút HTML thô xấu bằng Action Bar chuẩn Zinc/Shadcn gồm bộ chọn Target Deck linh hoạt (`#popup-deck-select`) và nút Add to Anki hiện đại kèm spinner và icon trạng thái.
- [x] **Task 31.6:** Bổ sung tính năng chỉnh sửa nội dung trực tiếp (`contenteditable="true"` với class `.result-editable`) cho tất cả các trường (từ vựng, phiên âm, từ loại, nghĩa tiếng Việt, định nghĩa tiếng Anh, câu ngữ cảnh, dịch câu) trên thẻ kết quả popup.
- [x] **Task 31.7:** Đồng bộ tùy chọn giọng đọc âm thanh trong popup: nâng cấp `playAudioPronunciation` trong `popup.js` để tự động chọn giọng nam/nữ (`male`/`female`) khớp chính xác với cấu hình `audioVoice` trong Options.
- [x] **Task 31.8:** Bổ sung nút "Tra lại / Phân tích lại" (`#btn-popup-relookup` kèm xoay hiệu ứng) và nút "Hoàn tác" (`#btn-popup-reset`) trên Header thẻ kết quả Popup.
- [x] **Task 31.9:** Đồng bộ hóa `popup/popup.html`, `popup/popup.css`, `popup/popup.js`, cập nhật `DESIGN.md`, `TASKS.md`, `CHANGELOG.md` và nâng version lên `[3.8.0]` trong `manifest.json`.

## Phase 32: 100% Full Context Translation & Standalone Word Example Generation [DONE]
- [x] **Task 32.1:** Khắc phục triệt để lỗi AI dịch thiếu vế hoặc bỏ sót mệnh đề trong câu ghép/câu phức dài: cập nhật `DEFAULT_PROMPT` trong `background/config.js` với chỉ thị dịch 100% câu ngữ cảnh, không được tóm tắt, cắt xén hoặc bỏ sót bất kỳ mệnh đề phụ nào (kể cả các mệnh đề nối bằng "and", "but", "because", "so", mệnh đề quan hệ).
- [x] **Task 32.2:** Nâng `maxOutputTokens` từ `250` lên `450` tokens trong `generationConfig` tại `background/ai-service.js` (và `max_tokens: 500` cho OpenAI/custom), loại bỏ hiện tượng tràn token gây cụt bản dịch tiếng Việt.
- [x] **Task 32.3:** Bổ sung cơ chế phát hiện tra từ đơn lập (`isRealContext` kiểm tra `sentence` có ít nhất 3 từ và không trùng với `word`): khi người dùng chỉ bôi đen 1 từ hoặc ô ngữ cảnh rỗng, AI tự động sinh một câu ví dụ tiếng Anh tự nhiên, thực tế (chuẩn B1-B2) vào `example_en` và dịch đầy đủ 100% sang `example_vi`.
- [x] **Task 32.4:** Cập nhật `responseSchema` trong `lookupGeminiFast` bổ sung thuộc tính `example_en: { type: "STRING" }` và đưa vào danh sách `required` trường bắt buộc cùng `example_vi`.
- [x] **Task 32.5:** Đồng bộ hóa logic `normalizeSchema` trong `background/ai-service.js`: tự động gán `example_sentence` và `example_en` từ kết quả sinh của AI khi tra từ đơn lập, bảo đảm không bị ghi đè bởi chuỗi rỗng hay từ đơn lẻ.
- [x] **Task 32.6:** Đồng bộ hóa `renderPopoverLoadedData`, `getEditedCardData` và `handleAddToAnki` trong `content/content.js`: hiển thị đầy đủ cả câu ví dụ tiếng Anh do AI sinh và bản dịch tiếng Việt trong hộp example box, lưu trọn vẹn vào thẻ Anki.
- [x] **Task 32.7:** Đồng bộ hóa `renderQuickResult` và nút `btn-popup-add-anki` trong `popup/popup.js`: hỗ trợ hiển thị và lưu câu ví dụ tự sinh khi người dùng tra từ đơn lẻ từ cửa sổ popup.
- [x] **Task 32.8:** Cập nhật tài liệu thiết kế `DESIGN.md`, ghi nhận lịch sử phiên bản `[3.9.0]` trong `CHANGELOG.md`, cập nhật nhãn phiên bản trong `popup/popup.html` và nâng version lên `3.9.0` trong `manifest.json`.

## Phase 35: Selection Popover Toggle in Popup, Sticky Deck Memory & Emerald Auto Button [DONE]
- [x] **Task 35.1:** Bổ sung nút bật/tắt hiển thị popover khi bôi đen từ ngay trên Popup tra cứu (`popup/popup.html` và `popup/popup.js`):
  - Thiết kế công tắc chuyển đổi `.popup-selection-toggle` và `.mini-switch` chuẩn Zinc/Shadcn tại hàng tiêu đề Manual Lookup.
  - Tự động đồng bộ và lưu trữ ngay lập tức vào `chrome.storage.local` và `chrome.storage.sync` (`showQuickTooltip`).
  - Lắng nghe sự kiện `storage.onChanged` trên tất cả các tab đang mở để cập nhật tức thì trạng thái bật/tắt mà không cần tải lại trang.
- [x] **Task 35.2:** Tính năng ghi nhớ Deck Anki ở lần thêm trước (Sticky Deck Selection):
  - Popover tự động ghi nhớ và chọn sẵn bộ thẻ đã dùng ở lần add hoặc click chọn trước đó (`lastUsedDeck` / `deckName`) trong `content/content.js`.
  - Cập nhật cả `chrome.storage.local` và `chrome.storage.sync` khi người dùng thay đổi deck hoặc bấm Add to Anki.
  - Đồng bộ lựa chọn deck qua lại mượt mà giữa Popover trên trang web và Popup extension.
- [x] **Task 35.3:** Đổi màu nút Auto trong Desired output token budget sang màu xanh lá Emerald (`options/options.css` và `options/options.js`):
  - Đổi màu nền, viền và chấm chỉ báo sáng sang tone Emerald Green (`var(--success)` / `#10B981`) chuyên nghiệp, hiện đại.
  - Cập nhật màu chữ nhãn giá trị `tokenBudgetVal` thành xanh Emerald khi kích hoạt chế độ Auto.
- [x] **Task 35.4:** Kiểm tra cú pháp toàn bộ codebase, nâng version lên `[3.11.0]` trong `manifest.json`, `popup/popup.html`, cập nhật `CHANGELOG.md` và `TASKS.md`.

## Phase 36: Anki Multi-Modal Card Templates: Typing from Meaning & Listening Dictation [DONE]
- [x] **Task 36.1:** Mở rộng đặc tả `ANKI_TEMPLATE.md` với 3 loại thẻ học tập toàn diện (Recognition, Type from Meaning, Listen & Type) dùng chung 8 fields của Note Type `Anki AI Vocab`.
- [x] **Task 36.2:** Thiết kế Card 2 (Type from Meaning): nghĩa tiếng Việt và định nghĩa tiếng Anh làm tiêu điểm, khung nhập từ vựng `{{type:Word}}` chuẩn Shadcn và so khớp kết quả gõ chữ với màu sắc trực quan.
- [x] **Task 36.3:** Thiết kế Card 3 (Listen & Type): Nút phát âm thanh trung tâm to rõ (`.card-listen-hero`), gợi ý từ loại và phím tắt `R`, khung gõ từ `{{type:Word}}` rèn luyện chính tả từ âm thanh.
- [x] **Task 36.4:** Cung cấp bảng mã CSS Styling hợp nhất với thiết kế input bo tròn hiện đại `input#typeans` và bảng diff kết quả `code#typeans` (`.typeGood`, `.typeBad`, `.typeMissed`) hỗ trợ mượt mà cả Light Mode và Dark Mode.
- [x] **Task 36.5:** Viết hướng dẫn chi tiết từng bước cài đặt nhiều loại thẻ (Add Card Type) trong Anki Desktop.

## Phase 38: In-Session Lookup Cache, Multi-Word Phrase Selection & Reordered Quality Priorities [DONE]
- [x] **Task 38.1:** Triển khai bộ nhớ đệm trong phiên (`_sessionWordCache` gắn trực tiếp vào Popover instance trong `content/content.js`):
  - Khi người dùng click lại từ/cụm từ đã từng tra trong cùng một phiên ngữ cảnh, kết quả được khôi phục ngay lập tức trong 0ms mà không phải gọi lại AI API.
  - Tự động bắt và bảo lưu các chỉnh sửa của người dùng trước khi chuyển đổi sang từ khác, hoàn nguyên đúng các chỉnh sửa khi chọn lại.
  - Nút "Tra lại" (Re-analyze) chủ động xóa cache của từ đó và kích hoạt tra mới bằng AI với cờ `bypassCache: true`.
- [x] **Task 38.2:** Tính năng chọn cả cụm từ/thành ngữ trong ô ngữ cảnh (Phrase & Collocation Selection trong Captured Context):
  - Nâng cấp `renderInteractiveChips` hỗ trợ khớp chuỗi đa token, nối các từ liên tiếp bằng chip phân cách có cùng highlight (`.active-chip-sep`).
  - Hỗ trợ thao tác kéo chuột (drag-to-select / swipe) qua nhiều từ liên tiếp với hiệu ứng xem trước viền xanh `.chip-selecting`.
  - Hỗ trợ phím tắt `Shift + Click` để chọn dải từ nhanh chóng.
  - Hỗ trợ bôi đen văn bản tự nhiên bằng chuột trong vùng chips.
- [x] **Task 38.3:** Chuẩn hóa thứ tự ưu tiên chất lượng tra từ trên toàn bộ hệ thống (Prompts, UI, và Note Type):
  - Ưu tiên 1 (Cao nhất): Nghĩa tiếng Việt theo đúng ngữ cảnh câu (`meaning_vi`).
  - Ưu tiên 2: Câu ngữ cảnh gốc và dịch trọn vẹn 100% không bỏ sót vế (`example_sentence` & `example_vi`).
  - Ưu tiên 3: Định nghĩa tiếng Anh ngắn gọn cho người học (`definition_en`).
  - Giữ nguyên vị trí hiển thị trực quan cổ điển (Nghĩa tiếng Việt -> Định nghĩa tiếng Anh -> Hộp ngữ cảnh & dịch) trên Popover, Popup và mẫu thẻ Anki, trong khi AI ưu tiên tối đa chất lượng phân tích nghĩa theo ngữ cảnh và dịch 100% câu.
- [x] **Task 38.4:** Thay thế mô hình `gemini-1.5-flash` đã hết vòng đời bằng `gemini-3.5-flash-lite`, `gemini-2.5-flash`, `gemini-3.1-flash-lite` trong pipeline Vision và danh sách lựa chọn của Options.
- [x] **Task 38.5:** Kiểm tra toàn diện cú pháp codebase, nâng version lên `[3.13.0]` trong `manifest.json`, cập nhật `CHANGELOG.md` và `TASKS.md`.

## Phase 39: UI Overlap Fix, Context Normalizer & Context Session State Manager [DONE]
- [x] **Task 39.1:** Khắc phục triệt để lỗi chen chúc / đè chữ trên giao diện Popover (UI Overlap & Layout Fix):
  - Sửa lỗi flexbox container: cấu hình `.anki-floating-popover` với `display: flex; flex-direction: column; overflow: visible;`.
  - Cấu hình `.anki-popover-content` với `flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden;` cho phép thanh cuộn kích hoạt mượt mà khi nội dung vượt quá chiều cao tối đa.
  - Gán `flex-shrink: 0;` cho toàn bộ các phần tử con (`.anki-context-chips-wrap`, `.anki-meaning-row`, `.anki-def-row`, `.anki-example-box`) cùng `word-break: break-word; overflow-wrap: anywhere;` để các dòng chữ không bao giờ bị ép méo hoặc đè lên nhau.
  - Tách bạch `.anki-popover-header` và `.anki-popover-footer` cố định với `flex-shrink: 0;`.
- [x] **Task 39.2:** Xây dựng bộ chuẩn hóa câu ngữ cảnh (Context Normalizer & Cleaning Engine):
  - Triển khai `cleanContextSpacing(str)`: dọn dẹp các dấu cách thừa quanh dấu ngoặc đơn, ngoặc vuông và dấu câu (e.g. `( the pink tiles )` -> `(the pink tiles)`, `meters .` -> `meters.`, `don 't` -> `don't`).
  - Triển khai `isMostlyAllCaps(str)` & `toSentenceCase(str)`: tự động nhận diện câu bị IN HOA TOÀN BỘ từ OCR hoặc web (e.g. `PASS THE BALL BRO, I AM INTERESTED`) và chuyển đổi sang sentence case tự nhiên mà vẫn giữ nguyên từ ngữ gốc.
  - Tích hợp chuẩn hóa ngữ cảnh vào `extractSentenceContext`, `openFloatingPopover`, và `openCropLoadingPopover`.
  - Cập nhật System Prompt và Vision OCR Prompt để AI tự động chuẩn hóa văn bản ngay từ đầu.
- [x] **Task 39.3:** Xây dựng Bộ Quản lý Phiên Ngữ cảnh (`ContextSessionManager`):
  - Quản lý phiên ngữ cảnh theo câu: tái sử dụng 100% bản dịch tiếng Việt của câu (`existingTranslation`) khi người dùng đổi từ trong cùng một câu, giảm độ trễ về 0 cho khối ví dụ và tiết kiệm token tối đa.
  - Highlight từ/cụm từ mục tiêu phía client (`highlightWordInSentence`) bằng thẻ `<b class="anki-example-highlight">` màu cyan nổi bật `#38bdf8`, độc lập với việc AI có trả thẻ `<b>` hay không.
  - Triển khai Partial Skeleton Loading: khi đổi từ trên thanh Captured Context Chips, khối câu ngữ cảnh và bản dịch tiếng Việt được giữ nguyên trên màn hình với 0ms delay, chỉ hiển thị skeleton shimmer tại các trường từ vựng mục tiêu (`word`, `pos`, `phonetic`, `meaning_vi`, `definition_en`).
- [x] **Task 39.4:** Kiểm tra toàn diện cú pháp codebase, nâng version lên `[3.14.0]` trong `manifest.json`, `popup/popup.html`, cập nhật `CHANGELOG.md` và `TASKS.md`.

---

## Phase 40: POS Standardization & Green Popover Toggle Switch [DONE]
- [x] **Task 40.1:** Chuẩn hóa hoàn toàn trường Loại từ (Part of Speech - POS) theo đúng một format thống nhất:
  - Xây dựng module chuẩn hóa `normalizePos(rawPos)` triệt để: loại bỏ hoàn toàn tình trạng lúc trả về viết tắt (e.g. `Prep`, `prep.`, `n`, `v`, `adj`, `adv`, `conj`, `pron`), lúc trả về viết đầy đủ (e.g. `preposition`, `noun`, `verb`, `adjective`, `adverb`).
  - Quy chuẩn 100% về danh mục chuẩn từ điển viết thường (lowercase): `noun`, `verb`, `adjective`, `adverb`, `preposition`, `conjunction`, `pronoun`, `interjection`, `phrasal verb`, `idiom`.
  - Cập nhật quy tắc bắt buộc trong `DEFAULT_PROMPT` (`background/config.js`) và toàn bộ System Instructions (`background/ai-service.js` cho Gemini Fast, OpenAI, Gemini Vision, OpenAI Vision).
  - Tích hợp mô tả `description` ràng buộc trong `responseSchema` của Gemini API.
  - Tự động chuẩn hóa POS ở các tầng: AI parse fallback, `normalizeSchema`, `content/content.js`, `content/popover-ui.js`, `popup/popup.js`, và `background/anki-service.js` trước khi lưu thẻ Anki.
  - Bổ sung bộ lắng nghe sự kiện `blur` trên các badge POS có thể chỉnh sửa (`contenteditable`) để tự động hoàn nguyên về chuẩn ngay sau khi người dùng sửa.
- [x] **Task 40.2:** Đổi màu nút bật/tắt selection popover trong icon extension thành màu xanh lá cây:
  - Cập nhật styling trong `popup/popup.css` cho `.mini-switch input:checked + .mini-switch-slider` sang tone xanh lá Emerald (`#10B981` Dark Mode, `#059669` Light Mode).
  - Bổ sung hiệu ứng focus ring xanh lá đồng điệu (`rgba(16, 185, 129, 0.4)` / `rgba(5, 150, 105, 0.3)`) và hover brightness.
  - Tinh chỉnh trạng thái màu chữ nhãn (`selectionToggleLabel`) khi bật sang `var(--text-primary)`.
- [x] **Task 40.3:** Kiểm tra toàn diện cú pháp codebase, nâng version lên `[3.15.0]` trong `manifest.json`, `popup/popup.html`, cập nhật `CHANGELOG.md` và `TASKS.md`.

---

## Phase 41: Mozilla Firefox Dedicated Edition [DONE]
- [x] **Task 41.1:** Khởi tạo kiến trúc build và đóng gói riêng cho Firefox (`build_firefox.js`):
  - Tự động đồng bộ toàn bộ mã nguồn (`background/`, `content/`, `popup/`, `options/`, `icons/`) vào thư mục chuyên dụng `firefox/`.
  - Tự động chuyển đổi `manifest.json` sang chuẩn Firefox Manifest V3 Gecko (`browser_specific_settings.gecko.id: "anki-ai-vocab@spacetimevoid.github.io"` và `strict_min_version: "109.0"`).
  - Cấu hình Background Script chuẩn Firefox: `background: { scripts: ["background/background.js"], type: "module" }`.
- [x] **Task 41.2:** Tối ưu hóa khả năng tương thích chéo trình duyệt (Cross-Browser Compatibility):
  - Cập nhật bộ chụp màn hình `CAPTURE_AND_LOOKUP_HYBRID` trong `background/background.js` hỗ trợ an toàn cả API `chrome.tabs.captureVisibleTab` và `browser.tabs.captureVisibleTab`.
  - Loại trừ các tiền tố URL nội bộ Firefox `moz-extension://` và `about:` trong bộ lọc context menu.
- [x] **Task 41.3:** Bổ sung hướng dẫn cài đặt Firefox trong `README.md` và `firefox/README.md` (nạp trực tiếp qua `about:debugging`).
- [x] **Task 41.4:** Kiểm tra cú pháp, cập nhật `CHANGELOG.md` và commit/push lên GitHub.

---

## Phase 42: Real-Time Anki Deck Auto-Sync in Popover & Popup [DONE]
- [x] **Task 42.1:** Loại bỏ phụ thuộc vào việc người dùng phải mở Options và ấn Save Settings để cập nhật danh sách Anki deck:
  - Bổ sung hàm đồng bộ real-time `syncLiveAnkiDecks(currentConfig)` trong `background/background.js`, tự động truy vấn `getDeckNames(currentConfig)` từ AnkiConnect trực tiếp.
  - Tự động so sánh và lưu cập nhật `availableDecks` và `deckName` vào `chrome.storage.sync` & `chrome.storage.local` ngay khi phát hiện deck mới hoặc deck bị đổi tên trong Anki.
  - Bổ sung action `FETCH_LIVE_DECKS` vào message dispatcher của background worker để phục vụ content script và popup query theo nhu cầu.
- [x] **Task 42.2:** Tối ưu hóa hiệu năng đồng bộ deck không gây trễ (0ms perceived latency):
  - Chạy `syncLiveAnkiDecks` song song (concurrent) với AI Explanation (`EXPLAIN_WORD`) và Hybrid OCR (`CAPTURE_AND_LOOKUP_HYBRID`), trả về danh sách `decks` mới nhất cùng với kết quả tra từ.
  - Tích hợp timeout đua tốc độ 500ms trong `GET_CONFIG` để background cung cấp ngay lập tức cấu hình với live decks mà không làm đơ popover hoặc popup nếu AnkiConnect phản hồi chậm.
- [x] **Task 42.3:** Tự động làm mới danh sách deck trong Popover và Popup (Real-Time UI Update):
  - Cập nhật `content/content.js` và `content/popover-ui.js`: Bổ sung `bindDeckMenuItems` và hàm `_updateDeckMenu(freshDecks)` giúp dropdown deck tự cập nhật DOM động mà không cần render lại toàn bộ popover.
  - Kích hoạt truy vấn live decks khi người dùng nhấn mở dropdown `#anki-deck-trigger`, bắt trọn mọi deck mới tạo trong Anki Desktop.
  - Lắng nghe `chrome.storage.onChanged` đối với key `availableDecks` để tự động đẩy danh sách deck mới tới popover đang mở.
  - Cập nhật `popup/popup.js`: Tự động làm mới `<select id="popup-deck-select">` khi popup mở và khi focus vào dropdown deck.
- [x] **Task 42.4:** Đồng bộ hóa sang Firefox Edition và kiểm tra chất lượng:
  - Chạy `node build_firefox.js` đồng bộ toàn bộ thay đổi sang thư mục `firefox/`.
  - Kiểm tra cú pháp toàn diện (`node --check`) qua tất cả các file trong codebase với 0 lỗi.
  - Nâng version lên `v3.16.0` trong `manifest.json`, `popup/popup.html`, cập nhật `CHANGELOG.md` và `TASKS.md`.

---

## Phase 43: Redesign Captured Context: Streamlined Natural Bôi Đen & 1-Click Lookup [DONE]
- [x] **Task 43.1:** Tái thiết kế trải nghiệm văn bản tự nhiên trong Captured Context:
  - Loại bỏ hoàn toàn cơ chế chip rời rạc với `user-select: none` và bộ lắng nghe `mousemove` phức tạp dễ lỗi.
  - Chuyển đổi thành luồng văn bản liên tục tự nhiên (`user-select: text !important`), hỗ trợ bôi đen nguyên bản (native text selection) chuẩn xác 100% trên mọi trình duyệt.
  - Đánh dấu từ/cụm từ đang được phân tích bằng thẻ `<mark class="anki-ctx-target-pill">` màu cyan nổi bật.
- [x] **Task 43.2:** Triển khai cơ chế tương tác kép tối giản và tiện lợi:
  - **1-Click Lookup:** Click vào bất kỳ từ đơn nào trong câu ngữ cảnh để tra cứu ngay lập tức (0ms nếu đã có trong session cache), không cần bôi đen hay thao tác phức tạp.
  - **Bôi đen mượt mà (Natural Selection):** Khi kéo chuột bôi đen một cụm từ bất kỳ, hiển thị ngay nút nổi Floating Action Pill (`#anki-selection-pill`) phía trên vùng chọn: `Look up "..." ↵` kèm nút hành động trên thanh tiêu đề (`#anki-ctx-header-btn`).
  - Hỗ trợ phím tắt `Enter` để kích hoạt tra cứu nhanh, phím `Escape` hoặc click ra ngoài để hủy vùng chọn mượt mà.
  - Hỗ trợ đầy đủ sao chép văn bản (`Ctrl+C`), double-click chọn từ, và tự động ẩn nút nổi khi cuộn nội dung popover.
- [x] **Task 43.3:** Kiểm tra cú pháp toàn diện, đồng bộ sang Firefox và nâng version `v3.17.0`:
  - Đồng bộ mã nguồn sang thư mục `firefox/` với `node build_firefox.js`.
  - Kiểm tra cú pháp toàn bộ file với 0 lỗi (`node --check`).
  - Cập nhật `DESIGN.md`, `TASKS.md` và `CHANGELOG.md`.









