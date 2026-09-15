# Chrome Web Store submission copy

## Product details

**Name:** Send Image to MockoFun

**Summary:** Adds an edit icon to large webpage images and opens the selected image in MockoFun for editing.

**Category:** Photos

**Language:** English

**Support email:** admin@mockofun.com

**Support website:** https://www.mockofun.com/

**Privacy policy:** Publish `PRIVACY.md` at a public HTTPS URL and enter that URL in the dashboard.

## Detailed description

Send Image to MockoFun provides a quick way to move an image from a webpage into the MockoFun online editor. On supported HTTP and HTTPS webpages, the extension places a small edit icon over images larger than 300 × 300 pixels. Click the icon to open that image as a new MockoFun design.

The selected image is fetched only after you activate its edit icon. It is resized when necessary, temporarily stored in the browser, and transferred to the MockoFun create page. A new successful selection replaces any previously pending image. After the image loads successfully, the temporary image data is removed.

If MockoFun redirects a guest user to registration, the extension enables MockoFun's guest editor and returns to the create page automatically. No MockoFun account is required for the basic handoff.

The extension contains no advertising, analytics SDKs, or remotely hosted executable code.

## Single purpose

Let the user select a large image on a webpage and open that image as a new document in the MockoFun online editor.

## Permission justifications

**storage:** Temporarily transports one user-selected image from its source page to the MockoFun editor. The transport value is removed after it is staged on MockoFun.

**unlimitedStorage:** A high-detail image resized to the extension's 2000px limit can still exceed Chrome's normal 10 MB local-storage quota when encoded losslessly. This permission prevents valid selected images from failing during the temporary handoff.

**Host access (`http://*/*` and `https://*/*`):** Detects eligible images on the webpages the user visits and lets the background service worker fetch the specific image whose edit control the user activates. Broad access is intrinsic to the extension's single purpose because the user may select an image from any website and the displayed image may be hosted on a different origin.

## Data-use disclosure

- **Website content:** Yes. The user-selected image and its resource URL are processed locally for the requested handoff.
- **Web history:** No collection for analytics, profiling, advertising, or transmission to the developer. The extension necessarily runs on allowed pages but does not retain or report browsing history.
- **Authentication, personal communications, financial, health, location, and form data:** No.
- Data is used only for the extension's single purpose, is not sold, is not used for advertising or creditworthiness, and is not transferred to the developer.
- The selected image is disclosed to MockoFun only because the user explicitly requests that it be opened in the MockoFun editor.

**Remote code:** No. All extension JavaScript is included in the uploaded package. The packaged main-world adapter calls MockoFun editor APIs already present on the MockoFun page but does not download or evaluate executable code.

## Reviewer test instructions

1. Install the extension and visit an HTTP or HTTPS page containing an image whose natural width and height are both greater than 300 pixels.
2. Confirm that a circular image-edit control appears near the image's upper-right corner.
3. Activate the control. The extension fetches and locally encodes that image, stores one temporary pending payload, and navigates the same tab to `https://www.mockofun.com/create/`.
4. If MockoFun redirects to `/register/`, confirm that the extension enables guest access and returns to `/create/`.
5. Wait for the editor to initialize and confirm that the selected image appears as the new document's canvas image.
6. In DevTools, confirm that `mockofun_edit_image` is absent from Chrome extension storage and MockoFun local storage after successful import.
7. Repeat with another image and confirm that only the latest successful selection opens.

## Graphic assets

- Store icon: `icons/icon-128.png` (128 × 128)
- Screenshot: `store-assets/screenshot-1280x800.png` (1280 × 800)
- Small promotional tile: `store-assets/small-promo-440x280.png` (440 × 280)
