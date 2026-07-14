/* =====================================
   GOLDIES
   -------------------------------------

   Datei:
   main.js

   Version:
   3.0.0

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
   DATEN LADEN

   Ablauf

   1. CSV laden
   2. Firestore laden
   3. Zusammenführen
   4. Falls nötig speichern
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

    if (needSave) {

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
