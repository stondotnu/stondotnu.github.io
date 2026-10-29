/*!
 * RIKSBYRÅKRATEN – från blåögd novis till Oxenstierna.
 * Ett clicker/idle-spel för STÖN (Statens Överprövningsnämnd). Ren HTML/CSS/JS, inga bilder, inga ramverk.
 *
 * Läggs in med EN rad före </body>:
 *   <script src="features/spel/spel.js" defer></script>
 * Tas bort genom att radera raden. Stäng av med data-enabled="false".
 *
 * Valfria attribut på script-taggen:
 *   data-open="true"    Öppna spelet direkt (används av features/spel/spel.html).
 *   data-bare="true"    Ingen knapp i verktygsraden (fristående sida).
 *
 * Spelet sparas lokalt i webbläsaren (nyckel ston.spel.v1). Inget skickas någonstans.
 * Allt är i try/catch, så ett fel här påverkar aldrig resten av sidan.
 */
(function () {
    'use strict';
    try {
        var script = document.currentScript;
        if (!script || script.dataset.enabled === 'false') return;
        if (document.getElementById('sp-root')) return;
        var BARE = script.dataset.bare === 'true';
        var host = document.querySelector('.utility .push');
        var navAnchor = document.querySelector('[data-nav="om-oss"]');
        var navList = navAnchor && navAnchor.parentNode ? navAnchor.parentNode.parentNode : null;
        if (!BARE && !navList && !host) return;

        var KEY = 'ston.spel.v1';
        var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* =====================================================================
         * 1. SPELDATA – här finns alla texter, så det är lätt att skriva om dem
         * ===================================================================== */

        // Personal som stämplar åt dig. [namn, emoji, grundkostnad, ärenden/sek, beskrivning]
        var GENS = [
            ['Praktikant', '🧑‍🎓', 15, 0.1, 'Gör allt. Får kaffe i betalning.'],
            ['Kopiator', '🖨️', 100, 1, 'Fungerar på tisdagar.'],
            ['Handläggare', '🧑‍💼', 1100, 8, 'Hänvisar till nästa handläggare.'],
            ['Arbetsgrupp', '👥', 12000, 47, 'Möts för att utse en ordförande.'],
            ['Utredning', '📚', 130000, 260, 'Tillsatt för att utreda varför den tillsattes.'],
            ['Remissrunda', '📨', 1.4e6, 1400, 'Skickar ut. Får tillbaka. Skickar ut igen.'],
            ['Ledningsgrupp', '🪑', 2e7, 7800, 'Beslutar att fatta beslut senare.'],
            ['Omorganisation', '🔀', 3.3e8, 44000, 'Flyttar stolarna. Stolarna är nöjda.'],
            ['Myndighet i myndigheten', '🏛️', 5.1e9, 260000, 'Har en egen myndighet. Som har en egen.'],
            ['Regeringskansliet', '🇸🇪', 7.5e10, 1.6e6, 'Allt går via här. Inget kommer ut.'],
            ['Rikets Kansli', '👑', 1e12, 1e7, 'Styr riket med brev. Ingen märker att det är du.']
        ];

        // Titlar. [ärenden totalt, titel, kommentar vid befordran]
        var RANKS = [
            [0, 'Blåögd novis', 'Du tror på systemet. Det kommer att gå över.'],
            [100, 'Nyanställd med entusiasm', 'Du har läst hela introduktionsmaterialet. Det har ingen annan gjort.'],
            [1e3, 'Vikarie', 'Du ersätter någon som ersätter någon.'],
            [1e4, 'Handläggare', 'Du har nu ärenden. Ärendena har dig.'],
            [1e5, 'Äldre handläggare', 'Du säger "så här har vi alltid gjort" och menar det.'],
            [1e6, 'Enhetschef (tf)', 'Tillförordnad är staten längsta tillfällighet.'],
            [1e7, 'Avdelningschef', 'Du leder möten om hur man leder möten.'],
            [1e8, 'Generaldirektör', 'Du har en egen parkeringsplats. Den är upptagen.'],
            [1e9, 'Statssekreterare', 'Du bestämmer allt, men får aldrig skriva under.'],
            [1e10, 'Kansliråd', 'Ingen vet vad du gör. Det är därför det fungerar.'],
            [1e11, 'Rikskansler', 'Du är nu Oxenstierna. Riket styrs av dina brev, och du har aldrig varit nöjdare med en ärendebalans.']
        ];

        // Kritiska träffar och lyckliga stunder
        var CRITS = ['TJÄNSTEMANNAFINT!', 'SMIDIG HANDLÄGGNING!', 'EXTRA ÄNDRINGSBUDGET!', 'DELEGERAT UPPÅT!', 'FÖRANKRAT!', 'GENOMDRIVET!'];
        var MEGA = 'BESLUT FATTAT (AV MISSTAG)!';
        var KLICK = [
            'Stämplat. Det finns fler.', 'Beviljat i princip.', 'Handlagt. Ingen har märkt det.', 'Ärendet är avslutat. Nästa.',
            'Diarieförd. Aldrig mer sedd.', 'Bra jobbat. Det kommer att glömmas.', 'Registrerat, ej åtgärdat.', 'Stämpeln gillar dig.',
            'En stämpel till i riket.', 'Någon behövde den där stämpeln.'
        ];

        // Uppgraderingar. t = typ: click (klick ×m), gen (personal i ×m), glob (allt ×m), crit (+chans)
        var UPS = [
            { id: 'u1', n: 'Ergonomisk stämpel', e: '🖋️', c: 100, d: 'Stämplar ×2. Handleden tackar.', t: 'click', m: 2 },
            { id: 'u2', n: 'Extra bläck i stämpeldynan', e: '🫙', c: 500, d: 'Stämplar ×2. Det syns nu.', t: 'click', m: 2 },
            { id: 'u3', n: 'Dubbelstämpling', e: '🔏', c: 5000, d: 'Stämplar ×2. Ingen vet vilken stämpel som gäller.', t: 'click', m: 2 },
            { id: 'u4', n: 'Rätt att stämpla åt andra', e: '🧾', c: 5e4, d: 'Stämplar ×3. Fullmakten är muntlig.', t: 'click', m: 3 },
            { id: 'g0', n: 'Praktik med lön (symbolisk)', e: '☕', c: 150, d: 'Praktikanter ×2. Kaffet är numera gratis.', t: 'gen', i: 0, m: 2 },
            { id: 'g1', n: 'Servicedokumentation', e: '📎', c: 1000, d: 'Kopiatorer ×2. Ingen läser den, men de går sönder mer sällan.', t: 'gen', i: 1, m: 2 },
            { id: 'g2', n: 'Egen e-postsignatur', e: '✉️', c: 1.1e4, d: 'Handläggare ×2. Med titel i versaler.', t: 'gen', i: 2, m: 2 },
            { id: 'g3', n: 'Gemensam kalender', e: '📅', c: 1.2e5, d: 'Arbetsgrupper ×2. Alla hittar nu ett gemensamt tillfälle: aldrig.', t: 'gen', i: 3, m: 2 },
            { id: 'g4', n: 'Direktiv med bilagor', e: '📑', c: 1.3e6, d: 'Utredningar ×2. Bilagorna är längre än direktivet.', t: 'gen', i: 4, m: 2 },
            { id: 'g5', n: 'Remisstid förkortas (till samma tid)', e: '⏱️', c: 1.4e7, d: 'Remissrundor ×2. Gäller från nästa remiss.', t: 'gen', i: 5, m: 2 },
            { id: 'g6', n: 'Beslutsförhet utan beslut', e: '🔨', c: 2e8, d: 'Ledningsgrupper ×2. Beslutsför, men inte beslutande.', t: 'gen', i: 6, m: 2 },
            { id: 'g7', n: 'Omorganisation av omorganisationen', e: '♻️', c: 3.3e9, d: 'Omorganisationer ×2. Resultatet blir detsamma, men det går fortare.', t: 'gen', i: 7, m: 2 },
            { id: 'c1', n: 'Tjänstemannafint', e: '🎯', c: 2500, d: '+4 % chans till kritiskt stämplande.', t: 'crit', m: 0.04 },
            { id: 'c2', n: 'Närmare chef', e: '🧠', c: 8e5, d: '+4 % chans till kritiskt stämplande.', t: 'crit', m: 0.04 },
            { id: 'k1', n: 'Kaffemaskin (ej upphandlad)', e: '🫖', c: 1e4, d: 'All produktion ×1,25. Den enda maskin som alltid fungerar.', t: 'glob', m: 1.25 },
            { id: 'k2', n: 'Fikarast med strategi', e: '🥐', c: 1e6, d: 'All produktion ×1,5. Beslut fattas vid kaffet.', t: 'glob', m: 1.5 },
            { id: 'k3', n: 'Digital transformation', e: '💾', c: 1e8, d: 'All produktion ×2. Samma papper, annan ordning.', t: 'glob', m: 2 },
            { id: 'k4', n: 'AI-strategi (fyra år i arbete)', e: '🤖', c: 1e10, d: 'All produktion ×2. Tekniken hann bli gammal under tiden.', t: 'glob', m: 2 },
            { id: 'k5', n: 'Förankring i hela organisationen', e: '⚓', c: 1e12, d: 'All produktion ×2. Ingen vågar längre säga emot.', t: 'glob', m: 2 }
        ];

        // Bragder. Varje bragd ger +1 % produktion (meritvärde).
        var ACH = [
            ['a1', 'Första stämpeln', 'Du har stämplat något. Det kan inte tas tillbaka.', function (s) { return s.clicks >= 1; }],
            ['a2', 'Hundra stämplar', 'Handleden har lämnat in en anmälan.', function (s) { return s.clicks >= 100; }],
            ['a3', 'Tjänstemannafint', 'Du träffade en kritisk handläggning.', function (s) { return s.crits >= 1; }],
            ['a4', 'Remiss mottagen', 'Du klickade på en remiss. Det är mer än de flesta gör.', function (s) { return s.golden >= 1; }],
            ['a5', 'Din första anställning', 'Du är nu chef. Ingen sa det till dig.', function (s) { return total(s.gens) >= 1; }],
            ['a6', 'Tio praktikanter', 'Det är en grupp. Gruppen har inget syfte.', function (s) { return s.gens[0] >= 10; }],
            ['a7', 'Tusen ärenden', 'Ärendebalansen har fått en egen medarbetare.', function (s) { return s.all >= 1e3; }],
            ['a8', 'Miljonärendet', 'Ett ärende för varje invånare i Skåne och Småland.', function (s) { return s.all >= 1e6; }],
            ['a9', 'Ledningsgrupp: ingen enighet', 'Du har en ledningsgrupp. De är oense om det.', function (s) { return s.gens[6] >= 1; }],
            ['a10', 'Omorganiserad', 'Du omorganiserade. Allt är nytt. Allt är detsamma.', function (s) { return s.omorg >= 1; }],
            ['a11', 'Äldre än tjänsten', 'Du har omorganiserat tre gånger. Tjänsten minns inte hur det var förut.', function (s) { return s.omorg >= 3; }],
            ['a12', 'Beslut fattat (av misstag)', 'Du fattade ett beslut av misstag. Det gäller.', function (s) { return s.mega >= 1; }],
            ['a13', 'Semesterersättning', 'Du var borta. Riket klarade sig. Ärendena samlades.', function (s) { return s.vac >= 1; }],
            ['a14', 'Rikskansler', 'Du är Oxenstierna. Brevet är skrivet.', function (s) { return s.all >= 1e11; }]
        ];

        // Händelser. Varje val har utfall med vikt: [vikt, text, typ, värde]
        //   typ: gain (sekunders produktion), lose (andel av ärenden), buff (sekunder x multiplikator)
        var EVENTS = [
            { t: 'Remiss inkommen', d: 'En remiss från Finansdepartementet. Svarstid: i förrgår.', o: [
                { l: 'Svara ja', r: [[3, 'Du svarade ja. Alla blev förvånade.', 'gain', 300], [1, 'Svaret skickades till fel myndighet. De tackade.', 'gain', 60]] },
                { l: 'Svara nej', r: [[2, 'Du avstyrkte. Det fanns ingen att avstyrka.', 'gain', 240], [2, 'Nejet återkom som en ny remiss.', 'lose', 0.05]] },
                { l: 'Hänvisa', r: [[1, 'Du hänvisade till en myndighet som sedan länge är nedlagd.', 'gain', 480]] }
            ] },
            { t: 'Chefen vill "stämma av"', d: 'Chefen skickar en kalenderinbjudan: "Avstämning." Utan agenda.', o: [
                { l: 'Gå', r: [[2, 'Mötet var ett mejl. Du fick en kopp kaffe.', 'gain', 120], [2, 'Mötet ledde till ett nytt möte. Det gav ärenden.', 'gain', 360]] },
                { l: 'Tacka nej', r: [[1, 'Du har inte tid. Chefen är imponerad.', 'buff', [30, 3]], [2, 'Chefen noterar det. Du noteras.', 'lose', 0.03]] }
            ] },
            { t: 'Kopiatorn har gått sönder', d: 'Ett felmeddelande med en kod du inte kan googla.', o: [
                { l: 'Slå på den', r: [[1, 'Den startade. Ingen vet varför.', 'buff', [45, 2]], [2, 'Den gick sönder mer. Ärenden försvann.', 'lose', 0.04]] },
                { l: 'Ring support', r: [[1, 'Supporten ringer tillbaka (aldrig).', 'gain', 30], [1, 'De skickade en tekniker. Hen fixade allt.', 'gain', 600]] }
            ] },
            { t: 'Ändringsförslag', d: 'Någon vill ändra ändringsförslaget. Du måste ta ställning.', o: [
                { l: 'Bifall', r: [[2, 'Bifallet. Nu vill alla ändra bifallet.', 'gain', 300], [1, 'Bifallet av en slump som visade sig vara rätt.', 'gain', 800]] },
                { l: 'Avslag', r: [[2, 'Avslaget. Det överklagades. Till dig.', 'gain', 200], [1, 'Avslaget. Besluten är nu rättsligt bindande.', 'buff', [40, 2]]] }
            ] },
            { t: 'Medarbetarenkät', d: 'Svaren är anonyma. Alla vet vem som skrev vad.', o: [
                { l: 'Svara ärligt', r: [[1, 'Ärligheten har noterats. Du har noterats.', 'lose', 0.06], [1, 'Din ärlighet ledde till en workshop. Den gav ärenden.', 'gain', 500]] },
                { l: 'Svara 4 på allt', r: [[3, 'Alla fick 4. Ingenting förändras. Det är mycket stabilt.', 'buff', [40, 1.5]]] }
            ] },
            { t: 'Julbord', d: 'Den enda fråga som får beslut inom en vecka.', o: [
                { l: 'Gå', r: [[3, 'Du fick sill och beslutsunderlag.', 'gain', 400]] },
                { l: 'Stanna kvar och jobba', r: [[2, 'Du jobbade. Ingen märkte det.', 'gain', 200], [1, 'Du jobbade så mycket att det blev en bragd.', 'buff', [60, 2]]] }
            ] }
        ];

        /* =====================================================================
         * 2. TILLSTÅND OCH BERÄKNINGAR
         * ===================================================================== */
        function fresh() {
            return { a: 0, run: 0, all: 0, clicks: 0, crits: 0, mega: 0, golden: 0, vac: 0, gens: GENS.map(function () { return 0; }),
                ups: {}, ach: {}, minne: 0, omorg: 0, t: Date.now(), buffs: [], sound: false, evAt: 0, goldAt: 0 };
        }
        function total(arr) { return arr.reduce(function (x, y) { return x + y; }, 0); }
        var S = fresh();
        function load() {
            try {
                var r = localStorage.getItem(KEY);
                if (r) { var o = JSON.parse(r); if (o && typeof o === 'object') { S = Object.assign(fresh(), o); if (!Array.isArray(S.gens) || S.gens.length !== GENS.length) S.gens = GENS.map(function (_, i) { return (o.gens && o.gens[i]) || 0; }); } }
            } catch (e) {}
        }
        function save() { S.t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

        function upCount() { return Object.keys(S.ups).length; }
        function genMult(i) { var m = 1; UPS.forEach(function (u) { if (S.ups[u.id] && u.t === 'gen' && u.i === i) m *= u.m; }); return m; }
        function globMult() {
            var m = 1 + S.minne * 0.1 + Object.keys(S.ach).length * 0.01;
            UPS.forEach(function (u) { if (S.ups[u.id] && u.t === 'glob') m *= u.m; });
            var now = Date.now(); S.buffs.forEach(function (b) { if (b.until > now && b.p) m *= b.p; });
            return m;
        }
        function clickMult() {
            var m = 1; UPS.forEach(function (u) { if (S.ups[u.id] && u.t === 'click') m *= u.m; });
            var now = Date.now(); S.buffs.forEach(function (b) { if (b.until > now && b.c) m *= b.c; });
            return m;
        }
        function critChance() { var c = 0.06; UPS.forEach(function (u) { if (S.ups[u.id] && u.t === 'crit') c += u.m; }); return c; }
        function cps() { var s = 0; GENS.forEach(function (g, i) { s += S.gens[i] * g[3] * genMult(i); }); return s * globMult(); }
        function clickPower() { return (1 + cps() * 0.01) * clickMult() * (1 + S.minne * 0.1); }
        function genCost(i, n) { // kostnaden för n st: geometrisk summa med faktor 1.15
            var base = GENS[i][2] * Math.pow(1.15, S.gens[i]);
            return base * (Math.pow(1.15, n) - 1) / 0.15;
        }
        function rankIndex() { var r = 0; RANKS.forEach(function (x, i) { if (S.all >= x[0]) r = i; }); return r; }
        function minneGain() { return Math.floor(Math.sqrt(S.run / 1e6)); }

        var SUF = [[1e15, ' kvadr.'], [1e12, ' bn'], [1e9, ' md'], [1e6, ' mn'], [1e4, ' tn']];
        function fmt(n) {
            if (!isFinite(n)) return '∞';
            for (var i = 0; i < SUF.length; i++) if (n >= SUF[i][0]) return (n / SUF[i][0]).toLocaleString('sv-SE', { maximumFractionDigits: 2 }) + SUF[i][1];
            return n < 10 ? n.toLocaleString('sv-SE', { maximumFractionDigits: 1 }) : Math.floor(n).toLocaleString('sv-SE');
        }

        /* =====================================================================
         * 3. DOM-HJÄLPARE OCH LJUD
         * ===================================================================== */
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
        function rnd(a, b) { return a + Math.random() * (b - a); }
        function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

        var ac = null;
        function beep(f, d, type, vol) {
            if (!S.sound) return;
            try {
                ac = ac || new (window.AudioContext || window.webkitAudioContext)();
                var o = ac.createOscillator(), g = ac.createGain();
                o.type = type || 'square'; o.frequency.value = f; g.gain.value = vol || 0.04;
                o.connect(g); g.connect(ac.destination);
                g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
                o.start(); o.stop(ac.currentTime + d);
            } catch (e) {}
        }

        /* =====================================================================
         * 4. UTSEENDE (CSS med prefixet .sp-)
         * ===================================================================== */
        var css = [
            '#sp-root{position:fixed;inset:0;z-index:300;background:radial-gradient(circle at 50% -10%,#0a4a7c,#00263e 60%,#00131f);color:#fff;display:none;flex-direction:column;font-family:inherit;overflow:hidden}',
            '#sp-root.open{display:flex}',
            '#sp-root *{box-sizing:border-box}',
            '.sp-top{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(0,0,0,.35);border-bottom:4px solid var(--c-yellow,#fecc02)}',
            '.sp-top h2{margin:0;font-size:1rem;flex:1;line-height:1.2}',
            '.sp-top h2 small{display:block;font-weight:400;opacity:.8;font-size:.75rem}',
            '.sp-ib{font:inherit;background:rgba(255,255,255,.12);color:#fff;border:2px solid rgba(255,255,255,.5);border-radius:8px;padding:6px 12px;cursor:pointer;font-weight:700}',
            '.sp-ib:hover{background:rgba(255,255,255,.22)}',
            '.sp-main{flex:1;min-height:0;display:grid;grid-template-columns:minmax(300px,1fr) minmax(320px,1.1fr);gap:0}',
            '.sp-left{padding:14px;display:flex;flex-direction:column;align-items:center;gap:10px;overflow:auto;position:relative}',
            '.sp-right{background:rgba(0,0,0,.28);display:flex;flex-direction:column;min-height:0;border-left:1px solid rgba(255,255,255,.15)}',
            '.sp-arenden{font-size:2.4rem;font-weight:900;line-height:1;text-align:center;font-variant-numeric:tabular-nums}',
            '.sp-lbl{font-size:.8rem;opacity:.8;text-align:center}',
            '.sp-rank{text-align:center}',
            '.sp-rank b{color:var(--c-yellow,#fecc02);font-size:1.1rem}',
            '.sp-bar{width:min(380px,92%);height:12px;background:rgba(255,255,255,.15);border-radius:6px;overflow:hidden;margin:6px auto 0;border:1px solid rgba(255,255,255,.25)}',
            '.sp-bar i{display:block;height:100%;background:linear-gradient(90deg,#006aa7,#fecc02);width:0}',
            '.sp-stamp-wrap{position:relative;display:grid;place-items:center;padding:6px;touch-action:manipulation;user-select:none;-webkit-user-select:none}',
            '.sp-stamp{width:min(230px,52vw);aspect-ratio:1;border-radius:50%;border:0;cursor:pointer;color:#00263e;font:inherit;font-weight:900;font-size:1.5rem;letter-spacing:.06em;display:grid;place-items:center;text-align:center;background:radial-gradient(circle at 35% 30%,#ffe680,#fecc02 55%,#c99a00);box-shadow:0 10px 0 #7a5a00,0 18px 30px rgba(0,0,0,.5),inset 0 0 0 10px #006aa7,inset 0 0 0 14px #fecc02;transition:transform .06s,box-shadow .06s;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
            '.sp-stamp span{display:block;font-size:2.4rem;margin-bottom:2px}',
            '.sp-stamp:active,.sp-stamp.down{transform:translateY(8px);box-shadow:0 2px 0 #7a5a00,0 6px 14px rgba(0,0,0,.5),inset 0 0 0 10px #006aa7,inset 0 0 0 14px #fecc02}',
            '.sp-stamp:focus-visible{outline:4px solid #fff;outline-offset:6px}',
            '.sp-flav{min-height:1.4em;text-align:center;font-style:italic;opacity:.9;padding:0 10px}',
            '.sp-stats{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;font-size:.8rem}',
            '.sp-stats span{background:rgba(255,255,255,.12);border-radius:999px;padding:3px 10px}',
            '.sp-buffs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:26px}',
            '.sp-buff{background:#fecc02;color:#000;font-weight:800;border-radius:999px;padding:2px 10px;font-size:.78rem}',
            '.sp-tabs{display:flex;border-bottom:2px solid rgba(255,255,255,.2)}',
            '.sp-tab{flex:1;font:inherit;font-weight:700;padding:11px 4px;background:none;border:0;color:#fff;opacity:.7;cursor:pointer;border-bottom:4px solid transparent;margin-bottom:-2px}',
            '.sp-tab[aria-selected="true"]{opacity:1;border-bottom-color:var(--c-yellow,#fecc02)}',
            '.sp-panel{flex:1;min-height:0;overflow:auto;padding:10px;display:grid;gap:8px;align-content:start}',
            '.sp-buy{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;text-align:left;font:inherit;color:#fff;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.25);border-radius:10px;padding:9px 11px;cursor:pointer;width:100%}',
            '.sp-buy:hover:not([aria-disabled="true"]){background:rgba(255,255,255,.2);border-color:#fecc02}',
            '.sp-buy[aria-disabled="true"]{opacity:.5;cursor:not-allowed}',
            '.sp-buy .e{font-size:1.8rem}',
            '.sp-buy b{display:block}',
            '.sp-buy small{display:block;opacity:.85;line-height:1.25}',
            '.sp-buy .p{text-align:right;font-weight:800;color:var(--c-yellow,#fecc02);white-space:nowrap}',
            '.sp-buy .p em{display:block;font-style:normal;font-weight:400;color:#fff;opacity:.8;font-size:.78rem}',
            '.sp-buy:focus-visible,.sp-tab:focus-visible,.sp-ib:focus-visible{outline:3px solid #fff;outline-offset:2px}',
            '.sp-ach{display:grid;grid-template-columns:auto 1fr;gap:10px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.07);opacity:.55}',
            '.sp-ach.on{opacity:1;background:rgba(254,204,2,.18)}',
            '.sp-hint{font-size:.85rem;opacity:.85;margin:0 2px 2px}',
            '.sp-gold{position:absolute;z-index:5;font-size:3rem;border:0;background:none;cursor:pointer;animation:sp-wob 1s ease-in-out infinite;filter:drop-shadow(0 0 14px #fecc02);padding:6px}',
            '@keyframes sp-wob{50%{transform:rotate(10deg) scale(1.12)}}',
            '.sp-pop{position:absolute;pointer-events:none;font-weight:900;text-shadow:0 2px 0 #000;white-space:nowrap;animation:sp-up 1s ease-out forwards;z-index:6}',
            '@keyframes sp-up{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-90px)}}',
            '.sp-part{position:absolute;pointer-events:none;font-size:1.3rem;animation:sp-fly .9s ease-out forwards;z-index:6}',
            '@keyframes sp-fly{from{opacity:1;transform:translate(0,0) scale(1)}to{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r)) scale(.6)}}',
            '#sp-root.shake .sp-main{animation:sp-shake .35s}',
            '@keyframes sp-shake{20%{transform:translate(-7px,3px)}40%{transform:translate(6px,-4px)}60%{transform:translate(-5px,-2px)}80%{transform:translate(4px,3px)}}',
            '.sp-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:20;background:#fecc02;color:#000;border-radius:10px;padding:10px 16px;font-weight:700;max-width:min(520px,92vw);text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:sp-in .3s}',
            '@keyframes sp-in{from{opacity:0;transform:translate(-50%,14px)}}',
            '.sp-modal{position:absolute;inset:0;z-index:30;background:rgba(0,10,20,.78);display:grid;place-items:center;padding:16px}',
            '.sp-card{background:#fff;color:#14202b;border-radius:12px;border-top:8px solid #fecc02;max-width:480px;width:100%;padding:20px 22px;display:grid;gap:12px}',
            '.sp-card h3{margin:0;font-size:1.2rem}',
            '.sp-card p{margin:0}',
            '.sp-card .row{display:flex;gap:10px;flex-wrap:wrap}',
            '.sp-card button{font:inherit;font-weight:700;padding:10px 16px;border-radius:8px;border:2px solid #00528a;background:#fff;color:#00528a;cursor:pointer;flex:1 1 120px}',
            '.sp-card button.main{background:#fecc02;border-color:#fecc02;color:#000}',
            '.sp-card button:focus-visible{outline:3px solid #1a73e8;outline-offset:2px}',
            '#sp-open{position:relative}',
            'html[data-contrast="high"] #sp-root{background:#000}',
            '@media (max-width:760px){.sp-main{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.sp-left{overflow:visible;padding:8px 12px;gap:6px}.sp-right{border-left:0;border-top:2px solid rgba(255,255,255,.2)}.sp-arenden{font-size:2rem}.sp-stamp{width:min(150px,38vw);font-size:1.1rem}.sp-stamp span{font-size:1.7rem}.sp-flav{display:none}.sp-buffs{min-height:0}}',
            '@media (max-width:760px) and (max-height:700px){.sp-rank small{display:none}.sp-stats{display:none}}',
            '@media (prefers-reduced-motion:reduce){.sp-gold{animation:none}.sp-pop,.sp-part{animation-duration:.01s}#sp-root.shake .sp-main{animation:none}}'
        ].join('\n');
        var style = h('style', { id: 'sp-style', text: css });
        document.head.appendChild(style);

        /* =====================================================================
         * 5. GRÄNSSNITT
         * ===================================================================== */
        var el = {};
        var root = h('div', { id: 'sp-root', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sp-title' });
        el.title = h('h2', { id: 'sp-title' }, 'Riksbyråkraten', h('small', { text: 'Från blåögd novis till Oxenstierna' }));
        el.soundBtn = h('button', { type: 'button', class: 'sp-ib', 'aria-pressed': 'false', 'aria-label': 'Ljud', onclick: function () { S.sound = !S.sound; syncSound(); beep(660, 0.1); save(); } }, '🔇');
        el.closeBtn = h('button', { type: 'button', class: 'sp-ib', onclick: function () { api.close(); } }, 'Lämna tjänsten');
        var top = h('div', { class: 'sp-top' }, el.title, el.soundBtn, el.closeBtn);

        el.arenden = h('div', { class: 'sp-arenden', 'aria-live': 'off' });
        el.cps = h('div', { class: 'sp-lbl' });
        el.rank = h('div', { class: 'sp-rank' });
        el.bar = h('i');
        el.flav = h('div', { class: 'sp-flav', 'aria-live': 'polite' });
        el.buffs = h('div', { class: 'sp-buffs' });
        el.stats = h('div', { class: 'sp-stats' });
        el.stamp = h('button', { type: 'button', class: 'sp-stamp', 'aria-label': 'Stämpla ett ärende' }, h('div', null, h('span', { 'aria-hidden': 'true', text: '🖋️' }), 'STÄMPLA'));
        el.stampWrap = h('div', { class: 'sp-stamp-wrap' }, el.stamp);
        el.left = h('div', { class: 'sp-left' },
            h('div', null, el.arenden, h('div', { class: 'sp-lbl', text: 'handlagda ärenden' }), el.cps),
            el.rank, h('div', { class: 'sp-bar', 'aria-hidden': 'true' }, el.bar), el.buffs, el.stampWrap, el.flav, el.stats);

        el.tabs = h('div', { class: 'sp-tabs', role: 'tablist' });
        el.panel = h('div', { class: 'sp-panel', role: 'tabpanel' });
        el.right = h('div', { class: 'sp-right' }, el.tabs, el.panel);
        root.append(top, h('div', { class: 'sp-main' }, el.left, el.right));
        document.body.appendChild(root);

        var TAB = 'pers', BUY = 1;
        var TABS = [['pers', 'Personal'], ['rut', 'Rutiner'], ['bragd', 'Bragder'], ['omorg', 'Omorganisera']];
        function renderTabs() {
            el.tabs.replaceChildren.apply(el.tabs, TABS.map(function (t) {
                return h('button', { type: 'button', class: 'sp-tab', role: 'tab', 'aria-selected': String(TAB === t[0]), onclick: function () { TAB = t[0]; renderTabs(); renderPanel(); } }, t[1]);
            }));
        }

        // Personal-fliken
        var genBtns = [];
        function renderPers() {
            genBtns = [];
            var nodes = [h('div', { class: 'sp-hint' }, 'Anställ personal som stämplar åt dig. Priset stiger för varje anställd. ',
                h('button', { type: 'button', class: 'sp-ib', style: 'padding:2px 10px;margin-left:6px', onclick: function () { BUY = BUY === 1 ? 10 : 1; renderPanel(); } }, 'Köp ×' + BUY))];
            GENS.forEach(function (g, i) {
                var cost = h('div', { class: 'p' });
                var b = h('button', { type: 'button', class: 'sp-buy', onclick: function () { buyGen(i); } },
                    h('div', { class: 'e', 'aria-hidden': 'true', text: g[1] }),
                    h('div', null, h('b', { text: g[0] + ' (' + S.gens[i] + ')' }), h('small', { text: g[4] })),
                    cost);
                genBtns.push({ b: b, cost: cost, i: i });
                nodes.push(b);
            });
            el.panel.replaceChildren.apply(el.panel, nodes);
            updatePers();
        }
        function updatePers() {
            genBtns.forEach(function (g) {
                var n = BUY, c = genCost(g.i, n);
                var visible = S.gens[g.i] > 0 || S.all >= GENS[g.i][2] * 0.3 || (g.i > 0 && S.gens[g.i - 1] > 0);
                g.b.style.display = visible ? '' : 'none';
                g.b.setAttribute('aria-disabled', String(S.a < c));
                g.b.querySelector('b').textContent = GENS[g.i][0] + ' (' + S.gens[g.i] + ')';
                g.cost.replaceChildren(fmt(c) + ' ärenden', h('em', { text: '+' + fmt(GENS[g.i][3] * genMult(g.i) * globMult()) + '/s styck' }));
            });
        }
        function buyGen(i) {
            var n = BUY, c = genCost(i, n);
            if (S.a < c) { flavor('Du har inte råd. Det har ingen annan heller, men de har inte heller sagt det.'); beep(120, 0.15, 'sawtooth'); return; }
            S.a -= c; S.gens[i] += n; beep(520, 0.08); beep(780, 0.1);
            popAt(el.cpsRect(), '+' + n + ' ' + GENS[i][1], '#fecc02');
            if (S.gens[i] === n && n >= 1 && S.gens[i] === 1) flavor('Första ' + GENS[i][0].toLowerCase() + 'en är på plats. ' + GENS[i][4]);
            checkAll(); updatePers(); updateHud(); save();
        }

        // Rutiner-fliken
        function renderRut() {
            var avail = UPS.filter(function (u) { return !S.ups[u.id] && S.run + S.a >= u.c * 0.3; });
            var nodes = [h('div', { class: 'sp-hint' }, 'Rutiner gäller för resten av omgången. Ingen vet vem som beslutade om dem.')];
            if (!avail.length) nodes.push(h('p', { class: 'sp-hint', text: 'Inga nya rutiner just nu. Någon utreder frågan.' }));
            avail.forEach(function (u) {
                var b = h('button', { type: 'button', class: 'sp-buy', 'data-c': String(u.c), onclick: function () { buyUp(u); } },
                    h('div', { class: 'e', 'aria-hidden': 'true', text: u.e }),
                    h('div', null, h('b', { text: u.n }), h('small', { text: u.d })),
                    h('div', { class: 'p', text: fmt(u.c) }));
                b.setAttribute('aria-disabled', String(S.a < u.c));
                nodes.push(b);
            });
            el.panel.replaceChildren.apply(el.panel, nodes);
        }
        function buyUp(u) {
            if (S.a < u.c) { flavor('Rutinen kräver ' + fmt(u.c) + ' ärenden. Du har färre. Det bekräftas härmed.'); beep(120, 0.15, 'sawtooth'); return; }
            S.a -= u.c; S.ups[u.id] = 1; beep(660, 0.1); beep(990, 0.14);
            flavor('Rutin införd: ' + u.n + '. ' + u.d);
            shake(); burst(el.stamp, ['✅', '📋', '✨'], 10);
            checkAll(); renderPanel(); updateHud(); save();
        }

        // Bragder-fliken
        function renderBragd() {
            var n = Object.keys(S.ach).length;
            var nodes = [h('div', { class: 'sp-hint' }, n + ' av ' + ACH.length + ' bragder. Varje bragd ger +1 % produktion i meritvärde, för alltid.')];
            ACH.forEach(function (a) {
                var on = !!S.ach[a[0]];
                nodes.push(h('div', { class: 'sp-ach' + (on ? ' on' : '') }, h('div', { 'aria-hidden': 'true', text: on ? '🏅' : '🔒' }),
                    h('div', null, h('b', { text: on ? a[1] : '???' }), h('small', { style: 'display:block;opacity:.85', text: on ? a[2] : 'Bragden är ännu inte beviljad.' }))));
            });
            el.panel.replaceChildren.apply(el.panel, nodes);
        }

        // Omorganisera-fliken
        function renderOmorg() {
            var g = minneGain(), can = g >= 1;
            var nodes = [
                h('div', { class: 'sp-hint', text: 'Omorganisation nollställer ärenden, personal och rutiner. Du behåller bragder och får institutionellt minne: +10 % produktion och stämplar per poäng, för alltid. Staten gör så här hela tiden. Den kallar det förnyelse.' }),
                h('div', { class: 'sp-ach on' }, h('div', { 'aria-hidden': 'true', text: '🧠' }), h('div', null, h('b', { text: 'Institutionellt minne: ' + S.minne }), h('small', { style: 'display:block', text: 'Omorganiserad ' + S.omorg + ' gånger. Bonus: +' + (S.minne * 10) + ' %.' }))),
                h('button', { type: 'button', class: 'sp-buy', 'aria-disabled': String(!can), onclick: function () { if (can) confirmOmorg(g); else flavor('Du har för få ärenden för att kunna omorganisera. Kom tillbaka när det är för sent.'); } },
                    h('div', { class: 'e', 'aria-hidden': 'true', text: '🔀' }),
                    h('div', null, h('b', { text: 'Omorganisera nu' }), h('small', { text: can ? 'Du får ' + g + ' poäng institutionellt minne.' : 'Kräver minst 1 miljon ärenden i denna omgång (du har ' + fmt(S.run) + ').' })),
                    h('div', { class: 'p', text: can ? '+' + g : '–' }))
            ];
            el.panel.replaceChildren.apply(el.panel, nodes);
        }
        function renderPanel() { if (TAB === 'pers') renderPers(); else if (TAB === 'rut') renderRut(); else if (TAB === 'bragd') renderBragd(); else renderOmorg(); }

        /* ---------- Rutor (modaler) och notiser ---------- */
        var modal = null;
        function showModal(title, text, buttons) {
            closeModal();
            var row = h('div', { class: 'row' }, buttons.map(function (b) { return h('button', { type: 'button', class: b.main ? 'main' : '', onclick: function () { closeModal(); b.f && b.f(); } }, b.l); }));
            modal = h('div', { class: 'sp-modal' }, h('div', { class: 'sp-card', role: 'alertdialog', 'aria-labelledby': 'sp-mt' }, h('h3', { id: 'sp-mt', text: title }), h('p', { text: text }), row));
            root.appendChild(modal);
            var first = modal.querySelector('button'); if (first) first.focus();
        }
        function closeModal() { var had = !!modal; if (modal && modal.parentNode) modal.parentNode.removeChild(modal); modal = null; if (had && root.classList.contains('open') && el.stamp) { try { el.stamp.focus({ preventScroll: true }); } catch (e) {} } }
        // Notiser köas, så att en bragd inte skymmer resultatet av en remiss
        var toastT = null, toastQ = [], toastBusy = false;
        function toast(text) { toastQ.push(text); if (!toastBusy) nextToast(); }
        function nextToast() {
            var text = toastQ.shift();
            if (!text) { toastBusy = false; return; }
            toastBusy = true;
            var old = root.querySelector('.sp-toast'); if (old) old.remove();
            var t = h('div', { class: 'sp-toast', role: 'status', text: text }); root.appendChild(t);
            clearTimeout(toastT);
            toastT = setTimeout(function () { if (t.parentNode) t.remove(); nextToast(); }, toastQ.length ? 2800 : 4200);
        }
        function flavor(t) { el.flav.textContent = t; }

        function confirmOmorg(g) {
            showModal('Omorganisera hela verksamheten?', 'Allt återgår till ursprungsläget, men med ny organisationsskiss och nytt namn på samma saker. Du får ' + g + ' poäng institutionellt minne. Ingen kommer att minnas varför.', [
                { l: 'Omorganisera', main: true, f: function () {
                    S.minne += g; S.omorg++; S.a = 0; S.run = 0; S.gens = GENS.map(function () { return 0; }); S.ups = {}; S.buffs = [];
                    shake(); burst(el.stamp, ['🔀', '🪑', '📊', '♻️'], 24); beep(300, 0.3, 'sawtooth');
                    toast('Omorganisationen är genomförd. Alla är nöjda med att något har hänt.');
                    checkAll(); renderPanel(); updateHud(); save();
                } },
                { l: 'Avvakta (rekommenderas)', f: function () {} }
            ]);
        }

        /* ---------- Effekter ---------- */
        function shake() {
            if (REDUCED) return;
            root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake');
            setTimeout(function () { root.classList.remove('shake'); }, 380);
        }
        function popAt(pos, text, color, size) {
            var p = h('div', { class: 'sp-pop', text: text, style: 'left:' + pos.x + 'px;top:' + pos.y + 'px;color:' + (color || '#fff') + ';font-size:' + (size || 1.4) + 'rem' });
            el.left.appendChild(p); setTimeout(function () { p.remove(); }, 1000);
        }
        function localPos(cx, cy) { var r = el.left.getBoundingClientRect(); return { x: cx - r.left + el.left.scrollLeft, y: cy - r.top + el.left.scrollTop }; }
        el.cpsRect = function () { var r = el.stamp.getBoundingClientRect(); return localPos(r.left + r.width / 2, r.top + r.height * 0.2); };
        var PARTS = 0;
        function burst(from, emojis, n) {
            if (REDUCED) return;
            var r = from.getBoundingClientRect(), c = localPos(r.left + r.width / 2, r.top + r.height / 2);
            for (var i = 0; i < n && PARTS < 60; i++) {
                (function () {
                    PARTS++;
                    var a = rnd(0, Math.PI * 2), d = rnd(60, 150);
                    var p = h('div', { class: 'sp-part', text: pick(emojis), style: 'left:' + c.x + 'px;top:' + c.y + 'px;--dx:' + Math.cos(a) * d + 'px;--dy:' + (Math.sin(a) * d - 40) + 'px;--r:' + rnd(-200, 200) + 'deg' });
                    el.left.appendChild(p); setTimeout(function () { p.remove(); PARTS--; }, 950);
                })();
            }
        }
        function syncSound() { el.soundBtn.textContent = S.sound ? '🔊' : '🔇'; el.soundBtn.setAttribute('aria-pressed', String(S.sound)); el.soundBtn.setAttribute('aria-label', S.sound ? 'Ljud på' : 'Ljud av'); }

        /* =====================================================================
         * 6. SPELMEKANIK
         * ===================================================================== */
        function gain(n) { S.a += n; S.run += n; S.all += n; }

        function stamp(cx, cy) {
            var base = clickPower(), crit = Math.random() < critChance(), mega = crit && Math.random() < 0.08;
            var v = base * (mega ? 100 : crit ? 10 : 1);
            gain(v); S.clicks++;
            var pos = localPos(cx, cy);
            if (mega) { S.mega++; S.crits++; shake(); burst(el.stamp, ['🏆', '🎉', '👑', '🇸🇪'], 22); beep(880, 0.25, 'sawtooth', 0.06); popAt({ x: pos.x, y: pos.y - 40 }, MEGA, '#fecc02', 1.4); flavor('Du har av misstag fattat ett beslut. Det gäller nu.'); }
            else if (crit) { S.crits++; shake(); burst(el.stamp, ['💥', '⭐', '📄', '🔥'], 12); beep(700, 0.15, 'square', 0.05); popAt({ x: pos.x, y: pos.y - 40 }, pick(CRITS), '#ff6b6b', 1.1); flavor(pick(CRITS) + ' ×10'); }
            else { burst(el.stamp, ['📄', '✅', '🗂️', '🖊️'], 2); beep(280 + Math.random() * 60, 0.05, 'square', 0.025); if (S.clicks % 7 === 0) flavor(pick(KLICK)); }
            popAt(pos, '+' + fmt(v), crit ? '#ffd24a' : '#fff', crit ? 1.8 : 1.2);
            checkAll(); updateHud();
        }

        var lastRank = -1;
        function checkAll() {
            var r = rankIndex();
            if (lastRank >= 0 && r > lastRank) {
                shake(); burst(el.stamp, ['🎖️', '🥇', '📜', '🎉', '👔'], 24); beep(523, 0.15); beep(659, 0.15); beep(784, 0.3);
                showModal('Befordran: ' + RANKS[r][1], RANKS[r][2], [{ l: r === RANKS.length - 1 ? 'Ta emot riket' : 'Tack, det var på tiden', main: true }]);
            }
            lastRank = r;
            ACH.forEach(function (a) {
                if (!S.ach[a[0]] && a[3](S)) { S.ach[a[0]] = 1; toast('🏅 Bragd: ' + a[1] + '. ' + a[2] + ' (+1 % meritvärde)'); beep(880, 0.12); if (TAB === 'bragd') renderBragd(); }
            });
        }

        // Gyllene händelser: remisser som svävar förbi. Slumpad utgång (variabel belöning).
        var gold = null;
        function spawnGold() {
            if (gold || !root.classList.contains('open')) return;
            var kind = pick(['📨', '💶', '⏰', '👑', '📋']);
            var r = el.left.getBoundingClientRect();
            var x = rnd(20, Math.max(40, r.width - 80)), y = rnd(60, Math.max(120, r.height - 100));
            gold = h('button', { type: 'button', class: 'sp-gold', 'aria-label': 'Remiss: klicka för att besvara', text: kind, style: 'left:' + x + 'px;top:' + y + 'px', onclick: function () { claimGold(); } });
            el.left.appendChild(gold); beep(990, 0.1, 'sine', 0.05); beep(1320, 0.12, 'sine', 0.05);
            flavor('En remiss har dykt upp! Den ska besvaras snabbt eller aldrig.');
            var g = gold; setTimeout(function () { if (gold === g) { g.remove(); gold = null; flavor('Remissen löpte ut. Den ersattes av en ny remiss, som löpte ut.'); } }, 12000);
            S.goldAt = Date.now() + rnd(45000, 110000);
        }
        function addBuff(label, secs, p, c) { S.buffs.push({ label: label, until: Date.now() + secs * 1000, p: p, c: c }); }
        function claimGold() {
            var r = gold.getBoundingClientRect(), pos = localPos(r.left + r.width / 2, r.top);
            gold.remove(); gold = null; S.golden++;
            var roll = Math.random() * 100, c = cps();
            burst(el.stamp, ['✨', '💰', '📨'], 16); shake();
            if (roll < 40) { var v = Math.max(13, Math.min(S.a * 0.15, c * 900) + c * 60); gain(v); popAt(pos, '+' + fmt(v), '#ffd24a', 1.8); toast('📨 Remiss besvarad: +' + fmt(v) + ' ärenden. Svaret var "se bilaga".'); beep(1046, 0.2); }
            else if (roll < 65) { addBuff('Budgetslutspurt ×7', 20, 7); toast('💶 Budgetslutspurt! Produktionen ×7 i 20 sekunder. Pengarna måste förbrukas före årsskiftet.'); beep(784, 0.3); }
            else if (roll < 85) { addBuff('Sista ansökningsdag ×20', 15, 0, 20); toast('⏰ Sista ansökningsdag! Dina stämplar ×20 i 15 sekunder. Skynda dig, alla andra är sena.'); beep(880, 0.3); }
            else if (roll < 95) { addBuff('Omorganisation ×0,5', 15, 0.5); toast('🔀 Omorganisation av omorganisationen: produktionen ×0,5 i 15 sekunder. Alla blev glada över att något hände.'); beep(160, 0.4, 'sawtooth'); }
            else { var big = Math.max(100, c * 3600); gain(big); popAt(pos, '+' + fmt(big), '#ffd24a', 2); toast('👑 Kunglig skrivelse: +' + fmt(big) + ' ärenden. En timmes produktion, och en titel du inte begärde.'); beep(1318, 0.5); }
            checkAll(); updateHud(); save();
        }

        // Händelser med val (variabel belöning med tankeväckande humor)
        function triggerEvent() {
            if (modal || !root.classList.contains('open') || S.all < 200) return;
            var ev = pick(EVENTS);
            showModal(ev.t, ev.d, ev.o.map(function (o) { return { l: o.l, f: function () { resolve(o); } }; }));
            S.evAt = Date.now() + rnd(150000, 280000);
        }
        function resolve(o) {
            var tot = o.r.reduce(function (s, x) { return s + x[0]; }, 0), roll = Math.random() * tot, chosen = o.r[0];
            for (var i = 0; i < o.r.length; i++) { roll -= o.r[i][0]; if (roll <= 0) { chosen = o.r[i]; break; } }
            var type = chosen[2], val = chosen[3], c = cps(), msg = chosen[1];
            if (type === 'gain') { var g = Math.max(20, c * val); gain(g); msg += ' (+' + fmt(g) + ' ärenden)'; beep(880, 0.15); }
            else if (type === 'lose') { var l = S.a * val; S.a = Math.max(0, S.a - l); msg += ' (−' + fmt(l) + ' ärenden)'; beep(150, 0.3, 'sawtooth'); }
            else if (type === 'buff') { addBuff('Händelse ×' + val[1], val[0], val[1]); msg += ' (produktion ×' + val[1] + ' i ' + val[0] + ' s)'; beep(700, 0.2); }
            toast(msg); checkAll(); updateHud(); save();
        }

        /* ---------- Uppdatering av siffror ---------- */
        var lastRankRender = -1, rutSig = '';
        function updateHud() {
            el.arenden.textContent = fmt(S.a);
            var c = cps();
            el.cps.textContent = 'Produktion: ' + fmt(c) + ' ärenden/s · Stämpel: +' + fmt(clickPower());
            var r = rankIndex(), nxt = RANKS[r + 1];
            el.rank.replaceChildren(h('b', { text: RANKS[r][1] }), h('small', { style: 'display:block;opacity:.8', text: nxt ? 'Nästa titel: ' + nxt[1] + ' (' + fmt(nxt[0]) + ' ärenden)' : 'Du kan inte befordras högre. Det har utretts.' }));
            el.bar.style.width = (nxt ? Math.min(100, (S.all - RANKS[r][0]) / (nxt[0] - RANKS[r][0]) * 100) : 100) + '%';
            var now = Date.now(); S.buffs = S.buffs.filter(function (b) { return b.until > now; });
            el.buffs.replaceChildren.apply(el.buffs, S.buffs.map(function (b) { return h('span', { class: 'sp-buff', text: b.label + ' · ' + Math.ceil((b.until - now) / 1000) + ' s' }); }));
            el.stats.replaceChildren(h('span', { text: '🧠 Minne ' + S.minne }), h('span', { text: '🏅 ' + Object.keys(S.ach).length + '/' + ACH.length }), h('span', { text: '🖋️ ' + S.clicks + ' stämplar' }), h('span', { text: '💥 ' + S.crits + ' kritiska' }));
            if (TAB === 'pers') updatePers();
            else if (TAB === 'rut') {
                var sig = UPS.filter(function (u) { return !S.ups[u.id] && S.run + S.a >= u.c * 0.3; }).map(function (u) { return u.id + (S.a >= u.c ? '+' : '-'); }).join();
                if (sig !== rutSig) { rutSig = sig; renderRut(); }
            } else if (TAB === 'omorg' && now % 2000 < 260) renderOmorg();
            if (countEl) countEl.textContent = fmt(S.a);
        }

        // Tickar med verklig tid, så att bakgrundsflikar inte tappar produktion
        var last = Date.now(), tickTimer = null;
        function tick() {
            var now = Date.now(), dt = Math.min(5, (now - last) / 1000); last = now;
            var c = cps(); if (c > 0) gain(c * dt);
            if (S.goldAt && now >= S.goldAt && root.classList.contains('open')) spawnGold();
            if (S.evAt && now >= S.evAt) triggerEvent();
            if (root.classList.contains('open')) { checkAll(); updateHud(); }
            else if (countEl) countEl.textContent = fmt(S.a);
        }

        // Semesterersättning: produktion medan spelet var stängt (50 %, högst 8 timmar)
        function offline() {
            var secs = Math.min(8 * 3600, (Date.now() - S.t) / 1000);
            if (secs < 90 || cps() <= 0) return null;
            var g = cps() * secs * 0.5; gain(g); S.vac++;
            return { secs: secs, g: g };
        }
        function human(s) { if (s < 3600) return Math.round(s / 60) + ' minuter'; return (s / 3600).toLocaleString('sv-SE', { maximumFractionDigits: 1 }) + ' timmar'; }

        /* ---------- Knapp i sajtens verktygsrad ---------- */
        var countEl = null, openBtn = null, navItem = null;
        // Menypunkten "Riksbyråkraten" i huvudmenyn. Finns ingen meny används en knapp i verktygsraden.
        if (!BARE) {
            if (navList) {
                openBtn = h('a', { href: '#/spel', id: 'sp-open', 'data-nav': 'spel', text: 'Riksbyråkraten', onclick: function (e) {
                    e.preventDefault();
                    var mn = document.getElementById('mainnav'), mb = document.getElementById('menu-btn');
                    if (mn) mn.classList.remove('open'); if (mb) mb.setAttribute('aria-expanded', 'false');
                    api.open();
                } });
                navItem = h('li', null, openBtn);
                navList.insertBefore(navItem, navAnchor.parentNode);
            } else {
                openBtn = h('button', { type: 'button', id: 'sp-open', onclick: function () { api.open(); } }, '🖋️ Riksbyråkraten');
                host.insertBefore(openBtn, host.firstChild);
            }
        }

        /* ---------- Händelsekopplingar ---------- */
        var typing = false;
        el.stamp.addEventListener('pointerdown', function (e) {
            if (e.button > 0) return; e.preventDefault();
            el.stamp.classList.add('down'); stamp(e.clientX, e.clientY);
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) { el.stamp.addEventListener(t, function () { el.stamp.classList.remove('down'); }); });
        el.stamp.addEventListener('click', function (e) { if (e.detail === 0) { var r = el.stamp.getBoundingClientRect(); stamp(r.left + r.width / 2, r.top + r.height / 2); } }); // tangentbord
        el.stamp.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        document.addEventListener('keydown', function (e) {
            if (!root.classList.contains('open')) return;
            if (e.key === 'Escape') { if (modal) closeModal(); else api.close(); }
            if (e.key === 'Tab') { // enkel fokusfälla
                var f = Array.prototype.filter.call((modal || root).querySelectorAll('button:not([disabled])'), function (b) { return b.offsetParent !== null; });
                if (!f.length) return; var a = f[0], z = f[f.length - 1];
                if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
                else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
            }
        });
        window.addEventListener('beforeunload', save);
        document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

        /* =====================================================================
         * 7. START
         * ===================================================================== */
        var wasOpen = false, prevFocus = null;
        var api = {
            open: function () {
                if (root.classList.contains('open')) return;
                prevFocus = document.activeElement;
                root.classList.add('open'); document.documentElement.style.overflow = 'hidden';
                var off = offline(); last = Date.now();
                lastRank = rankIndex(); syncSound(); renderTabs(); renderPanel(); updateHud();
                if (!S.goldAt) S.goldAt = Date.now() + 20000; // första remissen kommer snabbt: tidig belöning
                if (!S.evAt || S.evAt < Date.now() + 40000) S.evAt = Date.now() + rnd(60000, 120000); // inga händelser rakt i ansiktet efter en frånvaro
                if (S.clicks === 0 && S.all === 0) {
                    showModal('Välkommen till tjänsten', 'Du är nyanställd handläggare vid Statens Överprövningsnämnd. Du har ingen skrivbordsstol, men väl en stämpel. Din uppgift är att stämpla ärenden. Din karriär går från blåögd novis till Rikskansler. Allt du behöver göra är att stämpla.', [{ l: 'Jag är redo (jag är inte redo)', main: true, f: function () { el.stamp.focus(); } }]);
                } else if (off) {
                    showModal('Semesterersättning', 'Du var borta i ' + human(off.secs) + '. Riket klarade sig. Din personal stämplade vidare på halvfart och samlade ' + fmt(off.g) + ' ärenden. Ingen har märkt att du var borta, vilket är det högsta betyg en tjänsteman kan få.', [{ l: 'Tacka för förtroendet', main: true, f: function () { el.stamp.focus(); } }]);
                } else el.stamp.focus();
                checkAll(); save();
            },
            close: function () {
                closeModal(); root.classList.remove('open'); document.documentElement.style.overflow = ''; save();
                if (BARE) { location.href = '../../'; return; }
                if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} } else if (openBtn) openBtn.focus();
            },
            reset: function () {
                showModal('Begära avsked?', 'All din tjänstetid, alla titlar och allt institutionellt minne raderas. Det går inte att överklaga, av princip.', [
                    { l: 'Begär avsked', f: function () { S = fresh(); S.goldAt = Date.now() + 20000; S.evAt = Date.now() + 120000; try { localStorage.removeItem(KEY); } catch (e) {} lastRank = 0; renderPanel(); updateHud(); toast('Avsked beviljat. Du är nu praktikant igen. Välkommen tillbaka.'); } },
                    { l: 'Stanna (ingen alternativ tjänst finns)', main: true }
                ]);
            },
            unmount: function () {
                clearInterval(tickTimer); clearInterval(saveTimer); save();
                [root, style, navItem, navItem ? null : openBtn].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
                document.documentElement.style.overflow = ''; delete window.stonSpel;
            }
        };
        // "Begär avsked" som liten länk längst ned i Omorganisera-fliken
        var origOmorg = renderOmorg;
        renderOmorg = function () { origOmorg(); el.panel.appendChild(h('button', { type: 'button', class: 'sp-ib', style: 'justify-self:start;margin-top:8px', onclick: function () { api.reset(); } }, 'Begär avsked (nollställ allt)')); };

        load();
        // Första tickningen räknar upp tiden sedan sist, så att även stängt spel räknas (se offline())
        tickTimer = setInterval(tick, 250);
        var saveTimer = setInterval(save, 10000); // autospar var 10:e sekund
        window.stonSpel = api;
        if (script.dataset.open === 'true' || location.hash === '#/spel') api.open();
        window.addEventListener('hashchange', function () { if (location.hash === '#/spel') api.open(); });
    } catch (err) {
        if (window.console && console.warn) console.warn('Spelet kunde inte starta:', err);
    }
})();
