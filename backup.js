/* =====================================
   GOLDIES
-------------------------------------

Datei:
backup.js

Version:
3.0.0

Beschreibung:
- Tages-Backup
- Wiederherstellen
- CSV synchronisieren

===================================== */


async function createDailyBackup() {

    const today =
        new Date()
            .toISOString()
            .substring(0, 10);

    const backupRef =
        db.collection("backup").doc(today);

    const backupDoc =
        await backupRef.get();

    // Existiert bereits → nichts machen
    if (backupDoc.exists) {

        return;

    }

    // Aktuelle Daten lesen
    const doc = await db
        .collection("training")
        .doc("list")
        .get();

    if (!doc.exists) {

        return;

    }

    // Backup speichern
    await backupRef.set({

        created: firebase.firestore.FieldValue.serverTimestamp(),

        version: "3.0.0",

        json: doc.data().json || "",

        comments: doc.data().comments || {}

    });


}

/* =====================================
   BACKUPS AUFLISTEN

   Liest alle vorhandenen Tages-Backups
   aus Firestore und gibt sie in
   absteigender Reihenfolge zurück.

   Rückgabe:

   [
      "2026-07-13",
      "2026-05-26",
      ...
   ]

===================================== */

async function listBackups() {

    try {

        const snapshot = await db
            .collection("backup")
            .get();

        const backups = [];

        snapshot.forEach(doc => {

            backups.push(doc.id);

        });

        // Neueste zuerst
        backups.sort().reverse();

        return backups;

    }

    catch (err) {

        console.error(err);

        return [];

    }

}


/* =====================================
   BACKUP WIEDERHERSTELLEN

   Liest ein gespeichertes Tages-Backup
   aus Firestore und ersetzt die
   aktuellen Trainingsdaten.

===================================== */

async function restoreBackup() {

    /* ==============================
       Verfügbare Backups laden
    ============================== */

    const backups = await listBackups();

    if (backups.length === 0) {

        alert("Keine Backups vorhanden.");

        return;

    }


    /* ==============================
       Backup auswählen
    ============================== */

    const selected = prompt(

        "Welches Backup wiederherstellen?\n\n" +

        backups.join("\n")

    );

    if (!selected)
        return;


    /* ==============================
       Backup laden
    ============================== */

    const doc = await db
        .collection("backup")
        .doc(selected)
        .get();

    if (!doc.exists) {

        alert("Backup nicht gefunden.");

        return;

    }


    /* ==============================
       Sicherheitsabfrage
    ============================== */

    if (!confirm(

        "Backup " + selected + " wirklich wiederherstellen?"

    ))
        return;


    /* ==============================
       Trainingsdaten ersetzen
    ============================== */

    await db
        .collection("training")
        .doc("list")
        .set({

            json: doc.data().json,

            comments: doc.data().comments || {}

        });


    /* ==============================
       Tabelle neu laden
    ============================== */

    await load();

    alert("Backup erfolgreich wiederhergestellt.");

}


/* =====================================
   CSV SYNCHRONISIEREN

   Ablauf

   1. Tages-Backup erstellen
   2. CSV laden
   3. Firestore laden
   4. Daten zusammenführen
   5. Kommentare übernehmen
   6. Firestore speichern
   7. Tabelle neu laden

===================================== */

async function synchronizeCSV() {

    try {

        /* ==============================
           Tages-Backup erstellen
        ============================== */

        await createDailyBackup();


        /* ==============================
           CSV laden
        ============================== */

        const csv = await loadCSV();


        /* ==============================
           Firestore laden
        ============================== */

        const doc = await db
            .collection("training")
            .doc("list")
            .get();

        let dbData = [];

        if (doc.exists && doc.data().json) {

            dbData = JSON.parse(doc.data().json);

        }


        /* ==============================
           CSV + Firestore zusammenführen
        ============================== */

        const merged = mergeData(csv, dbData);


        /* ==============================
           Kommentare übernehmen
        ============================== */

        const comments = doc.exists
            ? (doc.data().comments || {})
            : {};


        /* ==============================
           Firestore speichern
        ============================== */

        await db
            .collection("training")
            .doc("list")
            .set({

                json: JSON.stringify(merged),

                comments: comments

            });


        /* ==============================
           Tabelle neu laden
        ============================== */

        await load();

        alert("CSV erfolgreich synchronisiert.");

    }

    catch (err) {

        console.error(err);

        alert("Fehler beim Synchronisieren.");

    }

}
