(function () {
  'use strict';

  var MIN_SIZE = 300;
  var MOCKOFUN_URL = 'https://www.mockofun.com/create/';
  var FETCH_MESSAGE = 'mockofun:fetch-image';
  var handled = new WeakSet();
  var hostStyles = new WeakMap();

  function qualifies(img) {
    return img.naturalWidth > MIN_SIZE && img.naturalHeight > MIN_SIZE;
  }

  function isSkippable(src) {
    return !src || /^(data:|blob:|chrome-extension:|about:|javascript:)/i.test(src);
  }

  function makeHost(img) {
    var parent = img.parentNode;
    if (!parent) return null;
    var position = window.getComputedStyle(parent).position;
    if (position === 'static' || !position) {
      if (!hostStyles.has(parent)) {
        hostStyles.set(parent, parent.style.position);
        parent.style.position = 'relative';
      }
    }
    return parent;
  }

  function buildButton() {
    var button = document.createElement('div');
    button.className = 'mf-send-btn';
    button.setAttribute('role', 'button');
    button.setAttribute('title', 'Edit this image in MockoFun');
    button.setAttribute('aria-label', 'Edit this image in MockoFun');
    button.setAttribute('tabindex', '0');
    return button;
  }

  function addOverlay(img) {
    if (handled.has(img)) return;
    if (!img.complete) {
      img.addEventListener('load', function onLoad() {
        img.removeEventListener('load', onLoad);
        addOverlay(img);
      });
      return;
    }
    if (img.naturalWidth === 0) return;

    var src = String(img.currentSrc || img.src || '').split(' ')[0];
    if (isSkippable(src) || !qualifies(img)) return;

    var parent = makeHost(img);
    if (!parent) return;
    handled.add(img);

    var button = buildButton();
    parent.insertBefore(button, img.nextSibling);
    button.addEventListener('click', activate);
    button.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') activate(event);
    });

    function activate(event) {
      event.preventDefault();
      event.stopPropagation();
      sendToMockoFun(button, src);
    }
  }

  async function sendToMockoFun(button, src) {
    if (button.classList.contains('mf-busy')) return;
    button.classList.add('mf-busy');
    try {
      var response = await chrome.runtime.sendMessage({type: FETCH_MESSAGE, url: src});
      if (!response || !response.ok) {
        throw new Error(response && response.error || 'Could not prepare image');
      }
      window.location.href = MOCKOFUN_URL;
    } catch (error) {
      button.classList.remove('mf-busy');
      showToast('Could not load this image for MockoFun');
    }
  }

  function showToast(message) {
    var toast = document.querySelector('.mf-send-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'mf-send-toast';
      toast.setAttribute('role', 'status');
      document.documentElement.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('mf-show');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(function () {
      toast.classList.remove('mf-show');
    }, 2500);
  }

  function scan(images) {
    images.forEach(addOverlay);
  }

  scan(document.querySelectorAll('img'));
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes') {
        if (mutation.target.tagName === 'IMG') addOverlay(mutation.target);
        return;
      }
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'IMG') addOverlay(node);
        else if (node.querySelectorAll) scan(node.querySelectorAll('img'));
      });
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset']
  });
})();
