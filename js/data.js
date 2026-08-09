// ============================================================
// A7 SATTA - Data Layer (localStorage-based persistence)
// ============================================================

const DEFAULT_CREDENTIALS = {
    username: (typeof window !== 'undefined' && window.ENV_CONFIG && window.ENV_CONFIG.ADMIN_USERNAME) ? window.ENV_CONFIG.ADMIN_USERNAME : "Adminx285",
    password: (typeof window !== 'undefined' && window.ENV_CONFIG && window.ENV_CONFIG.ADMIN_PASSWORD) ? window.ENV_CONFIG.ADMIN_PASSWORD : "Admin@2805"
};

const DEFAULT_GAMES_PRIMARY = [
    { name: "मुंबई डे",    slug: "mumbai-day",    time: "12:30 PM", yesterday: "--", today: "" },
    { name: "सदर बाजार",  slug: "sadar-bazar",   time: "01:20 PM", yesterday: "--", today: "" },
    { name: "ग्वालियर",   slug: "gwalior",        time: "02:20 PM", yesterday: "--", today: "" },
    { name: "दिल्ली बाजार",slug: "delhi-bazar",   time: "03:00 PM", yesterday: "--", today: "" },
    { name: "भोपाल सिटी", slug: "bhopal-city",    time: "03:50 PM", yesterday: "--", today: "" },
    { name: "श्री गणेश",  slug: "shree-ganesh",   time: "04:20 PM", yesterday: "--", today: "" },
    { name: "जयपुर सिटी", slug: "jaipur-city",    time: "05:15 PM", yesterday: "--", today: "" },
    { name: "फरीदाबाद",   slug: "faridabad",      time: "05:50 PM", yesterday: "--", today: "" },
    { name: "सूरत",       slug: "surat",           time: "06:45 PM", yesterday: "--", today: "" },
    { name: "अलवर",       slug: "alwar",           time: "07:20 PM", yesterday: "--", today: "" },
    { name: "गाज़ियाबाद", slug: "gaziyabad",       time: "09:30 PM", yesterday: "--", today: "" },
    { name: "पुणे नाईट",  slug: "pune-night",     time: "10:30 PM", yesterday: "--", today: "" },
    { name: "गली",        slug: "gali",            time: "11:30 PM", yesterday: "--", today: "" },
    { name: "दिसावर",     slug: "disawar",         time: "03:00 AM", yesterday: "--", today: "" }
];

const DEFAULT_GAMES_SECONDARY = [];

const DEFAULT_FEATURED = {
    name: "दिसावर",
    slug: "disawar",
    time: "05:10 AM",
    previous: "93",
    current: "51"
};

const DEFAULT_MARQUEE = "A7 Satta King, A7-Satta, A7 सट्टा, Satta king chart, Satta Record Chart, Old Result Chart, Satta king online result, Satta king online, Satta king result today, Gali result, Desawar result, Faridabad result, Gaziyabad result, Satta matka king, Satta king up, Satta king desawar, Satta king gali, Satta king 2019 chart, Satta baba king, Gali live result, Disawar live result, Satta Number, Matka Number, Satta.com, Satta Game, Gali Number, Delhi Satta king, Satta Bazar, Satta king 2017, satta king 2018, Gali Leak Number, Gali Single Jodi, Black Satta Result, Black satta king, Satta King India";

const DEFAULT_HINDI_TEXT = "हा भाई यही आती हे सबसे पहले खबर रूको और देखो";

const DEFAULT_AD_SCHEDULE = {
    topHeader: "--सीधे सट्टा कंपनी का No 1 खाईवाल--",
    khaiwalName: "",
    items: [
        { name: "मुंबई डे",    time: "12:30 PM" },
        { name: "सदर बाजार",  time: "01:20 PM" },
        { name: "ग्वालियर",   time: "02:20 PM" },
        { name: "दिल्ली बाजार",time: "03:00 PM" },
        { name: "भोपाल सिटी", time: "03:50 PM" },
        { name: "श्री गणेश",  time: "04:20 PM" },
        { name: "जयपुर सिटी", time: "05:15 PM" },
        { name: "फरीदाबाद",   time: "05:50 PM" },
        { name: "सूरत",       time: "06:45 PM" },
        { name: "अलवर",       time: "07:20 PM" },
        { name: "गाज़ियाबाद", time: "09:30 PM" },
        { name: "पुणे नाईट",  time: "10:30 PM" },
        { name: "गली",        time: "11:30 PM" },
        { name: "दिसावर",     time: "03:00 AM" }
    ],
    rateTitle: "? Rate list ?",
    jodiRate: "जोड़ी रेट 10-------960",
    harufRate: "हरूफ रेट 100-----960",
    bottomTitle: "",
    linkText: "Game play करने के लिये नीचे लिंक पर क्लिक करे",
    whatsappPhone: "917027405875",
    whatsappUrl: "https://wa.me/message/WTOZYC4GBMWNC1"
};

function compileAdContentFromSchedule(schedule) {
    if (!schedule) return '';
    let html = '';

    // Top Header & Khaiwal Name
    if (schedule.topHeader || schedule.khaiwalName) {
        html += `<div class="ad-header-box">\n`;
        if (schedule.topHeader) {
            html += `<div class="ad-top-title">${schedule.topHeader}</div>\n`;
        }
        if (schedule.khaiwalName) {
            html += `<div class="ad-khaiwal-title">${schedule.khaiwalName}</div>\n`;
        }
        html += `</div>\n`;
    }

    // Schedule Rows with Dotted Leaders
    if (schedule.items && schedule.items.length) {
        html += `<div class="ad-schedule-list">\n`;
        schedule.items.forEach(item => {
            if (item.name) {
                const timeStr = item.time || '';
                html += `  <div class="ad-schedule-row">
                    <span class="ad-schedule-name"><span class="clock-icon">⏰</span> ${item.name}</span>
                    <span class="ad-schedule-leader"></span>
                    <span class="ad-schedule-time">${timeStr}</span>
                </div>\n`;
            }
        });
        html += `</div>\n`;
    }

    // Rate Card
    if (schedule.rateTitle || schedule.jodiRate || schedule.harufRate) {
        html += `<div class="ad-rate-card">\n`;
        if (schedule.rateTitle) html += `<div class="ad-rate-title">${schedule.rateTitle}</div>\n`;
        if (schedule.jodiRate) html += `<div class="ad-rate-item">${schedule.jodiRate}</div>\n`;
        if (schedule.harufRate) html += `<div class="ad-rate-item">${schedule.harufRate}</div>\n`;
        html += `</div>\n`;
    }

    // Bottom Title & WhatsApp Button
    if (schedule.bottomTitle) {
        html += `<div class="ad-bottom-title">${schedule.bottomTitle}</div>\n`;
    }
    if (schedule.linkText) {
        const linkUrl = schedule.whatsappUrl || (schedule.whatsappPhone ? `https://wa.me/${schedule.whatsappPhone}` : 'https://wa.me/message/WTOZYC4GBMWNC1');
        const waSvgIcon = `<svg class="ad-wa-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="vertical-align:-4px;margin-right:8px;display:inline-block;"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.76.459 3.477 1.33 4.988l-1.414 5.163 5.281-1.385c1.458.796 3.104 1.215 4.79 1.216h.004c5.505 0 9.989-4.478 9.99-9.984 0-2.669-1.038-5.178-2.924-7.064a9.927 9.927 0 0 0-7.067-2.918zm0 1.834c4.493 0 8.151 3.658 8.153 8.15.001 2.181-.848 4.232-2.391 5.776-1.543 1.543-3.595 2.393-5.776 2.393h-.003c-1.479 0-2.923-.396-4.18-1.144l-.3-.178-3.109.815.829-3.029-.196-.312a8.106 8.106 0 0 1-1.246-4.321c.002-4.492 3.66-8.15 8.153-8.15zm-4.633 4.218c-.126 0-.327.047-.498.234-.171.188-.654.639-.654 1.558 0 .919.668 1.807.762 1.932.094.125 1.303 2.062 3.208 2.854.453.189.807.301 1.083.389.455.144.869.124 1.197.075.365-.054 1.125-.46 1.286-.905.161-.445.161-.826.113-.905-.047-.078-.171-.125-.36-.219-.188-.094-1.125-.555-1.3-.618-.175-.063-.303-.094-.431.094-.128.188-.498.639-.611.764-.113.125-.226.141-.414.047-.188-.094-.795-.293-1.514-.934-.56-.499-.938-1.116-1.048-1.304-.11-.188-.012-.29.082-.383.085-.084.188-.219.283-.328.094-.109.126-.188.188-.313.063-.125.031-.234-.016-.328-.047-.094-.431-1.037-.591-1.422-.156-.375-.315-.324-.431-.33h-.368z"/></svg>`;
        html += `<div class="ad-cta-container">
            <a href="${linkUrl}" target="_blank" class="ad-whatsapp-btn">
                ${waSvgIcon}<span>${schedule.linkText}</span>
            </a>
        </div>\n`;
    }
    return html;
}

const DEFAULT_AD_CONTENT = compileAdContentFromSchedule(DEFAULT_AD_SCHEDULE);

if (typeof window !== 'undefined') {
    window.DEFAULT_AD_SCHEDULE = DEFAULT_AD_SCHEDULE;
    window.DEFAULT_AD_CONTENT = DEFAULT_AD_CONTENT;
    window.compileAdContentFromSchedule = compileAdContentFromSchedule;
}

// Chart 1: Green table — games 1–5
const DEFAULT_CHART1_HEADERS = ["मुंबई डे", "सदर बाजार", "ग्वालियर", "दिल्ली बाजार", "भोपाल सिटी"];
const DEFAULT_CHART1_DATA = [
    { date: "01-08", values: ["-", "-", "-", "-", "-"] },
    { date: "02-08", values: ["-", "-", "-", "-", "-"] },
    { date: "03-08", values: ["-", "-", "-", "-", "-"] },
    { date: "04-08", values: ["-", "-", "-", "-", "-"] },
    { date: "05-08", values: ["-", "-", "-", "-", "-"] },
    { date: "आज",   values: ["-", "-", "-", "-", "-"] }
];

// Chart 2: Blue table — games 6–10
const DEFAULT_CHART2_HEADERS = ["श्री गणेश", "जयपुर सिटी", "फरीदाबाद", "सूरत", "अलवर"];
const DEFAULT_CHART2_DATA = [
    { date: "01-08", values: ["-", "-", "-", "-", "-"] },
    { date: "02-08", values: ["-", "-", "-", "-", "-"] },
    { date: "03-08", values: ["-", "-", "-", "-", "-"] },
    { date: "04-08", values: ["-", "-", "-", "-", "-"] },
    { date: "05-08", values: ["-", "-", "-", "-", "-"] },
    { date: "आज",   values: ["-", "-", "-", "-", "-"] }
];

// Chart 3: Orange table — games 11–14
const DEFAULT_CHART3_HEADERS = ["गाज़ियाबाद", "पुणे नाईट", "गली", "दिसावर"];
const DEFAULT_CHART3_DATA = [
    { date: "01-08", values: ["-", "-", "-", "-"] },
    { date: "02-08", values: ["-", "-", "-", "-"] },
    { date: "03-08", values: ["-", "-", "-", "-"] },
    { date: "04-08", values: ["-", "-", "-", "-"] },
    { date: "05-08", values: ["-", "-", "-", "-"] },
    { date: "आज",   values: ["-", "-", "-", "-"] }
];

// Full chart page data — all 14 games
const DEFAULT_FULLCHART_HEADERS = [
    "मुंबई डे", "सदर बाजार", "ग्वालियर", "दिल्ली बाजार",
    "भोपाल सिटी", "श्री गणेश", "जयपुर सिटी", "फरीदाबाद",
    "सूरत", "अलवर", "गाज़ियाबाद", "पुणे नाईट",
    "गली", "दिसावर"
];

const DEFAULT_FULLCHART_DATA = [
    { date: "01-08", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "02-08", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "03-08", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "04-08", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "05-08", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "आज",   values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] }
];

// Previous month chart — all 14 games
const DEFAULT_PREV_FULLCHART_HEADERS = DEFAULT_FULLCHART_HEADERS;
const DEFAULT_PREV_FULLCHART_DATA = [
    { date: "01-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "02-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "03-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "04-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "05-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "06-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "07-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "08-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "09-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "10-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "11-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "12-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "13-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "14-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "15-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "16-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "17-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "18-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "19-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "20-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "21-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "22-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "23-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "24-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "25-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "26-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "27-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "28-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "29-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "30-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] },
    { date: "31-07", values: ["-","-","-","-","-","-","-","-","-","-","-","-","-","-"] }
];

const ALL_GAME_LIST = [
    { name: "मुंबई डे",    slug: "mumbai-day" },
    { name: "सदर बाजार",  slug: "sadar-bazar" },
    { name: "ग्वालियर",   slug: "gwalior" },
    { name: "दिल्ली बाजार",slug: "delhi-bazar" },
    { name: "भोपाल सिटी", slug: "bhopal-city" },
    { name: "श्री गणेश",  slug: "shree-ganesh" },
    { name: "जयपुर सिटी", slug: "jaipur-city" },
    { name: "फरीदाबाद",   slug: "faridabad" },
    { name: "सूरत",       slug: "surat" },
    { name: "अलवर",       slug: "alwar" },
    { name: "गाज़ियाबाद", slug: "gaziyabad" },
    { name: "पुणे नाईट",  slug: "pune-night" },
    { name: "गली",        slug: "gali" },
    { name: "दिसावर",     slug: "disawar" }
];

const DEFAULT_DISCLAIMER = "!! DISCLAIMER:- This is a demo website. Viewing This Website Is Your Own Risk, All The Information Shown On Website Is Sponsored And We Warn You That Matka Gambling/Satta May Be Banned Or Illegal In Your Country..., We Are Not Responsible For Any Issues Or Scam..., We Respect All Country Rules/Laws... If You Not Agree With Our Site Disclaimer... Please Quit Our Site Right Now. Thank You.";

// ============================================================
// Data Access Functions
// ============================================================

// Map of alternative names for reliable header matching
const GAME_NAME_MAP = {
    "MUMBAI DAY":   ["मुंबई डे",    "mumbai-day",  "MUMBAI DAY"],
    "SADAR BAZAR":  ["सदर बाजार",  "sadar-bazar", "SADAR BAZAR"],
    "GWALIOR":      ["ग्वालियर",   "gwalior",     "GWALIOR"],
    "DELHI BAZAR":  ["दिल्ली बाजार","delhi-bazar", "DELHI BAZAR"],
    "BHOPAL CITY":  ["भोपाल सिटी", "bhopal-city", "BHOPAL CITY"],
    "SHREE GANESH": ["श्री गणेश",  "shree-ganesh","SHREE GANESH"],
    "JAIPUR CITY":  ["जयपुर सिटी", "jaipur-city", "JAIPUR CITY"],
    "FARIDABAD":    ["फरीदाबाद",   "faridabad",   "FARIDABAD"],
    "SURAT":        ["सूरत",       "surat",        "SURAT"],
    "ALWAR":        ["अलवर",       "alwar",        "ALWAR"],
    "GAZIYABAD":    ["गाज़ियाबाद", "gaziyabad",   "GAZIYABAD"],
    "PUNE NIGHT":   ["पुणे नाईट",  "pune-night",  "PUNE NIGHT"],
    "GALI":         ["गली",        "gali",         "GALI"],
    "DISAWAR":      ["दिसावर",     "disawar",      "DISAWAR"]
};

function findHeaderColumnIndex(headers, game) {
    if (!headers || !game) return -1;
    // 1. Direct name match
    var idx = headers.indexOf(game.name);
    if (idx !== -1) return idx;

    // 2. Map match
    var targetList = [game.name, game.slug];
    if (GAME_NAME_MAP[game.name]) targetList = targetList.concat(GAME_NAME_MAP[game.name]);

    for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        if (targetList.indexOf(header) !== -1) return i;
        if (GAME_NAME_MAP[header] && GAME_NAME_MAP[header].indexOf(game.name) !== -1) return i;
        if (game.slug && header.toLowerCase().replace(/\s+/g, '-') === game.slug.toLowerCase()) return i;
    }
    return -1;
}

function autoSyncTodayResults() {
    var primary = getData('games_primary') || [];
    var secondary = getData('games_secondary') || [];
    var allGames = primary.concat(secondary);

    var now = new Date();
    var dd = String(now.getDate()).padStart(2, '0');
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var currentDateStr = dd + '-' + mm; // e.g. "06-08"

    function updateChartDataset(headerKey, dataKey) {
        var headers = getData(headerKey);
        var data = getData(dataKey);
        if (!headers || !data) return;

        var updated = false;
        var targetRowIndex = -1;

        for (var r = 0; r < data.length; r++) {
            if (data[r].date === currentDateStr || data[r].date === "आज" || data[r].date === "Today") {
                targetRowIndex = r;
                if (data[r].date === "Today" || data[r].date === "आज") {
                    data[r].date = currentDateStr;
                    updated = true;
                }
                break;
            }
        }

        if (targetRowIndex === -1) {
            var emptyValues = headers.map(function() { return '-'; });
            data.push({ date: currentDateStr, values: emptyValues });
            targetRowIndex = data.length - 1;
            updated = true;
        }

        allGames.forEach(function(game) {
            if (game.today && game.today !== '' && game.today !== '-') {
                var colIndex = findHeaderColumnIndex(headers, game);
                if (colIndex !== -1) {
                    if (data[targetRowIndex].values[colIndex] !== game.today) {
                        data[targetRowIndex].values[colIndex] = game.today;
                        updated = true;
                    }
                }
            }
        });

        if (updated) {
            localStorage.setItem('a7_' + dataKey, JSON.stringify(data));
            localStorage.setItem('a7_' + headerKey, JSON.stringify(headers));
        }
    }

    updateChartDataset('chart1_headers', 'chart1_data');
    updateChartDataset('chart2_headers', 'chart2_data');
    updateChartDataset('chart3_headers', 'chart3_data');
    updateChartDataset('fullchart_headers', 'fullchart_data');
}

function initData(forceReset) {
    if (forceReset || !localStorage.getItem('a7_initialized_v11')) {
        localStorage.setItem('a7_credentials', JSON.stringify(DEFAULT_CREDENTIALS));
        localStorage.setItem('a7_games_primary', JSON.stringify(DEFAULT_GAMES_PRIMARY));
        localStorage.setItem('a7_games_secondary', JSON.stringify(DEFAULT_GAMES_SECONDARY));
        localStorage.setItem('a7_featured', JSON.stringify(DEFAULT_FEATURED));
        localStorage.setItem('a7_marquee', DEFAULT_MARQUEE);
        localStorage.setItem('a7_hindi_text', DEFAULT_HINDI_TEXT);
        localStorage.setItem('a7_ad_schedule', JSON.stringify(DEFAULT_AD_SCHEDULE));
        localStorage.setItem('a7_ad_content', DEFAULT_AD_CONTENT);
        localStorage.setItem('a7_chart1_headers', JSON.stringify(DEFAULT_CHART1_HEADERS));
        localStorage.setItem('a7_chart1_data', JSON.stringify(DEFAULT_CHART1_DATA));
        localStorage.setItem('a7_chart2_headers', JSON.stringify(DEFAULT_CHART2_HEADERS));
        localStorage.setItem('a7_chart2_data', JSON.stringify(DEFAULT_CHART2_DATA));
        localStorage.setItem('a7_chart3_headers', JSON.stringify(DEFAULT_CHART3_HEADERS));
        localStorage.setItem('a7_chart3_data', JSON.stringify(DEFAULT_CHART3_DATA));
        localStorage.setItem('a7_fullchart_headers', JSON.stringify(DEFAULT_FULLCHART_HEADERS));
        localStorage.setItem('a7_fullchart_data', JSON.stringify(DEFAULT_FULLCHART_DATA));
        localStorage.setItem('a7_prev_fullchart_headers', JSON.stringify(DEFAULT_PREV_FULLCHART_HEADERS));
        localStorage.setItem('a7_prev_fullchart_data', JSON.stringify(DEFAULT_PREV_FULLCHART_DATA));
        localStorage.setItem('a7_disclaimer', DEFAULT_DISCLAIMER);
        localStorage.setItem('a7_initialized_v11', 'true');
    }
    // Update ad_schedule and ad_content to ensure new WhatsApp phone & link are applied
    localStorage.setItem('a7_ad_schedule', JSON.stringify(DEFAULT_AD_SCHEDULE));
    localStorage.setItem('a7_ad_content', DEFAULT_AD_CONTENT);
    // Always update firebase_config to new faltu-816e4 database credentials
    localStorage.setItem('a7_firebase_config', JSON.stringify({
        apiKey: "AIzaSyBNl_Nys3QTSkp_mvnrd3jKHvfm4syoKyU",
        databaseURL: "https://faltu-816e4-default-rtdb.asia-southeast1.firebasedatabase.app/",
        projectId: "faltu-816e4",
        authDomain: "faltu-816e4.firebaseapp.com",
        storageBucket: "faltu-816e4.appspot.com"
    }));
    // Always sync credentials from DEFAULT_CREDENTIALS
    localStorage.setItem('a7_credentials', JSON.stringify(DEFAULT_CREDENTIALS));
    autoSyncTodayResults();
}

function getData(key) {
    const val = localStorage.getItem('a7_' + key);
    try { return JSON.parse(val); } catch (e) { return val; }
}

function setData(key, value) {
    if (typeof value === 'object') {
        localStorage.setItem('a7_' + key, JSON.stringify(value));
    } else {
        localStorage.setItem('a7_' + key, value);
    }
    if (key === 'games_primary' || key === 'games_secondary') {
        autoSyncTodayResults();
    }
}

function resetAllData() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('a7_'));
    keys.forEach(k => localStorage.removeItem(k));
    initData(true);
}

// Initialize on load
initData();
