// ======================================
// Goldies
// Backup Explorer
// Version 4.0.0
// ======================================

let backupExplorer = null;
let backupPreview = null;

let currentBackup = null;
let currentBackupId = null;
let currentTable = null;


// ======================================
// Backup Explorer öffnen
// ======================================

function openBackupExplorer() {

    if (backupExplorer) {

        backupExplorer.style.display = "block";
        loadBackupList();

        return;

    }

    backupExplorer = document.createElement("div");

    Object.assign(backupExplorer.style, {

        position: "fixed",

        top: "50%",
        left: "50%",

        transform: "translate(-50%,-50%)",

        width: "560px",
        maxHeight: "75vh",

        overflowY: "auto",

        padding: "20px",

        background: "#ffffff",

        border: "1px solid #999",

        borderRadius: "10px",

        boxShadow: "0 5px 20px rgba(0,0,0,.30)",

        zIndex: "11000"

    });

    backupExplorer.innerHTML = `

        <h2 style="margin-top:0">

            🗂 Backup Explorer

        </h2>

        <div id="backupList">

            Lade Backups...

        </div>

        <br>

        <button id="btnCloseBackupExplorer">

            Schliessen

        </button>

    `;

    document.body.appendChild(backupExplorer);

    document
        .getElementById("btnCloseBackupExplorer")
        .addEventListener("click", () => {

            backupExplorer.style.display = "none";

        });

    loadBackupList();

}


// ======================================
// Backupliste laden
// ======================================

async function loadBackupList() {

    const div = document.getElementById("backupList");

    if (!div)
        return;

    div.innerHTML = "Lade Backups...";

    try {

        const backups = await listBackups();

        if (!backups || backups.length === 0) {

            div.innerHTML = "<i>Keine Backups vorhanden.</i>";
            return;

        }

        let html = "";

        backups.forEach(id => {

            html += `

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:8px;
                    border-bottom:1px solid #ddd;
                ">

                    <span>📅 ${id}</span>

                    <button
                        class="btnViewBackup"
                        data-id="${id}">

                        👁 Anzeigen

                    </button>

                </div>

            `;

        });

        div.innerHTML = html;

        document
            .querySelectorAll(".btnViewBackup")
            .forEach(btn => {

                btn.addEventListener("click", () => {

                    showBackup(btn.dataset.id);

                });

            });

    }
    catch (err) {

        console.error(err);

        div.innerHTML =
            "<span style='color:red'>Fehler beim Laden der Backups.</span>";

    }

}



// ======================================
// Backup laden
// ======================================

async function loadBackup(id) {

    const doc = await db
        .collection("backup")
        .doc(id)
        .get();

    if (!doc.exists)
        return null;

    const backup = doc.data();

    currentBackup = backup;
    currentBackupId = id;
    currentTable = JSON.parse(backup.json);

    return {

        id,

        version: backup.version || "",

        created: backup.created || null,

        comments: backup.comments || {},

        table: currentTable

    };

}

// ======================================
// Backup anzeigen
// ======================================

async function showBackup(id) {

    const backup = await loadBackup(id);

    if (!backup) {

        alert("Backup nicht gefunden.");
        return;

    }

    if (!backupPreview) {

        backupPreview = document.createElement("div");

        Object.assign(backupPreview.style, {

            position: "fixed",

            top: "50%",
            left: "50%",

            transform: "translate(-50%,-50%)",

            width: "720px",
            maxHeight: "80vh",

            overflowY: "auto",

            padding: "20px",

            background: "#ffffff",

            border: "1px solid #999",

            borderRadius: "10px",

            boxShadow: "0 5px 20px rgba(0,0,0,.30)",

            zIndex: "12000"

        });

        document.body.appendChild(backupPreview);

    }

    const dates = backup.table[0];
    const types = backup.table[1];

    const playerCount = backup.table.length - 2;
    const trainingCount = dates.length - 1;
    const commentCount = Object.keys(backup.comments).length;

    let created = "";

    if (backup.created?.seconds) {

        created = new Date(
            backup.created.seconds * 1000
        ).toLocaleString();

    }

    let html = `

        <h2 style="margin-top:0">

            👁 Backup ansehen

        </h2>

        <b>Backup</b><br>

        ${backup.id}

        <hr>

        <table style="width:100%">

            <tr>
                <td><b>Version</b></td>
                <td>${backup.version}</td>
            </tr>

            <tr>
                <td><b>Erstellt</b></td>
                <td>${created}</td>
            </tr>

            <tr>
                <td><b>Trainingstage</b></td>
                <td>${trainingCount}</td>
            </tr>

            <tr>
                <td><b>Spielerinnen</b></td>
                <td>${playerCount}</td>
            </tr>

            <tr>
                <td><b>Kommentare</b></td>
                <td>${commentCount}</td>
            </tr>

        </table>

        <hr>

        <h3>Termine</h3>

        <div id="trainingList">

    `;

    for (let c = 1; c < dates.length; c++) {

        html += `

            <div

                class="trainingRow"

                data-col="${c}"

                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:8px;
                    border-bottom:1px solid #eee;
                    cursor:pointer;
                ">

                <span>${dates[c]}</span>

                <span>${types[c]}</span>

            </div>

        `;

    }

    html += `

        </div>

        <br>

        <label style="display:block;margin-bottom:10px">

            <input
                id="chkOnlyChanges"
                type="checkbox">

            Nur Änderungen anzeigen

        </label>

        <div id="trainingDetails">

            <i>Bitte einen Termin auswählen.</i>

        </div>

        <br>

        <button id="btnClosePreview">

            Schliessen

        </button>

    `;

    backupPreview.innerHTML = html;

    backupPreview.style.display = "block";

    document
        .getElementById("btnClosePreview")
        .addEventListener("click", () => {

            backupPreview.style.display = "none";

        });

    document
        .querySelectorAll(".trainingRow")
        .forEach(row => {

            row.addEventListener("click", () => {

                document
                    .querySelectorAll(".trainingRow")
                    .forEach(r => r.classList.remove("selected"));

                row.classList.add("selected");

                renderTrainingDay(

                    parseInt(row.dataset.col)

                );

            });

        });

    document
        .getElementById("chkOnlyChanges")
        .addEventListener("change", () => {

            const selected = document.querySelector(".trainingRow.selected");

            if (selected) {

                renderTrainingDay(

                    parseInt(selected.dataset.col)

                );

            }

        });

}

// ======================================
// Trainingstag anzeigen
// ======================================

function renderTrainingDay(col) {

    const container = document.getElementById("trainingDetails");

    if (!container)
        return;

    const onlyChanges =
        document.getElementById("chkOnlyChanges")?.checked;

    let html = `

        <h3>

            ${currentTable[0][col]}

        </h3>

        <table style="
            width:100%;
            border-collapse:collapse;
        ">

            <tr style="background:#f0f0f0">

                <th style="text-align:left;padding:6px">Spielerin</th>
                <th style="width:90px">Backup</th>
                <th style="width:90px">Aktuell</th>

            </tr>

    `;

    let changes = 0;

    for (let r = 2; r < currentTable.length; r++) {

        const player = currentTable[r][0];

        const backupValue = currentTable[r][col] || "";
        const currentValue = getCurrentValue(player, col);

        const equal = compareAttendance(
            backupValue,
            currentValue
        );

        if (onlyChanges && equal)
            continue;

        if (!equal)
            changes++;

        html += `

            <tr>

                <td style="
                    padding:6px;
                    border-bottom:1px solid #eee;
                ">
                    ${player}
                </td>

                <td style="
                    text-align:center;
                    border-bottom:1px solid #eee;
                ">
                    ${statusIcon(backupValue)}
                </td>

                <td style="
                    text-align:center;
                    border-bottom:1px solid #eee;
                ">
                    ${statusIcon(currentValue)}
                </td>

            </tr>

        `;

    }

    html += "</table>";

    if (changes === 0 && onlyChanges) {

        html += `

            <p style="
                color:green;
                font-weight:bold;
                margin-top:15px;
            ">

                ✅ Keine Änderungen gefunden.

            </p>

        `;

    }

    html += `

        <br>

        <button
            id="btnRestoreTraining">

            Diesen Trainingstag wiederherstellen

        </button>

    `;

    container.innerHTML = html;

    document
        .getElementById("btnRestoreTraining")
        .addEventListener("click", () => {

            restoreTrainingDay(col);

        });

}

// ======================================
// Trainingstag wiederherstellen
// ======================================

async function restoreTrainingDay(col) {

    if (!confirm("Diesen Trainingstag aus dem Backup wiederherstellen?"))
        return;

    for (let r = 2; r < currentTable.length; r++) {

        const player = currentTable[r][0];

        const row = data.find(x => x[0] === player);

        if (row)
            row[col] = currentTable[r][col];

    }

    if (currentBackup.comments) {

        Object.entries(currentBackup.comments).forEach(([key, value]) => {

            if (key.endsWith("_" + col))
                comments[key] = value;

        });

    }

    if (typeof saveData === "function")
        await saveData();

    if (typeof renderTable === "function")
        renderTable();

    alert("Trainingstag wurde wiederhergestellt.");

    renderTrainingDay(col);

}



// ======================================
// Aktuellen Wert suchen
// ======================================

function getCurrentValue(player, col) {

    const row = data.find(r => r[0] === player);

    if (!row)
        return "";

    return row[col] || "";

}



// ======================================
// Statussymbol
// ======================================

function statusIcon(value) {

    switch ((value || "").toLowerCase()) {

        case "ja":
            return "🟢";

        case "ev":
            return "🟡";

        case "nein":
            return "🔴";

        default:
            return "⚪";

    }

}



// ======================================
// Vergleich Attendance
// ======================================

function compareAttendance(a, b) {

    a = (a || "").trim().toLowerCase();
    b = (b || "").trim().toLowerCase();

    return a === b;

}