/* =====================================
   GOLDIES
   -------------------------------------

   Datei:
   firebase.js

   Version:
   3.0.0

   Beschreibung:
   Initialisierung von Firebase
   - Test / Produktion automatisch erkennen
   - Firestore initialisieren

===================================== */


/* =====================================
   FIREBASE KONFIGURATION
===================================== */

const firebaseConfigProd = {

    apiKey: "AIzaSyA_X89nznC06g7brnrVmQoFHG2SiTXk0Hc",
    authDomain: "goldies-89ea2.firebaseapp.com",
    projectId: "goldies-89ea2",
    storageBucket: "goldies-89ea2.firebasestorage.app",
    messagingSenderId: "210598012879",
    appId: "1:210598012879:web:dca79e3e3eb237e5bb14ba"

};

const firebaseConfigTest = {

    apiKey: "AIzaSyA8W7v73ESxd_qUK15VzyUu_nx-6t0R7Yc",
    authDomain: "goldies-test.firebaseapp.com",
    projectId: "goldies-test",
    storageBucket: "goldies-test.firebasestorage.app",
    messagingSenderId: "472746893960",
    appId: "1:472746893960:web:b31f810205dbcac420b53d"

};


/* =====================================
   FIREBASE AUSWÄHLEN
===================================== */

const firebaseConfig = location.href.includes("Goldies-Test")
    ? firebaseConfigTest
    : firebaseConfigProd;


/* =====================================
   FIREBASE INITIALISIEREN
===================================== */

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
