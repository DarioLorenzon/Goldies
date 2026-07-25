/* =====================================
   GOLDIES
   -------------------------------------

   Datei:
   main.js

   Version:
   3.1.0

   Beschreibung:
   Hauptprogramm

   - globale Variablen
   - Autosave
   - Laden
   - Speichern
   - Start

===================================== */


/* =====================================
   GLOBALE VARIABLEN
===================================== */

// Tabelle
let data = [];

// Kommentare pro Datum
let comments = {};

// Aktuelles Kommentardatum
let currentCommentDate = null;

// Initialisierung abgeschlossen?
let initialized = false;

// Autosave-Timer
let saveTimer = null;


/* =====================================
   AUTOSAVE
===================================== */

function autoSave() {

    if (!initialized)
        return;

    clearTimeout(saveTimer);

    saveTimer = setTimeout(save, 500);

}


/* =====================================
   TABELLEN VERGLEICHEN
===================================== */

/* =====================================
   STRUKTUR VERGLEICHEN

   Vergleicht nur:

   - Datum
   - Typ
   - Spieler

   Nicht:

   - Teilnahmen
   - Kommentare

===================================== */

function structureChanged(csv, dbData) {

    // Noch keine Daten vorhanden
    if (!dbData || dbData.length === 0)
        return true;

    // Anzahl Zeilen
    if (csv.length !== dbData.length)
        return true;

    // Anzahl Spalten
    if (csv[0].length !== dbData[0].length)
        return true;

    // Datum vergleichen
    for (let c = 0; c < csv[0].length; c++) {

        if ((csv[0][c] || "") !== (dbData[0][c] || ""))
            return true;

    }

    // Typ vergleichen
    for (let c = 0; c < csv[1].length; c++) {

        if ((csv[1][c] || "") !== (dbData[1][c] || ""))
            return true;

    }

    // Spieler vergleichen
    for (let r = 2; r < csv.length; r++) {

        if ((csv[r][0] || "") !== (dbData[r][0] || ""))
            return true;

    }

    return false;

}


/* =====================================
   DATEN LADEN

   Ablauf

   1. CSV laden
   2. Firestore laden
   3. Zusammenführen
   4. Falls nötig synchronisieren
   5. Tabelle zeichnen

===================================== */

async function load() {

    // CSV laden
    const csv = await loadCSV();

    let dbData = null;
    let needSave = false;

    try {

        const doc = await db
            .collection("training")
            .doc("list")
            .get();

        if (doc.exists) {

            const d = doc.data();

            if (d.json && d.json !== "") {

                try {

                    dbData = JSON.parse(d.json);

                }

                catch {

                    console.warn("Firestore JSON konnte nicht gelesen werden.");

                    dbData = null;
                    needSave = true;

                }

            }
            else {

                needSave = true;

            }

            comments = d.comments || {};

        }
        else {

            needSave = true;

        }

    }
    catch (err) {

        console.error(err);

        needSave = true;

    }

    if (!dbData) {

        dbData = [];

    }

    // CSV + Firestore zusammenführen
    data = mergeData(csv, dbData);

    initialized = true;

    // Firestore synchronisieren, wenn sich die CSV-Struktur geändert hat
    if (needSave || structureChanged(csv, dbData)) {

        console.log("CSV-Struktur geändert → Firestore wird synchronisiert.");

        await save();

    }

    draw();

}


/* =====================================
   SPEICHERN

   Speichert

   - Teilnahmen
   - Kommentare

===================================== */

async function save() {

    try {

        await createDailyBackup();

    }
    catch (err) {

        console.error("Backup konnte nicht erstellt werden:", err);

        // Trotzdem weiterspeichern

    }

    const payload = {

        json: JSON.stringify(data),

        comments: comments

    };

    await db
        .collection("training")
        .doc("list")
        .set(payload);

}


/* =====================================
   START
===================================== */

load();