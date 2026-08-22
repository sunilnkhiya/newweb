// ============================================================
// Environment Configuration (js/env.js)
// Dedicated Firebase Project Configuration for NEW Website
// Project ID: web3-7a4cf
// ============================================================

const ENV_CONFIG = {
    // Admin Credentials
    ADMIN_USERNAME: "Adminx285",
    ADMIN_PASSWORD: "Admin@2805",
    SETTINGS_PASSKEY: "SecurityxAdmin2026",

    // Site & Contact Config
    SITE_NAME: "A7 SATTA",
    WHATSAPP_PHONE: "917027405875",
    WHATSAPP_URL: "https://wa.me/message/WTOZYC4GBMWNC1",

    // Dedicated NEW Firebase Credentials (web3-7a4cf)
    VITE_FIREBASE_API_KEY: "AIzaSyB_web3_7a4cf_key",
    VITE_FIREBASE_AUTH_DOMAIN: "web3-7a4cf.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: "web3-7a4cf",
    VITE_FIREBASE_STORAGE_BUCKET: "web3-7a4cf.appspot.com",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "",
    VITE_FIREBASE_APP_ID: "",
    VITE_FIREBASE_DATABASE_URL: "https://web3-7a4cf-default-rtdb.firebaseio.com/",

    // Compatibility Mappings
    FIREBASE_API_KEY: "AIzaSyB_web3_7a4cf_key",
    FIREBASE_DATABASE_URL: "https://web3-7a4cf-default-rtdb.firebaseio.com/",
    FIREBASE_PROJECT_ID: "web3-7a4cf",
    FIREBASE_AUTH_DOMAIN: "web3-7a4cf.firebaseapp.com",
    FIREBASE_STORAGE_BUCKET: "web3-7a4cf.appspot.com"
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ENV_CONFIG = ENV_CONFIG;
}
