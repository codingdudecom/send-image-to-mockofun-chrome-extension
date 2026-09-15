(function () {
  'use strict';

  var STORAGE_KEY = 'mockofun_edit_image';
  var LOCAL_KEY = 'mockofun_edit_image';
  var READY_EVENT = 'mockofun:pending-ready';
  var LOADED_EVENT = 'mockofun:image-loaded';
  var MOCKOFUN_URL = 'https://www.mockofun.com/create/';
  var isCreatePage = /^\/create(\/|$)/i.test(location.pathname);
  var isRegisterPage = /^\/register(\/|$)/i.test(location.pathname);

  function getLocalImage() {
    try {
      return localStorage.getItem(LOCAL_KEY) || '';
    } catch (error) {
      return '';
    }
  }

  function setLocalImage(dataUrl) {
    try {
      localStorage.setItem(LOCAL_KEY, dataUrl);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function getPendingImage() {
    try {
      var result = await chrome.storage.local.get(STORAGE_KEY);
      var stored = result && result[STORAGE_KEY];
      return typeof stored === 'string' && stored ? stored : '';
    } catch (error) {
      return '';
    }
  }

  async function clearTransportImage() {
    await chrome.storage.local.remove(STORAGE_KEY);
  }

  async function clearPendingImage() {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch (error) {}
    try {
      await clearTransportImage();
    } catch (error) {}
  }

  if (isRegisterPage) {
    getPendingImage().then(function (pendingImage) {
      if (!pendingImage && !getLocalImage()) return;
      try {
        document.cookie = 'allow_guest_editor=true; path=/; max-age=3000; SameSite=Lax; Secure';
      } catch (error) {}
      window.location.replace(MOCKOFUN_URL);
    });
    return;
  }

  if (!isCreatePage) return;

  window.addEventListener(LOADED_EVENT, clearPendingImage);
  getPendingImage().then(async function (pendingImage) {
    var dataUrl = pendingImage || getLocalImage();
    if (!dataUrl) return;

    if (pendingImage) {
      if (!setLocalImage(pendingImage)) return;
      try {
        await clearTransportImage();
      } catch (error) {
        // The page-local copy remains available for retry.
      }
    }
    window.dispatchEvent(new CustomEvent(READY_EVENT));
  });
})();
