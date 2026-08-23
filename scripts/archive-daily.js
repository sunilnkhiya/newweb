const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');

// 1. Initialize Firebase Admin SDK using Environment Secret or Local Fallback File
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : process.env.FIREBASE_SERVICE_ACCOUNT;
        console.log('[FIREBASE ADMIN] Loaded service account credentials from process.env.FIREBASE_SERVICE_ACCOUNT');
    } catch (err) {
        console.error('[FIREBASE ADMIN ERROR] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON env variable:', err.message);
        process.exit(1);
    }
} else {
    try {
        const localSaPath = path.join(__dirname, '../service-account.json');
        serviceAccount = require(localSaPath);
        console.log('[FIREBASE ADMIN] Loaded local service account key file from:', localSaPath);
    } catch (err) {
        console.error('[FIREBASE ADMIN ERROR] No FIREBASE_SERVICE_ACCOUNT env var or local service-account.json file found:', err.message);
        process.exit(1);
    }
}

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://web3-7a4cf-default-rtdb.firebaseio.com/"
    });
}

// 2. Accurate Previous Calendar Date Calculation in Asia/Kolkata timezone
function getKolkataTargetDate(customDateStr = null) {
    if (customDateStr && typeof customDateStr === 'string') {
        const trimmed = customDateStr.trim();
        if (trimmed.includes('-')) {
            const parts = trimmed.split('-');
            let d, m, y;
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                [y, m, d] = parts;
            } else if (parts.length >= 3) {
                // DD-MM-YYYY
                [d, m, y] = parts;
            } else if (parts.length === 2) {
                // DD-MM
                [d, m] = parts;
                y = String(new Date().getFullYear());
            }

            if (d && m && y) {
                const pd = String(d).padStart(2, '0');
                const pm = String(m).padStart(2, '0');
                const py = String(y);
                return {
                    dateDDMM: `${pd}-${pm}`,
                    dateDDMMYYYY: `${pd}-${pm}-${py}`,
                    fullISO: `${py}-${pm}-${pd}`
                };
            }
        }
    }

    // Default: Calculate previous calendar date in Asia/Kolkata timezone
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const currentDateStr = formatter.format(new Date());

    const [curYear, curMonth, curDay] = currentDateStr.split('-').map(Number);
    // Subtract 1 calendar day safely using UTC Date math
    const prevDate = new Date(Date.UTC(curYear, curMonth - 1, curDay - 1));

    const py = String(prevDate.getUTCFullYear());
    const pm = String(prevDate.getUTCMonth() + 1).padStart(2, '0');
    const pd = String(prevDate.getUTCDate()).padStart(2, '0');

    return {
        dateDDMM: `${pd}-${pm}`,
        dateDDMMYYYY: `${pd}-${pm}-${py}`,
        fullISO: `${py}-${pm}-${pd}`
    };
}

// 3. Unicode Normalization & Stable Game Key Mapping
function normalizeGameName(name) {
    if (!name) return '';
    return String(name)
        .normalize('NFC')
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]/g, '');
}

const GAME_ALIASES = {
    'mumbai-day': 'chennai-day',
    'mumbaiday': 'chennai-day',
    'chennaiday': 'chennai-day',
    'चेन्नईडे': 'chennai-day',
    'मुंबईडे': 'chennai-day',
    'sadar-bazar': 'sadar-bazar',
    'sadarbazar': 'sadar-bazar',
    'सदरबाजार': 'sadar-bazar',
    'gwalior': 'gwalior',
    'ग्वालियर': 'gwalior',
    'delhi-bazar': 'delhi-bazar',
    'delhibazar': 'delhi-bazar',
    'दिल्लीबाजार': 'delhi-bazar',
    'bhopal-city': 'udaipur-town',
    'bhopalcity': 'udaipur-town',
    'udaipurtown': 'udaipur-town',
    'उदयपुरटाउन': 'udaipur-town',
    'भोपालसिटी': 'udaipur-town',
    'shree-ganesh': 'shree-ganesh',
    'shreeganesh': 'shree-ganesh',
    'श्रीगणेश': 'shree-ganesh',
    'jaipur-city': 'bombay-city',
    'jaipurcity': 'bombay-city',
    'bombaycity': 'bombay-city',
    'बॉम्बेसिटी': 'bombay-city',
    'जयपुरसिटी': 'bombay-city',
    'faridabad': 'faridabad',
    'फरीदाबाद': 'faridabad',
    'surat': 'dehradun-bazar',
    'suratcity': 'dehradun-bazar',
    'dehradunbazar': 'dehradun-bazar',
    'देहरादूनबाजार': 'dehradun-bazar',
    'सूरत': 'dehradun-bazar',
    'alwar': 'alwar',
    'अलवर': 'alwar',
    'gaziyabad': 'gaziyabad',
    'गाज़ियाबाद': 'gaziyabad',
    'गाज़ियाबाद': 'gaziyabad',
    'pune-night': 'ayodhya-nagari',
    'punenight': 'ayodhya-nagari',
    'ayodhyanagari': 'ayodhya-nagari',
    'अयोध्यानगरी': 'ayodhya-nagari',
    'पुणेनाईट': 'ayodhya-nagari',
    'gali': 'gali',
    'गली': 'gali',
    'disawar': 'disawar',
    'दिसावर': 'disawar'
};

function getCanonicalGameKey(gameObj) {
    if (!gameObj) return '';
    if (gameObj.id) {
        const normId = normalizeGameName(gameObj.id);
        if (GAME_ALIASES[normId]) return GAME_ALIASES[normId];
    }
    if (gameObj.slug) {
        const normSlug = normalizeGameName(gameObj.slug);
        if (GAME_ALIASES[normSlug]) return GAME_ALIASES[normSlug];
    }
    if (gameObj.name) {
        const normName = normalizeGameName(gameObj.name);
        if (GAME_ALIASES[normName]) return GAME_ALIASES[normName];
        return normName;
    }
    return '';
}

// 4. Main Archive Execution Function
async function main() {
    try {
        const db = getDatabase();
        const rootRef = db.ref('a7satta');

        const customDateArg = process.argv[2] || null;
        const forceFlag = process.argv.includes('--force');

        const target = getKolkataTargetDate(customDateArg);
        const { dateDDMM, dateDDMMYYYY, fullISO } = target;

        console.log(`\n======================================================`);
        console.log(`[ARCHIVE SCRIPT] Starting Daily Result Archiving`);
        console.log(`[ARCHIVE SCRIPT] Target Date: ${dateDDMMYYYY} (ISO: ${fullISO}, Monthly key: ${dateDDMM})`);
        console.log(`======================================================\n`);

        const snapshot = await rootRef.once('value');
        const data = snapshot.val() || {};

        // Idempotency Check via Archive Marker
        const archiveStatus = data.archive_status || {};
        const existingMarker = archiveStatus[fullISO];

        if (existingMarker && existingMarker.status === 'completed' && !forceFlag) {
            console.log(`[ARCHIVE SKIPPED] Date ${dateDDMMYYYY} (${fullISO}) was already successfully archived at ${existingMarker.completedAt}. Skipping rollover.`);
            console.log(`[ARCHIVE SUCCESS] No action needed.`);
            process.exit(0);
        }

        const primaryGames = Array.isArray(data.games_primary) ? data.games_primary : [];
        const secondaryGames = Array.isArray(data.games_secondary) ? data.games_secondary : [];
        const allGames = [...primaryGames, ...secondaryGames];

        if (allGames.length === 0) {
            console.warn('[ARCHIVE CANCELLED] No games found in database at a7satta/games_primary.');
            process.exit(0);
        }

        const sanitizeResult = (val) => {
            if (!val || typeof val !== 'string') return '-';
            const trimmed = val.trim();
            if (trimmed === '' || trimmed === '--' || trimmed === '-' || trimmed.toUpperCase() === 'WAIT') {
                return '-';
            }
            return trimmed;
        };

        const gameResultMap = new Map();
        const missingGames = [];

        allGames.forEach(g => {
            const canonicalKey = getCanonicalGameKey(g);
            const resVal = sanitizeResult(g.today);
            gameResultMap.set(canonicalKey, resVal);

            if (g.name) gameResultMap.set(normalizeGameName(g.name), resVal);
            if (g.slug) gameResultMap.set(normalizeGameName(g.slug), resVal);

            if (resVal === '-') {
                missingGames.push(g.name || g.slug || g.id);
            }
        });

        console.log(`[ARCHIVE GAMES] Extracted ${allGames.length} games.`);
        if (missingGames.length > 0) {
            console.log(`[ARCHIVE GAMES] Missing/Pending results for ${missingGames.length} games:`, missingGames.join(', '));
        }

        const chart1Headers = Array.isArray(data.chart1_headers) ? data.chart1_headers : ["चेन्नई डे", "सदर बाजार", "ग्वालियर", "दिल्ली बाजार", "उदयपुर टाउन"];
        const chart2Headers = Array.isArray(data.chart2_headers) ? data.chart2_headers : ["श्री गणेश", "बॉम्बे सिटी", "फरीदाबाद", "देहरादून बाजार", "अलवर"];
        const chart3Headers = Array.isArray(data.chart3_headers) ? data.chart3_headers : ["गाज़ियाबाद", "अयोध्या नगरी", "गली", "दिसावर"];
        const fullChartHeaders = Array.isArray(data.fullchart_headers) ? data.fullchart_headers : [...chart1Headers, ...chart2Headers, ...chart3Headers];

        const getResultForHeader = (headerName) => {
            const normHeader = normalizeGameName(headerName);
            const canonicalHeader = GAME_ALIASES[normHeader] || normHeader;

            if (gameResultMap.has(canonicalHeader)) return gameResultMap.get(canonicalHeader);
            if (gameResultMap.has(normHeader)) return gameResultMap.get(normHeader);
            return '-';
        };

        // Non-Destructive Update Row Logic (NEVER overwrite existing valid values with "-")
        const updateOrInsertRow = (chartArray, dateKey, headersList, prefix) => {
            const rows = Array.isArray(chartArray) ? [...chartArray] : [];
            const existingIdx = rows.findIndex(r => r && r.date === dateKey);

            if (existingIdx !== -1) {
                const existingRow = rows[existingIdx];
                const existingValues = Array.isArray(existingRow.values) ? existingRow.values : [];
                const mergedValues = headersList.map((header, idx) => {
                    const newVal = getResultForHeader(header);
                    const oldVal = existingValues[idx];

                    if (newVal === '-' || newVal === '') {
                        if (oldVal && oldVal !== '-' && oldVal !== '' && oldVal !== 'WAIT') {
                            return oldVal; // PRESERVE existing valid result!
                        }
                    }
                    return newVal;
                });

                rows[existingIdx] = {
                    ...existingRow,
                    values: mergedValues
                };
                console.log(`[CHART UPDATE] Updated row for date "${dateKey}" in ${prefix} (Non-destructive merge)`);
            } else {
                const cleanKey = dateKey.replace(/-/g, '');
                const newValues = headersList.map(header => getResultForHeader(header));
                rows.push({
                    id: `${prefix}_r${cleanKey}`,
                    date: dateKey,
                    values: newValues
                });
                console.log(`[CHART INSERT] Created new row for date "${dateKey}" in ${prefix}`);
            }
            return rows;
        };

        // Process destination monthly charts (year_chart_data is EXCLUDED)
        const updatedChart1Data = updateOrInsertRow(data.chart1_data, dateDDMM, chart1Headers, 'c1');
        const updatedChart2Data = updateOrInsertRow(data.chart2_data, dateDDMM, chart2Headers, 'c2');
        const updatedChart3Data = updateOrInsertRow(data.chart3_data, dateDDMM, chart3Headers, 'c3');
        const updatedFullChartData = updateOrInsertRow(data.fullchart_data, dateDDMM, fullChartHeaders, 'fc');

        // Step 2: Determine if Month Boundary Rollover is required
        // Check current Kolkata year-month vs target archive year-month
        const kolkataFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
        const currentKolkataDateStr = kolkataFormatter.format(new Date()); // YYYY-MM-DD
        const currentKolkataMonth = currentKolkataDateStr.substring(0, 7); // YYYY-MM
        const targetMonth = fullISO.substring(0, 7); // YYYY-MM
        const targetYear = fullISO.substring(0, 4);  // YYYY
        const targetMonthMM = fullISO.substring(5, 7); // MM

        // Idempotency check via month_rollover_status marker
        const monthRolloverStatus = data.month_rollover_status || {};
        const existingRolloverMarker = monthRolloverStatus[targetMonth];
        const isRolloverCompleted = existingRolloverMarker && existingRolloverMarker.status === 'completed';

        let finalChart1Data = updatedChart1Data;
        let finalChart2Data = updatedChart2Data;
        let finalChart3Data = updatedChart3Data;
        let finalFullChartData = updatedFullChartData;

        let shouldPerformRollover = false;

        if (currentKolkataMonth > targetMonth) {
            if (!isRolloverCompleted) {
                shouldPerformRollover = true;
            } else {
                console.log(`[MONTH ROLLOVER SKIPPED] Month ${targetMonth} rollover was already completed. Skipping rollover.`);
            }
        } else {
            console.log(`[MONTH ROLLOVER NOT NEEDED] Current month (${currentKolkataMonth}) is not past target archive month (${targetMonth}).`);
        }

        const updates = {};

        if (shouldPerformRollover) {
            console.log(`\n------------------------------------------------------`);
            console.log(`[MONTH ROLLOVER TRIGGERED] Transitioning from ${targetMonth} to ${currentKolkataMonth}`);
            console.log(`------------------------------------------------------\n`);

            // 1. Copy completed month full chart to prev_fullchart_headers and prev_fullchart_data
            updates['prev_fullchart_headers'] = fullChartHeaders;
            updates['prev_fullchart_data'] = updatedFullChartData;
            console.log(`[MONTH ROLLOVER] Copied completed month ${targetMonth} to prev_fullchart_headers & prev_fullchart_data (${updatedFullChartData.length} rows)`);

            // 2. Merge completed month rows into year_chart_headers and year_chart_data
            const existingYearChartHeaders = Array.isArray(data.year_chart_headers) && data.year_chart_headers.length > 0
                ? data.year_chart_headers
                : fullChartHeaders;
            const existingYearChartData = Array.isArray(data.year_chart_data) ? [...data.year_chart_data] : [];

            const isValidValue = (val) => {
                if (val === undefined || val === null) return false;
                const str = String(val).trim();
                if (str === '' || str === '-' || str === '--' || str.toUpperCase() === 'WAIT') return false;
                return true;
            };

            // Merge each row from updatedFullChartData into year_chart_data
            updatedFullChartData.forEach(row => {
                if (!row || !row.date) return;
                const parts = row.date.split('-');
                let fullDateStr = row.date;
                if (parts.length === 2) {
                    // Convert DD-MM to DD-MM-YYYY using target year
                    fullDateStr = `${parts[0]}-${parts[1]}-${targetYear}`;
                }

                const existingIdx = existingYearChartData.findIndex(yr => yr && yr.date === fullDateStr);
                const rowValues = Array.isArray(row.values) ? row.values : [];

                if (existingIdx !== -1) {
                    const existingRow = existingYearChartData[existingIdx];
                    const existingVals = Array.isArray(existingRow.values) ? existingRow.values : [];
                    const mergedVals = fullChartHeaders.map((header, idx) => {
                        const newVal = rowValues[idx];
                        const oldVal = existingVals[idx];
                        if (isValidValue(oldVal) && !isValidValue(newVal)) {
                            return oldVal; // PRESERVE existing valid result!
                        }
                        return isValidValue(newVal) ? newVal : (isValidValue(oldVal) ? oldVal : '-');
                    });
                    existingYearChartData[existingIdx] = {
                        ...existingRow,
                        date: fullDateStr,
                        values: mergedVals
                    };
                } else {
                    const cleanDateKey = fullDateStr.replace(/-/g, '');
                    const newVals = fullChartHeaders.map((header, idx) => {
                        const newVal = rowValues[idx];
                        return isValidValue(newVal) ? newVal : '-';
                    });
                    existingYearChartData.push({
                        id: `yc_r${cleanDateKey}`,
                        date: fullDateStr,
                        values: newVals
                    });
                }
            });

            // Sort year_chart_data chronologically by DD-MM-YYYY date
            existingYearChartData.sort((a, b) => {
                if (!a || !a.date) return -1;
                if (!b || !b.date) return 1;
                const [d1, m1, y1] = a.date.split('-').map(Number);
                const [d2, m2, y2] = b.date.split('-').map(Number);
                if (y1 !== y2) return y1 - y2;
                if (m1 !== m2) return m1 - m2;
                return d1 - d2;
            });

            updates['year_chart_headers'] = fullChartHeaders;
            updates['year_chart_data'] = existingYearChartData;
            console.log(`[MONTH ROLLOVER] Merged ${updatedFullChartData.length} completed month rows into year_chart_data (Total rows in year_chart_data: ${existingYearChartData.length})`);

            // 3. Mark month rollover as completed for targetMonth (e.g. 2026-08)
            updates[`month_rollover_status/${targetMonth}`] = {
                status: 'completed',
                month: targetMonthMM,
                year: targetYear,
                completedAt: new Date().toISOString()
            };
            console.log(`[MONTH ROLLOVER] Marked month_rollover_status/${targetMonth} as completed`);

            // 4. Reset ONLY current monthly arrays (Do NOT reset headers)
            finalChart1Data = [];
            finalChart2Data = [];
            finalChart3Data = [];
            finalFullChartData = [];
            console.log(`[MONTH ROLLOVER] Reset current monthly arrays (chart1_data, chart2_data, chart3_data, fullchart_data) to []`);
        }

        // Game state rollover: Move today -> yesterday and clear today for next day ONLY on confirmed archive
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

        // Atomic Multi-Location Write to Firebase Realtime Database
        updates['games_primary'] = updatedPrimaryGames;
        if (secondaryGames.length > 0) updates['games_secondary'] = updatedSecondaryGames;
        updates['chart1_data'] = finalChart1Data;
        updates['chart2_data'] = finalChart2Data;
        updates['chart3_data'] = finalChart3Data;
        updates['fullchart_data'] = finalFullChartData;

        // Set archive status marker
        updates[`archive_status/${fullISO}`] = {
            status: 'completed',
            completedAt: new Date().toISOString(),
            dateDDMMYYYY: dateDDMMYYYY,
            gamesArchived: allGames.length - missingGames.length,
            missingGamesCount: missingGames.length
        };

        await rootRef.update(updates);

        console.log(`\n✔ [SUCCESS] Successfully archived results for date ${dateDDMMYYYY} (${fullISO}) into Realtime Database.`);
        if (shouldPerformRollover) {
            console.log(`✔ [SUCCESS] Month rollover completed for month ${targetMonth}. Prev month chart and Year chart updated.`);
        }
        process.exit(0);
    } catch (err) {
        console.error(`\n❌ [ERROR] Archiving failed:`, err);
        process.exit(1);
    }
}

main();
