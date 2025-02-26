# Auto Browse Agent Chrome Extension

A Chrome extension that uses Puppeteer to automate browser interactions through a popup interface.

## Features

- Get the title of the current active tab
- Highlight all links on the current page
- Uses Puppeteer Core for browser automation
- Simple popup UI with buttons and input field

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd auto-browse-agent
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

4. Load the extension in Chrome:

- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode" in the top right
- Click "Load unpacked" and select the `dist` directory

## Development

The extension consists of:

- `src/popup/popup.html` - The popup UI
- `src/popup/popup.js` - Popup interaction logic
- `src/background/background.js` - Background script with Puppeteer functionality
- `public/manifest.json` - Extension manifest file

To make changes:

1. Modify the source files
2. Run `npm run build` to rebuild
3. Click the refresh icon in `chrome://extensions/` to reload the extension

## Usage

1. Click the extension icon to open the popup
2. Enter a URL (optional)
3. Click "Get Current Page Title" to fetch the active tab's title
4. Click "Highlight All Links" to highlight all links on the current page

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
