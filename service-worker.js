'use strict';

const STORAGE_KEY = 'mockofun_edit_image';
const MAX_DIMENSION = 2000;
const FETCH_MESSAGE = 'mockofun:fetch-image';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== FETCH_MESSAGE) return false;

  prepareSelectedImage(message.url, sender)
    .then(() => sendResponse({ok: true}))
    .catch((error) => sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : 'Could not prepare image'
    }));

  return true;
});

async function prepareSelectedImage(rawUrl, sender) {
  validateRequest(rawUrl, sender);

  const response = await fetch(rawUrl, {credentials: 'include'});
  if (!response.ok) throw new Error(`Image request failed (HTTP ${response.status})`);

  const sourceBlob = await response.blob();
  if (!sourceBlob.type.startsWith('image/')) throw new Error('Selected URL is not an image');

  const bitmap = await createImageBitmap(sourceBlob, {imageOrientation: 'from-image'});
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not initialize image canvas');
    context.drawImage(bitmap, 0, 0, width, height);

    const isJpeg = /^image\/jpe?g$/i.test(sourceBlob.type);
    const outputBlob = await canvas.convertToBlob({
      type: isJpeg ? 'image/jpeg' : 'image/png',
      quality: isJpeg ? 0.92 : undefined
    });
    const dataUrl = await blobToDataUrl(outputBlob);
    await chrome.storage.local.set({[STORAGE_KEY]: dataUrl});
  } finally {
    bitmap.close();
  }
}

function validateRequest(rawUrl, sender) {
  if (!sender || !sender.tab || sender.frameId !== 0 || !sender.url) {
    throw new Error('Image request did not come from a top-level webpage');
  }

  const senderUrl = new URL(sender.url);
  const imageUrl = new URL(rawUrl);
  if (!['http:', 'https:'].includes(senderUrl.protocol) ||
      !['http:', 'https:'].includes(imageUrl.protocol) ||
      /(^|\.)mockofun\.com$/i.test(senderUrl.hostname)) {
    throw new Error('Unsupported image request');
  }
}

async function blobToDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const chunkSize = 0x8000;
  const chunks = [];
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + chunkSize)));
  }
  return `data:${blob.type};base64,${btoa(chunks.join(''))}`;
}
