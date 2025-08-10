# Portfolio & Resume Website

A responsive, dark-mode-friendly personal site showcasing **16+ years in IT**, selected projects, and a professional resume. Built for performance, accessibility, and clean UI with **HTML**, **Tailwind CSS**, and **vanilla JavaScript**.

---

## ✨ Features

- **Responsive Layout** across mobile, tablet, and desktop
- **Dark/Light Theme Toggle** with persistent preference (localStorage)
- **Sticky Navigation** with active tab highlighting
- **Projects Reveal Panel (hashless)** — button-triggered slide/fold reveal (no `#` in URL)
- **Asymmetric Animations** — faster close, smoother open (CSS-only)
- **Keyboard & A11y** — real `<button>`, `aria-expanded`, `Escape` to close
- **Skills Section** with animated progress bars
- **Downloadable Resume** (PDF)
- **Contact Form** via `mailto:` (name, email, subject, message)
- **Image Lightbox** with pan & zoom
- **SEO-friendly** meta tags and descriptions
- **No Frameworks** — minimal JS, no build required

---

## 🛠 Tech Stack

- **HTML5** & **CSS3**
- [Tailwind CSS](https://tailwindcss.com/)
- **Vanilla JavaScript**
- Optional: NGINX or GitHub Pages for hosting

---

## 🚀 Live Demo

**https://hanlonhouse.us**

---

## ⚙️ Configuration Highlights

- **Hashless Projects Toggle:** Uses a button + class toggles; no `location.hash` writes.
- **Asymmetric Timing:** Controlled in CSS:
  - Open: `transition: 800–900ms cubic-bezier(.22,.61,.36,1)`
  - Close: `transition: ~320ms ease-in`
  - Adjust durations in `.reveal-frame .flap`, `.reveal-frame .reveal-content`, and `.reveal-frame.closing …`.

---

## 📦 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Open directly
open index.html   # macOS
start index.html  # Windows
xdg-open index.html  # Linux

# Or serve locally (optional)
python3 -m http.server 8080
# then visit http://localhost:8080
