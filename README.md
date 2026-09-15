<p align="center">
  <img src="icons/icon-128.png" width="128" height="128" alt="Send Image to MockoFun extension icon">
</p>

<h1 align="center">Send Image to MockoFun for Chrome</h1>

<p align="center">Open images from almost any webpage directly in the MockoFun online editor.</p>

![Send Image to MockoFun workflow](store-assets/screenshot-1280x800.png)

## What it does

The extension places a small edit icon over webpage images larger than 300 × 300 pixels. Clicking it prepares the selected image locally and opens it as a new design at [MockoFun](https://www.mockofun.com/create/).

- Handles regular HTTP and HTTPS webpages, including dynamically loaded images.
- Resizes very large images to a maximum dimension of 2000px before handoff.
- Replaces a previously pending image with the latest successful selection.
- Supports MockoFun's guest editor when registration would otherwise interrupt the handoff.
- Removes temporary image data after the editor confirms a successful import.

## Install for development

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose this directory.
4. Visit a webpage containing an image larger than 300 × 300 pixels.

Chrome does not inject extensions into its internal pages. If Chrome is configured to grant this extension access only on click, grant access and refresh the source page.

## Build

The extension is plain Manifest V3 JavaScript and CSS with no runtime dependencies, transpilation, bundling, minification, or remote code.

```bash
./build.sh
```

This validates the manifest and scripts, then creates `dist/send_image_to_mockofun-1.0.0.zip`. The ZIP contains only runtime files and is ready for the Chrome Web Store upload form.

For a complete browser test matrix and DevTools verification steps, see [TESTING.md](TESTING.md).

## Permissions and privacy

- `storage` temporarily carries one user-selected image between the source page and MockoFun.
- `unlimitedStorage` prevents a high-detail 2000px lossless image from exceeding Chrome's normal storage quota.
- HTTP/HTTPS host access detects eligible images and fetches only the image selected by the user, including cross-origin images.

There is no analytics or advertising SDK. See [PRIVACY.md](PRIVACY.md) for the complete policy and [STORE_LISTING.md](STORE_LISTING.md) for submission copy and reviewer instructions.

## Support

Email [admin@mockofun.com](mailto:admin@mockofun.com) or visit [MockoFun](https://www.mockofun.com/).

## License

All rights reserved.
