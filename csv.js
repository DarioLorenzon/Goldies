/* =====================================
   GOLDIES
   -------------------------------------

   Datei:
   csv.js

   Version:
   3.0.0

   Beschreibung:
   - kalender.csv laden
   - spieler.csv laden
   - CSV-Struktur erstellen
   - Firestore-Daten zusammenführen

===================================== */


/* =====================================
   CSV LADEN
   -------------------------------------
   Erstellt die interne Tabelle

   Zeile 0 = Datum
   Zeile 1 = Typ
   Zeile 2.. = Spieler
===================================== */

async function loadCSV() {

    const kalender = await loadCalendar();
    const spieler = await loadPlayers();

    const table = [

        [""],   // Datum
        [""]    // Typ

    ];


    /* ==============================
       Datum + Typ übernehmen
    ============================== */

    kalender.forEach(k => {

        table[0].push(k.Datum);
        table[1].push(k.Typ);

    });


    /* ==============================
       Spieler übernehmen
    ============================== */

    spieler.forEach(name => {

        const row = [name];

        while (row.length < table[0].length) {

            row.push("");

        }

        table.push(row);

    });


    return table;

}


/* =====================================
   KALENDER LADEN
===================================== */

async function loadCalendar() {

    return new Promise(resolve => {

        Papa.parse("./kalender.csv", {

            download: true,

            header: true,

            complete: res => {

                resolve(

                    res.data.filter(r => r.Datum)

                );

            }

        });

    });

}


/* =====================================
   SPIELER LADEN
===================================== */

async function loadPlayers() {

    return new Promise(resolve => {

        Papa.parse("./spieler.csv", {

            download: true,

            header: true,

            complete: res => {

                resolve(

                    res.data
                        .filter(r => r.Name)
                        .map(r => r.Name)

                );

            }

        });

    });

}


/* =====================================
   CSV + FIRESTORE ZUSAMMENFÜHREN

   CSV bestimmt:

   - Spieler
   - Termine
   - Reihenfolge

   Firestore enthält:

   - Teilnahmen

===================================== */

function mergeData(csv, dbData) {

    const result = [];

    const lookup = {};


    /* ==============================
       Firestore → Lookup
    ============================== */

    if (dbData && dbData.length > 2) {

        for (let r = 2; r < dbData.length; r++) {

            const player = (dbData[r][0] || "").trim();

            for (let c = 1; c < dbData[0].length; c++) {

                const date = (dbData[0][c] || "").trim();

                const value = dbData[r][c] || "";

                if (value !== "") {

                    lookup[player + "|" + date] = value;

                }

            }

        }

    }


    /* ==============================
       Datum
    ============================== */

    result.push([...csv[0]]);


    /* ==============================
       Typ
    ============================== */

    result.push([...csv[1]]);


    /* ==============================
       Spieler
    ============================== */

    for (let r = 2; r < csv.length; r++) {

        const player = (csv[r][0] || "").trim();

        const row = [player];

        for (let c = 1; c < csv[0].length; c++) {

            const date = (csv[0][c] || "").trim();

            // Neues Format
            const key = player + "|" + date;

            // Kompatibilität mit alten Daten
            const shortDate = date.substring(0, 5);

            const oldKey = player + "|" + shortDate;

            const value =

                lookup[key] ??
                lookup[oldKey] ??
                "";

            row.push(value);

        }

        result.push(row);

    }


    return result;

}
