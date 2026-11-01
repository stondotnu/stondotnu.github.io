/*!
 * Dynamiskt nyhetsflöde och Breaking News Ticker för STÖN.
 *  - Ticker: gult band under headern, pulserande röd ikon, byter text var 6:e sekund.
 *    Första budskapet anpassas efter klockan och datumet hos besökaren (lunch, fredag, helg, december …).
 *  - Nyhetssektionen på startsidan byggs om varje dag: dagens nyhet (kl. 08:30), gårdagens och en från
 *    för fem dagar sedan, plus en generator som kombinerar [subjekt] + [handling] + [utfall]
 *    för knappen "Ladda fler äldre nyheter". Samma dag ger samma nyheter (seedat), nästa dag nya.
 *
 * Aktivera med EN rad före </body>:   <script src="features/nyheter/nyheter.js" defer></script>
 * Ta bort genom att radera raden. Stäng av med data-enabled="false". Allt är lokalt och i try/catch.
 */
(function () {
    'use strict';
    try {
        var script = document.currentScript;
        if (!script || script.dataset.enabled === 'false') return;
        if (document.getElementById('ny-ticker')) return;
        var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var INTERVAL = 6000;

        /* ================= 1. TEXTER ================= */
        var INCIDENTS = [
            'Blankett 102 har utgått på grund av stavfel i ingressen. 14 000 ärenden måste göras om från början.',
            'Registratorn har tagit lunch (11.00–13.45). E-postservern är avstängd under måltiden.',
            'En medborgare försökte lämna in en handling personligen. Receptionen är utrymd och saneras.',
            'Skrivaren på plan 3 brinner. Brandlarmet väntar på diarienummer.',
            'Planerat underhåll pågår. Underhållet är planerat att pågå permanent.',
            'Kaffemaskinen är under utredning. Kaffet är under utredning av kaffemaskinen.',
            'Hissen går nu endast till plan 4, som inte finns. Vi arbetar med att tillsätta plan 4.',
            'Dokumentet "Riktlinjer för dokument" har dragits tillbaka på grund av ett dokument.',
            'Beslut har fattats av misstag. Internrevisionen utreder vem som gjorde det.',
            'Telefonsystemet är återställt. Ni är nu plats 42 i kön, precis som innan.',
            'Ett ärende har hittats. Det söks nu en handläggare för ärendet.',
            'Mötet som kunde ha varit ett mejl har blivit ett mejl. Mejlet kallar till möte.',
            'Pappersbristen är löst. Det finns nu papper men ingen blankett att skriva ut på det.',
            'Servern har startats om. Det gjorde ingen skillnad, men det finns nu ett ärendenummer på det.',
            'Kvalitetsmålet "Kvalitet" har nåtts. Målet ersätts av ett nytt mål, som är detsamma.'
        ];
        function timeIncident(d) {
            var m = d.getHours() * 60 + d.getMinutes(), dow = d.getDay(), dom = d.getDate(), mon = d.getMonth();
            if (dow === 0 || dow === 6) return 'Helg: myndigheten är stängd. Ärendena är öppna men bemannas inte.';
            if (m >= 11 * 60 && m < 13 * 60 + 45) return 'Registratorn har lunch (11.00–13.45). E-postservern är avstängd under måltiden.';
            if (m >= 16 * 60) return 'Receptionen har stängt för dagen. Dagen har stängt för receptionen.';
            if (dow === 5 && m >= 14 * 60) return 'Fredag eftermiddag: all beredning pausas till måndag. Beredningen är pausad. Pausen bereds.';
            if (dow === 1 && m < 10 * 60) return 'Måndag: veckan har inletts enligt planen. Planen gäller sedan förra veckan.';
            if (mon === 11) return 'Julbordet har beslutats på fyra dagar, vilket är årets enda beslut.';
            if (dom === 1) return 'Ny månad: alla pågående ärenden har automatiskt förlängts med en månad.';
            if (mon === 10 || mon === 11) return 'Budgetslutspurt: medel måste förbrukas före årsskiftet. Förbrukningen utreds.';
            return null;
        }

        var SUBJ = ['Generaldirektören', 'Registratorn', 'Internrevisionen', 'Rättsavdelningen', 'HR-avdelningen', 'IT-avdelningen',
            'Säkerhetsavdelningen', 'Kommunikationsstaben', 'Beredningsgruppen', 'Kaffemaskinen', 'Receptionen', 'Styrgruppen',
            'Förste handläggaren', 'Samverkansgruppen', 'Avdelningen för avdelningar', 'Enheten för enheter'];
        var ACT = [
            'har återremitterat en utredning om återremisser', 'inför en ny rutin för att avskaffa rutiner', 'utreder förutsättningarna för att utreda',
            'har förankrat beslutet att förankra', 'pausar pausen', 'upphandlar en upphandling av upphandlingsstöd', 'bjuder in till samråd efter att beslutet fattats',
            'har kvalitetssäkrat kvalitetssäkringen', 'inför arbetsro på måndagar efter lunch', 'avslår sin egen ansökan', 'tillsätter en utredning för att utreda tillsättningen',
            'har pilotprojekterat ett pilotprojekt för pilotprojekt', 'remitterar remissvaret på remissen', 'omorganiserar omorganisationen', 'inför e-tjänst för att skriva ut blanketter',
            'har tagit fram en lathund som är längre än regelverket', 'presenterar en förstudie om en förstudie', 'delegerar delegeringen till den som delegerat',
            'bekräftar att inget har hänt', 'varslar om skärpt beredskapsfika'];
        var OUT = [
            'Åtgärden förväntas ge effekt under nästa budgetår, eller det därpå.',
            '{n} ärenden måste göras om från början.',
            'Ingen har blivit ansvarig, vilket bedöms som en framgång.',
            'Beslutet kan inte överklagas eftersom ingen vet vem som fattade det.',
            'Saken har remitterats till den instans som tillsatte saken.',
            'Berörda har underrättats via en kanal som är avstängd.',
            'Kostnaden uppgår till 0 kronor och {n} arbetstimmar.',
            'Ärendebalansen har ökat med {n} ärenden, vilket är i linje med målet.',
            'Uppföljning sker när det är för sent att följa upp.',
            'Nämnden beklagar eventuella olägenheter, om de skulle visa sig förekomma.',
            'Ett pressmeddelande har förberetts. Det publiceras när händelsen är avslutad.',
            'Förändringen har införts. Den ska införas i hela organisationen under {n} år.',
            'Arbetet fortsätter i en arbetsgrupp som saknar ledamöter.',
            'Frågan är nu i beredning, där den kommer att förbli.'];
        var TAGS = ['Nyhet', 'Pressmeddelande', 'Verksamhet', 'Driftinformation'];

        // Fasta nyheter enligt kravet: dag 0 kl. 08:30, dag −1, dag −5
        var FIXED = [
            { off: 0, t: [8, 30], tag: 'Pressmeddelande', title: 'Statens Överprövningsnämnd varslar om skärpt beredskapsfika', text: 'Åtgärden införs med omedelbar verkan, men först när fikat har beretts. Beredskapsfikat omfattar en kaka per anställd, om kakan har diarieförts.' },
            { off: 1, t: null, tag: 'Verksamhet', title: 'Pilotprojekt om muntlig handläggning avbrutet av internrevisionen', text: 'Projektet avbröts efter att en handläggare råkat tala. Samtalet har protokollförts, och protokollet har remitterats.' },
            { off: 5, t: null, tag: 'Nyhet', title: 'Förstudie om utredning av tidigare utredningskommitté presenterad', text: 'Förstudien visar att kommittén bör utredas. En utredning om förstudien är under beredning.' }
        ];

        /* ================= 2. HJÄLPARE ================= */
        function h(tag, attrs) {
            var el = document.createElement(tag);
            if (attrs) Object.keys(attrs).forEach(function (k) {
                var v = attrs[k];
                if (v == null || v === false) return;
                if (k === 'class') el.className = v;
                else if (k === 'text') el.textContent = v;
                else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
                else el.setAttribute(k, v === true ? '' : v);
            });
            for (var i = 2; i < arguments.length; i++) {
                var c = arguments[i];
                if (c == null || c === false) continue;
                if (Array.isArray(c)) c.forEach(function (x) { el.append(x.nodeType ? x : document.createTextNode(x)); });
                else el.append(c.nodeType ? c : document.createTextNode(c));
            }
            return el;
        }
        // Seedad slumpgenerator (mulberry32): samma dag ger samma nyheter
        function rng(seed) { var a = seed >>> 0; return function () { a += 0x6D2B79F5; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
        function dayKey(d) { return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
        function offsetDay(base, n) { var d = new Date(base.getFullYear(), base.getMonth(), base.getDate()); d.setDate(d.getDate() - n); return d; }
        var FMT = null; try { FMT = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long' }); } catch (e) {}
        function fdate(d) { return FMT ? FMT.format(d) : d.toDateString(); }
        function pad(n) { return String(n).padStart(2, '0'); }
        function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
        function sv(n) { try { return Number(n).toLocaleString('sv-SE'); } catch (e) { return String(n); } }

        /* ================= 3. UTSEENDE ================= */
        var css = [
            '.ny-ticker{background:var(--c-yellow,#fecc02);color:#000;border-bottom:3px solid #000}',
            '.ny-in{max-width:var(--wrap,1180px);margin:0 auto;padding:8px 20px;display:flex;gap:12px;align-items:center}',
            '.ny-dot{flex:none;width:14px;height:14px;border-radius:50%;background:#d10000;box-shadow:0 0 0 0 rgba(209,0,0,.7);animation:ny-pulse 1.4s infinite}',
            '@keyframes ny-pulse{70%{box-shadow:0 0 0 12px rgba(209,0,0,0)}100%{box-shadow:0 0 0 0 rgba(209,0,0,0)}}',
            '.ny-lbl{flex:none;font-weight:900;letter-spacing:.08em;color:#b00000;text-transform:uppercase;font-size:.85rem}',
            '.ny-txt{flex:1;min-width:0;font-weight:600;transition:opacity .35s,transform .35s;line-height:1.35}',
            '.ny-txt.out{opacity:0;transform:translateY(-6px)}',
            '.ny-ctl{flex:none;display:flex;gap:4px}',
            '.ny-ctl button{font:inherit;font-weight:700;background:transparent;border:2px solid #000;border-radius:6px;color:#000;padding:2px 9px;cursor:pointer;line-height:1.3}',
            '.ny-ctl button:hover{background:rgba(0,0,0,.12)}',
            '.ny-ctl button:focus-visible,.ny-more:focus-visible{outline:3px solid #000;outline-offset:2px}',
            '.ny-meta{font-size:.82rem;color:var(--c-muted,#43566a);margin:0 0 12px}',
            '.ny-new{animation:ny-in .5s both}',
            '@keyframes ny-in{from{opacity:0;transform:translateY(10px)}}',
            '.ny-time{font-variant-numeric:tabular-nums}',
            '.ny-more{margin-top:18px;font:inherit;font-weight:700;padding:11px 20px;border-radius:6px;border:2px solid var(--c-link,#00528a);background:#fff;color:var(--c-link,#00528a);cursor:pointer}',
            '.ny-more:hover:not([disabled]){background:#eaf4fb}',
            '.ny-more[disabled]{opacity:.6;cursor:default}',
            'html[data-contrast="high"] .ny-ticker{background:#fff}',
            '@media (max-width:640px){.ny-in{flex-wrap:wrap;padding:8px 14px}.ny-txt{flex-basis:100%;order:3}.ny-lbl{font-size:.78rem}}',
            '@media (prefers-reduced-motion:reduce){.ny-dot{animation:none}.ny-txt{transition:none}.ny-new{animation:none}}'
        ].join('\n');
        var style = h('style', { id: 'ny-style', text: css });
        document.head.appendChild(style);

        /* ================= 4. TICKER ================= */
        var now0 = new Date();
        var shuffled = INCIDENTS.slice().sort(function () { return Math.random() - 0.5; });
        var queue = [];
        function buildQueue() {
            var t = timeIncident(new Date());
            queue = (t ? [t] : []).concat(shuffled.filter(function (x) { return x !== t; }));
        }
        buildQueue();
        var idx = 0, timer = null, paused = false, userPaused = false;
        var txt = h('div', { class: 'ny-txt', id: 'ny-txt', role: 'status', 'aria-live': 'off' });
        var btnPause = h('button', { type: 'button', 'aria-pressed': 'false', 'aria-label': 'Pausa rullande nyheter', onclick: function () { userPaused = !userPaused; btnPause.setAttribute('aria-pressed', String(userPaused)); btnPause.textContent = userPaused ? '▶' : '⏸'; btnPause.setAttribute('aria-label', userPaused ? 'Fortsätt rullande nyheter' : 'Pausa rullande nyheter'); schedule(); } }, REDUCED ? '▶' : '⏸');
        if (REDUCED) { userPaused = true; btnPause.setAttribute('aria-pressed', 'true'); btnPause.setAttribute('aria-label', 'Fortsätt rullande nyheter'); }
        var btnPrev = h('button', { type: 'button', 'aria-label': 'Föregående meddelande', onclick: function () { step(-1); } }, '‹');
        var btnNext = h('button', { type: 'button', 'aria-label': 'Nästa meddelande', onclick: function () { step(1); } }, '›');
        var ticker = h('section', { class: 'ny-ticker', id: 'ny-ticker', 'aria-label': 'Aktuellt just nu' },
            h('div', { class: 'ny-in' }, h('span', { class: 'ny-dot', 'aria-hidden': 'true' }), h('span', { class: 'ny-lbl', text: 'Just nu' }), txt, h('div', { class: 'ny-ctl' }, btnPrev, btnPause, btnNext)));
        function show(i, animate) {
            idx = (i + queue.length) % queue.length;
            var apply = function () { txt.textContent = queue[idx]; txt.classList.remove('out'); };
            if (animate && !REDUCED) { txt.classList.add('out'); setTimeout(apply, 330); } else apply();
        }
        function step(d) { if (d < 0 || d > 0) { buildQueueIfNeeded(); show(idx + d, true); schedule(); } }
        function buildQueueIfNeeded() { var t = timeIncident(new Date()); if (t && queue[0] !== t && queue.indexOf(t) === -1) queue.unshift(t); }
        function schedule() {
            clearTimeout(timer);
            if (userPaused || paused || document.hidden) return;
            timer = setTimeout(function () { step(1); }, INTERVAL);
        }
        ticker.addEventListener('mouseenter', function () { paused = true; clearTimeout(timer); });
        ticker.addEventListener('mouseleave', function () { paused = false; schedule(); });
        ticker.addEventListener('focusin', function () { paused = true; clearTimeout(timer); });
        ticker.addEventListener('focusout', function () { paused = false; schedule(); });
        document.addEventListener('visibilitychange', schedule);

        var header = document.querySelector('.site-header') || document.querySelector('header');
        var nav = document.querySelector('.mainnav');
        if (nav && nav.parentNode) nav.parentNode.insertBefore(ticker, nav);
        else if (header && header.parentNode) header.parentNode.insertBefore(ticker, header.nextSibling);
        else document.body.insertBefore(ticker, document.body.firstChild);
        show(0, false); schedule();

        /* ================= 5. NYHETSFLÖDE ================= */
        var list = document.getElementById('news');
        var moreBtn = null, metaEl = null, extra = null;
        if (list) {
            var today = new Date(), count = 0, gen = 0, MAXGEN = 36;
            var shownKeys = {};
            var wasStatic = Array.prototype.slice.call(list.children);

            var rnd = rng(dayKey(today));
            function makeGenerated(dayOffset, salt) {
                var r = rng(dayKey(offsetDay(today, dayOffset)) * 31 + salt * 977);
                var title = SUBJ[Math.floor(r() * SUBJ.length)] + ' ' + ACT[Math.floor(r() * ACT.length)];
                var outc = OUT[Math.floor(r() * OUT.length)].replace('{n}', sv(Math.floor(r() * r() * 19000) + 3));
                return { tag: TAGS[Math.floor(r() * TAGS.length)], title: title, text: outc, off: dayOffset, t: [Math.floor(7 + r() * 9), Math.floor(r() * 60)], gen: true };
            }
            function card(it, isNew) {
                var d = offsetDay(today, it.off);
                var tm = it.t ? ' kl. ' + pad(it.t[0]) + '.' + pad(it.t[1]) : '';
                var label = (it.off === 0 ? 'Idag' : it.off === 1 ? 'Igår' : fdate(d)) + tm;
                if (it.off === 0 && it.t && (today.getHours() * 60 + today.getMinutes()) < it.t[0] * 60 + it.t[1]) label += ' (planerad publicering)';
                var key = it.title;
                if (shownKeys[key]) return null; shownKeys[key] = 1;
                return h('li', { class: isNew ? 'ny-new' : null }, h('span', { class: 'tag' + (it.tag === 'Driftinformation' ? ' warn' : ''), text: it.tag }), ' ',
                    h('time', { class: 'ny-time', datetime: iso(d), text: label }), h('h3', { text: it.title }), h('p', { text: it.text }));
            }
            function add(items, isNew) { items.forEach(function (it) { var c = card(it, isNew); if (c) { list.appendChild(c); count++; } }); }

            list.replaceChildren();
            // dagens lead utifrån veckodag/månad ligger överst efter de tre fasta
            add(FIXED.map(function (f) { return { off: f.off, t: f.t, tag: f.tag, title: f.title, text: f.text }; }), false);
            var off = 2;
            for (var k = 0; k < 3; k++) { add([makeGenerated(off + k * 2, k)], false); }
            metaEl = h('p', { class: 'ny-meta', text: 'Nyhetsflödet uppdateras varje dag. Dagens datum: ' + fdate(today) + '. Nyheterna är aktuella till och med slutet av dagen.' });
            list.parentNode.insertBefore(metaEl, list);
            extra = h('div', { 'aria-live': 'polite' });
            moreBtn = h('button', { type: 'button', class: 'ny-more', onclick: function () {
                if (gen >= MAXGEN) return;
                var added = [], before = count;
                for (var q = 0; q < 4 && gen < MAXGEN; q++) { gen++; added.push(makeGenerated(8 + gen * 2 + (q % 2), 100 + gen)); }
                add(added, true);
                var more = gen < MAXGEN;
                if (!more) { moreBtn.disabled = true; moreBtn.textContent = 'Arkivet är tomt. Äldre nyheter har gallrats.'; }
                extra.textContent = (count - before) + ' äldre nyheter har lästs in.';
            } }, 'Ladda fler äldre nyheter');
            list.parentNode.insertBefore(extra, list.nextSibling);
            list.parentNode.insertBefore(moreBtn, extra);
        }

        window.stonNyheter = {
            unmount: function () {
                clearTimeout(timer);
                [ticker, style, metaEl, moreBtn, extra].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
                if (list) { list.replaceChildren.apply(list, wasStatic); }
                delete window.stonNyheter;
            }
        };
    } catch (err) {
        if (window.console && console.warn) console.warn('Nyhetsmodulen kunde inte starta:', err);
    }
})();
