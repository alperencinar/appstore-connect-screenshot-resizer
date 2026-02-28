# App Store Screenshot Resizer

A simple, free tool to resize your images to exact App Store screenshot dimensions for iPhone and iPad.

## Features

- **iPhone 6.5"** — Resize to 1242 × 2688 px
- **iPad 13"** — Resize to 2064 × 2752 px
- **Batch Upload** — Upload multiple images at once via drag & drop or file picker
- **Batch Download** — Download all resized images as a ZIP file
- **No Server** — Everything runs locally in your browser

## Usage

1. Select **iPhone** or **iPad** target size
2. Drag & drop your images (or click to browse)
3. Click **Download All** (ZIP) or download individually

## Running Locally

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Tech Stack

- Vanilla JavaScript + HTML5 Canvas
- JSZip (loaded from CDN) for batch ZIP export
- No frameworks, no dependencies

## License

MIT
