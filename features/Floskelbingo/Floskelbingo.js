/*!
 * FLOSKELBINGO – Statens Överprövningsnämnd.
 * Ett reaktionsspel för STÖN: du sitter i ett möte, på bordet ligger ett bingokort fullt av floskler,
 * och varje gång någon yttrar en av dem ska du anteckna den innan den passerat. Fem i rad ger BINGO.
 * Fel anteckning ger anmärkning. Tre anmärkningar ajournerar mötet.
 *
 * Aktivera med EN rad före </body>:   <script src="features/floskelbingo/floskelbingo.js" defer></script>
 * Ta bort raden för att ta bort spelet. data-enabled="false" stänger av. Allt är lokalt (localStorage), inga externa tillgångar.
 * Spelet lägger själv in menyvalet "Floskelbingo" och sidan #/floskelbingo.
 */
(function () {
    'use strict';
    try {
        var script = document.currentScript;
        if (!script || script.dataset.enabled === 'false') return;
        if (window.stonFloskelbingo) return;

        /* ================= 1. INNEHÅLL ================= */
        // 75 kulor som i riktigt bingo: B 1-15, I 16-30, N 31-45, G 46-60, O 61-75.
        // [kort text på brickan, mening som utropas]. Index + 1 = kulans nummer.
        var LET = 'BINGO';
        var PHR = [
            ['Under beredning', 'Ärendet är under beredning. Det har varit det sedan 2019.'],
            ['Handläggningstid', 'Normal handläggningstid är tio veckor. Tiden räknas från den dag vi påbörjar handläggningen.'],
            ['Ärendebalans', 'Vi har en ärendebalans. Den balanserar åt ett håll.'],
            ['Ej inkommen handling', 'Er ansökan har inte inkommit. Vi har den, men den har inte inkommit.'],
            ['Besvärshänvisning', 'Beslutet kan överklagas. Besvärshänvisningen finns i beslutet som ni inte fått.'],
            ['Kommunicering', 'Vi kommunicerar nu handlingen till er, så att ni kan yttra er om att vi kommunicerar.'],
            ['Delegationsordning', 'Det är inte jag som beslutar. Se delegationsordningen, bilaga 7.'],
            ['Tjänsteanteckning', 'Samtalet har dokumenterats i en tjänsteanteckning. Anteckningen är sekretessbelagd mot er.'],
            ['Remissinstanser', 'Vi har inhämtat yttranden från remissinstanserna. Två av tre har svarat. Ingen har läst.'],
            ['Diarieförd', 'Handlingen har diarieförts. Diariet är avstängt.'],
            ['Utanför ansvarsområde', 'Frågan ligger utanför vårt ansvarsområde. Vi hänvisar till en myndighet som hänvisar tillbaka.'],
            ['Gällande rutin', 'Vi har handlagt ärendet enligt gällande rutin. Rutinen är under revidering.'],
            ['Beslut saknas', 'Beslut i frågan saknas, vilket är ett beslut.'],
            ['Ange diarienummer', 'Ange gärna diarienummer. Diarienumret får ni när ärendet har registrerats.'],
            ['Komplettering', 'Ni måste komplettera med den handling ni nyss kompletterade.'],
            ['Tillsyn', 'Vi har bedrivit tillsyn av tillsynen. Tillsynen var godkänd.'],
            ['Intern kontroll', 'Den interna kontrollen visar att kontrollen är intern.'],
            ['Förstudie', 'Först gör vi en förstudie. Resultatet är att vi behöver en förstudie.'],
            ['Samverkan', 'Vi bedriver samverkan med de myndigheter som bedriver samverkan med oss.'],
            ['Regeringsuppdrag', 'Uppdraget är redovisat. Redovisningen är under uppdrag.'],
            ['Medborgarperspektiv', 'Vi har ett medborgarperspektiv. Medborgaren har inte tillfrågats.'],
            ['Effektivisering', 'Verksamheten har effektiviserats. Handläggningstiden har ökat i takt med det.'],
            ['Digitalisering', 'Vi digitaliserar. Blanketten skickas nu som PDF till en skrivare.'],
            ['Ansvarsutkrävande', 'Ansvar ska utkrävas. Av vem utreds.'],
            ['Överklagandenämnd', 'Beslutet har överklagats till en nämnd som beslutar att vi beslutar.'],
            ['Återremitteras', 'Ärendet återremitteras till den som remitterade det.'],
            ['Rättssäkerhet', 'Rättssäkerheten är hög. Den är bara inte tillgänglig.'],
            ['Offentlighetsprincipen', 'Handlingen är offentlig. Den är endast inte utlämnad.'],
            ['Sekretess', 'Uppgiften är sekretessbelagd. Sekretessen är sekretessbelagd.'],
            ['Gallrad', 'Handlingen har gallrats enligt gallringsplanen. Planen har gallrats.'],
            ['Utanför mandat', 'Det ligger utanför vårt mandat att uttala oss om vårt mandat.'],
            ['Prioritering', 'Vi prioriterar. Allt är prioriterat, vilket är en prioritering.'],
            ['Verksamhetsidé', 'Vår verksamhetsidé är att ha en verksamhetsidé.'],
            ['Nuläge', 'Nuläget är att vi är i nuläget.'],
            ['Konsekvensutredning', 'Konsekvensutredningen konstaterar att konsekvenserna blir konsekvenser.'],
            ['Ansvarsfördelning', 'Ansvaret är fördelat. Alla har fått lika mycket av ingenting.'],
            ['Ärendeslag: övrigt', 'Ert ärende är av ärendeslag "övrigt". Övrigt handläggs sist.'],
            ['Slutligt beslut', 'Beslutet är slutligt tills vidare.'],
            ['Verksamhetsstöd', 'Verksamhetsstödet stödjer verksamheten med stöd.'],
            ['Utreda', 'Vi utreder om det finns anledning att utreda.'],
            ['Lyft till nämnd', 'Frågan har lyfts till nämnden. Nämnden sammanträder nästa gång i maj. Av något år.'],
            ['Beredskap', 'Vi har god beredskap. Beredskapen är under uppbyggnad.'],
            ['Frågan är komplex', 'Frågan är komplex, vilket vi inte kan förklara.'],
            ['Regelbunden uppföljning', 'Uppföljning sker regelbundet, vid oregelbundna tillfällen.'],
            ['Avslag', 'Er ansökan har avslagits av skäl som avslagits.'],
            ['Tillgänglighet', 'Vår tillgänglighet är hög. Vi är tillgängliga för att meddela att vi inte är det.'],
            ['Handläggare saknas', 'Ärendet saknar för närvarande handläggare. Handläggaren saknar ärende.'],
            ['Dokumentation', 'Allt dokumenteras. Dokumentationen dokumenteras.'],
            ['Riktlinje', 'Det framgår av riktlinjen. Riktlinjen finns i en riktlinje.'],
            ['Granskning', 'Granskningen har granskats och befunnits ha granskats.'],
            ['Remissvar', 'Vi har lämnat remissvar. Svaret är att vi inte har några synpunkter, utförligt.'],
            ['Rutinbeskrivning', 'Vi ska ta fram en rutinbeskrivning för att beskriva rutinen.'],
            ['Beslutsunderlag', 'Beslutsunderlag saknas. Vi inväntar underlag som underlag.'],
            ['Verksamhetsplan', 'Detta ryms inte i verksamhetsplanen. Verksamhetsplanen ryms inte i verksamheten.'],
            ['Förtydligande', 'Vi lämnar ett förtydligande. Det har förtydligats att det är oklart.'],
            ['Tidsplanen håller', 'Tidsplanen håller. Den hålls för närvarande i en pärm.'],
            ['Resurser saknas', 'Resurser saknas. Därför tillsätts en utredning om resurser.'],
            ['Delegera', 'Jag delegerar det till er. Ni har inget mandat.'],
            ['Uppdragsbeskrivning', 'Uppdragsbeskrivningen är under uppdrag.'],
            ['Återkoppling', 'Vi återkopplar, så snart vi har något att återkoppla.'],
            ['Bifall delvis', 'Er ansökan bifalls delvis. Delen som bifalls är rubriken.'],
            ['Ordning och reda', 'Vi arbetar med ordning och reda. Reda har ordnats.'],
            ['Beslutsmöte inställt', 'Beslutsmötet ställs in. Ett möte om det inställda mötet hålls.'],
            ['Förvaltningsfråga', 'Det är en förvaltningsfråga. Förvaltningen förvaltar frågan.'],
            ['Samråd', 'Vi har samrått. Samrådet resulterade i ett nytt samråd.'],
            ['Tillämpning', 'Det beror på tillämpningen. Tillämpningen beror på det.'],
            ['Fristen har löpt ut', 'Fristen har löpt ut. Den löpte ut innan den infördes.'],
            ['Inom skälig tid', 'Beslut meddelas inom skälig tid. Skälig tid avgörs av oss.'],
            ['Verkställighet', 'Beslutet verkställs så snart det har fattats.'],
            ['Inga synpunkter', 'Vi har inga synpunkter men vill gärna framföra dem.'],
            ['Ansvarig utgivare', 'Ansvarig utgivare saknas. Utgivaren har varit ansvarig.'],
            ['Bred förankring', 'Beslutet är förankrat. Ingen vet i vad.'],
            ['Se tidigare hänvisning', 'Vi hänvisar till vår tidigare hänvisning.'],
            ['Pågående arbete', 'Arbetet pågår. Det har pågått.'],
            ['Slutredovisning', 'Slutredovisningen skjuts upp till redovisning.']
        ];
        var PLAIN = [
            ['Utroparen', 'Observera: kula 76 har inte inkommit. Kula 76 finns inte.'],
            ['Utroparen', 'Trumman snurrar. Trummans diarienummer har ännu inte tilldelats.'],
            ['Utroparen', 'Vinsten betalas ut när vinsten har beviljats.'],
            ['Utroparen', 'Har någon bingo? Nej. Har någon synpunkt på det? Skriv till kulan.'],
            ['Receptionisten', 'Någon har lämnat sin bricka i hissen. Hissen är under utredning.'],
            ['Praktikanten', 'Får man fråga vad bingo egentligen betyder?'],
            ['Juristen', 'Spelet saknar lagstöd. Det fortsätter ändå.'],
            ['Controllern', 'Vinstsumman har dragits av som kostnad för att dra vinstsumman.'],
            ['Utroparen', 'Dragningen pausas. Kaffet är slut.'],
            ['Generaldirektören', 'Jag vill att alla vet att jag inte vet vad som pågår.']
        ];
        var SPEAKERS = ['Generaldirektören', 'Controllern', 'HR-chefen', 'Kommunikatören', 'Juristen', 'Verksamhetsutvecklaren', 'Enhetschefen', 'Avdelningschefen'];
        var RANKS = [
            [0, 'Praktikant utan mandat', 'Du får sitta längst ned vid bordet. Stolen är lånad.'],
            [1500, 'Handläggare', 'Du har fått ett eget diarienummer.'],
            [5000, 'Förste handläggare', 'Du får numera skriva "bifall" med två l.'],
            [12000, 'Enhetschef', 'Du har fått en titel, ett rum och ingen tid.'],
            [25000, 'Avdelningschef', 'Du är i alla möten, så ingenting hinns med.'],
            [50000, 'Överdirektör', 'Du delegerar delegeringen av delegeringen.'],
            [100000, 'Generaldirektör', 'Du har tagit till dig ansvaret och skickat det vidare.'],
            [200000, 'Statssekreterare', 'Ingen vet exakt vad du gör, vilket är poängen.']
        ];
        var ACH = [
            ['first', 'Första anteckningen', 'Godkänn din första ruta.'],
            ['bingo1', 'Bingo i rikets tjänst', 'Få din första BINGO.'],
            ['combo10', 'Mötesveteran', 'Nå combo 10.'],
            ['clean', 'Felfri protokollförare', 'Få BINGO utan en enda anmärkning.'],
            ['double', 'Dubbelprotokoll', 'Få två rader med en och samma anteckning.'],
            ['gold3', 'Guldkant', 'Fånga tre gyllene kulor i ett möte.'],
            ['strike3', 'Ajournerad', 'Bli utsparkad ur ett möte efter tre anmärkningar.'],
            ['marks100', 'Hundra stämplar', 'Godkänn 100 rutor totalt.'],
            ['streak3', 'Trogen tjänsteman', 'Spela Dagens möte tre dagar i rad.']
        ];
        var END_LINES = {
            time: ['Mötestiden är slut. Ingen kunde ange vad som beslutades.', 'Tiden gick ut. Mötet förlängs med ett nytt möte.', 'Klockan slog. Protokollet justeras av ingen.'],
            strikes: ['Mötet ajournerades efter tre anmärkningar. Ordföranden hänvisar till dig som orsak.', 'Du anmärktes ur salen. Beslutet kan inte överklagas.', 'Protokollföraren har lämnat rummet och protokollet.']
        };

        /* ================= 2. HJÄLPARE ================= */
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
        function mulberry(seed) { var a = seed >>> 0; return function () { a += 0x6D2B79F5; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
        function pad(n) { return String(n).padStart(2, '0'); }
        function todayKey() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
        function yesterdayKey() { var d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
        function seedOf(k) { var s = 7; for (var i = 0; i < k.length; i++) s = (s * 31 + k.charCodeAt(i)) | 0; return s; }
        function fmt(n) { try { return Math.round(n).toLocaleString('sv-SE'); } catch (e) { return String(Math.round(n)); } }
        var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* ---- Sparat ---- */
        var KEY = 'ston.floskelbingo.v1';
        var S = { xp: 0, best: 0, games: 0, bingos: 0, marks: 0, ach: {}, sound: true, calm: false, daily: { date: '', best: 0 }, streak: { n: 0, last: '' } };
        try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); Object.keys(S).forEach(function (k) { if (o[k] !== undefined) S[k] = o[k]; }); } } catch (e) {}
        function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
        function rankIndex(xp) { var r = 0; for (var i = 0; i < RANKS.length; i++) if (xp >= RANKS[i][0]) r = i; return r; }

        /* ---- Ljud ---- */
        var ac = null;
        function beep(f, d, type, v, when) {
            if (!S.sound) return;
            try {
                ac = ac || new (window.AudioContext || window.webkitAudioContext)();
                var t = ac.currentTime + (when || 0), o = ac.createOscillator(), g = ac.createGain();
                o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
                g.gain.setValueAtTime(v || 0.04, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
                o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02);
            } catch (e) {}
        }
        var SND = {
            mark: function () { beep(660, .08, 'square', .04); beep(990, .1, 'square', .04, .07); },
            gold: function () { [880, 1175, 1568].forEach(function (f, i) { beep(f, .12, 'triangle', .05, i * .08); }); },
            strike: function () { beep(140, .3, 'sawtooth', .06); },
            bingo: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { beep(f, .16, 'square', .045, i * .09); }); },
            miss: function () { beep(240, .12, 'triangle', .035); },
            end: function () { [392, 330, 262, 196].forEach(function (f, i) { beep(f, .22, 'sawtooth', .04, i * .16); }); },
            tick: function () { beep(1200, .03, 'square', .02); },
            draw: function () { beep(300, .05, 'triangle', .03); beep(420, .05, 'triangle', .03, .06); }
        };
        function buzz(p) { try { if (navigator.vibrate && !REDUCED) navigator.vibrate(p); } catch (e) {} }

        /* ================= 3. STIL ================= */
        var css = [
            '.fb{--fb-bg:#0a1b2b;--fb-bg2:#102a40;--fb-paper:#f6f0df;--fb-ink:#1a1a1a;--fb-y:#fecc02;--fb-red:#d3202f;--fb-ok:#2fb36d;background:var(--fb-bg);color:#f4efe3;border-radius:14px;padding:18px;border:3px solid #000;box-shadow:0 6px 0 #000;position:relative;overflow:hidden;max-width:720px;margin:0 auto}',
            '.fb *{box-sizing:border-box}.fb{min-width:0}',
            '.fb h2,.fb h3{color:#fff;margin:0}',
            '.fb-lead{max-width:62ch;margin:0 0 14px}',
            '.fb-btn{font:inherit;font-weight:800;border:3px solid #000;border-radius:8px;padding:12px 18px;cursor:pointer;background:var(--fb-y);color:#000;box-shadow:0 4px 0 #000;transition:transform .08s,box-shadow .08s}',
            '.fb-btn:hover{transform:translateY(-1px)}.fb-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #000}',
            '.fb-btn.sec{background:#fff}.fb-btn.ghost{background:transparent;color:#fff;border-color:#fff;box-shadow:none}',
            '.fb-btn[disabled]{opacity:.5;cursor:default;transform:none}',
            '.fb button:focus-visible{outline:4px solid #fff;outline-offset:2px}',
            '.fb-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}',
            '.fb-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:14px 0}',
            '.fb-stat{background:var(--fb-bg2);border-radius:8px;padding:10px 12px;border:1px solid rgba(255,255,255,.15)}',
            '.fb-stat b{display:block;font-size:1.35rem;color:var(--fb-y);font-variant-numeric:tabular-nums}.fb-stat span{font-size:.8rem;opacity:.85}',
            '.fb-bar{height:10px;border-radius:99px;background:rgba(255,255,255,.18);overflow:hidden}.fb-bar i{display:block;height:100%;background:var(--fb-y);width:0;transition:width .2s linear}',
            '.fb-bar.time i{background:var(--fb-ok)}.fb-bar.time.low i{background:var(--fb-red)}',
            '.fb-ach{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin:10px 0 0;padding:0;list-style:none}',
            '.fb-ach li{background:var(--fb-bg2);border-radius:8px;padding:8px 10px;border:1px solid rgba(255,255,255,.12);font-size:.86rem}.fb-ach li.off{opacity:.45}.fb-ach b{display:block}',
            '.fb details{margin-top:14px;background:var(--fb-bg2);border-radius:8px;padding:10px 12px}.fb summary{cursor:pointer;font-weight:700}',
            '.fb-tog{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:.92rem}.fb-tog label{display:flex;gap:8px;align-items:center;cursor:pointer}',
            /* spel */
            '.fb-hud{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}',
            '.fb-hud div{background:var(--fb-bg2);border-radius:8px;padding:6px 8px;text-align:center;border:1px solid rgba(255,255,255,.15)}',
            '.fb-hud b{display:block;font-size:1.15rem;font-variant-numeric:tabular-nums;color:var(--fb-y)}.fb-hud span{font-size:.7rem;opacity:.85;text-transform:uppercase;letter-spacing:.05em}',
            '.fb-strikes b{letter-spacing:4px;color:var(--fb-red)}',
            '.fb-stage{background:#fff;color:#111;border-radius:10px;border:3px solid #000;padding:10px 14px 12px;margin:10px 0;min-height:88px;position:relative}',
            '.fb-stage.gold{background:#fff3b0;border-color:#b58900;box-shadow:0 0 0 4px var(--fb-y)}',
            '.fb-who{font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#00528a}',
            '.fb-say{font-size:1.08rem;font-weight:600;margin:2px 0 8px;line-height:1.3}',
            '.fb-ttl{height:6px;border-radius:99px;background:#d9d9d9;overflow:hidden}.fb-ttl i{display:block;height:100%;width:100%;background:#00528a}',
            '.fb-tag{position:absolute;top:-12px;right:10px;background:var(--fb-red);color:#fff;font-weight:900;font-size:.72rem;padding:3px 10px;border-radius:99px;border:2px solid #000;letter-spacing:.06em}',
            '.fb-msg{min-height:1.5em;font-weight:700;color:var(--fb-y);margin:6px 2px;text-align:center}',
            '.fb-board{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}',
            '.fb-cell{position:relative;font:inherit;font-weight:700;font-size:clamp(.5rem,2.25vw,.86rem);line-height:1.12;aspect-ratio:1/1;min-height:58px;background:var(--fb-paper);color:var(--fb-ink);border:2px solid #000;border-radius:6px;padding:3px;cursor:pointer;hyphens:auto;-webkit-hyphens:auto;overflow-wrap:anywhere;display:flex;align-items:center;justify-content:center;text-align:center;transition:transform .08s}',
            '.fb-cell:active{transform:scale(.94)}',
            '.fb-cell.on{background:#e9dfbd;color:#6b6648}',
            '.fb-cell.on::after{content:"GODKÄNT";position:absolute;inset:0;margin:auto;height:fit-content;width:fit-content;font-size:clamp(.5rem,2vw,.7rem);font-weight:900;color:var(--fb-red);border:2px solid var(--fb-red);border-radius:4px;padding:1px 4px;transform:rotate(-14deg);background:rgba(246,240,223,.82);animation:fb-stamp .25s both}',
            '.fb-cell.free{background:var(--fb-y)}.fb-cell.free::after{content:"✓";font-size:1.4rem;border:0;background:none;transform:none;color:#000;top:auto;bottom:2px;inset:auto 4px 2px auto}',
            '.fb-cell.hint{animation:fb-hint .9s infinite;border-color:var(--fb-red)}',
            '.fb-cell.bad{animation:fb-shake .3s}',
            '.fb-cell.line{background:#bff0cf;color:#06361c}',
            '@keyframes fb-stamp{from{transform:rotate(-14deg) scale(2.2);opacity:0}to{transform:rotate(-14deg) scale(1);opacity:1}}',
            '@keyframes fb-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
            '@keyframes fb-hint{50%{box-shadow:0 0 0 4px rgba(254,204,2,.9)}}',
            '.fb-stage{display:flex;gap:12px;align-items:center}.fb-sb{flex:1;min-width:0}',
            '.fb-ball{flex:none;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 30% 28%,#fff 0 12%,#fecc02 13% 70%,#c79a00 100%);border:3px solid #000;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;color:#000;box-shadow:0 3px 0 #000;animation:fb-drop .35s both}',
            '.fb-ball small{font-size:.8rem;font-weight:900;letter-spacing:.05em}.fb-ball b{font-size:1.5rem;font-weight:900}',
            '.fb-ball.idle{background:#ddd;animation:fb-spin 1s linear infinite;box-shadow:none}.fb-ball.none{background:#ccc;font-weight:900;font-size:1.4rem}',
            '@keyframes fb-drop{from{transform:translateY(-30px) scale(.6);opacity:0}}@keyframes fb-spin{50%{transform:rotate(180deg) scale(.92)}to{transform:rotate(360deg)}}',
            '.fb-hist{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:.78rem;opacity:.9;margin:2px 0 6px;min-height:1.6em}.fb-hist i{font-style:normal;font-weight:800;background:#fff;color:#000;border-radius:99px;padding:1px 8px;border:2px solid #000;font-size:.72rem}',
            '.fb-cap{font-size:.7rem;text-align:center;opacity:.75;margin:2px 0 4px;letter-spacing:.03em}',
            '.fb-head{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-bottom:4px}.fb-head b{text-align:center;background:var(--fb-y);color:#000;border:2px solid #000;border-radius:6px;font-size:1.25rem;line-height:1.5}',
            '.fb-cell{flex-direction:column;gap:1px;min-width:0;width:100%}.fb-n{position:absolute;top:2px;left:4px;font-size:.62rem;font-weight:900;opacity:.6}.fb-t{padding-top:7px}',
            '.fb-pw{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}',
            '.fb-pw .fb-btn{flex:1 1 150px;padding:9px 12px;font-size:.92rem}',
            '.fb-pw small{display:block;font-weight:600}',
            '.fb-over{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:5;pointer-events:none}',
            '.fb-big{font-size:clamp(2rem,9vw,4rem);font-weight:900;color:var(--fb-red);border:6px solid var(--fb-red);padding:6px 22px;border-radius:10px;transform:rotate(-8deg);background:rgba(255,255,255,.92);animation:fb-stamp .45s both;text-align:center}',
            '.fb-big.ok{color:#087a3a;border-color:#087a3a}',
            '.fb-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#000;color:#fff;border:2px solid var(--fb-y);border-radius:10px;padding:10px 16px;z-index:300;max-width:92vw;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,.4)}',
            '.fb-toast b{color:var(--fb-y)}',
            '.fb-res{background:#fff;color:#111;border-radius:10px;border:3px solid #000;padding:14px 16px;margin:12px 0}.fb-res h3{color:#111}',
            '.fb-res dl{display:grid;grid-template-columns:1fr auto;gap:4px 14px;margin:10px 0}.fb-res dd{margin:0;font-weight:800;text-align:right;font-variant-numeric:tabular-nums}',
            '@media (max-width:520px){.fb{padding:12px}.fb-hud span{font-size:.62rem}.fb-say{font-size:1rem}.fb-board{gap:4px}}',
            '@media (prefers-reduced-motion:reduce){.fb *{animation:none!important;transition:none!important}}',
            'html[data-contrast="high"] .fb{background:#000;border-color:#fff}html[data-contrast="high"] .fb-cell{border-color:#fff}'
        ].join('\n');
        var style = h('style', { id: 'fb-style', text: css });
        document.head.appendChild(style);

        /* ================= 4. SPELLOGIK ================= */
        var root = h('div', { class: 'fb', id: 'fb-root' });
        var live = h('div', { class: 'sr-only', 'aria-live': 'polite', style: 'position:absolute;left:-9999px' });
        var G = null, timer = null, toastEl = null, toastQ = [], toasting = false;

        function toast(html, ms) {
            toastQ.push([html, ms || 3200]);
            if (!toasting) nextToast();
        }
        function nextToast() {
            var t = toastQ.shift();
            if (!t) { toasting = false; return; }
            toasting = true;
            if (toastEl) toastEl.remove();
            toastEl = h('div', { class: 'fb-toast', role: 'status' });
            toastEl.innerHTML = t[0];
            document.body.appendChild(toastEl);
            setTimeout(function () { if (toastEl) toastEl.remove(); toastEl = null; setTimeout(nextToast, 150); }, t[1]);
        }
        function grant(id) {
            if (S.ach[id]) return;
            S.ach[id] = todayKey(); save();
            var a = ACH.filter(function (x) { return x[0] === id; })[0];
            if (a) { toast('🏅 Merit: <b>' + a[1] + '</b><br>' + a[2]); SND.gold(); }
        }

        var LINES = (function () {
            var L = [], i, j;
            for (i = 0; i < 5; i++) { var r = [], c = []; for (j = 0; j < 5; j++) { r.push(i * 5 + j); c.push(j * 5 + i); } L.push(r, c); }
            L.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
            return L;
        })();

        function colPool(c) { var a = []; for (var i = c * 15; i < c * 15 + 15; i++) a.push(i); return a; }
        function shuffle(arr, R) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
        function newGame(daily) {
            var R = daily ? mulberry(seedOf(todayKey())) : Math.random;
            var board = new Array(25), c, r;
            for (c = 0; c < 5; c++) {
                var pool = shuffle(colPool(c), R), k = 0;
                for (r = 0; r < 5; r++) { var i = r * 5 + c; board[i] = (i === 12) ? { id: -1, on: true, free: true } : { id: pool[k++], on: false }; }
            }
            G = { daily: !!daily, R: R, board: board, time: 90, score: 0, combo: 0, maxCombo: 0, strikes: 0, marks: 0, bingos: 0, golds: 0, stage: null, last: null, hist: [],
                clock: 0, nextAt: 1.0, freeze: 0, coffee: 1, pen: 1, sinceCharge: 0, over: false, msg: '', hintCell: -1, doneLines: {}, flawless: true, missed: 0, nr: 1000 + Math.floor(R() * 8999) };
            return G;
        }
        function ballName(id) { return LET[Math.floor(id / 15)] + ' ' + (id + 1); }
        function rf(a) { return a[Math.floor(G.R() * a.length)]; }
        function level() { return G.bingos + Math.floor(G.marks / 12); }
        function ttl() { return Math.max(3.0, 6.4 - level() * 0.3) * (S.calm ? 1.7 : 1); }
        function mult() { return 1 + Math.min(G.combo, 20) * 0.1; }

        function spawn() {
            var unmarked = [], marked = [];
            G.board.forEach(function (c, i) { if (!c.free) (c.on ? marked : unmarked).push(i); });
            var r = G.R(), st;
            if (r < 0.60 && unmarked.length) {
                var ci = rf(unmarked), id = G.board[ci].id;
                st = { kind: 'cell', cell: ci, id: id, who: rf(SPEAKERS), say: PHR[id][1], gold: G.R() < 0.14 };
            } else if (r < 0.66 && marked.length) {
                var cm = rf(marked);
                st = { kind: 'again', cell: cm, id: G.board[cm].id, who: rf(SPEAKERS), say: PHR[G.board[cm].id][1] };
            } else if (r < 0.86) {
                var onBoard = {}; G.board.forEach(function (c) { if (!c.free) onBoard[c.id] = 1; });
                var offs = []; for (var q = 0; q < PHR.length; q++) if (!onBoard[q]) offs.push(q);
                var oid = rf(offs);
                st = { kind: 'off', cell: -1, id: oid, who: rf(SPEAKERS), say: PHR[oid][1] };
            } else {
                var p = rf(PLAIN);
                st = { kind: 'plain', cell: -1, who: p[0], say: p[1] };
            }
            st.born = G.clock; st.ttl = ttl(); st.alive = true; st.done = false;
            if (st.kind !== 'plain') { st.ball = ballName(st.id); G.hist.push(st.ball); if (G.hist.length > 8) G.hist.shift(); }
            G.stage = st; G.last = null;
            SND.draw();
            live.textContent = (st.ball ? 'Kula ' + st.ball + '. ' : '') + st.who + ': ' + st.say;
        }

        function msg(t) { G.msg = t; var m = root.querySelector('.fb-msg'); if (m) m.textContent = t; }

        function expireStage() {
            var st = G.stage; if (!st) return;
            st.alive = false;
            if (st.kind === 'cell' && !st.done) {
                G.combo = 0; G.missed++; msg('Kulan passerade obemärkt. Protokollet är bristfälligt.'); SND.miss();
                G.last = st;
            }
            G.stage = null; G.nextAt = G.clock + 0.7 + G.R() * 0.7 * (S.calm ? 1.5 : 1);
            if (st.kind === 'cell' && !st.done) G.stageGrace = st;
        }

        function nearMiss() {
            G.hintCell = -1; var best = null;
            LINES.forEach(function (ln) {
                var n = 0, miss = -1;
                ln.forEach(function (i) { if (G.board[i].on) n++; else miss = i; });
                if (n === 4 && miss >= 0) best = miss;
            });
            if (best !== null) { G.hintCell = best; return true; }
            return false;
        }

        function checkBingo() {
            var done = [];
            LINES.forEach(function (ln, idx) {
                if (G.doneLines[idx]) return;
                if (ln.every(function (i) { return G.board[i].on; })) done.push(idx);
            });
            if (!done.length) return false;
            var cells = {};
            done.forEach(function (idx) { G.doneLines[idx] = 1; LINES[idx].forEach(function (i) { cells[i] = 1; }); });
            G.bingos++; S.bingos++;
            var bonus = 500 * done.length * mult();
            G.score += bonus; G.time += 20;
            if (done.length >= 2) grant('double');
            grant('bingo1'); if (G.flawless && G.strikes === 0) grant('clean');
            SND.bingo(); buzz([60, 40, 120]);
            stampBig('BINGO!', true, 1100);
            msg('BINGO! +' + fmt(bonus) + ' poäng och 20 sekunders förlängning. Vinsten har remitterats till prisnämnden.');
            // markerade rader byts ut mot nya floskler: mötet fortsätter
            var cl = Object.keys(cells).map(Number);
            cl.forEach(function (i) { var cell = root.querySelector('.fb-cell[data-i="' + i + '"]'); if (cell) cell.classList.add('line'); });
            setTimeout(function () {
                if (!G || G.over) return;
                cl.forEach(function (i) {
                    if (G.board[i].free) return;
                    var col = i % 5, used = {}; G.board.forEach(function (x) { used[x.id] = 1; });
                    var cand = colPool(col).filter(function (q) { return !used[q]; });
                    G.board[i] = { id: cand.length ? cand[Math.floor(G.R() * cand.length)] : G.board[i].id, on: false };
                });
                G.doneLines = {};
                LINES.forEach(function (ln, idx) { if (ln.every(function (i) { return G.board[i].on; })) G.doneLines[idx] = 1; });
                renderBoard(); nearMiss(); paintHint();
            }, REDUCED ? 100 : 950);
            return true;
        }

        function mark(i, how) {
            var c = G.board[i], st = G.stage;
            var late = how === 'late';
            c.on = true; G.marks++; S.marks++;
            if (!late) { G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo); } else G.combo = 0;
            var gold = !late && st && st.gold;
            var speed = (!late && st) ? Math.max(0, 1 - (G.clock - st.born) / st.ttl) : 0;
            var gain = (100 + Math.round(speed * 60)) * (late ? 0.4 : mult());
            if (gold) { gain *= 3; G.time += 3; G.golds++; SND.gold(); stampBig('GYLLENE KULA ★', true, 800); if (G.golds >= 3) grant('gold3'); }
            else SND.mark();
            G.score += gain;
            if (late) G.stageGrace = null;
            else if (st) { st.done = true; st.alive = false; G.stage = null; G.nextAt = G.clock + 0.5 + G.R() * 0.5; renderStage(); }
            G.sinceCharge++;
            var chargeTxt = '';
            if (G.sinceCharge >= 8) {
                G.sinceCharge = 0;
                if (G.R() < 0.5) { G.coffee++; chargeTxt = 'Kaffepaus'; } else { G.pen++; chargeTxt = 'Protokollföring'; }
                toast('📎 Du fick en <b>' + chargeTxt + '</b>. Befordran är nära.', 1800);
            }
            msg(late ? 'Försenad anteckning: 40 procent av poängen.' : ('Godkänt! +' + fmt(gain) + (G.combo >= 3 ? '  Combo ×' + mult().toFixed(1).replace('.', ',') : '')));
            save();
            if (S.marks === 1) grant('first'); if (S.marks >= 100) grant('marks100'); if (G.combo >= 10) grant('combo10');
            var bingo = checkBingo();
            if (!bingo && nearMiss()) msg('Bara en från BINGO! Leta efter den markerade rutan.');
            renderAll();
        }

        function strike(i, why) {
            G.strikes++; G.combo = 0; G.flawless = false; G.score = Math.max(0, G.score - 50);
            SND.strike(); buzz(200);
            var cell = root.querySelector('.fb-cell[data-i="' + i + '"]'); if (cell) { cell.classList.remove('bad'); void cell.offsetWidth; cell.classList.add('bad'); }
            msg('Anmärkning ' + G.strikes + ' av 3: ' + why);
            if (G.strikes >= 3) { endGame('strikes'); return; }
            renderAll();
        }

        function tapCell(i) {
            if (!G || G.over) return;
            var c = G.board[i]; if (!c || c.free) return;
            var st = G.stage;
            if (c.on) { msg('Den rutan är redan godkänd. Protokollet är redan tungt.'); return; }
            if (st && st.alive && st.kind === 'cell' && st.cell === i) return mark(i, 'tap');
            if (G.stageGrace && G.stageGrace.cell === i && G.clock - (G.stageGrace.born + G.stageGrace.ttl) < 1.2) { return mark(i, 'late'); }
            if (st && st.alive && st.kind === 'off') return strike(i, 'kulan du tryckte på drogs inte. Den som drogs finns inte på din bricka.');
            if (st && st.alive && st.kind === 'plain') return strike(i, 'ingen kula drogs. Utroparen sade bara något.');
            strike(i, 'den kulan har inte dragits just nu.');
        }

        function usePen() {
            if (!G || G.over || G.pen < 1) return;
            var st = G.stage; if (!st || !st.alive || st.kind !== 'cell') { msg('Protokollföringen kräver att en kula som finns på din bricka just har dragits.'); return; }
            G.pen--; mark(st.cell, 'pen');
        }
        function useCoffee() {
            if (!G || G.over || G.coffee < 1 || G.freeze > 0) return;
            G.coffee--; G.freeze = 5; msg('☕ Kaffepaus. Mötet är avbrutet i fem sekunder. Ingen kommer ihåg varför.'); renderAll();
        }

        /* ================= 5. TICK ================= */
        function tick() {
            if (!G || G.over || document.hidden) return;
            var dt = 0.1;
            if (G.freeze > 0) { G.freeze = Math.max(0, G.freeze - dt); updHud(); return; }
            G.clock += dt; G.time -= dt;
            if (G.time <= 10 && Math.abs(G.time - Math.round(G.time)) < 0.06) SND.tick();
            if (G.time <= 0) { G.time = 0; endGame('time'); return; }
            var st = G.stage;
            if (st) { if (G.clock - st.born >= st.ttl) expireStage(); }
            else if (G.clock >= G.nextAt) { spawn(); renderStage(); }
            if (G.stage || G.stageGrace) { updTtl(); }
            if (G.stageGrace && G.clock - (G.stageGrace.born + G.stageGrace.ttl) > 1.2) G.stageGrace = null;
            updHud();
        }

        /* ================= 6. RENDERING ================= */
        function stampBig(text, ok, ms) {
            var o = h('div', { class: 'fb-over', 'aria-hidden': 'true' }, h('div', { class: 'fb-big' + (ok ? ' ok' : ''), text: text }));
            root.appendChild(o); setTimeout(function () { o.remove(); }, ms || 900);
        }
        function updHud() {
            var q = function (s) { return root.querySelector(s); };
            var t = q('[data-h="time"]'); if (!t) return;
            t.textContent = Math.ceil(G.time);
            q('[data-h="score"]').textContent = fmt(G.score);
            q('[data-h="combo"]').textContent = '×' + mult().toFixed(1).replace('.', ',');
            q('[data-h="strikes"]').textContent = '✖'.repeat(G.strikes) + '·'.repeat(3 - G.strikes);
            var bar = q('.fb-bar.time'); if (bar) { bar.firstChild.style.width = Math.min(100, G.time / 90 * 100) + '%'; bar.classList.toggle('low', G.time < 15); }
            var cb = q('[data-pw="coffee"]'), pb = q('[data-pw="pen"]');
            if (cb) { cb.disabled = G.coffee < 1 || G.freeze > 0; cb.querySelector('small').textContent = G.coffee + ' kvar'; }
            if (pb) { pb.disabled = G.pen < 1; pb.querySelector('small').textContent = G.pen + ' kvar'; }
            var f = q('.fb-freeze'); if (f) f.hidden = G.freeze <= 0;
        }
        function updTtl() {
            var bar = root.querySelector('.fb-ttl i'); if (!bar) return;
            var st = G.stage; if (!st) { bar.style.width = '0%'; return; }
            bar.style.width = Math.max(0, 100 - (G.clock - st.born) / st.ttl * 100) + '%';
        }
        function renderStage() {
            var box = root.querySelector('.fb-stage'); if (!box) return;
            var st = G.stage; box.classList.toggle('gold', !!(st && st.gold && st.kind === 'cell'));
            box.querySelectorAll('.fb-tag').forEach(function (n) { n.remove(); });
            var ball = box.querySelector('.fb-ball'), who = box.querySelector('.fb-who'), say = box.querySelector('.fb-say');
            if (!st) { ball.textContent = ''; ball.className = 'fb-ball idle'; who.textContent = 'Trumman snurrar'; say.textContent = '… utroparen harklar sig …'; return; }
            ball.className = 'fb-ball' + (st.ball ? '' : ' none');
            ball.replaceChildren.apply(ball, st.ball ? [h('small', { text: st.ball.split(' ')[0] }), h('b', { text: st.ball.split(' ')[1] })] : ['—']);
            who.textContent = (st.ball ? 'Kula ' + st.ball + ' · ' : '') + st.who;
            say.textContent = '”' + st.say + '”';
            if (st.gold && st.kind === 'cell') box.appendChild(h('span', { class: 'fb-tag', text: '★ GYLLENE KULA ×3' }));
            var hs = root.querySelector('.fb-hist');
            if (hs) hs.replaceChildren.apply(hs, [h('span', { text: 'Dragna kulor: ' })].concat(G.hist.map(function (b) { return h('i', { text: b }); })));
        }
        function renderBoard() {
            var b = root.querySelector('.fb-board'); if (!b) return;
            b.replaceChildren.apply(b, G.board.map(function (c, i) {
                return h('button', { type: 'button', class: 'fb-cell' + (c.on ? ' on' : '') + (c.free ? ' free' : ''), 'data-i': i, 'data-id': c.free ? '' : c.id,
                    'aria-label': c.free ? 'Fri ruta: ordet är fritt (godkänd)' : (ballName(c.id) + ': ' + PHR[c.id][0] + (c.on ? ', godkänd' : '')), 'aria-pressed': c.on ? 'true' : 'false',
                    onclick: function () { tapCell(i); } },
                    c.free ? 'ORDET ÄR FRITT' : [h('span', { class: 'fb-n', text: String(c.id + 1) }), h('span', { class: 'fb-t', text: PHR[c.id][0] })]);
            }));
        }
        function paintHint() { root.querySelectorAll('.fb-cell.hint').forEach(function (n) { n.classList.remove('hint'); }); if (G && G.hintCell >= 0) { var n = root.querySelector('.fb-cell[data-i="' + G.hintCell + '"]'); if (n) n.classList.add('hint'); } }
        function renderAll() { renderBoard(); paintHint(); updHud(); var m = root.querySelector('.fb-msg'); if (m) m.textContent = G.msg; }

        function screenPlay() {
            root.replaceChildren(
                h('div', { class: 'fb-hud' },
                    h('div', null, h('b', { 'data-h': 'time', text: '90' }), h('span', { text: 'Sekunder' })),
                    h('div', null, h('b', { 'data-h': 'score', text: '0' }), h('span', { text: 'Poäng' })),
                    h('div', null, h('b', { 'data-h': 'combo', text: '×1,0' }), h('span', { text: 'Combo' })),
                    h('div', { class: 'fb-strikes' }, h('b', { 'data-h': 'strikes', text: '···' }), h('span', { text: 'Anmärkningar' }))),
                h('div', { class: 'fb-bar time', 'aria-hidden': 'true' }, h('i')),
                h('div', { class: 'fb-stage', 'aria-hidden': 'true' }, h('div', { class: 'fb-ball idle' }), h('div', { class: 'fb-sb' }, h('div', { class: 'fb-who', text: 'Trumman snurrar' }), h('div', { class: 'fb-say', text: 'Bingot öppnas. Utroparen harklar sig.' }), h('div', { class: 'fb-ttl' }, h('i')))),
                h('div', { class: 'fb-hist', 'aria-hidden': 'true' }, h('span', { text: 'Dragna kulor:' })),
                h('div', { class: 'fb-msg', role: 'status', text: G.daily ? 'Dagens möte: samma kort för alla som spelar idag.' : 'Kulorna dras i trumman. Har du numret och floskeln på din bricka: tryck på rutan, innan kulan passerat.' }),
                h('div', { class: 'fb-cap', text: 'Bingobricka nr ' + G.nr + ' · fastställd av ingen · giltig tills vidare' }),
                h('div', { class: 'fb-head', 'aria-hidden': 'true' }, LET.split('').map(function (l) { return h('b', { text: l }); })),
                h('div', { class: 'fb-board', role: 'group', 'aria-label': 'Bingobricka' }),
                h('div', { class: 'fb-pw' },
                    h('button', { type: 'button', class: 'fb-btn sec', 'data-pw': 'coffee', onclick: useCoffee }, '☕ Kaffepaus', h('small', { text: '1 kvar' })),
                    h('button', { type: 'button', class: 'fb-btn sec', 'data-pw': 'pen', onclick: usePen }, '🖋 Protokollföring', h('small', { text: '1 kvar' }))),
                h('p', { class: 'fb-freeze', hidden: true, style: 'text-align:center;font-weight:700;margin:8px 0 0', text: '☕ Mötet är pausat. Passa på att läsa kortet.' }),
                h('div', { class: 'fb-row', style: 'margin-top:12px;justify-content:space-between' },
                    h('button', { type: 'button', class: 'fb-btn ghost', onclick: function () { if (confirm('Lämna mötet? Poängen räknas ändå.')) endGame('quit'); } }, 'Lämna mötet'),
                    h('span', { style: 'font-size:.8rem;opacity:.8', text: 'Tips: gyllene kulor ger ×3 och +3 sekunder.' })),
                live);
            renderBoard(); renderStage(); updHud();
        }

        function start(daily) {
            newGame(daily);
            S.games++; save();
            screenPlay();
            clearInterval(timer); timer = setInterval(tick, 100);
            var f = root.querySelector('.fb-stage'); if (f && f.scrollIntoView && !REDUCED) { try { root.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) {} }
        }

        function endGame(why) {
            if (!G || G.over) return;
            G.over = true; clearInterval(timer);
            var beforeRank = rankIndex(S.xp);
            var score = Math.round(G.score);
            S.xp += score; S.best = Math.max(S.best, score);
            var firstDaily = false;
            if (G.daily) {
                if (S.daily.date !== todayKey()) { S.daily = { date: todayKey(), best: score }; firstDaily = true; } else S.daily.best = Math.max(S.daily.best, score);
                if (firstDaily) { S.streak.n = (S.streak.last === yesterdayKey()) ? S.streak.n + 1 : 1; S.streak.last = todayKey(); if (S.streak.n >= 3) grant('streak3'); }
            }
            if (why === 'strikes') grant('strike3');
            save();
            if (why === 'strikes') SND.end(); else if (why === 'time') SND.end();
            var afterRank = rankIndex(S.xp);
            stampBig(why === 'strikes' ? 'AJOURNERAT' : why === 'time' ? 'TIDEN UTE' : 'AVSLUTAT', false, 1500);
            var line = why === 'quit' ? 'Du lämnade mötet. Frånvaron har protokollförts.' : END_LINES[why][Math.floor(Math.random() * 3)];
            var share = 'Floskelbingo på STÖN: ' + fmt(score) + ' poäng, ' + G.bingos + ' bingo, combo ' + G.maxCombo + '. Titel: ' + RANKS[afterRank][1] + '. Kan du slå det? ' + location.origin + '/#/floskelbingo';
            setTimeout(function () {
                var res = h('div', { class: 'fb-res' },
                    h('h3', { text: 'Protokoll från mötet' }),
                    h('p', { text: line }),
                    h('dl', null, h('dt', { text: 'Poäng' }), h('dd', { text: fmt(score) }), h('dt', { text: 'Bingo' }), h('dd', { text: String(G.bingos) }), h('dt', { text: 'Anteckningar' }), h('dd', { text: String(G.marks) }),
                        h('dt', { text: 'Längsta combo' }), h('dd', { text: String(G.maxCombo) }), h('dt', { text: 'Gyllene kulor' }), h('dd', { text: String(G.golds) }), h('dt', { text: 'Anmärkningar' }), h('dd', { text: String(G.strikes) }),
                        h('dt', { text: 'Ditt rekord' }), h('dd', { text: fmt(S.best) })),
                    afterRank > beforeRank ? h('p', { style: 'font-weight:800;color:#087a3a', text: '⬆ Befordran! Du är nu ' + RANKS[afterRank][1] + '. ' + RANKS[afterRank][2] } ) : null,
                    G.daily && firstDaily ? h('p', { style: 'font-weight:700', text: 'Dagens möte avklarat. Serie: ' + S.streak.n + ' dag' + (S.streak.n === 1 ? '' : 'ar') + ' i rad. Missa en dag och serien ajourneras.' }) : null);
                var sh = h('button', { type: 'button', class: 'fb-btn', onclick: function () {
                    var done = function () { sh.textContent = 'Kopierat till urklipp'; };
                    try { navigator.clipboard.writeText(share).then(done, function () { prompt('Kopiera texten:', share); }); } catch (e) { prompt('Kopiera texten:', share); }
                } }, 'Kopiera resultatet');
                root.replaceChildren(res, h('div', { class: 'fb-row' }, h('button', { type: 'button', class: 'fb-btn', onclick: function () { start(false); } }, 'Nytt möte'), sh, h('button', { type: 'button', class: 'fb-btn sec', onclick: screenMenu }, 'Till kontoret')), live);
                try { root.scrollIntoView({ block: 'start' }); } catch (e) {}
            }, REDUCED ? 100 : 1300);
        }

        function screenMenu() {
            clearInterval(timer); G = null;
            var ri = rankIndex(S.xp), next = RANKS[ri + 1], cur = RANKS[ri];
            var prog = next ? Math.min(100, (S.xp - cur[0]) / (next[0] - cur[0]) * 100) : 100;
            var dailyDone = S.daily.date === todayKey();
            var streakLive = S.streak.last === todayKey() || S.streak.last === yesterdayKey() ? S.streak.n : 0;
            var snd = h('input', { type: 'checkbox', id: 'fb-snd', onchange: function () { S.sound = snd.checked; save(); if (S.sound) SND.mark(); } }); snd.checked = !!S.sound;
            var calm = h('input', { type: 'checkbox', id: 'fb-calm', onchange: function () { S.calm = calm.checked; save(); } }); calm.checked = !!S.calm;
            root.replaceChildren(
                h('p', { class: 'fb-lead', text: 'Traditionellt bingo, fast med myndighetens egna kulor. Du får en bricka med B, I, N, G och O. Utroparen drar kulor ur trumman och varje kula bär ett nummer och en floskel. Finns kulan på din bricka trycker du på rutan innan den passerat. Fem i rad ger BINGO. Drogs kulan inte, eller finns den inte på brickan, ger det anmärkning. Tre anmärkningar ajournerar bingot, och dig.' }),
                h('div', { class: 'fb-row' },
                    h('button', { type: 'button', class: 'fb-btn', onclick: function () { start(true); } }, dailyDone ? 'Dagens möte (spela om)' : 'Dagens möte'),
                    h('button', { type: 'button', class: 'fb-btn sec', onclick: function () { start(false); } }, 'Fritt möte')),
                h('p', { style: 'margin:10px 0 0;font-size:.9rem', text: dailyDone ? 'Dagens möte är avklarat. Bäst idag: ' + fmt(S.daily.best) + '. Serie: ' + streakLive + ' dagar.' : 'Dagens möte är detsamma för alla. Spela det för att bygga upp din serie' + (streakLive ? ' (nu ' + streakLive + ' dagar). Missa en dag och serien ajourneras.' : '.') }),
                h('div', { class: 'fb-stats' },
                    h('div', { class: 'fb-stat' }, h('b', { text: cur[1] }), h('span', { text: cur[2] })),
                    h('div', { class: 'fb-stat' }, h('b', { text: fmt(S.best) }), h('span', { text: 'Rekordpoäng' })),
                    h('div', { class: 'fb-stat' }, h('b', { text: fmt(S.bingos) }), h('span', { text: 'Bingo totalt' })),
                    h('div', { class: 'fb-stat' }, h('b', { text: fmt(S.marks) }), h('span', { text: 'Anteckningar totalt' }))),
                h('div', null, h('div', { style: 'font-size:.85rem;margin-bottom:4px', text: next ? 'Till nästa titel (' + next[1] + '): ' + fmt(next[0] - S.xp) + ' poäng' : 'Högsta tjänstegrad uppnådd. Ingen vet vad den innebär.' }), h('div', { class: 'fb-bar', 'aria-hidden': 'true' }, h('i', { style: 'width:' + prog + '%' }))),
                h('div', { class: 'fb-tog' }, h('label', { for: 'fb-snd' }, snd, 'Ljud'), h('label', { for: 'fb-calm' }, calm, 'Lugnt tempo (mer tid att läsa)')),
                h('details', null, h('summary', { text: 'Så spelar du' }),
                    h('ul', { style: 'margin:8px 0 0;padding-left:18px' },
                        h('li', { text: 'Kulan visas med bokstav och nummer, till exempel N 37, samt en floskel. Samma nummer och floskel står i en ruta på din bricka, om du har den.' }),
                        h('li', { text: 'Tryck på rutan innan tidsstrecket tar slut. Snabbt ger extra poäng. För sent ger bara 40 procent.' }),
                        h('li', { text: 'Finns kulan inte på din bricka, eller sade utroparen bara något, ska du inte trycka på något. Det ger anmärkning.' }),
                        h('li', { text: 'Rätt i rad ger combo. Gyllene kulor ger ×3 och 3 extra sekunder.' }),
                        h('li', { text: 'BINGO (rad, kolumn eller diagonal) ger bonus, 20 sekunder extra och nya kulor i raden. Bingot slutar aldrig.' }),
                        h('li', { text: 'Var 8:e godkänd ruta ger en Kaffepaus (C) eller Protokollföring (P, anteckna automatiskt).' }))),
                h('h3', { style: 'margin-top:16px', text: 'Meriter' }),
                h('ul', { class: 'fb-ach' }, ACH.map(function (a) { return h('li', { class: S.ach[a[0]] ? '' : 'off' }, h('b', { text: (S.ach[a[0]] ? '🏅 ' : '🔒 ') + a[1] }), a[2]); })),
                h('p', { style: 'margin:14px 0 0;font-size:.8rem;opacity:.75', text: 'Inget i spelet sparas utanför din webbläsare. Alla likheter med verkliga möten är avsiktliga.' }),
                live);
        }

        /* ================= 7. SIDA OCH MENY ================= */
        var host = document.getElementById('innehall') || document.querySelector('main');
        var menu = document.querySelector('.mainnav ul');
        var firstPage = document.querySelector('[data-page]');
        if (!host || !menu || !firstPage) { document.head.removeChild(style); return; }
        var pageEl = h('div', { 'data-page-fb': 'floskelbingo', hidden: true },
            h('div', { class: 'wrap page-body' }, h('h1', { tabindex: '-1', text: 'Floskelbingo' }), root));
        firstPage.parentNode.appendChild(pageEl);
        var navA = h('a', { href: '#/floskelbingo', 'data-nav-fb': 'floskelbingo', id: 'fb-open', text: 'Floskelbingo' });
        var navLi = h('li', null, navA);
        var omLi = null; Array.prototype.forEach.call(menu.children, function (li) { var a = li.querySelector('a'); if (a && a.getAttribute('href') === '#/om-oss') omLi = li; });
        menu.insertBefore(navLi, omLi);

        var firstRoute = true;
        function onRoute() {
            var on = location.hash === '#/floskelbingo';
            if (on) {
                Array.prototype.forEach.call(document.querySelectorAll('[data-page]'), function (p) { p.hidden = true; });
                pageEl.hidden = false;
                Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) { a.removeAttribute('aria-current'); });
                navA.setAttribute('aria-current', 'page');
                document.title = 'Floskelbingo – STÖN – Statens Överprövningsnämnd';
                var cr = document.getElementById('crumbs'); if (cr) cr.remove();
                var m = document.querySelector('.mainnav'); if (m) m.classList.remove('open');
                if (!G) screenMenu();
                if (!firstRoute) { window.scrollTo(0, 0); var hd = pageEl.querySelector('h1'); if (hd) hd.focus({ preventScroll: true }); }
            } else {
                if (!pageEl.hidden && G && !G.over) { clearInterval(timer); endGame('quit'); }
                pageEl.hidden = true; navA.removeAttribute('aria-current');
            }
            firstRoute = false;
        }
        window.addEventListener('hashchange', onRoute); onRoute();
        document.addEventListener('keydown', function kd(e) {
            if (!G || G.over || pageEl.hidden) return;
            if (e.key === 'c' || e.key === 'C') useCoffee();
            else if (e.key === 'p' || e.key === 'P') usePen();
        });

        window.stonFloskelbingo = {
            reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); },
            unmount: function () {
                clearInterval(timer); window.removeEventListener('hashchange', onRoute);
                [pageEl, navLi, style, toastEl].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
                if (location.hash === '#/floskelbingo') location.hash = '#/';
                delete window.stonFloskelbingo;
            }
        };
    } catch (err) { if (window.console && console.warn) console.warn('Floskelbingo kunde inte starta:', err); }
})();
