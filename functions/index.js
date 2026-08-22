const { setGlobalOptions } = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK using default App Engine / Functions service account credentials
if (!admin.apps.length) {
    admin.initializeApp();
}

setGlobalOptions({ maxInstances: 10 });

/**
 * Core Archive Logic (Reusable for both Scheduled Trigger & HTTP Manual Trigger)
 * @param {string|null} customDateStr - Optional date override in "DD-MM-YYYY" or "YYYY-MM-DD" format
 * @returns {Promise<Object>} Execution result metrics
 */
async function runArchiveDailyResults(customDateStr = null) {
    const db = admin.database();
    const rootRef = db.ref('a7satta');

    // 1. Calculate Target Archive Date in Asia/Kolkata timezone
    let targetDate = null;
    if (customDateStr && typeof customDateStr === 'string') {
        const trimmed = customDateStr.trim();
        if (trimmed.includes('-')) {
            const parts = trimmed.split('-');
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                targetDate = {
                    day: parts[2].padStart(2, '0'),
                    month: parts[1].padStart(2, '0'),
                    year: parts[0]
                };
            } else if (parts.length >= 2) {
                // DD-MM-YYYY or DD-MM
                targetDate = {
                    day: parts[0].padStart(2, '0'),
                    month: parts[1].padStart(2, '0'),
                    year: parts[2] || String(new Date().getFullYear())
                };
            }
        }
    }

    if (!targetDate) {
        // Scheduled trigger at 12:00 AM IST: archive previous day (the day that just ended)
        const now = new Date();
        const kolkataOffsetMs = (5 * 60 + 30) * 60 * 1000;
        const localKolkataTimeMs = now.getTime() + kolkataOffsetMs;
        const prevDayDate = new Date(localKolkataTimeMs - (12 * 60 * 60 * 1000));

        const day = String(prevDayDate.getUTCDate()).padStart(2, '0');
        const month = String(prevDayDate.getUTCMonth() + 1).padStart(2, '0');
        const year = String(prevDayDate.getUTCFullYear());
        targetDate = { day, month, year };
    }

    const dateDDMM = `${targetDate.day}-${targetDate.month}`;              // e.g. "22-08"
    const dateDDMMYYYY = `${targetDate.day}-${targetDate.month}-${targetDate.year}`;   // e.g. "22-08-2026"

    logger.info(`[ARCHIVE START] Target Archive Date: ${dateDDMMYYYY} (Monthly key: ${dateDDMM})`);

    // 2. Fetch current database state from a7satta
    const snapshot = await rootRef.once('value');
    const data = snapshot.val() || {};

    const primaryGames = Array.isArray(data.games_primary) ? data.games_primary : [];
    const secondaryGames = Array.isArray(data.games_secondary) ? data.games_secondary : [];
    const allGames = [...primaryGames, ...secondaryGames];

    if (allGames.length === 0) {
        logger.warn('[ARCHIVE CANCELLED] No games found in a7satta/games_primary.');
        return { success: false, message: 'No games found in database.' };
    }

    // Helper to sanitize game values
    const sanitizeResult = (val) => {
        if (!val || typeof val !== 'string') return '-';
        const trimmedVal = val.trim();
        if (trimmedVal === '' || trimmedVal === '--' || trimmedVal === '-' || trimmedVal.toUpperCase() === 'WAIT') {
            return '-';
        }
        return trimmedVal;
    };

    // Build game results lookup map
    const gameResultMap = new Map();
    allGames.forEach(g => {
        gameResultMap.set(g.name, sanitizeResult(g.today));
    });

    logger.info(`[ARCHIVE GAMES] Extracted ${allGames.length} games. Active values:`, Object.fromEntries(gameResultMap));

    // Default column headers fallback
    const chart1Headers = Array.isArray(data.chart1_headers) ? data.chart1_headers : ["चेन्नई डे", "सदर बाजार", "ग्वालियर", "दिल्ली बाजार", "उदयपुर टाउन"];
    const chart2Headers = Array.isArray(data.chart2_headers) ? data.chart2_headers : ["श्री गणेश", "बॉम्बे सिटी", "फरीदाबाद", "देहरादून बाजार", "अलवर"];
    const chart3Headers = Array.isArray(data.chart3_headers) ? data.chart3_headers : ["गाज़ियाबाद", "अयोध्या नगरी", "गली", "दिसावर"];
    const fullChartHeaders = Array.isArray(data.fullchart_headers) ? data.fullchart_headers : [...chart1Headers, ...chart2Headers, ...chart3Headers];
    const yearChartHeaders = Array.isArray(data.year_chart_headers) ? data.year_chart_headers : fullChartHeaders;

    // Helper to update or insert row into chart data array (Idempotent)
    const updateOrInsertRow = (chartArray, dateKey, headersList, prefix) => {
        const rows = Array.isArray(chartArray) ? [...chartArray] : [];
        const values = headersList.map(h => gameResultMap.get(h) || '-');

        const existingIdx = rows.findIndex(r => r && r.date === dateKey);
        if (existingIdx !== -1) {
            rows[existingIdx] = {
                ...rows[existingIdx],
                values: values
            };
            logger.info(`[CHART UPDATE] Updated existing row for date "${dateKey}" in ${prefix}`);
        } else {
            const cleanKey = dateKey.replace(/-/g, '');
            const newRow = {
                id: `${prefix}_r${cleanKey}`,
                date: dateKey,
                values: values
            };
            rows.push(newRow);
            logger.info(`[CHART INSERT] Created new row for date "${dateKey}" in ${prefix}`);
        }
        return rows;
    };

    // 3. Process each destination chart
    const updatedChart1Data = updateOrInsertRow(data.chart1_data, dateDDMM, chart1Headers, 'c1');
    const updatedChart2Data = updateOrInsertRow(data.chart2_data, dateDDMM, chart2Headers, 'c2');
    const updatedChart3Data = updateOrInsertRow(data.chart3_data, dateDDMM, chart3Headers, 'c3');
    const updatedFullChartData = updateOrInsertRow(data.fullchart_data, dateDDMM, fullChartHeaders, 'fc');
    const updatedYearChartData = updateOrInsertRow(data.year_chart_data, dateDDMMYYYY, yearChartHeaders, 'yc');

    // 4. Game state rollover: Move today -> yesterday and clear today for next day
    const updatedPrimaryGames = primaryGames.map(g => {
        const todayVal = sanitizeResult(g.today);
        const newYesterday = (todayVal !== '-') ? todayVal : (g.yesterday || '--');
        return {
            ...g,
            yesterday: newYesterday,
            today: ''
        };
    });

    const updatedSecondaryGames = secondaryGames.map(g => {
        const todayVal = sanitizeResult(g.today);
        const newYesterday = (todayVal !== '-') ? todayVal : (g.yesterday || '--');
        return {
            ...g,
            yesterday: newYesterday,
            today: ''
        };
    });

    // 5. Atomic write to Firebase Realtime Database
    const updates = {};
    updates['games_primary'] = updatedPrimaryGames;
    if (secondaryGames.length > 0) updates['games_secondary'] = updatedSecondaryGames;
    updates['chart1_data'] = updatedChart1Data;
    updates['chart2_data'] = updatedChart2Data;
    updates['chart3_data'] = updatedChart3Data;
    updates['fullchart_data'] = updatedFullChartData;
    updates['year_chart_data'] = updatedYearChartData;

    await rootRef.update(updates);

    logger.info(`[ARCHIVE COMPLETE] Successfully archived results for date ${dateDDMMYYYY} into Realtime Database.`);

    return {
        success: true,
        archiveDate: dateDDMMYYYY,
        monthlyDateKey: dateDDMM,
        gamesCount: allGames.length,
        chartsUpdated: ['chart1_data', 'chart2_data', 'chart3_data', 'fullchart_data', 'year_chart_data']
    };
}

/**
 * 1. Scheduled Cloud Function v2
 * Triggers every day at 12:00 AM (00:00) Asia/Kolkata timezone
 */
exports.dailyArchiveResults = onSchedule({
    schedule: "0 0 * * *",
    timeZone: "Asia/Kolkata",
    retryCount: 3
}, async (event) => {
    logger.info("[SCHEDULED TRIGGER] Daily 12:00 AM Archive Started");
    try {
        const res = await runArchiveDailyResults();
        logger.info("[SCHEDULED TRIGGER SUCCESS]", res);
    } catch (err) {
        logger.error("[SCHEDULED TRIGGER FAILED]", err);
        throw err;
    }
});

/**
 * 2. HTTP Manual Test Trigger
 * Usage: GET /manualArchiveDailyResults or GET /manualArchiveDailyResults?date=22-08-2026
 */
exports.manualArchiveDailyResults = onRequest(async (req, res) => {
    try {
        const customDate = req.query.date || null;
        logger.info(`[MANUAL TRIGGER] Triggered with custom date: ${customDate || 'Default Previous Day'}`);

        const result = await runArchiveDailyResults(customDate);
        res.status(200).json({
            message: "Manual archive completed successfully",
            result: result
        });
    } catch (err) {
        logger.error("[MANUAL TRIGGER FAILED]", err);
        res.status(500).json({
            error: "Archive failed",
            details: err.message
        });
    }
});
