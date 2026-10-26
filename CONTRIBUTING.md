# Contributing to Anki AI Vocab

Thank you for your interest in contributing to **Anki AI Vocab**! We welcome bug reports, feature suggestions, documentation enhancements, and code contributions.

---

## 🛠️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/anki-ai-vocab.git
   cd anki-ai-vocab
   ```

2. **Load into Google Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (top-right toggle switch).
   - Click **Load unpacked** (Tải tiện ích đã giải nén).
   - Select this repository folder.

3. **Verify Code Standards:**
   - Ensure native JavaScript syntax is clean:
     ```bash
     node generate_icons.js # Re-renders PNG icons if vector SVG is modified
     ```

---

## 🌿 Branching Strategy

- `main`: Production-ready release branch.
- `feat/<feature-name>`: New feature implementations.
- `fix/<bug-name>`: Bug fixes and performance patches.

---

## 📝 Pull Request Guidelines

1. Ensure code follows the existing clean vanilla JavaScript (ES Modules) style.
2. Maintain Manifest V3 compatibility and Shadow DOM styling isolation.
3. Keep response latency under 1 second by avoiding heavy external libraries in content scripts.
4. Update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format.
5. Submit a clear Pull Request description referencing relevant issues.

---

## 📄 License

By contributing to Anki AI Vocab, you agree that your contributions will be licensed under its [MIT License](LICENSE).

