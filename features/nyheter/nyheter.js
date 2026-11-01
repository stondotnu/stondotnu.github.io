/*!
 * "Nyheter" – Statens Överprövningsnämnd.
 * Fristående modul för STÖN. Bygger om nyhetslistan på startsidan när sidan läses in.
 * Den ursprungliga listan visas som fallback om modulen inte startar.
 */
(function () {
    'use strict';
    try {
        var script = document.currentScript;
        if (!script || script.dataset.enabled === 'false') return;

        var list = document.getElementById('news');
        if (!list) return;

        var items = [
            {
                label: 'Byråkrati',
                time: '19 september 2026',
                title: 'Samarbetsgruppen omförhandlar ansvarsfrågan med återkommande fördröjning',
                text: 'Det har inrättats en ny grupp för att kartlägga var ansvaret gick, men gruppen är redan övergripande och behandlas därför i nästa skede.'
            },
            {
                label: 'Digitalisering',
                time: '17 september 2026',
                title: 'E-tjänstens uppstart skjuts fram efter möte om användarvänlighet',
                text: 'Systemet är klart för lansering i princip. Primärt krävs emellertid en workshopsession om behov, driftförutsättningar och ansvarsfördelning.'
            },
            {
                label: 'Kundservice',
                time: '14 september 2026',
                title: 'Kundtjänst svarar att frågan kommer att behandlas, och gör det sedan',
                text: 'Samtal och mail har återförts till ett tidigare läge i processen, där de nu väntar på beslut om att återkoppla.'
            },
            {
                label: 'Arkiv',
                time: '11 september 2026',
                title: 'Ärende återfinns i papperskorgen under “troligtvis bortsett”',
                text: 'Dokumentet återupptäcktes efter fem månader i arkivets mellanlager. Ingen kunde bekräfta om det var en återupptäckt eller en uppsättning.'
            }
        ];

        list.innerHTML = items.map(function (item) {
            return '<li>' +
                '<time>' + item.time + '</time>' +
                '<span class="tag">' + item.label + '</span>' +
                '<h3>' + item.title + '</h3>' +
                '<p>' + item.text + '</p>' +
                '</li>';
        }).join('');
    } catch (err) {
        if (window.console && console.warn) console.warn('Nyhetsmodulen kunde inte starta:', err);
    }
})();
