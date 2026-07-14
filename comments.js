/* =====================================
   GOLDIES
   -------------------------------------

   Datei:
   comments.js

   Version:
   3.0.0

   Beschreibung:
   Verwaltung der Kommentare

   - Tooltip
   - Kommentar öffnen
   - Kommentar speichern

===================================== */


/* =====================================
   TOOLTIP ANZEIGEN
===================================== */

function showTip(text, x, y) {

    const tip =
        document.getElementById("commentTip");

    tip.innerText = text;

    tip.style.left = x + "px";
    tip.style.top = y + "px";

    tip.style.display = "block";

}


/* =====================================
   TOOLTIP AUSBLENDEN
===================================== */

function hideTip() {

    document
        .getElementById("commentTip")
        .style.display = "none";

}


/* =====================================
   KOMMENTAR ÖFFNEN
===================================== */

function openComment(date) {

    currentCommentDate = date;

    document
        .getElementById("commentTitle")
        .innerText = "Kommentar " + formatDate(date);

    document
        .getElementById("commentText")
        .value = comments[date] || "";

    document
        .getElementById("commentBox")
        .style.display = "block";

}


/* =====================================
   KOMMENTAR SCHLIESSEN
===================================== */

function closeComment() {

    document
        .getElementById("commentBox")
        .style.display = "none";

}


/* =====================================
   KOMMENTAR SPEICHERN
===================================== */

function saveComment() {

    comments[currentCommentDate] =

        document
            .getElementById("commentText")
            .value;

    closeComment();

    save();

    draw();

}
