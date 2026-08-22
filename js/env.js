// ============================================================
// Environment Configuration (js/env.js)
// Dedicated Firebase Project Configuration for NEW Website
// Project ID: web3-7a4cf
// ============================================================

const ENV_CONFIG = {
    // Site & Contact Config
    SITE_NAME: "A7 SATTA",
    WHATSAPP_PHONE: "917027405875",
    WHATSAPP_URL: "https://wa.me/message/WTOZYC4GBMWNC1",

    // REAL NEW Firebase Web App Configuration (web3-7a4cf)
    VITE_FIREBASE_API_KEY: "AIzaSyC-IF9v4YOLamDidsVOn1JcGg8-PitCoH4",
    VITE_FIREBASE_AUTH_DOMAIN: "web3-7a4cf.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: "web3-7a4cf",
    VITE_FIREBASE_STORAGE_BUCKET: "web3-7a4cf.firebasestorage.app",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "729815551172",
    VITE_FIREBASE_APP_ID: "1:729815551172:web:1b5d18220cae4fee9d0d91",
    VITE_FIREBASE_DATABASE_URL: "https://web3-7a4cf-default-rtdb.firebaseio.com/",

    // Compatibility Mappings
    FIREBASE_API_KEY: "AIzaSyC-IF9v4YOLamDidsVOn1JcGg8-PitCoH4",
    FIREBASE_DATABASE_URL: "https://web3-7a4cf-default-rtdb.firebaseio.com/",
    FIREBASE_PROJECT_ID: "web3-7a4cf",
    FIREBASE_AUTH_DOMAIN: "web3-7a4cf.firebaseapp.com",
    FIREBASE_STORAGE_BUCKET: "web3-7a4cf.firebasestorage.app",
    FIREBASE_MESSAGING_SENDER_ID: "729815551172",
    FIREBASE_APP_ID: "1:729815551172:web:1b5d18220cae4fee9d0d91"
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ENV_CONFIG = ENV_CONFIG;
}
