# Send Image to MockoFun Privacy Policy

Last updated: September 15, 2026

Send Image to MockoFun does not use analytics or advertising SDKs and does not sell or share user data. It does not collect account credentials, form data, or browsing history for profiling or advertising.

The extension examines image dimensions on HTTP and HTTPS webpages to display its edit control on eligible images. It accesses an image's URL and contents only after the user activates that image's edit control. This website content is fetched and processed locally in Chrome, resized when necessary, and stored temporarily in Chrome extension storage.

The selected image is then made available to the MockoFun editor at `https://www.mockofun.com/create/` through MockoFun's first-party local storage. If guest access is required, the extension sets MockoFun's first-party `allow_guest_editor` cookie and returns to the create page. The temporary image is removed from extension storage once staged on MockoFun and removed from MockoFun local storage after the editor confirms that it loaded successfully. If loading fails, the local copy may remain so the handoff can be retried. A later successful selection replaces an earlier pending selection.

The extension does not send the selected image, its URL, or the source-page URL to the extension developer. Network requests are limited to fetching the user-selected image from its existing host and navigating to MockoFun. Continued use of MockoFun is governed by the [MockoFun Privacy Policy and Terms](https://www.mockofun.com/privacy-policy/).

For privacy questions, contact [admin@mockofun.com](mailto:admin@mockofun.com).
