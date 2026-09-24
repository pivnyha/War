// ===== FIREBASE =====
// ЗАМЕНИ НА СВОЙ КОНФИГ ИЗ FIREBASE CONSOLE!
const firebaseConfig = {
    apiKey: "ТВОЙ_API_KEY",
    authDomain: "ТВОЙ_PROJECT.firebaseapp.com",
    databaseURL: "https://ТВОЙ_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ТВОЙ_PROJECT",
    storageBucket: "ТВОЙ_PROJECT.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:xxxxxxxxxxxx"
};

let db = null;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK не подключён');
        return false;
    }
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
        console.log('Firebase подключён');
        return true;
    } catch (e) {
        console.error('Firebase ошибка:', e);
        return false;
    }
}

function syncGame(game) {
    if (!db) return;
    db.ref('games/' + game.code).set({
        ...game,
        updated: Date.now()
    }).catch(e => console.error('syncGame:', e));
}

function listenGame(code, callback) {
    if (!db) return;
    db.ref('games/' + code).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) callback(data);
    });
}

function sendAction(code, action) {
    if (!db) return;
    db.ref('games/' + code + '/actions').push({
        ...action,
        time: Date.now()
    });
}

function listenActions(code, callback) {
    if (!db) return;
    db.ref('games/' + code + '/actions').limitToLast(30).on('child_added', (snapshot) => {
        callback(snapshot.val());
    });
}
