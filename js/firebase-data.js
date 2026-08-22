// ============================================================
// A7 SATTA - Dedicated Firebase Realtime Sync Integration
// NEW Website Dedicated Project: web3-7a4cf
// Database URL: https://web3-7a4cf-default-rtdb.firebaseio.com/
// ============================================================

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyB_web3_7a4cf_key",
    authDomain: "web3-7a4cf.firebaseapp.com",
    databaseURL: "https://web3-7a4cf-default-rtdb.firebaseio.com/",
    projectId: "web3-7a4cf",
    storageBucket: "web3-7a4cf.appspot.com",
    messagingSenderId: "",
    appId: ""
};

let firebaseInitialized = false;
let firebaseDb = null;

function getFirebaseConfig() {
    var stored = (typeof getData === 'function') ? getData('firebase_config') : null;
    if (stored && stored.apiKey && stored.databaseURL) {
        return stored;
    }

    if (typeof window !== 'undefined' && window.ENV_CONFIG) {
        const env = window.ENV_CONFIG;
        const apiKey = env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey;
        const dbUrl = env.VITE_FIREBASE_DATABASE_URL || env.FIREBASE_DATABASE_URL || DEFAULT_FIREBASE_CONFIG.databaseURL;
        const projId = env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId;
        const authDom = env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain;
        const storageBkt = env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket;
        
        return {
            apiKey: apiKey,
            databaseURL: dbUrl,
            projectId: projId,
            authDomain: authDom,
            storageBucket: storageBkt,
            messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
            appId: env.VITE_FIREBASE_APP_ID || ''
        };
    }
    
    return DEFAULT_FIREBASE_CONFIG;
}

function saveFirebaseConfig(config) {
    if (typeof setData === 'function') setData('firebase_config', config);
    initFirebaseSync();
}

function initFirebaseSync() {
    const config = getFirebaseConfig();
    if (!config || !config.apiKey || !config.databaseURL) {
        console.log('[A7 Firebase] Firebase configuration incomplete.');
        return false;
    }

    if (typeof firebase === 'undefined') {
        console.warn('[A7 Firebase] Firebase SDK not loaded.');
        return false;
    }

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
        firebaseDb = firebase.database();
        firebaseInitialized = true;

        console.log('[A7 Firebase] Initialized successfully with NEW Firebase Project!');
        console.log('[A7 Firebase] Verified Active Project ID: ' + (config.projectId || 'web3-7a4cf'));
        console.log('[A7 Firebase] Verified Active Database URL: ' + config.databaseURL);
        
        listenToFirebaseUpdates();
        return true;
    } catch (err) {
        console.error('[A7 Firebase] Initialization error:', err);
        return false;
    }
}

// Push local data state to Firebase Database (Returns a Promise)
function pushToFirebase(key, value) {
    if (!firebaseInitialized || !firebaseDb) {
        console.log('[RESULT SAVE] Local mode (Firebase disconnected). Key:', key);
        return Promise.resolve(true);
    }
    console.log('[RESULT SAVE] Sending WRITE to Database (web3-7a4cf) for key:', key);
    return firebaseDb.ref('a7satta/' + key).set(value)
        .then(function() {
            console.log('[RESULT SAVE] Database WRITE SUCCESS for key:', key);
            return true;
        })
        .catch(function(err) {
            console.error('[RESULT SAVE] Database WRITE FAILED for key:', key, err);
            throw err;
        });
}

// Delete key or path from Firebase Database (Returns a Promise)
function deleteFromFirebase(key) {
    if (!firebaseInitialized || !firebaseDb) {
        console.log('[RESULT DELETE] Local mode (Firebase disconnected). Deleted key:', key);
        return Promise.resolve(true);
    }
    console.log('[RESULT DELETE] Sending DELETE to Database (web3-7a4cf) for key:', key);
    return firebaseDb.ref('a7satta/' + key).remove()
        .then(function() {
            console.log('[RESULT DELETE] Database DELETE SUCCESS for key:', key);
            return true;
        })
        .catch(function(err) {
            console.error('[RESULT DELETE] Database DELETE FAILED for key:', key, err);
            throw err;
        });
}

// Listen to changes from Firebase and update local state + UI
function listenToFirebaseUpdates() {
    if (!firebaseInitialized || !firebaseDb) return;

    const ref = firebaseDb.ref('a7satta');
    ref.on('value', function(snapshot) {
        const val = snapshot.val();
        if (!val) {
            console.log('[RESULT FETCH] Database returned empty snapshot.');
            return;
        }

        console.log('[RESULT FETCH] Received real-time update from Database (web3-7a4cf).');
        let hasChanges = false;

        Object.keys(val).forEach(function(key) {
            const remoteVal = val[key];
            if (remoteVal === undefined || remoteVal === null) return;

            const localValStr = localStorage.getItem('a7_' + key);
            const remoteValStr = typeof remoteVal === 'object' ? JSON.stringify(remoteVal) : remoteVal;

            if (localValStr !== remoteValStr) {
                localStorage.setItem('a7_' + key, remoteValStr);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            if (typeof renderPrimaryTable === 'function' && document.getElementById('primary-table-body')) {
                renderPrimaryTable();
            }
            if (typeof renderSecondaryTable === 'function' && document.getElementById('secondary-table-body')) {
                renderSecondaryTable();
            }
            if (typeof renderLiveResults === 'function' && document.getElementById('live-results')) {
                renderLiveResults();
            }
            if (typeof renderFullChart === 'function' && document.getElementById('fullchart-table')) {
                renderFullChart('fullchart-table', 'fullchart_headers', 'fullchart_data');
            }
        }
    }, function(error) {
        console.error('[RESULT FETCH] Realtime subscription error:', error);
    });
}

// Initialize Firebase Sync on script load
initFirebaseSync();
document.addEventListener('DOMContentLoaded', function() {
    initFirebaseSync();
});
