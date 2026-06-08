// A small probe script injected into HTML artifact iframes so the outer
// page can mediate annotations. The probe:
//   - On mouseup with a non-empty selection, posts a `selectionAnchor`
//     message with the selected text + a stable descriptor.
//   - On Alt/Option + click on a discrete element (not text), posts an
//     `elementAnchor` message with tag + index + text excerpt + descriptor.
//   - Renders visible highlight markers when the parent posts
//     `applyHighlights` with a list of descriptors.
//
// All cross-frame traffic uses { source: 'cherry-annot', type, payload }.
//
// The probe is deliberately tiny — it's a prototype, not a robust DOM
// observer.

export const ANNOT_CHANNEL = 'cherry-annot';

// IMPORTANT: this is `String.raw` so that backslashes in inner regex literals
// (e.g. /\[(\d+)\]/) survive template-literal escape processing. Without it
// TypeScript turns `\[` → `[`, `\d` → `d`, etc., which silently breaks the
// regex and prevents the entire injected script from compiling.
const PROBE_SOURCE = String.raw`
(function () {
  var CH = ${JSON.stringify(ANNOT_CHANNEL)};
  var highlights = [];
  var highlightLayer = null;

  function ensureLayer() {
    if (highlightLayer) return highlightLayer;
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483600;';
    el.setAttribute('data-cherry-annot-layer', '');
    document.documentElement.appendChild(el);
    highlightLayer = el;
    return el;
  }

  function send(type, payload) {
    try { parent.postMessage({ source: CH, type: type, payload: payload }, '*'); } catch (e) { /* noop */ }
  }

  function describeElement(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    var tag = el.tagName.toLowerCase();
    // Pick the canonical "container" the click landed in for chart bars
    // etc. that are usually inner spans/rects.
    var node = el;
    if (tag === 'tspan' || tag === 'text') node = el.parentElement || el;
    if (!node) return null;
    var t = (node.tagName || '').toLowerCase();
    // Index among same-tag siblings.
    var idx = 0;
    var same = document.getElementsByTagName(t);
    for (var i = 0; i < same.length; i++) {
      if (same[i] === node) { idx = i; break; }
    }
    var text = (node.textContent || '').trim().slice(0, 80);
    var rect = node.getBoundingClientRect();
    return {
      tag: t,
      index: idx,
      excerpt: text || ('<' + t + '> 元素'),
      descriptor: t + '[' + idx + ']',
      rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
    };
  }

  function describeSelection(sel) {
    if (!sel || sel.rangeCount === 0) return null;
    var range = sel.getRangeAt(0);
    var text = sel.toString();
    if (!text || text.trim().length < 2) return null;
    var rect = range.getBoundingClientRect();
    // Walk up to nearest block-level ancestor as the anchor "node".
    var node = range.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentElement;
    var blockTag = '';
    var n = node;
    while (n && n.nodeType === 1) {
      var t = n.tagName.toLowerCase();
      if (/^(p|li|h1|h2|h3|h4|h5|h6|blockquote|td|th|figure)$/.test(t)) { blockTag = t; break; }
      n = n.parentElement;
    }
    var blockIdx = 0;
    if (blockTag && n) {
      var same = document.getElementsByTagName(blockTag);
      for (var i = 0; i < same.length; i++) { if (same[i] === n) { blockIdx = i; break; } }
    }
    return {
      excerpt: text.trim().slice(0, 200),
      descriptor: (blockTag || 'range') + '[' + blockIdx + ']/text',
      blockTag: blockTag,
      blockIdx: blockIdx,
      rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
    };
  }

  document.addEventListener('mouseup', function (e) {
    setTimeout(function () {
      var sel = window.getSelection();
      var info = describeSelection(sel);
      if (info) {
        send('selectionAnchor', info);
      }
    }, 0);
  }, true);

  document.addEventListener('click', function (e) {
    // Treat Alt-click as the element-pointer gesture so plain selection still
    // works for text. Also accept a plain click on non-text leaf elements
    // (svg shapes, img, button, canvas).
    var isElementGesture = e.altKey;
    var target = e.target;
    if (!isElementGesture && target) {
      var t = target.tagName ? target.tagName.toLowerCase() : '';
      if (/^(img|button|svg|canvas|rect|circle|path|video|iframe|input|select)$/.test(t)) {
        isElementGesture = true;
      }
    }
    if (!isElementGesture) return;
    e.preventDefault(); e.stopPropagation();
    var info = describeElement(target);
    if (info) send('elementAnchor', info);
  }, true);

  var pinLeaveTimer = null;
  function paintHighlights() {
    var layer = ensureLayer();
    layer.innerHTML = '';
    // Layer must allow pointer events on pins (default pointer-events:none
    // suppresses them); switch to pass-through with per-pin override.
    layer.style.pointerEvents = 'none';
    highlights.forEach(function (h, i) {
      // Try to locate the anchor node by descriptor.
      var node = null;
      var m = /^([a-z0-9]+)\[(\d+)\](\/text)?$/.exec(h.descriptor);
      if (m) {
        var same = document.getElementsByTagName(m[1]);
        node = same[Number(m[2])] || null;
      }
      if (!node) return;
      var r = node.getBoundingClientRect();
      var pin = document.createElement('div');
      pin.setAttribute('data-cherry-pin-id', h.id);
      pin.style.cssText = 'position:absolute;left:' + (r.left + r.width - 6) + 'px;top:' + (r.top - 6) + 'px;' +
        'width:16px;height:16px;border-radius:9999px;background:#f59e0b;color:#fff;font:600 10px/16px ui-sans-serif,system-ui;' +
        'text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.25);pointer-events:auto;cursor:pointer;z-index:2147483601;transition:transform .12s;';
      pin.textContent = String(i + 1);
      pin.addEventListener('mouseenter', function () {
        if (pinLeaveTimer) { clearTimeout(pinLeaveTimer); pinLeaveTimer = null; }
        pin.style.transform = 'scale(1.15)';
        var pr = pin.getBoundingClientRect();
        send('pinHover', { id: h.id, rect: { x: pr.left, y: pr.top, w: pr.width, h: pr.height } });
      });
      pin.addEventListener('mouseleave', function () {
        pin.style.transform = '';
        if (pinLeaveTimer) clearTimeout(pinLeaveTimer);
        pinLeaveTimer = setTimeout(function () { send('pinLeave', { id: h.id }); }, 220);
      });
      layer.appendChild(pin);
      if (m && m[3]) {
        // Text annotation: also draw a wash on the block.
        var wash = document.createElement('div');
        wash.style.cssText = 'position:absolute;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;' +
          'background:rgba(245,158,11,.08);border-bottom:1.5px solid rgba(245,158,11,.5);pointer-events:none;border-radius:2px;';
        layer.appendChild(wash);
      } else {
        var ring = document.createElement('div');
        ring.style.cssText = 'position:absolute;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;' +
          'outline:2px solid #f59e0b;outline-offset:1px;border-radius:4px;pointer-events:none;';
        layer.appendChild(ring);
      }
    });
  }
  // Allow parent to cancel a pending pinLeave when the user moves the
  // cursor onto the overlay popover (which lives outside the iframe).
  function cancelPinLeave() {
    if (pinLeaveTimer) { clearTimeout(pinLeaveTimer); pinLeaveTimer = null; }
  }

  window.addEventListener('scroll', paintHighlights, true);
  window.addEventListener('resize', paintHighlights);

  window.addEventListener('message', function (ev) {
    var msg = ev.data;
    if (!msg || msg.source !== CH) return;
    if (msg.type === 'setEnabled') {
      // Visual hint only — the actual gating happens on the parent.
      document.body && (document.body.style.cursor = msg.payload ? 'crosshair' : '');
    } else if (msg.type === 'applyHighlights') {
      highlights = Array.isArray(msg.payload) ? msg.payload : [];
      paintHighlights();
    } else if (msg.type === 'cancelPinLeave') {
      cancelPinLeave();
    } else if (msg.type === 'ping') {
      send('pong', { ok: true });
    }
  });

  // Announce readiness.
  send('ready', { url: location.href });
})();
`;

export function injectProbe(html: string): string {
  const tag = `<script>${PROBE_SOURCE}</script>`;
  // Insert before </body> if present, otherwise append.
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${tag}</body>`);
  }
  return html + tag;
}
