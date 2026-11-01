/*!
 * Kontaktcenter med Kölapp för STÖN – ersätter "Telefon: 000-000 000 (plats 42 i kön)".
 *  - Telefontid är vardagar 09.12–09.13. Statusen räknas ut live från besökarens klocka.
 *  - Kön är alltid plats 42. Du kan ta kölapp (sparas lokalt) och se vem som betjänas nu.
 *  - Fem kanaler (telefon, e-post, besök, brev, fax) med varsin statusrad.
 *  - Sidfotens kontaktkolumn får en kort version, Om oss-sidans "Kontakta oss" får hela centret.
 *
 * Aktivera med EN rad före </body>:   <script src="features/kontakt/kontakt.js" defer></script>
 * Ta bort genom att radera raden. Stäng av med data-enabled="false". Allt är lokalt och i try/catch.
 */
(function () {
    'use strict';
    try {
        var script = document.currentScript;
        if (!script || script.dataset.enabled === 'false') return;
        if (window.stonKontakt) return;
        var KEY = 'ston.kolapp.v1';
        var OPEN = [9 * 60 + 12, 9 * 60 + 13];
        var DAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
        var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function h(tag, attrs) {
            var el = document.createElement(tag);
            if (attrs) Object.keys(attrs).forEach(function (k) {
                var v = attrs[k]; if (v == null || v === false) return;
                if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v;
                else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
            });
            for (var i = 2; i < arguments.length; i++) {
                var c = arguments[i]; if (c == null || c === false) continue;
                if (Array.isArray(c)) c.forEach(function (x) { el.append(x.nodeType ? x : document.createTextNode(x)); });
                else el.append(c.nodeType ? c : document.createTextNode(c));
            }
            return el;
        }
        function store(set, v) { try { if (set) { localStorage.setItem(KEY, JSON.stringify(v)); return; } var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }

        /* ---- Tid och status ---- */
        function pad(n) { return String(n).padStart(2, '0'); }
        function hm(m) { return pad(Math.floor(m / 60)) + '.' + pad(m % 60); }
        function nextOpening(d) {
            for (var i = 0; i < 8; i++) {
                var t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, 9, 12, 0);
                var wd = t.getDay();
                if (wd !== 0 && wd !== 6 && t > d) return t;
            }
            return null;
        }
        function span(ms) {
            var s = Math.floor(ms / 1000), dd = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), mm = Math.floor(s % 3600 / 60);
            if (dd > 0) return dd + ' d ' + hh + ' h ' + mm + ' min';
            if (hh > 0) return hh + ' h ' + mm + ' min';
            return mm + ' min ' + (s % 60) + ' s';
        }
        function phoneStatus(d) {
            var m = d.getHours() * 60 + d.getMinutes(), wd = d.getDay();
            var openNow = wd >= 1 && wd <= 5 && m >= OPEN[0] && m < OPEN[1];
            if (openNow) return { open: true, text: 'Öppet just nu (till ' + hm(OPEN[1]) + '). Alla handläggare är upptagna med att svara på det här samtalet.' };
            var n = nextOpening(d);
            return { open: false, text: 'Stängt. Telefontiden är vardagar ' + hm(OPEN[0]) + '–' + hm(OPEN[1]) + '. Nästa öppning ' + (n ? DAYS[n.getDay()] + ' ' + hm(OPEN[0]) + ' (om ' + span(n - d) + ')' : 'aldrig') + '.' };
        }
        var WAIT_START = new Date(1987, 2, 14).getTime();
        function waitText(d) {
            var y = Math.floor((d.getTime() - WAIT_START) / 31557600000);
            return 'Beräknad väntetid: ' + (y + 3) + ' år (minskar inte). Du står på plats 42 av 42.';
        }

        /* ---- Kölapp ---- */
        var SERVING = ['A-0001', 'A-0001', 'A-0001'];
        function ticket() {
            var t = store(false);
            if (!t) {
                var n = 100000 + Math.floor(Math.random() * 900000);
                t = { n: 'K-' + n, at: Date.now() };
                store(true, t);
            }
            return t;
        }

        /* ---- Kontaktcenter ---- */
        var CH = [
            ['Telefon', '000-000 000', function (d) { return phoneStatus(d).text; }],
            ['E-post', 'Se bifogad fil', function () { return 'Ingen bifogad fil finns. Filen förväntas bifogas av den som svarar.'; }],
            ['Besök', 'Källaren, via plan 4', function () { return 'Hissen stannar vid plan 4. Plan 4 är under utredning. Ta trappan ned.'; }],
            ['Brev', 'Box 0, 000 00 Ingenstans', function () { return 'Svar skickas inom 6 veckor. Svaret avser din fråga om hur lång tid svar tar.'; }],
            ['Fax', '000-000 001', function () { return 'Fax mottas. Fax besvaras genom att fax skickas, vilket kräver fax.'; }]
        ];
        var live = [];
        function center() {
            var wrap = h('div', { class: 'kc-wrap', 'data-kc': '1' });
            var stat = h('p', { class: 'kc-stat', role: 'status' });
            var wait = h('p', { class: 'kc-wait' });
            var kolOut = h('p', { class: 'kc-out', 'aria-live': 'polite' });
            var tick = store(false);
            function showTicket() {
                var t = store(false);
                kolOut.textContent = t ? 'Din kölapp: ' + t.n + '. Nu betjänas: ' + SERVING[0] + ' (sedan 1987). Du har avancerat 0 platser sedan ' + new Date(t.at).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' }) + '.' : '';
            }
            var btn = h('button', { type: 'button', class: 'kc-btn', onclick: function () { ticket(); showTicket(); btn.textContent = 'Kölapp tagen'; btn.disabled = true; } }, tick ? 'Kölapp tagen' : 'Ta kölapp');
            if (tick) btn.disabled = true;
            var cb = h('button', { type: 'button', class: 'kc-btn kc-sec', onclick: function () { kolOut.textContent = 'Vi ringer upp dig inom 5–7 arbetsår från dolt nummer. Svara inte, då avförs ärendet som besvarat.'; } }, 'Be oss ringa upp dig');
            var rows = CH.map(function (c) {
                var st = h('div', { class: 'kc-st' });
                live.push(function (d) { st.textContent = c[2](d); });
                return h('div', { class: 'kc-row' }, h('div', { class: 'kc-k' }, h('strong', { text: c[0] }), h('span', { text: c[1] })), st);
            });
            function upd() { var d = new Date(); stat.textContent = ''; stat.append(h('span', { class: 'kc-pill' + (phoneStatus(d).open ? ' on' : ''), text: phoneStatus(d).open ? 'ÖPPET' : 'STÄNGT' })); wait.textContent = waitText(d); live.forEach(function (f) { f(d); }); }
            wrap.append(h('h3', { class: 'kc-h', text: 'Kontaktcenter' }), stat, wait, h('div', { class: 'kc-rows' }, rows), h('div', { class: 'kc-act' }, btn, cb), kolOut);
            showTicket(); upd();
            return { el: wrap, upd: upd };
        }

        /* ---- Stil ---- */
        var style = h('style', { id: 'kc-style', text: [
            '.kc-wrap{background:var(--c-card,#fff);border:1px solid var(--c-line,#d3dbe3);border-left:5px solid var(--c-yellow,#fecc02);border-radius:10px;padding:16px 18px;max-width:75ch;margin-top:12px}',
            '.kc-h{margin:0 0 8px;font-size:1.15rem}',
            '.kc-stat{margin:0 0 4px}',
            '.kc-pill{display:inline-block;font-weight:800;font-size:.75rem;letter-spacing:.08em;padding:3px 10px;border-radius:999px;background:#d10000;color:#fff}',
            '.kc-pill.on{background:#0a7a2f}',
            '.kc-wait{margin:0 0 12px;font-weight:600}',
            '.kc-row{display:grid;grid-template-columns:minmax(150px,220px) 1fr;gap:6px 16px;padding:9px 0;border-top:1px solid var(--c-line,#d3dbe3)}',
            '.kc-k{display:flex;flex-direction:column}.kc-k span{font-variant-numeric:tabular-nums}',
            '.kc-st{color:var(--c-muted,#43566a);font-size:.92rem}',
            '.kc-act{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}',
            '.kc-btn{font:inherit;font-weight:700;padding:10px 16px;border-radius:6px;border:2px solid #000;background:var(--c-yellow,#fecc02);color:#000;cursor:pointer}',
            '.kc-btn.kc-sec{background:#fff}',
            '.kc-btn[disabled]{opacity:.6;cursor:default}',
            '.kc-btn:focus-visible{outline:3px solid var(--c-focus,#000);outline-offset:2px}',
            '.kc-out{margin:10px 0 0;font-weight:600}',
            '.kc-foot{margin:0}.kc-foot .kc-pill{margin-left:6px}',
            '@media (max-width:640px){.kc-row{grid-template-columns:1fr}}'
        ].join('\n') });
        document.head.appendChild(style);

        /* ---- Montering ---- */
        var centers = [], footP = null, footOld = null, oldBlocks = [];
        function mount() {
            // Sidfot: kort version med live-status
            if (!footP) {
                var cols = document.querySelectorAll('footer h2');
                for (var i = 0; i < cols.length; i++) if (cols[i].textContent.trim() === 'Kontakt') {
                    var p = cols[i].nextElementSibling;
                    if (p && p.tagName === 'P') {
                        footOld = p.innerHTML; footP = p; p.classList.add('kc-foot');
                        var s = h('span', { class: 'kc-pill' });
                        var a = h('a', { href: '#/om-oss', text: 'Hela kontaktcentret' });
                        function upd() { var o = phoneStatus(new Date()); s.textContent = o.open ? 'ÖPPET' : 'STÄNGT'; s.className = 'kc-pill' + (o.open ? ' on' : ''); }
                        p.replaceChildren('Telefon: 000-000 000 ', s, h('br'), 'Plats 42 i kön. Tid 09.12–09.13', h('br'), 'Besök: Källaren, ', a);
                        upd(); footP._upd = upd;
                    }
                }
            }
            // Om oss
            var targets = document.querySelectorAll('.oo-kont:not([data-kc-done])');
            Array.prototype.forEach.call(targets, function (t) {
                t.setAttribute('data-kc-done', '1');
                var p = t.querySelector('p'); if (p) { p.hidden = true; oldBlocks.push(p); }
                var c = center(); t.appendChild(c.el); centers.push(c);
            });
        }
        mount();
        var mo = null; try { var tm = null; mo = new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(mount, 100); }); mo.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
        var iv = setInterval(function () { if (document.hidden) return; centers.forEach(function (c) { c.upd(); }); if (footP && footP._upd) footP._upd(); }, 1000);

        window.stonKontakt = {
            reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
            unmount: function () {
                clearInterval(iv); if (mo) mo.disconnect();
                centers.forEach(function (c) { if (c.el.parentNode) c.el.parentNode.removeChild(c.el); });
                oldBlocks.forEach(function (p) { p.hidden = false; });
                document.querySelectorAll('[data-kc-done]').forEach(function (n) { n.removeAttribute('data-kc-done'); });
                if (footP && footOld != null) { footP.innerHTML = footOld; footP.classList.remove('kc-foot'); }
                if (style.parentNode) style.parentNode.removeChild(style);
                delete window.stonKontakt;
            }
        };
    } catch (err) { if (window.console && console.warn) console.warn('Kontaktmodulen kunde inte starta:', err); }
})();
