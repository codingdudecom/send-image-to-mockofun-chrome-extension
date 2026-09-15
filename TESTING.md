# Manual testing guide

## 1. Load the extension

1. Open `chrome://extensions` in Google Chrome.
2. Enable **Developer mode** in the upper-right corner.
3. Select **Load unpacked**.
4. Choose the `mockofun-chrome-extension` directory—the directory containing `manifest.json`, not the `dist` directory or ZIP file.
5. Confirm that **Send Image to MockoFun** appears as version `1.0.0` with no error badge.
6. Open the extension's **Details** page and set **Site access** to **On all sites**.

After changing the extension or reloading it from `chrome://extensions`, refresh every webpage used for testing.

## 2. Check for startup errors

1. On the extension card, select the **service worker** link.
2. In its DevTools Console, confirm there are no red errors.
3. Keep this Console open while testing a selected image. A failed network request or image decode will be visible here.

## 3. Test the image overlay

Use ordinary HTTP or HTTPS webpages; Chrome internal pages and the Chrome Web Store do not permit content-script injection.

1. Visit a page containing several images.
2. Confirm that the circular edit control appears only when both natural dimensions are greater than 300px.
3. Confirm that it does not appear on a 300×300 image or when either dimension is 300px or less.
4. Hover the control and confirm its blue highlight and slight enlargement.
5. Press `Tab` until the control is focused, then press `Enter`. Repeat with the Space key to verify keyboard operation.
6. Test a page that loads images after scrolling. Confirm that dynamically inserted images also receive controls.
7. Test a responsive `srcset` image and confirm the control is attached to the displayed image.

Expected result: each qualifying image receives one control near its upper-right corner, with no duplicates after page changes.

## 4. Test the normal MockoFun handoff

1. On a source webpage, activate the control for a qualifying image.
2. Confirm that the control shows a busy spinner while the image is fetched and prepared.
3. Confirm that the current tab—not a new tab—navigates to `https://www.mockofun.com/create/`.
4. Allow up to 45 seconds for MockoFun's editor to initialize.
5. Confirm that the selected image appears on the canvas as the new document and fills the canvas.
6. Confirm that the editor remains interactive after import.

Repeat this with:

- A JPEG image.
- A PNG image, preferably one with transparency.
- An image hosted on a different domain from the webpage displaying it.
- A landscape image wider than 2000px.
- A portrait image taller than 2000px.

Expected result: all supported images open successfully. Very large images are reduced so their longest pre-import dimension is 2000px; MockoFun additionally caps the imported editor width at 1600px.

## 5. Test guest access

Use a Chrome Guest profile or a profile that is signed out of MockoFun.

1. Select an eligible image on another website.
2. If MockoFun redirects to `/register/`, wait without interacting with the form.
3. Confirm that the extension automatically returns to `/create/` and opens the image in the guest editor.
4. Visit the MockoFun registration page directly without first selecting an image.

Expected result: the pending-image flow returns to the editor; a direct registration visit with no pending image stays on the registration page.

## 6. Verify temporary-data cleanup

Before importing an image:

1. Open the service worker DevTools from `chrome://extensions`.
2. Select **Application → Storage → Extension storage → Local**.
3. During the handoff, look for `mockofun_edit_image`. Depending on timing, it may be consumed before DevTools refreshes.

After a successful import:

1. On the MockoFun page, open DevTools.
2. Select **Application → Storage → Local storage → https://www.mockofun.com**.
3. Confirm that `mockofun_edit_image` is absent.
4. Return to the service worker's Extension storage view and confirm that the same key is absent there too.

Expected result: neither storage area retains the image after a successful import.

## 7. Test replacement behavior

1. Select image A and allow Chrome to navigate to MockoFun.
2. Before completing an import—or after deliberately interrupting it—return to a source page and select a different image B.
3. Let the second handoff complete.

Expected result: image B, the latest successfully prepared selection, opens in MockoFun rather than image A.

## 8. Test error handling

Test with an image URL that becomes unavailable or returns an HTTP error after the page loads. This can be reproduced most easily on a local test page or using DevTools request blocking.

Expected result:

- The busy state clears.
- A **Could not load this image for MockoFun** toast appears for about 2.5 seconds.
- The source page does not navigate away.
- The service worker Console may contain the underlying network or decode error, but no unhandled exception.

Also temporarily switch the extension's site access away from **On all sites** and confirm that Chrome requires access to be granted before overlays can appear.

## 9. Test the packaged build

Run:

```bash
./build.sh
unzip -t dist/send_image_to_mockofun-1.0.0.zip
```

Then extract that ZIP into a new temporary directory and load the extracted directory through `chrome://extensions`.

Expected result: validation succeeds, the ZIP reports no errors, `manifest.json` is at the ZIP root, and the extracted package behaves the same as the source directory.

## Acceptance checklist

- [ ] Extension loads without manifest or service-worker errors.
- [ ] Only images larger than 300×300 receive one edit control.
- [ ] Dynamic and responsive images work.
- [ ] Mouse and keyboard activation work.
- [ ] JPEG, PNG, cross-origin, landscape, and portrait images import.
- [ ] Oversized images are resized before storage.
- [ ] The current tab navigates to MockoFun.
- [ ] Signed-in and guest-editor flows both work.
- [ ] The imported image fills the new canvas.
- [ ] Temporary data is removed after success.
- [ ] The latest successful selection replaces an older pending image.
- [ ] Fetch/decode failures show a toast and do not navigate.
- [ ] The distributable ZIP validates and runs when extracted.
