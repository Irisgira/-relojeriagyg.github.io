// Configuración de Firebase para Relojería G&G
const firebaseConfig = {
  apiKey: "AIzaSyCFgKerly2w-raG1Qgth0L1YovCpD9Wki8",
  authDomain: "catalogo-gyg.firebaseapp.com",
  projectId: "catalogo-gyg",
  storageBucket: "catalogo-gyg.firebasestorage.app",
  messagingSenderId: "892377401504",
  appId: "1:892377401504:web:98c2a59b736ecea16421c5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();