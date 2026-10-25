<div align="center">

  <img src="icons/icon.svg" width="96" height="96" alt="Anki AI Vocab Logo" />

  # Anki AI Vocab
  ### Smart Context-Aware Vocabulary Card Creator for Google Chrome

  [![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?style=flat-square&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
  [![Version](https://img.shields.io/badge/Release-v3.9.0-10B981?style=flat-square)](https://github.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6?style=flat-square)](LICENSE)
  [![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_Flash--Lite_%7C_OpenAI-8B5CF6?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
  [![AnkiConnect](https://img.shields.io/badge/Anki-AnkiConnect_Ready-F59E0B?style=flat-square&logo=anki&logoColor=white)](https://ankiweb.net/shared/info/2055492159)
  [![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

  <p align="center">
    Bôi đen từ vựng tiếng Anh trên bất kỳ trang web nào, nhận bản phân tích AI theo đúng ngữ cảnh trong <b>dưới 0.5 giây</b> và tạo thẻ học <b>Anki Flashcard</b> chất lượng cao chỉ với <b>1 cú click</b>.
  </p>

  [Tính Năng Nổi Bật](#-tính-năng-nổi-bật) • [Cài Đặt & Cấu Hình](#-hướng-dẫn-cài-đặt) • [Cấu Trúc Mã Nguồn](#-cấu-trúc-mã-nguồn) • [Khắc Phục Sự Cố](#-khắc-phục-sự-cố-faq) • [Đóng Góp](#-đóng-góp--phát-triển)
</div>

---

## 💡 Giới Thiệu Dự Án

Khi học ngoại ngữ trên các trang web tin tức, tài liệu kỹ thuật hoặc sách báo (Medium, Reddit, BBC, Github...), việc phải liên tục chuyển tab để tra từ điển rồi copy-paste thủ công từng trường thông tin vào Anki làm đứt gãy mạch đọc và tiêu tốn nhiều thời gian. Hơn nữa, tra từ điển thông thường thường chỉ cho nghĩa gốc chung chung mà không khớp với **ngữ cảnh thực tế của câu văn**.

**Anki AI Vocab** giải quyết triệt để vấn đề này với cơ chế trích xuất ngữ cảnh thông minh, kết nối trực tiếp với **Google Gemini 3.5 Flash-Lite** và giao tiếp với **Anki Desktop** qua **AnkiConnect API**.

---

## ✨ Tính Năng Nổi Bật

### 1. ⚡ Tra Từ Theo Ngữ Cảnh Tốc Độ Cao (<0.5s)
- **Context-Aware Analysis**: Tự động bắt trọn câu văn chứa từ được chọn, phân tích nghĩa tiếng Việt và định nghĩa tiếng Anh chuẩn xác nhất theo ngữ cảnh đó.
- **Tối ưu Quota & Tốc độ**: Tích hợp mô hình `gemini-3.5-flash-lite` (hoặc `gemini-3.1-flash-lite`) với thời gian phản hồi siêu tốc dưới 500ms, tận dụng tối đa gói Google AI Studio Free (500 lượt/ngày, hoàn toàn miễn phí).
- **Hỗ trợ Đa Nền Tảng AI**: Dễ dàng chuyển đổi giữa **Google Gemini**, **OpenAI** (`gpt-4o-mini`), hoặc bất kỳ máy chủ **Custom / Ollama (OpenAI-compatible)** nào.

### 2. 🧠 Bộ Nhớ Đệm Thông Minh (Context-Aware FNV-1a Cache)
- **Phân tách từ đa nghĩa**: Tự động băm câu ngữ cảnh bằng thuật toán **32-bit FNV-1a**. Cùng một từ như *"bank"*, khi gặp trong ngữ cảnh tài chính và ngữ cảnh địa lý (*"river bank"*), hệ thống phân tích và lưu đệm hoàn toàn độc lập.
- **Phản hồi 0ms**: Những câu văn đã từng tra cứu sẽ được truy xuất tức thì từ bộ nhớ đệm mà không tốn thêm quota API.
- **Nút Tra Lại (Re-lookup / Force Refresh)**: Cho phép ép AI phân tích lại với cờ `bypassCache = true` chỉ với 1 click.

### 3. 🎯 Dịch Trọn Vẹn 100% Câu Ghép & Tự Sinh Ví Dụ
- **Không bỏ sót mệnh đề**: Khắc phục triệt để lỗi AI cắt bớt vế sau trong các câu ghép/câu phức dài; dịch đầy đủ 100% tất cả mệnh đề phụ và liên từ.
- **Tự sinh câu ví dụ cho từ đơn lẻ**: Khi bạn chỉ bôi đen 1 từ duy nhất không kèm câu văn, AI tự động sinh câu ví dụ tiếng Anh thực tế (B1-B2) và bản dịch tiếng Việt hoàn chỉnh.

### 4. 🪟 Giao Diện Popover Nổi Hiện Đại (Zero Backdrop / Non-Blocking)
- **100% Không chặn thao tác**: Hoàn toàn không tạo lớp màn đen làm tối trang web (`no backdrop`), người dùng vừa xem thẻ vừa đọc bài viết và cuộn chuột bình thường.
- **Shadow DOM Encapsulated**: Đóng gói cô lập CSS bên trong Shadow Root, không bị ảnh hưởng bởi style hay font chữ của trang web cha.
- **Kéo Thả Tự Do (Draggable)**: Kéo thả popover linh hoạt đến vị trí mong muốn trên màn hình với lề giới hạn an toàn, không bị trôi ra ngoài viewport.
- **Ghim Cửa Sổ (Pin Mode)**: Tùy chọn giữ popover luôn mở, chỉ đóng khi người dùng nhấn nút `×`.

### 5. 🎨 Chuẩn Mực Thiết Kế Minimalist Shadcn / Zinc
- **Typography hài hòa**: Tách biệt rõ ràng hàng Từ vựng + Badge từ loại và hàng Phiên âm IPA.
- **Font Times New Roman cho IPA**: Giúp các ký tự ngữ âm quốc tế hiển thị chuẩn xác, thanh thoát và chuẩn học thuật.
- **Badge Từ Loại Pastel Muted**: Phân loại trực quan theo màu sắc (Verb xanh dương, Noun lục ngọc, Adjective tím amber...).
- **Chỉnh sửa trực tiếp (Inline Editing)**: Cho phép click vào bất kỳ văn bản nào trên thẻ để sửa nhanh trước khi lưu vào Anki.

### 6. 🎙️ Tải Âm Thanh Phát Âm Bản Ngữ Vào Anki
- Tự động tải file âm thanh phát âm chuẩn (`.mp3`) và lưu trữ trực tiếp vào kho media của Anki Desktop.
- **Tùy chọn giọng đọc linh hoạt**: Tùy chọn **Random**, **Male Voice (Giọng Nam)**, hoặc **Female Voice (Giọng Nữ)** trong trang cài đặt.

### 7. 🚀 Extension Popup Thông Minh (Active Tab Auto-Fill)
- Khi click icon trên thanh trình duyệt, popup tự động phát hiện văn bản đang bôi đen trên tab hiện tại qua `chrome.scripting.executeScript` và tra cứu ngay.
- Tự co giãn chiều cao linh hoạt, loại bỏ khoảng trống thừa khi chưa tra từ.
- Bổ sung bộ chọn **Target Deck** và nút **Add to Anki** đồng bộ với Popover.

---

## 🛠️ Hướng Dẫn Cài Đặt

### Bước 1: Cài Đặt & Cấu Hình Anki Desktop + AnkiConnect (Bắt buộc)

1. Tải và cài đặt phần mềm [Anki Desktop](https://apps.ankiweb.net/) (Windows / macOS / Linux).
2. Mở Anki, trên thanh menu chọn **Tools (Công cụ)** ➔ **Add-ons**.
3. Bấm nút **Get Add-ons...**, nhập mã add-on: `2055492159` rồi bấm **OK** để cài đặt **AnkiConnect**.
4. Khởi động lại Anki.
5. **Cấu hình CORS cho AnkiConnect (Rất Quan Trọng)**:
   - Vào lại menu **Tools** ➔ **Add-ons**.
   - Chọn **AnkiConnect** trong danh sách và bấm nút **Config** ở góc bên phải.
   - Thêm `"*"` vào danh sách `webCorsOriginList` như dưới đây:
     ```json
     {
         "apiKey": null,
         "webBindAddress": "127.0.0.1",
         "webBindPort": 8765,
         "webCorsOriginList": [
             "*"
         ]
     }
     ```
   - Bấm **OK** và khởi động lại Anki để cấu hình có hiệu lực.

---

### Bước 2: Cài Đặt Anki AI Vocab Vào Trình Duyệt Chrome

1. Tải mã nguồn của dự án này về máy (hoặc dùng `git clone https://github.com/<your-username>/anki-ai-vocab.git`).
2. Mở trình duyệt Google Chrome hoặc Microsoft Edge, truy cập địa chỉ:
   ```text
   chrome://extensions/
   ```
3. Bật công tắc **Developer mode (Chế độ dành cho nhà phát triển)** ở góc trên bên phải.
4. Bấm nút **Load unpacked (Tải tiện ích đã giải nén)** ở góc trên bên trái.
5. Chọn thư mục chứa mã nguồn của extension.
6. Biểu tượng **Anki AI Vocab** ("The Luminary Flashcard") sẽ xuất hiện trên thanh công cụ của trình duyệt.

---

### Bước 3: Cấu Hình API Key (Hoàn Toàn Miễn Phí)

1. Nhấp chuột phải vào biểu tượng extension trên thanh công cụ ➔ chọn **Options (Tùy chọn)** (hoặc click vào icon bánh răng trên popup).
2. **Chọn AI Provider**: Khuyên dùng **Google Gemini** (Mặc định).
3. Lấy API Key miễn phí từ [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Dán API Key vào ô cấu hình và bấm **Save Settings**.
5. Extension sẽ tự động kết nối với AnkiConnect để tải danh sách **Decks** (Bộ bài) và **Note Types** (Loại thẻ) hiện có của bạn.

---

## 📖 Hướng Dẫn Sử Dụng

| Thao tác | Mô tả |
| :--- | :--- |
| **Bôi đen từ vựng trên trang web** | Popover xuất hiện tự động dưới cụm từ, hiển thị nghĩa, phiên âm, câu ví dụ và bản dịch. |
| **Kéo thả tiêu đề (Drag Header)** | Nhấn giữ chuột vào thanh tiêu đề để di chuyển popover tránh che khuất nội dung quan trọng. |
| **Sửa trực tiếp (Inline Editing)** | Click trực tiếp vào từ, phiên âm, nghĩa hoặc câu ví dụ để chỉnh sửa theo ý bạn. |
| **Nút Loa (`Speaker`)** | Nghe phát âm từ vựng theo cấu hình giọng nam/nữ đã chọn. |
| **Nút Tra Lại (`Refresh`)** | Bỏ qua cache và yêu cầu AI phân tích lại câu ngữ cảnh hiện tại. |
| **Nút Hoàn Tác (`Undo`)** | Khôi phục toàn bộ nội dung về kết quả phân tích nguyên bản của AI. |
| **Chọn Bộ Bài (`Deck Selector`)** | Nhấp vào menu dropdown ở chân popover để chọn nhanh bộ bài cần lưu thẻ. |
| **Bấm `+ Add to Anki`** | Đẩy thẻ flashcard kèm file audio phát âm vào Anki Desktop ngay lập tức. |
| **Phím `Escape` / Click ra ngoài** | Đóng popover nhanh chóng (có thể bật chế độ Pin Mode trong Options). |

---

## 📂 Cấu Trúc Mã Nguồn

```text
anki-ai-vocab/
├── manifest.json              # Khai báo chuẩn Chrome Extension Manifest V3
├── icons/                     # Bộ biểu tượng thương hiệu (16, 32, 48, 128, svg)
│   ├── icon.svg               # Vector SVG nhận diện "The Luminary Flashcard"
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── background/                # Service Worker chạy nền (ES Modules)
│   ├── background.js          # Khởi tạo context menu, điều phối message passing
│   ├── config.js              # Cấu hình mặc định, lưu trữ Chrome Sync Storage
│   ├── ai-service.js          # API Gemini, OpenAI, Context-aware Cache FNV-1a
│   └── anki-service.js        # Giao tiếp HTTP với AnkiConnect & media audio
├── content/                   # Content Scripts tương tác trên trang web
│   ├── content.js             # Bắt sự kiện selection, bóc tách câu, Shadow DOM Modal
│   ├── content.css            # Scoped Stylesheet cô lập hoàn toàn trong Shadow Root
│   ├── popover-ui.js          # Template HTML & SVG icons
│   └── position-calculator.js # Thuật toán tính toán tọa độ chống tràn Viewport
├── options/                   # Trang Cài Đặt (Options Dashboard)
│   ├── options.html           # Giao diện quản lý API, Anki, Voice, Field Mapping
│   ├── options.css            # Giao diện Zinc hiện đại, dark/light switch
│   └── options.js             # Logic kiểm tra kết nối, tải decks/models, lưu cấu hình
├── popup/                     # Popup giao diện khi click thanh công cụ
│   ├── popup.html             # Shell popup tra cứu nhanh & thẻ kết quả
│   ├── popup.css              # Bố cục tự co giãn, Zinc action bar
│   └── popup.js               # Auto-fill text từ active tab, inline edit, deck selector
├── generate_icons.js          # Script tự động xuất PNG đa kích cỡ từ vector SVG
├── ANKI_TEMPLATE.md           # Hướng dẫn mẫu template thẻ Anki chuẩn phong cách
├── ARCHITECTURE.md            # Tài liệu kiến trúc hệ thống chi tiết
├── DESIGN.md                  # Bản đặc tả thiết kế UI/UX & Design Tokens
├── TASKS.md                   # Tiến độ và lịch sử các giai đoạn phát triển
└── CHANGELOG.md               # Lịch sử phiên bản chi tiết (Keep a Changelog)
```

---

## 🔧 Khắc Phục Sự Cố (FAQ)

<details>
<summary><b>1. Bấm nút Add to Anki báo lỗi "Anki Offline" hoặc không kết nối được?</b></summary>

- Đảm bảo phần mềm **Anki Desktop đang chạy** trên máy tính của bạn.
- Kiểm tra xem add-on **AnkiConnect** (code `2055492159`) đã được cài đặt chưa.
- Kiểm tra file cấu hình AnkiConnect đã có `"webCorsOriginList": ["*"]` hay chưa (xem lại [Bước 1](#bước-1-cài-đặt-và-cấu-hình-anki--ankiconnect-bắt-buộc)).
- Khởi động lại Anki sau khi chỉnh sửa cấu hình.
</details>

<details>
<summary><b>2. Gặp lỗi "API rate limit reached (429)" từ Google Gemini?</b></summary>

- Bản miễn phí của Google AI Studio cho phép **15 requests/phút (RPM)** và **500 requests/ngày (RPD)**.
- Hệ thống đã tích hợp cơ chế tự động chuyển dự phòng (Auto-Fallback) sang `gemini-3.1-flash-lite`. Nếu bạn tra cứu với tần suất rất cao liên tục trong vài giây, vui lòng chờ khoảng 10 giây trước khi thử lại.
</details>

<details>
<summary><b>3. Làm thế nào để giữ Popover không tự đóng khi bấm chuột ra ngoài?</b></summary>

- Vào trang **Options (Tùy chọn)** của extension.
- Tại mục **Preferences & Performance**, bật công tắc **Close Only via Close Button ('×')**.
- Sau khi bật, popover sẽ chỉ đóng khi bạn chủ động bấm nút `×` hoặc nhấn phím `Escape`.
</details>

---

## 🤝 Đóng Góp & Phát Triển

Mọi đóng góp, báo cáo lỗi hoặc đề xuất tính năng mới đều rất được hoan nghênh!

1. Fork dự án trên GitHub.
2. Tạo nhánh tính năng mới (`git checkout -b feat/tinh-nang-moi`).
3. Commit các thay đổi (`git commit -m 'feat: them tinh nang XYZ'`).
4. Push nhánh của bạn lên GitHub (`git push origin feat/tinh-nang-moi`).
5. Mở một **Pull Request** theo hướng dẫn tại [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 Bản Quyền & Giấy Phép

Dự án được phát hành theo giấy phép mã nguồn mở **[MIT License](LICENSE)**. Tự do sử dụng, chỉnh sửa và phân phối cho mục đích cá nhân lẫn thương mại.

<div align="center">
  <sub>Xây dựng với niềm đam mê học tập ngôn ngữ và công nghệ AI hiện đại.</sub>
</div>
