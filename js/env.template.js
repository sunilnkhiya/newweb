// ============================================================
// Environment Configuration Template (env.template.js)
// Copy this file to js/env.js and fill in your actual credentials
// DO NOT commit js/env.js to GitHub!
// ============================================================

const ENV_CONFIG = {
    // Admin Credentials
    ADMIN_USERNAME: "YOUR_ADMIN_USERNAME",
    ADMIN_PASSWORD: "YOUR_ADMIN_PASSWORD",
    SETTINGS_PASSKEY: "YOUR_SETTINGS_PASSKEY",

    // Site & Contact Config
    SITE_NAME: "A7 SATTA",
    WHATSAPP_PHONE: "+91XXXXXXXXXX",
    WHATSAPP_URL: "https://wa.me/91XXXXXXXXXX",

    // Firebase Database Credentials
    FIREBASE_API_KEY: "YOUR_FIREBASE_API_KEY",
    FIREBASE_DATABASE_URL: "https://YOUR-APP.firebaseio.com",
    FIREBASE_PROJECT_ID: "YOUR_PROJECT_ID",
    FIREBASE_AUTH_DOMAIN: "YOUR-APP.firebaseapp.com",
    FIREBASE_STORAGE_BUCKET: "YOUR-APP.appspot.com"
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ENV_CONFIG = ENV_CONFIG;
}
