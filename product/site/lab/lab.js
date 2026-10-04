// BORN WEIRD LAB kit (tournament, DECISION #018/#019). Shared by every prototype so that
// analytics, share and friend-entry are identical and the tournament compares games, not plumbing.
// Usage in a prototype page:  <script src="../lab.js"></script>  then  const L = LAB.init('a');
(function (root) {
  'use strict';
  const NS = 'bw-lab-r1';
  const BASE = 'https://dimacloud.github.io/born-weird/lab/';

  function parseHash() {
    const out = {};
    (location.hash || '').replace(/^#/, '').split('&').forEach(kv => {
      if (!kv) return;
      const i = kv.indexOf('=');
      // A mangled link (e.g. "%ZZ") must never blank the page: skip the broken part, play normally.
      try {
        const k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
        out[k] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1));
      } catch (e) {}
    });
    return out;
  }
  function qs(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };

  function init(pid) {
    const h = parseHash();
    const qa = qs('qa') === '1';
    const founder = qs('f') === '1' || ss.get('bw_lab_f') === '1';
    if (founder) ss.set('bw_lab_f', '1');
    // A visitor is "referred" if they arrived through a shared link (ref marker in the fragment).
    // Kept for the tab so a reload mid-game stays referred.
    const refKey = 'bw_lab_ref_' + pid;
    if ('ref' in h) ss.set(refKey, h.ref || '1');
    const ref = ss.get(refKey);
    const sent = new Set();

    function hit(key) {
      if (qa) return;
      try { fetch('https://abacus.jasoncameron.dev/hit/' + NS + '/' + key, { mode: 'cors', keepalive: true }).catch(() => {}); } catch (e) {}
    }
    /** Count an event at most once per page load. Referred visitors also count ref_<ev> for view/start/done. */
    function track(ev) {
      if (sent.has(ev)) return;
      sent.add(ev);
      const pre = (founder ? 'f_' : '') + pid + '_';
      hit(pre + ev);
      if (ref && (ev === 'view' || ev === 'start' || ev === 'done')) hit(pre + 'ref_' + ev);
    }

    /**
     * Share the result. url = per-result page (has its own chat preview); state goes in the fragment.
     * Chain: navigator.share → Telegram share link → copy link. A cancelled share is not counted.
     */
    async function share({ code, state, text, onStatus }) {
      track('share_click');
      const url = BASE + pid + '/r/' + encodeURIComponent(code) + '/#ref=' + encodeURIComponent(code) + (state ? '&s=' + encodeURIComponent(state) : '');
      const say = m => { if (onStatus) onStatus(m); };
      if (navigator.share) {
        try { await navigator.share({ text: text, url: url }); track('share_ok'); say('ok'); return; }
        catch (e) { if (e && e.name === 'AbortError') { say('cancel'); return; } }
      }
      try { await navigator.clipboard.writeText(text + ' ' + url); track('share_ok'); say('copied'); }
      catch (e) {
        // Last resort: Telegram share link (works inside most in-app browsers).
        track('share_ok');
        say('tg');
        location.href = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);
      }
    }

    /** Render the 2-tap recognition check under the reveal. chips: short labels of the reveal's own lines. */
    function recog(el, chips) {
      el.innerHTML = '';
      const q = document.createElement('div'); q.className = 'lab-q'; q.textContent = 'ПОПАЛ?';
      const row = document.createElement('div'); row.className = 'lab-row';
      const answers = [['yes', 'В ТОЧКУ'], ['kinda', 'ПОЧТИ'], ['no', 'МИМО']];
      answers.forEach(([k, label]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'lab-chip'; b.textContent = label;
        b.onclick = () => {
          track('rec_' + k);
          row.querySelectorAll('button').forEach(x => { x.disabled = true; x.classList.toggle('on', x === b); });
          if (!chips || !chips.length) { thanks(); return; }
          const q2 = document.createElement('div'); q2.className = 'lab-q'; q2.textContent = k === 'no' ? 'Что мимо?' : 'Что именно?';
          const row2 = document.createElement('div'); row2.className = 'lab-row';
          chips.forEach((c, i) => {
            const cb = document.createElement('button'); cb.type = 'button'; cb.className = 'lab-chip'; cb.textContent = c;
            cb.onclick = () => { track('rec_' + k + '_' + (i + 1)); row2.querySelectorAll('button').forEach(x => { x.disabled = true; x.classList.toggle('on', x === cb); }); thanks(); };
            row2.appendChild(cb);
          });
          el.appendChild(q2); el.appendChild(row2);
        };
        row.appendChild(b);
      });
      el.appendChild(q); el.appendChild(row);
      function thanks() { const t = document.createElement('div'); t.className = 'lab-muted'; t.textContent = 'Принято.'; el.appendChild(t); }
    }

    return { pid, hash: h, qa, founder, ref, track, share, recog };
  }

  // ---------- sound: PC-speaker beeps, unlocked on the first touch (iOS needs a gesture) ----------
  const SND = (function () {
    let ctx = null, on = true;
    function ac() {
      if (!ctx) { const A = root.AudioContext || root.webkitAudioContext; if (!A) return null; try { ctx = new A(); } catch (e) { return null; } }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function unlock() {
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      const a = ac(); if (!a) return;
      try { const b = a.createBuffer(1, 1, 22050), s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); s.start(0); } catch (e) {}
      if (a.state === 'running') ['pointerdown', 'touchend', 'keydown'].forEach(ev => document.removeEventListener(ev, unlock, true));
    }
    if (typeof document !== 'undefined') ['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, true));
    function tone(f, d, at, type, vol) {
      if (!on) return;
      const a = ac(); if (!a) return;
      try {
        const o = a.createOscillator(), g = a.createGain(), st = a.currentTime + (at || 0);
        o.type = type || 'square'; o.frequency.setValueAtTime(f, st);
        g.gain.setValueAtTime(vol || 0.03, st); g.gain.exponentialRampToValueAtTime(0.0001, st + d);
        o.connect(g); g.connect(a.destination); o.start(st); o.stop(st + d + 0.02);
      } catch (e) {}
    }
    return {
      tone,
      tap() { tone(660, 0.05); },
      good() { tone(523, 0.07); tone(784, 0.1, 0.07); },
      bad() { tone(196, 0.18, 0, 'sawtooth', 0.025); },
      fall() { tone(440, 0.08); tone(330, 0.08, 0.08); tone(220, 0.12, 0.16); },
      tick(i) { tone(880 + (i || 0) * 40, 0.03, 0, 'square', 0.02); },
      reveal() { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.12, i * 0.09)); },
      mute(v) { on = !v; },
    };
  })();

  /** Pause-aware countdown: stops while the tab is hidden (Telegram sheet minimised), resumes on return. */
  function timer(ms, onTick, onEnd) {
    let left = ms, last = performance.now(), raf = 0, done = false, paused = false;
    function frame(t) {
      if (done) return;
      if (!paused) { left -= t - last; }
      last = t;
      if (onTick) onTick(Math.max(0, left) / ms);
      if (left <= 0) { done = true; cleanup(); onEnd(); return; }
      raf = requestAnimationFrame(frame);
    }
    function vis() { paused = document.hidden; last = performance.now(); }
    function cleanup() { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis); }
    document.addEventListener('visibilitychange', vis);
    raf = requestAnimationFrame(frame);
    return { stop() { done = true; cleanup(); }, get left() { return left; } };
  }

  /** Turn a canvas into an <img> (long-press save works in in-app browsers; downloads often don't). */
  function canvasImg(canvas, alt) {
    const img = document.createElement('img');
    img.alt = alt || 'BORN WEIRD';
    img.className = 'lab-card';
    img.src = canvas.toDataURL('image/png');
    return img;
  }

  /** Deterministic PRNG for simulations/tests. */
  function rng(seed) {
    let a = seed >>> 0 || 1;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  const api = { init, SND, timer, canvasImg, rng, BASE, NS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LAB = api;
})(typeof window !== 'undefined' ? window : globalThis);
