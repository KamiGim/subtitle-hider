(function () {
  'use strict';

  const STORAGE_KEY = 'subtitleHider_';
  let overlay, controls, opacitySlider;
  let isDragging = false, isResizing = false;
  let startX, startY, startW, startH, startLeft, startTop;
  let resizeDir = '';

  function getDomain() {
    try { return new URL(window.location.href).hostname; } catch { return 'default'; }
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY + getDomain()) || 'null') || {};
    } catch { return {}; }
  }

  function saveSettings(settings) {
    try { localStorage.setItem(STORAGE_KEY + getDomain(), JSON.stringify(settings)); } catch {}
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'subtitle-hider';
    overlay.style.display = 'none';
    // Use left/top only — no right/bottom mixing
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.transform = 'translateX(0) translateY(0)';

    // Opacity slider (tiny control in corner)
    controls = document.createElement('div');
    controls.id = 'sh-controls';
    controls.style.cssText = 'position:absolute;top:4px;right:4px;display:flex;align-items:center;gap:4px;z-index:1;opacity:0;transition:opacity 0.2s;';

    const opacityLabel = document.createElement('span');
    opacityLabel.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.7);pointer-events:none;';
    opacityLabel.textContent = '∘';

    opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = '0';
    opacitySlider.max = '1';
    opacitySlider.step = '0.05';
    opacitySlider.value = '1';
    opacitySlider.style.cssText = 'width:50px;height:4px;cursor:pointer;accent-color:#fff;opacity:0.6;';
    opacitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      overlay.style.opacity = val;
      const settings = loadSettings();
      settings.opacity = val;
      saveSettings(settings);
    });

    controls.appendChild(opacityLabel);
    controls.appendChild(opacitySlider);
    overlay.appendChild(controls);

    // Resize handles (all corners and edges)
    const handles = ['nw','n','ne','e','se','s','sw','w'];
    handles.forEach(dir => {
      const h = document.createElement('div');
      h.className = 'sh-resize-handle';
      h.dataset.dir = dir;
      h.style.cssText = 'position:absolute;z-index:2;';
      const pos = {
        nw:'top:0;left:0;cursor:nw-resize;', n:'top:0;left:50%;transform:translateX(-50%);cursor:n-resize;',
        ne:'top:0;right:0;cursor:ne-resize;', e:'top:50%;right:0;transform:translateY(-50%);cursor:e-resize;',
        se:'bottom:0;right:0;cursor:se-resize;', s:'bottom:0;left:50%;transform:translateX(-50%);cursor:s-resize;',
        sw:'bottom:0;left:0;cursor:sw-resize;', w:'top:50%;left:0;transform:translateY(-50%);cursor:w-resize;'
      };
      h.style.cssText += pos[dir] + 'width:12px;height:12px;';
      overlay.appendChild(h);
    });

    document.documentElement.appendChild(overlay);

    // Show controls on hover
    overlay.addEventListener('mouseenter', () => { controls.style.opacity = '1'; });
    overlay.addEventListener('mouseleave', () => { controls.style.opacity = '0'; });

    // Apply saved settings or defaults
    const settings = loadSettings();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = settings.width || Math.round(vw * 0.7);
    const h = settings.height || 100;
    const x = settings.x != null ? settings.x : Math.round(vw * 0.15);
    const y = settings.y != null ? settings.y : vh - h - 30;

    overlay.style.width = w + 'px';
    overlay.style.height = h + 'px';
    overlay.style.left = x + 'px';
    overlay.style.top = y + 'px';
    overlay.style.transform = 'none';

    if (settings.opacity != null) {
      overlay.style.opacity = settings.opacity;
      opacitySlider.value = settings.opacity;
    }

    setupDrag();
    setupResize();
  }

  function setupDrag() {
    overlay.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('sh-resize-handle') || e.target.tagName === 'INPUT') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = overlay.offsetLeft;
      startTop = overlay.offsetTop;
      e.preventDefault();
    });
  }

  function setupResize() {
    overlay.querySelectorAll('.sh-resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizeDir = handle.dataset.dir;
        startX = e.clientX;
        startY = e.clientY;
        const rect = overlay.getBoundingClientRect();
        startW = rect.width;
        startH = rect.height;
        startLeft = rect.left;
        startTop = rect.top;
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  function persist() {
    const settings = loadSettings();
    settings.width = parseInt(overlay.style.width);
    settings.height = parseInt(overlay.style.height);
    settings.x = overlay.offsetLeft;
    settings.y = overlay.offsetTop;
    if (overlay.style.opacity) settings.opacity = parseFloat(overlay.style.opacity);
    saveSettings(settings);
  }

  document.addEventListener('mousemove', (e) => {
    if (isDragging && overlay) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      overlay.style.left = (startLeft + dx) + 'px';
      overlay.style.top = (startTop + dy) + 'px';
    }
    if (isResizing && overlay) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newW = startW, newH = startH;
      let newLeft = startLeft, newTop = startTop;

      if (resizeDir.includes('e')) newW = startW + dx;
      if (resizeDir.includes('w')) { newW = startW - dx; newLeft = startLeft + dx; }
      if (resizeDir.includes('s')) newH = startH + dy;
      if (resizeDir.includes('n')) { newH = startH - dy; newTop = startTop + dy; }

      if (newW >= 60) overlay.style.width = newW + 'px';
      if (newH >= 20) overlay.style.height = newH + 'px';
      overlay.style.left = newLeft + 'px';
      overlay.style.top = newTop + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if ((isDragging || isResizing) && overlay) persist();
    isDragging = false;
    isResizing = false;
  });

  // Initialize
  createOverlay();

  // Check if this tab should be active
  try {
    chrome.storage.local.get('activeTabs', (data) => {
      try {
        chrome.tabs.getCurrent((tab) => {
          if (tab && data.activeTabs && data.activeTabs.includes(tab.id)) {
            overlay.style.display = 'block';
          }
        });
      } catch (e) {}
    });
  } catch (e) {}

  // Listen for toggle messages
  try {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.show !== undefined) {
        overlay.style.display = msg.show ? 'block' : 'none';
      }
    });
  } catch (e) {}
})();
