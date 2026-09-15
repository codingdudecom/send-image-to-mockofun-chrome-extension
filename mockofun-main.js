(function () {
  'use strict';

  if (!/^\/create(\/|$)/i.test(location.pathname)) return;

  var LOCAL_KEY = 'mockofun_edit_image';
  var READY_EVENT = 'mockofun:pending-ready';
  var LOADED_EVENT = 'mockofun:image-loaded';
  var OPEN_WINDOW = 45000;
  var OPEN_INTERVAL = 500;
  var EDITOR_SETTLE_TIME = 1500;
  var waitStarted = false;

  deferMockoFunApiUntilEditorExists();
  window.addEventListener(READY_EVENT, waitForEditor);
  if (getLocalImage()) waitForEditor();

  function getLocalImage() {
    try {
      return localStorage.getItem(LOCAL_KEY) || '';
    } catch (error) {
      return '';
    }
  }

  function deferMockoFunApiUntilEditorExists() {
    window.__mfReadyGuard = 'waiting-for-jquery';

    function patchReady() {
      var $ = window.jQuery;
      if (!$ || !$.fn || typeof $.fn.ready !== 'function') return false;
      if ($.fn.ready.__mockofunExtensionPatched) return true;

      var originalReady = $.fn.ready;
      $.fn.ready = function (callback) {
        var source = '';
        try {
          source = Function.prototype.toString.call(callback);
        } catch (error) {}
        if (source.indexOf('delayedJetpackIframeRemove') === -1) {
          return originalReady.call(this, callback);
        }

        window.__mfReadyGuard = 'api-callback-intercepted';
        return originalReady.call(this, function () {
          var context = this;
          var args = arguments;
          function runWhenEditorExists() {
            var editor = window.sceneGenerator;
            if (!editor || typeof editor.on !== 'function' || typeof window.wNumb !== 'function') {
              window.setTimeout(runWhenEditorExists, 25);
              return;
            }
            window.__mfReadyGuard = 'api-callback-released';
            callback.apply(context, args);
          }
          runWhenEditorExists();
        });
      };
      $.fn.ready.__mockofunExtensionPatched = true;
      window.__mfReadyGuard = 'jquery-ready-patched';
      return true;
    }

    if (patchReady()) return;
    var onReadyStateChange = function () {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        if (patchReady()) document.removeEventListener('readystatechange', onReadyStateChange, true);
      }
    };
    document.addEventListener('readystatechange', onReadyStateChange, true);
    var observer = new MutationObserver(function () {
      if (document.getElementById('scene-generator-api-js') && patchReady()) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList: true, subtree: true});
  }

  function isEditorReady() {
    var editor = window.sceneGenerator;
    return Boolean(
      editor &&
      typeof window.wNumb === 'function' &&
      typeof editor.addImage === 'function' &&
      editor.canvas &&
      typeof editor.canvas.getWidth === 'function'
    );
  }

  function waitForEditor() {
    if (waitStarted || !getLocalImage()) return;
    waitStarted = true;
    var start = Date.now();
    var readySince = 0;

    function step() {
      if (document.readyState === 'complete' && isEditorReady()) {
        if (!readySince) readySince = Date.now();
        if (Date.now() - readySince >= EDITOR_SETTLE_TIME) {
          openPendingImage();
          return;
        }
      } else {
        readySince = 0;
      }

      if (Date.now() - start < OPEN_WINDOW) window.setTimeout(step, OPEN_INTERVAL);
      else waitStarted = false;
    }
    step();
  }

  function openPendingImage() {
    var imageSrc = getLocalImage();
    var sceneGenerator = window.sceneGenerator;
    if (!imageSrc || !isEditorReady()) {
      waitStarted = false;
      return;
    }

    window.__mfDebug = {injected: true, called: true};
    var loader = typeof window.sceneGeneratorWorking === 'function'
      ? window.sceneGeneratorWorking('Loading image...')
      : null;

    try {
      sceneGenerator.addImage(imageSrc, function (object) {
        if (!object) {
          window.__mfDebug = {called: true, error: 'addImage returned falsy'};
          if (loader) loader.remove();
          waitStarted = false;
          return;
        }

        if (object.width > 1600) {
          var ratio = object.width / object.height;
          object.height = 1600 / ratio;
          object.width = 1600;
        }
        sceneGenerator.setSize({w: object.width, h: object.height});
        if (object._originalElement) {
          object.width = object._originalElement.width;
          object.height = object._originalElement.height;
        }
        object.scaleToWidth(sceneGenerator.canvas.getWidth(), true);
        object.left = 0;
        object.top = 0;
        sceneGenerator.canvas.requestRenderAll();

        try {
          localStorage.removeItem(LOCAL_KEY);
        } catch (error) {}
        window.__mfDebug = {called: true, objectAdded: true};
        window.dispatchEvent(new CustomEvent(LOADED_EVENT));
        if (loader) loader.remove();
        if (window.jQuery) {
          window.jQuery('.drawer').removeClass('active');
          window.jQuery('.contextMenu').css({'margin-left': 0});
        }
        sceneGenerator._new = false;
        waitStarted = false;
      });
    } catch (error) {
      window.__mfDebug = {called: true, error: String(error && error.message || error)};
      if (loader) loader.remove();
      waitStarted = false;
    }
  }
})();
