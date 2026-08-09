// ============================================================
// A7 SATTA - Firebase Realtime Sync Integration
// Synchronizes game results and record charts across all clients
// ============================================================

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyBNl_Nys3QTSkp_mvnrd3jKHvfm4syoKyU",
    authDomain: "faltu-816e4.firebaseapp.com",
    databaseURL: "https://faltu-816e4-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "faltu-816e4",
    storageBucket: "faltu-816e4.appspot.com",
    messagingSenderId: "",
    appId: ""
};

let firebaseInitialized = false;
let firebaseDb = null;

function getFirebaseConfig() {
    var stored = getData('firebase_config');
    if (stored && stored.apiKey && stored.databaseURL) return stored;
    if (typeof window !== 'undefined' && window.ENV_CONFIG && window.ENV_CONFIG.FIREBASE_API_KEY && window.ENV_CONFIG.FIREBASE_DATABASE_URL) {
        return {
            apiKey: window.ENV_CONFIG.FIREBASE_API_KEY,
            databaseURL: window.ENV_CONFIG.FIREBASE_DATABASE_URL,
            projectId: window.ENV_CONFIG.FIREBASE_PROJECT_ID || '',
            authDomain: window.ENV_CONFIG.FIREBASE_AUTH_DOMAIN || '',
            storageBucket: window.ENV_CONFIG.FIREBASE_STORAGE_BUCKET || ''
        };
    }
    return DEFAULT_FIREBASE_CONFIG;
}

function saveFirebaseConfig(config) {
    setData('firebase_config', config);
    initFirebaseSync();
}

function initFirebaseSync() {
    const config = getFirebaseConfig();
    if (!config || !config.apiKey || !config.databaseURL) {
        console.log('[A7 Firebase] Firebase credentials not set or incomplete. Operating in local mode.');
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
        console.log('[A7 Firebase] Initialized successfully with URL:', config.databaseURL);
        
        // Listen to live database changes from Firebase
        listenToFirebaseUpdates();
        return true;
    } catch (err) {
        console.error('[A7 Firebase] Initialization error:', err);
        return false;
    }
}

// Push local data state to Firebase Database
function pushToFirebase(key, value) {
    if (!firebaseInitialized || !firebaseDb) return;
    try {
        firebaseDb.ref('a7satta/' + key).set(value)
            .then(function() {
                console.log('[A7 Firebase] Pushed key "' + key + '" to Firebase');
            })
            .catch(function(err) {
                console.error('[A7 Firebase] Push error for key ' + key, err);
            });
    } catch (e) {
        console.error('[A7 Firebase] Error pushing to Firebase:', e);
    }
}

// Listen to changes from Firebase and update local state + UI
function listenToFirebaseUpdates() {
    if (!firebaseInitialized || !firebaseDb) return;

    const ref = firebaseDb.ref('a7satta');
    ref.on('value', function(snapshot) {
        const val = snapshot.val();
        if (!val) return;

        console.log('[A7 Firebase] Received real-time update from Firebase!');
        let hasChanges = false;

        Object.keys(val).forEach(function(key) {
            const remoteVal = val[key];
            const localValStr = localStorage.getItem('a7_' + key);
            const remoteValStr = typeof remoteVal === 'object' ? JSON.stringify(remoteVal) : remoteVal;

            if (localValStr !== remoteValStr) {
                localStorage.setItem('a7_' + key, remoteValStr);
                hasChanges = true;
            }
        });

        // If ad_content or ad_schedule is missing or contains old SULTAN BHAI KHAIWAL, update Firebase
        const defaultContent = typeof DEFAULT_AD_CONTENT !== 'undefined' ? DEFAULT_AD_CONTENT : window.DEFAULT_AD_CONTENT;
        const defaultSchedule = typeof DEFAULT_AD_SCHEDULE !== 'undefined' ? DEFAULT_AD_SCHEDULE : window.DEFAULT_AD_SCHEDULE;

        let shouldUpdateSched = false;
        if (val.ad_schedule) {
            if (val.ad_schedule.khaiwalName && val.ad_schedule.khaiwalName.includes('SULTAN')) {
                val.ad_schedule.khaiwalName = '';
                shouldUpdateSched = true;
            }
            if (val.ad_schedule.bottomTitle && val.ad_schedule.bottomTitle.includes('SULTAN')) {
                val.ad_schedule.bottomTitle = '';
                shouldUpdateSched = true;
            }
        }
        if (shouldUpdateSched && defaultSchedule) {
            const cleanSched = Object.assign({}, val.ad_schedule, { khaiwalName: '', bottomTitle: '' });
            const cleanContent = typeof compileAdContentFromSchedule === 'function' ? compileAdContentFromSchedule(cleanSched) : defaultContent;
            localStorage.setItem('a7_ad_schedule', JSON.stringify(cleanSched));
            localStorage.setItem('a7_ad_content', cleanContent);
            pushToFirebase('ad_schedule', cleanSched);
            pushToFirebase('ad_content', cleanContent);
            hasChanges = true;
        }

        if ((!val.ad_content || (typeof val.ad_content === 'string' && val.ad_content.includes('SULTAN'))) && defaultContent) {
            pushToFirebase('ad_content', defaultContent);
        }
        if (!val.ad_schedule && defaultSchedule) {
            pushToFirebase('ad_schedule', defaultSchedule);
        }

        if (hasChanges) {
            // Trigger UI updates on active page
            if (typeof initHomePage === 'function' && document.getElementById('primary-table-body')) {
                initHomePage();
            }
            if (typeof initChartPage === 'function' && document.getElementById('fullchart-table')) {
                initChartPage();
            }
            if (typeof initAdminPage === 'function' && document.getElementById('admin-primary-table')) {
                initAdminPage();
            }
        }
    });
}

// Intercept setData to automatically push updates to Firebase
const originalSetData = setData;
window.setData = function(key, value) {
    originalSetData(key, value);
    if (firebaseInitialized) {
        pushToFirebase(key, value);
    }
};

// Initialize Firebase Sync on script load immediately
initFirebaseSync();
document.addEventListener('DOMContentLoaded', function() {
    initFirebaseSync();
});
