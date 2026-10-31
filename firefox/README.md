# Anki AI Vocab - Firefox Edition

Phiên bản dành riêng cho Mozilla Firefox (Manifest V3 Gecko Compliant).

## Hướng dẫn cài đặt trên Firefox (Load Temporary Add-on)

1. Mở trình duyệt Firefox và truy cập địa chỉ: `about:debugging#/runtime/this-firefox`
2. Nhấn nút **"Load Temporary Add-on..."** (Tải tiện ích tạm thời...)
3. Điều hướng đến thư mục này (`firefox/`) và chọn tệp **`manifest.json`**.
4. Tiện ích **Anki AI Vocab** sẽ xuất hiện trên thanh công cụ Firefox!

## Cấu hình nổi bật của phiên bản Firefox:
- **Manifest V3 Gecko Compliant:** Tương thích chuẩn Firefox 109.0+ với `browser_specific_settings`.
- **Background Event Script:** Cấu hình `scripts: ["background/background.js"], type: "module"` ổn định tuyệt đối trên Firefox.
- **Cross-Browser Hybrid Screen Capture:** Tự động điều chỉnh `captureVisibleTab` cho cả Chrome và Firefox API.
- **Full Offline & AnkiConnect Support:** Hoạt động mượt mà với Anki Desktop (`http://127.0.0.1:8765`).
