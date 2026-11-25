/**
 * Liquid Glass Optical Engine (Apple visionOS 3D Deck Edition)
 */
(function initLiquidGlass(global) {
  'use strict';

  function buildBezelDisplacementMap(width, height, bezelPx, cornerRadius) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const halfW = width * 0.5;
    const halfH = height * 0.5;
    const r = Math.min(cornerRadius, halfW, halfH);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = Math.abs(x + 0.5 - halfW) - (halfW - r);
        const py = Math.abs(y + 0.5 - halfH) - (halfH - r);
        const qx = Math.max(px, 0);
        const qy = Math.max(py, 0);
        const sdf = Math.hypot(qx, qy) + Math.min(Math.max(px, py), 0) - r;
        const depthFromEdge = -sdf;
        let dx = 0;
        let dy = 0;

        if (depthFromEdge > 0 && depthFromEdge < bezelPx) {
          const t = depthFromEdge / bezelPx;
          const strength = Math.pow(1 - t, 2.2) * Math.sin((1 - t) * Math.PI * 0.5);
          const sx = x + 0.5 - halfW >= 0 ? 1 : -1;
          const sy = y + 0.5 - halfH >= 0 ? 1 : -1;
          let nx = 0;
          let ny = 0;
          if (px > 0 && py > 0) {
            const len = Math.hypot(px, py) || 1;
            nx = (px / len) * sx;
            ny = (py / len) * sy;
          } else if (px > py) {
            nx = sx;
          } else {
            ny = sy;
          }
          dx = -nx * strength;
          dy = -ny * strength;
        }

        const idx = (y * width + x) * 4;
        data[idx] = Math.max(0, Math.min(255, Math.round(128 + dx * 124)));
        data[idx + 1] = Math.max(0, Math.min(255, Math.round(128 + dy * 124)));
        data[idx + 2] = 128;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  function setupOpticalRefraction() {
    const isChromium = /Chrome|Chromium|Edg|Arc/.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent);
    const supportsBackdrop = typeof CSS !== 'undefined' && (
      CSS.supports('backdrop-filter', 'blur(10px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
    );
    if (!isChromium || !supportsBackdrop) return;

    const dockMapEl = document.getElementById('lg-map-dock');
    const pillMapEl = document.getElementById('lg-map-pill');
    if (dockMapEl) {
      const dockUri = buildBezelDisplacementMap(320, 68, 15, 34);
      if (dockUri) dockMapEl.setAttribute('href', dockUri);
    }
    if (pillMapEl) {
      const pillUri = buildBezelDisplacementMap(180, 48, 12, 24);
      if (pillUri) pillMapEl.setAttribute('href', pillUri);
    }
    document.documentElement.classList.add('lg-svg-refract');
  }

  function bindSpecularTracking(root = document) {
    let rafId = 0;
    let lastEvent = null;

    function updateGlow() {
      rafId = 0;
      if (!lastEvent) return;
      const target = lastEvent.target?.closest?.('.glass-window, .glass-tile, .glass-pill, .vision-dock, .glass-orb');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((lastEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((lastEvent.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty('--mx', `${x.toFixed(1)}%`);
      target.style.setProperty('--my', `${y.toFixed(1)}%`);
    }

    root.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      lastEvent = event;
      if (!rafId) rafId = requestAnimationFrame(updateGlow);
    }, { passive: true });
  }

  function syncSlider(container, activeSelector) {
    if (!container) return;
    const indicator = container.querySelector('.lg-slider-pill');
    const active = container.querySelector(activeSelector);
    if (!indicator) return;
    if (!active) {
      indicator.style.opacity = '0';
      return;
    }
    const cRect = container.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    indicator.style.width = `${aRect.width}px`;
    indicator.style.height = `${aRect.height}px`;
    indicator.style.transform = `translate3d(${aRect.left - cRect.left + container.scrollLeft}px, ${aRect.top - cRect.top + container.scrollTop}px, 0)`;
    indicator.style.opacity = '1';
  }

  function syncAllSliders() {
    requestAnimationFrame(() => {
      document.querySelectorAll('.dock-chapters').forEach(el => syncSlider(el, '[aria-current="true"]'));
      document.querySelectorAll('.apple-segment').forEach(el => syncSlider(el, '[aria-pressed="true"]'));
    });
  }

  function applyTheme(theme, persist = true) {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'pearl' ? '#eef0f6' : '#2a2756');
    if (persist) {
      try { localStorage.setItem('jx-garlic-deck-theme', theme); } catch {}
    }
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('jx-garlic-deck-theme'); } catch {}
    applyTheme(saved === 'pearl' ? 'pearl' : 'twilight', false);
  }

  global.LiquidGlass = {
    init() {
      initTheme();
      setupOpticalRefraction();
      bindSpecularTracking(document);
    },
    syncSliders: syncAllSliders,
    toggleTheme() {
      const next = document.documentElement.dataset.theme === 'pearl' ? 'twilight' : 'pearl';
      applyTheme(next, true);
      return next;
    },
    getTheme() {
      return document.documentElement.dataset.theme || 'twilight';
    },
  };
})(window);
