/*!
 * "Kontakt" – Statens Överprövningsnämnd.
 * Fristående modul för STÖN. Bygger om kontaktinformationen i sidfoten när sidan läses in.
 * Den ursprungliga texten finns kvar som fallback om modulen inte startar.
 */
(function () {
    'use strict';
    try {
        var script = document.currentScript;
        if (!script || script.dataset.enabled === 'false') return;

        var footer = document.querySelector('footer.site-footer');
        if (!footer) return;

        var contactBlock = Array.from(footer.querySelectorAll('div')).find(function (node) {
            var h2 = node.querySelector('h2');
            return !!(h2 && /kontakt/i.test(h2.textContent || ''));
        }) || Array.from(footer.querySelectorAll('div')).find(function (node) {
            return !!(node.textContent && /000-000 000/i.test(node.textContent));
        });

        if (!contactBlock) return;

        contactBlock.innerHTML = [
            '<h2>Kontakt</h2>',
            '<p>Telefon: 000-000 000<br>(plats 42 i kön)<br>Besöksadress: Källaren<br>Våra tjänster finns i papperskorgen, den nedre.</p>',
            '<p style="margin-top:10px;">E-post: se bifogad fil<br>Kontaktformulär: finns i nästa budgetår<br>Besökstid: efter föredragning, om någon har föredragit.</p>'
        ].join('');
    } catch (err) {
        if (window.console && console.warn) console.warn('Kontaktmodulen kunde inte starta:', err);
    }
})();
