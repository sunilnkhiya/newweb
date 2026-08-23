// ============================================================
// A7 SATTA - Dedicated Firebase Realtime Sync Integration
// NEW Website Dedicated Project: web3-7a4cf
// Realtime Database URL: https://web3-7a4cf-default-rtdb.firebaseio.com/
// ============================================================

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyC-IF9v4YOLamDidsVOn1JcGg8-PitCoH4",
    authDomain: "web3-7a4cf.firebaseapp.com",
    databaseURL: "https://web3-7a4cf-default-rtdb.firebaseio.com/",
    projectId: "web3-7a4cf",
    storageBucket: "web3-7a4cf.firebasestorage.app",
    messagingSenderId: "729815551172",
    appId: "1:729815551172:web:1b5d18220cae4fee9d0d91"
};

let firebaseInitialized = false;
let firebaseDb = null;
const activeFirebaseListeners = {};

// Get Firebase configuration (Always uses dedicated web3-7a4cf real configuration)
function getFirebaseConfig() {
    let apiKey = DEFAULT_FIREBASE_CONFIG.apiKey;
    let dbUrl = DEFAULT_FIREBASE_CONFIG.databaseURL;
    let projId = DEFAULT_FIREBASE_CONFIG.projectId;
    let authDom = DEFAULT_FIREBASE_CONFIG.authDomain;
    let storageBkt = DEFAULT_FIREBASE_CONFIG.storageBucket;
    let msgSenderId = DEFAULT_FIREBASE_CONFIG.messagingSenderId;
    let appId = DEFAULT_FIREBASE_CONFIG.appId;

    if (typeof window !== 'undefined' && window.ENV_CONFIG) {
        const env = window.ENV_CONFIG;
        if (env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY) {
            apiKey = env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY;
        }
        if (env.VITE_FIREBASE_DATABASE_URL || env.FIREBASE_DATABASE_URL) {
            dbUrl = env.VITE_FIREBASE_DATABASE_URL || env.FIREBASE_DATABASE_URL;
        }
        if (env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID) {
            projId = env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID;
        }
        if (env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN) {
            authDom = env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN;
        }
        if (env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET) {
            storageBkt = env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET;
        }
        if (env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID) {
            msgSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID;
        }
        if (env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID) {
            appId = env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID;
        }
    }
    
    return {
        apiKey: apiKey,
        databaseURL: dbUrl,
        projectId: projId,
        authDomain: authDom,
        storageBucket: storageBkt,
        messagingSenderId: msgSenderId,
        appId: appId
    };
}

function initFirebaseSync() {
    const config = getFirebaseConfig();
    if (!config || !config.apiKey || !config.databaseURL) {
        console.error('[A7 Firebase] Firebase configuration incomplete.');
        firebaseInitialized = false;
        return false;
    }

    if (typeof firebase === 'undefined') {
        console.warn('[A7 Firebase] Firebase SDK not loaded.');
        firebaseInitialized = false;
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
        console.log('[A7 Firebase] Verified Messaging Sender ID: ' + config.messagingSenderId);
        console.log('[A7 Firebase] Verified App ID: ' + config.appId);
        
        setupPageListeners();
        return true;
    } catch (err) {
        console.error('[A7 Firebase] Initialization error:', err);
        firebaseInitialized = false;
        return false;
    }
}

// Push data state to Firebase Database (Returns Promise. Rejects if user is unauthenticated or on Firebase error!)
function pushToFirebase(key, value) {
    if (!firebaseInitialized || !firebaseDb) {
        var initialized = initFirebaseSync();
        if (!initialized || !firebaseDb) {
            console.error('[RESULT SAVE] Firebase error: Database is disconnected or not initialized!');
            return Promise.reject(new Error('[A7 Firebase] Database connection failed. Save operation aborted.'));
        }
    }

    const authUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
    if (!authUser) {
        console.error('[RESULT SAVE] Access Denied: Unauthenticated user cannot write to database.');
        return Promise.reject(new Error('[A7 Firebase] Access Denied: Only authenticated admin users can modify database records.'));
    }

    const path = 'a7satta/' + key;
    console.log('[RESULT SAVE] Executing WRITE to Database path:', path);
    console.log('[RESULT SAVE] Active Project ID:', DEFAULT_FIREBASE_CONFIG.projectId);
    console.log('[RESULT SAVE] Auth Admin User:', authUser.email);

    return firebaseDb.ref(path).set(value)
        .then(function() {
            console.log('[RESULT SAVE] Database WRITE CONFIRMED BY FIREBASE for path:', path);
            return true;
        })
        .catch(function(err) {
            console.error('[RESULT SAVE] Database WRITE REJECTED BY FIREBASE for path:', path, err);
            throw err;
        });
}

// Delete key or path from Firebase Database (Returns Promise. Rejects if user is unauthenticated or on Firebase error!)
function deleteFromFirebase(key) {
    if (!firebaseInitialized || !firebaseDb) {
        var initialized = initFirebaseSync();
        if (!initialized || !firebaseDb) {
            console.error('[RESULT DELETE] Firebase error: Database is disconnected or not initialized!');
            return Promise.reject(new Error('[A7 Firebase] Database connection failed. Delete operation aborted.'));
        }
    }

    const authUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
    if (!authUser) {
        console.error('[RESULT DELETE] Access Denied: Unauthenticated user cannot delete database records.');
        return Promise.reject(new Error('[A7 Firebase] Access Denied: Only authenticated admin users can delete database records.'));
    }

    const path = 'a7satta/' + key;
    console.log('[RESULT DELETE] Executing DELETE on Database path:', path);
    console.log('[RESULT DELETE] Active Project ID:', DEFAULT_FIREBASE_CONFIG.projectId);
    console.log('[RESULT DELETE] Auth Admin User:', authUser.email);

    return firebaseDb.ref(path).remove()
        .then(function() {
            console.log('[RESULT DELETE] Database DELETE CONFIRMED BY FIREBASE for path:', path);
            return true;
        })
        .catch(function(err) {
            console.error('[RESULT DELETE] Database DELETE REJECTED BY FIREBASE for path:', path, err);
            throw err;
        });
}

// Reusable Path-Specific Realtime Listener Helper (Prevents Duplicate Subscriptions)
function listenToKey(key, callbacks) {
    if (!firebaseInitialized || !firebaseDb) return;
    if (activeFirebaseListeners[key]) return; // Duplicate listener prevention

    activeFirebaseListeners[key] = true;
    const path = 'a7satta/' + key;
    const ref = firebaseDb.ref(path);

    ref.on('value', function(snapshot) {
        const val = snapshot.val();
        const localValStr = localStorage.getItem('a7_' + key);
        const remoteValStr = (val !== null && typeof val === 'object') ? JSON.stringify(val) : (val !== null ? String(val) : '');

        if (localValStr !== remoteValStr) {
            if (val !== null) {
                localStorage.setItem('a7_' + key, remoteValStr);
            } else {
                localStorage.removeItem('a7_' + key);
            }
            console.log('[RESULT FETCH] Updated: ' + key);

            if (Array.isArray(callbacks)) {
                callbacks.forEach(function(cb) {
                    if (typeof cb === 'function') {
                        try { cb(); } catch (e) { console.error('[RESULT FETCH] Callback error for ' + key + ':', e); }
                    }
                });
            } else if (typeof callbacks === 'function') {
                try { callbacks(); } catch (e) { console.error('[RESULT FETCH] Callback error for ' + key + ':', e); }
            }
        }
    }, function(error) {
        console.error('[RESULT FETCH] Error listening to ' + key + ':', error);
    });
}

// Setup Page-Aware Realtime Listeners
function setupPageListeners() {
    if (!firebaseInitialized || !firebaseDb) return;

    const isHomepage = !!(document.getElementById('primary-table-body') || document.getElementById('featured-section'));
    const isChartPage = !!(document.getElementById('fullchart-table') || document.getElementById('yearchart-table'));
    const isAdminPage = !!(document.getElementById('admin-primary-table') || document.getElementById('stat-total-games'));

    if (isHomepage) {
        console.log('[A7 Firebase] Registering Page-Specific Realtime Listeners for HOMEPAGE (index.html)');
        listenToKey('marquee', [function() { if (typeof renderMarquee === 'function') renderMarquee(); }]);
        listenToKey('hindi_text', [function() { if (typeof renderHindiText === 'function') renderHindiText(); }]);
        listenToKey('featured', [function() { if (typeof renderFeatured === 'function') renderFeatured(); }]);
        listenToKey('games_primary', [
            function() { if (typeof renderPrimaryTable === 'function') renderPrimaryTable(); },
            function() { if (typeof renderLiveResults === 'function') renderLiveResults(); }
        ]);
        listenToKey('games_secondary', [
            function() { if (typeof renderSecondaryTable === 'function') renderSecondaryTable(); },
            function() { if (typeof renderLiveResults === 'function') renderLiveResults(); }
        ]);
        listenToKey('ad_schedule', [function() { if (typeof renderAdContent === 'function') renderAdContent(); }]);
        listenToKey('ad_content', [function() { if (typeof renderAdContent === 'function') renderAdContent(); }]);
        listenToKey('disclaimer', [function() { if (typeof renderDisclaimer === 'function') renderDisclaimer(); }]);
        listenToKey('chart1_headers', [function() { if (typeof renderChart === 'function') renderChart('chart1-table', 'chart1_headers', 'chart1_data', '#dbec95'); }]);
        listenToKey('chart1_data', [function() { if (typeof renderChart === 'function') renderChart('chart1-table', 'chart1_headers', 'chart1_data', '#dbec95'); }]);
        listenToKey('chart2_headers', [function() { if (typeof renderChart === 'function') renderChart('chart2-table', 'chart2_headers', 'chart2_data', '#95ceec'); }]);
        listenToKey('chart2_data', [function() { if (typeof renderChart === 'function') renderChart('chart2-table', 'chart2_headers', 'chart2_data', '#95ceec'); }]);
        listenToKey('chart3_headers', [function() { if (typeof renderChart === 'function') renderChart('chart3-table', 'chart3_headers', 'chart3_data', '#f0c987'); }]);
        listenToKey('chart3_data', [function() { if (typeof renderChart === 'function') renderChart('chart3-table', 'chart3_headers', 'chart3_data', '#f0c987'); }]);
    } else if (isChartPage) {
        console.log('[A7 Firebase] Registering Page-Specific Realtime Listeners for CHART PAGE (chart.html)');
        listenToKey('marquee', [function() { if (typeof renderMarquee === 'function') renderMarquee(); }]);
        listenToKey('disclaimer', [function() { if (typeof renderDisclaimer === 'function') renderDisclaimer(); }]);
        listenToKey('games_primary', [function() { if (typeof renderLiveResults === 'function') renderLiveResults(); }]);
        listenToKey('games_secondary', [function() { if (typeof renderLiveResults === 'function') renderLiveResults(); }]);
        listenToKey('fullchart_headers', [function() { if (typeof renderFullChart === 'function') renderFullChart('fullchart-table', 'fullchart_headers', 'fullchart_data'); }]);
        listenToKey('fullchart_data', [function() { if (typeof renderFullChart === 'function') renderFullChart('fullchart-table', 'fullchart_headers', 'fullchart_data'); }]);
        listenToKey('prev_fullchart_headers', [function() { if (typeof renderFullChart === 'function') renderFullChart('prev-fullchart-table', 'prev_fullchart_headers', 'prev_fullchart_data'); }]);
        listenToKey('prev_fullchart_data', [function() { if (typeof renderFullChart === 'function') renderFullChart('prev-fullchart-table', 'prev_fullchart_headers', 'prev_fullchart_data'); }]);
        listenToKey('year_chart_headers', [function() { if (typeof renderYearChart === 'function') renderYearChart(); }]);
        listenToKey('year_chart_data', [function() { if (typeof renderYearChart === 'function') renderYearChart(); }]);
    } else if (isAdminPage) {
        console.log('[A7 Firebase] Registering Page-Specific Realtime Listeners for ADMIN PANEL (admin.html)');
        listenToKey('games_primary', [
            function() { if (typeof renderAdminPrimaryTable === 'function') renderAdminPrimaryTable(); },
            function() { if (typeof renderAdminTopGameNames === 'function') renderAdminTopGameNames(); }
        ]);
        listenToKey('games_secondary', [function() { if (typeof renderAdminSecondaryTable === 'function') renderAdminSecondaryTable(); }]);
        listenToKey('featured', [function() { if (typeof renderAdminFeatured === 'function') renderAdminFeatured(); }]);
        listenToKey('marquee', [function() { if (typeof renderAdminMarquee === 'function') renderAdminMarquee(); }]);
        listenToKey('hindi_text', [function() { if (typeof renderAdminHindiText === 'function') renderAdminHindiText(); }]);
        listenToKey('ad_schedule', [function() { if (typeof renderAdminAdContent === 'function') renderAdminAdContent(); }]);
        listenToKey('ad_content', [function() { if (typeof renderAdminAdContent === 'function') renderAdminAdContent(); }]);
        listenToKey('disclaimer', [function() { if (typeof renderAdminDisclaimer === 'function') renderAdminDisclaimer(); }]);
        listenToKey('chart1_headers', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-chart1', 'chart1_headers', 'chart1_data', 0); }]);
        listenToKey('chart1_data', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-chart1', 'chart1_headers', 'chart1_data', 0); }]);
        listenToKey('chart2_headers', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-chart2', 'chart2_headers', 'chart2_data', 1); }]);
        listenToKey('chart2_data', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-chart2', 'chart2_headers', 'chart2_data', 1); }]);
        listenToKey('chart3_headers', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-chart3', 'chart3_headers', 'chart3_data', 2); }]);
        listenToKey('chart3_data', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-chart3', 'chart3_headers', 'chart3_data', 2); }]);
        listenToKey('fullchart_headers', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-fullchart', 'fullchart_headers', 'fullchart_data', 3); }]);
        listenToKey('fullchart_data', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-fullchart', 'fullchart_headers', 'fullchart_data', 3); }]);
        listenToKey('prev_fullchart_headers', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-prev-fullchart', 'prev_fullchart_headers', 'prev_fullchart_data', 4); }]);
        listenToKey('prev_fullchart_data', [function() { if (typeof renderAdminChart === 'function') renderAdminChart('admin-prev-fullchart', 'prev_fullchart_headers', 'prev_fullchart_data', 4); }]);
        listenToKey('year_chart_headers', [function() { if (typeof renderAdminYearChart === 'function') renderAdminYearChart(); }]);
        listenToKey('year_chart_data', [function() { if (typeof renderAdminYearChart === 'function') renderAdminYearChart(); }]);
    } else {
        console.log('[A7 Firebase] Registering Page-Specific Realtime Listeners for OTHER PAGES (contact.html / login.html)');
        listenToKey('marquee', [function() { if (typeof renderMarquee === 'function') renderMarquee(); }]);
        listenToKey('disclaimer', [function() { if (typeof renderDisclaimer === 'function') renderDisclaimer(); }]);
    }
}

// Initialize Firebase Sync on script load
initFirebaseSync();
document.addEventListener('DOMContentLoaded', function() {
    initFirebaseSync();
});
