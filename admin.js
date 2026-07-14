/* =====================================
   GOLDIES
   -------------------------------------

   Modul:
   admin.js

   Version:
   3.0.0

   Beschreibung:
   Admin-Menü für Goldies

   - CSV synchronisieren
   - Backup erstellen
   - Backup wiederherstellen
   - Statistik
   - Excel Export
   - Einstellungen

===================================== */


/* =====================================
   APP INFORMATION
===================================== */

const APP = {

    name: "Goldies",

    version: "3.0.0",

    admin: {

        pin: "1234"

    }

};


/* =====================================
   ADMIN BUTTON
===================================== */

const adminButton = document.createElement("div");

adminButton.innerHTML = "⚙️";

Object.assign(adminButton.style, {

    position: "fixed",
    bottom: "15px",
    right: "15px",

    width: "50px",
    height: "50px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "50%",

    background: "#1976d2",
    color: "white",

    fontSize: "28px",

    cursor: "pointer",

    boxShadow: "0 2px 8px rgba(0,0,0,.3)",

    zIndex: "9999"

});

document.body.appendChild(adminButton);


/* =====================================
   ADMIN WINDOW
===================================== */

const adminWindow = document.createElement("div");

Object.assign(adminWindow.style, {

    position: "fixed",

    top: "50%",
    left: "50%",

    transform: "translate(-50%,-50%)",

    background: "white",

    border: "1px solid #999",
    borderRadius: "10px",

    padding: "20px",

    minWidth: "320px",

    boxShadow: "0 5px 20px rgba(0,0,0,.3)",

    display: "none",

    zIndex: "10000"

});


adminWindow.innerHTML = `

<h2 style="margin-top:0">
⚙️ Goldies Admin
</h2>

<button id="btnSync" class="adminBtn">
🔄 CSV synchronisieren
</button><br><br>

<button id="btnBackup" class="adminBtn">
💾 Backup erstellen
</button><br><br>

<button id="btnRestore" class="adminBtn">
📂 Backup wiederherstellen
</button><br><br>

<button id="btnStats" class="adminBtn">
📊 Statistik
</button><br><br>

<button id="btnExport" class="adminBtn">
📤 Excel Export
</button><br><br>

<button id="btnSettings" class="adminBtn">
⚙️ Einstellungen
</button>

<hr>

<div style="font-size:12px;color:#666">

${APP.name}<br>
Version ${APP.version}

</div>

<br>

<button id="closeAdmin">

Schliessen

</button>

`;

document.body.appendChild(adminWindow);


/* =====================================
   BUTTON DESIGN
===================================== */

document.querySelectorAll(".adminBtn").forEach(btn => {

    btn.style.width = "100%";
    btn.style.padding = "8px";
    btn.style.cursor = "pointer";

});


/* =====================================
   BUTTON EVENTS
===================================== */


/* CSV synchronisieren */

document.getElementById("btnSync").onclick = async () => {

    if (!confirm("CSV synchronisieren?"))
        return;

    await synchronizeCSV();

};


/* Backup erstellen */

document.getElementById("btnBackup").onclick = async () => {

    await createDailyBackup();

    alert("Backup erstellt.");

};


/* Backup wiederherstellen */

document.getElementById("btnRestore").onclick = async () => {

    await restoreBackup();

};


/* Statistik */

document.getElementById("btnStats").onclick = () => {

    alert("Statistik folgt in Version 3.1");

};


/* Excel Export */

document.getElementById("btnExport").onclick = () => {

    alert("Excel Export folgt in Version 3.1");

};


/* Einstellungen */

document.getElementById("btnSettings").onclick = () => {

    alert("Einstellungen folgen in Version 3.1");

};


/* =====================================
   ADMIN ÖFFNEN
===================================== */

adminButton.onclick = () => {

    const pin = prompt("Admin PIN eingeben");

    if (pin === null)
        return;

    if (pin !== APP.admin.pin) {

        alert("Falscher PIN");

        return;

    }

    adminWindow.style.display = "block";

};


/* =====================================
   ADMIN SCHLIESSEN
===================================== */

document.getElementById("closeAdmin").onclick = () => {

    adminWindow.style.display = "none";

};
