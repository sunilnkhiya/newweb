// ============================================================
// A7 SATTA - Admin Panel Logic
// ============================================================

// Auth check
function checkAuth() {
    if (sessionStorage.getItem('a7_logged_in') !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    sessionStorage.removeItem('a7_logged_in');
    sessionStorage.removeItem('a7_settings_unlocked');
    window.location.href = 'login.html';
}

// Toast notification
function showToast(message, type) {
    type = type || 'success';
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast-notification ' + type + ' show';
    setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

// ============================================================
// Settings Passkey Security Gate
// ============================================================

function getSettingsPasskey() {
    if (typeof window !== 'undefined' && window.ENV_CONFIG && window.ENV_CONFIG.SETTINGS_PASSKEY) {
        return window.ENV_CONFIG.SETTINGS_PASSKEY;
    }
    return "SecurityxAdmin2026";
}

function verifySettingsPasskey() {
    var inputEl = document.getElementById('settings-passkey-input');
    if (!inputEl) return;
    var entered = inputEl.value.trim();
    var correct = getSettingsPasskey();

    if (entered === correct) {
        sessionStorage.setItem('a7_settings_unlocked', 'true');
        showToast('Settings Unlocked Successfully!', 'success');
        updateSettingsGateState();
    } else {
        showToast('Invalid Security Passkey!', 'error');
        inputEl.style.borderColor = '#dc2626';
        inputEl.classList.add('flash-red');
        setTimeout(function() { inputEl.classList.remove('flash-red'); }, 500);
    }
}

function updateSettingsGateState() {
    var lockScreen = document.getElementById('settings-lock-screen');
    var unlockedContent = document.getElementById('settings-unlocked-content');
    if (!lockScreen || !unlockedContent) return;

    if (sessionStorage.getItem('a7_settings_unlocked') === 'true') {
        lockScreen.style.display = 'none';
        unlockedContent.style.display = 'block';
    } else {
        lockScreen.style.display = 'block';
        unlockedContent.style.display = 'none';
    }
}

// ============================================================
// Tab System
// ============================================================

function switchTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
    
    var tabBtn = document.querySelector('[data-tab="' + tabName + '"]');
    var tabContent = document.getElementById('tab-' + tabName);
    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');

    if (tabName === 'settings') {
        updateSettingsGateState();
    }
}

// ============================================================
// Inline Cell Editing
// ============================================================

function makeEditable(cell, saveCallback) {
    if (cell.classList.contains('editing')) return;
    
    var currentValue = cell.textContent.trim();
    cell.classList.add('editing');
    
    var input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    function save() {
        var newValue = input.value.trim();
        cell.classList.remove('editing');
        cell.textContent = newValue;
        if (saveCallback) saveCallback(newValue);
        cell.classList.add('flash-green');
        setTimeout(function() { cell.classList.remove('flash-green'); }, 500);
        showToast('Saved!');
    }

    function cancel() {
        cell.classList.remove('editing');
        cell.textContent = currentValue;
    }

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
        if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    });

    input.addEventListener('blur', function() {
        setTimeout(save, 100);
    });
}

// ============================================================
// Render Admin Tables
// ============================================================

function renderAdminPrimaryTable() {
    var container = document.getElementById('admin-primary-table');
    if (!container) return;
    var games = getData('games_primary');
    if (!games) return;

    var html = '<table class="admin-table"><thead><tr>';
    html += '<th>#</th><th>Game Name</th><th>Slug</th><th>Time</th><th>Yesterday</th><th>Today</th><th>Actions</th>';
    html += '</tr></thead><tbody>';

    games.forEach(function(game, i) {
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td class="editable-cell" onclick="editPrimaryCell(' + i + ',\'name\',this)">' + game.name + '</td>';
        html += '<td class="editable-cell" onclick="editPrimaryCell(' + i + ',\'slug\',this)">' + game.slug + '</td>';
        html += '<td class="editable-cell" onclick="editPrimaryCell(' + i + ',\'time\',this)">' + game.time + '</td>';
        html += '<td class="editable-cell" onclick="editPrimaryCell(' + i + ',\'yesterday\',this)">' + (game.yesterday || '--') + '</td>';
        html += '<td class="editable-cell" onclick="editPrimaryCell(' + i + ',\'today\',this)">' + (game.today || '--') + '</td>';
        html += '<td class="row-actions"><button class="btn-admin btn-danger" onclick="deletePrimaryRow(' + i + ')">✕</button></td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    html += '<div class="mt-10"><button class="btn-admin btn-success" onclick="addPrimaryRow()">+ Add Game</button></div>';
    container.innerHTML = html;
}

function editPrimaryCell(index, field, cell) {
    makeEditable(cell, function(newValue) {
        var games = getData('games_primary');
        games[index][field] = newValue;
        setData('games_primary', games);
    });
}

function addPrimaryRow() {
    var games = getData('games_primary');
    games.push({ name: "NEW GAME", slug: "new-game", time: "00:00 PM", yesterday: "--", today: "" });
    setData('games_primary', games);
    renderAdminPrimaryTable();
    showToast('Game added!');
}

function deletePrimaryRow(index) {
    if (!confirm('Delete this game?')) return;
    var games = getData('games_primary');
    games.splice(index, 1);
    setData('games_primary', games);
    renderAdminPrimaryTable();
    showToast('Game deleted!', 'error');
}

// --- Secondary Table ---

function renderAdminSecondaryTable() {
    var container = document.getElementById('admin-secondary-table');
    if (!container) return;
    var games = getData('games_secondary');
    if (!games) return;

    var html = '<table class="admin-table"><thead><tr>';
    html += '<th>#</th><th>Game Name</th><th>Slug</th><th>Time</th><th>Yesterday</th><th>Today</th><th>Actions</th>';
    html += '</tr></thead><tbody>';

    games.forEach(function(game, i) {
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td class="editable-cell" onclick="editSecondaryCell(' + i + ',\'name\',this)">' + game.name + '</td>';
        html += '<td class="editable-cell" onclick="editSecondaryCell(' + i + ',\'slug\',this)">' + game.slug + '</td>';
        html += '<td class="editable-cell" onclick="editSecondaryCell(' + i + ',\'time\',this)">' + game.time + '</td>';
        html += '<td class="editable-cell" onclick="editSecondaryCell(' + i + ',\'yesterday\',this)">' + (game.yesterday || '--') + '</td>';
        html += '<td class="editable-cell" onclick="editSecondaryCell(' + i + ',\'today\',this)">' + (game.today || '--') + '</td>';
        html += '<td class="row-actions"><button class="btn-admin btn-danger" onclick="deleteSecondaryRow(' + i + ')">✕</button></td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    html += '<div class="mt-10"><button class="btn-admin btn-success" onclick="addSecondaryRow()">+ Add Game</button></div>';
    container.innerHTML = html;
}

function editSecondaryCell(index, field, cell) {
    makeEditable(cell, function(newValue) {
        var games = getData('games_secondary');
        games[index][field] = newValue;
        setData('games_secondary', games);
    });
}

function addSecondaryRow() {
    var games = getData('games_secondary');
    games.push({ name: "NEW GAME", slug: "new-game", time: "00:00 PM", yesterday: "--", today: "" });
    setData('games_secondary', games);
    renderAdminSecondaryTable();
    showToast('Game added!');
}

function deleteSecondaryRow(index) {
    if (!confirm('Delete this game?')) return;
    var games = getData('games_secondary');
    games.splice(index, 1);
    setData('games_secondary', games);
    renderAdminSecondaryTable();
    showToast('Game deleted!', 'error');
}

// --- Featured Result ---

function renderAdminFeatured() {
    var container = document.getElementById('admin-featured');
    if (!container) return;
    var featured = getData('featured');
    if (!featured) return;

    var html = '<table class="admin-table"><thead><tr>';
    html += '<th>Game Name</th><th>Slug</th><th>Time</th><th>Previous Result</th><th>Current Result</th>';
    html += '</tr></thead><tbody><tr>';
    html += '<td class="editable-cell" onclick="editFeaturedField(\'name\',this)">' + featured.name + '</td>';
    html += '<td class="editable-cell" onclick="editFeaturedField(\'slug\',this)">' + featured.slug + '</td>';
    html += '<td class="editable-cell" onclick="editFeaturedField(\'time\',this)">' + featured.time + '</td>';
    html += '<td class="editable-cell" onclick="editFeaturedField(\'previous\',this)">' + featured.previous + '</td>';
    html += '<td class="editable-cell" onclick="editFeaturedField(\'current\',this)">' + featured.current + '</td>';
    html += '</tr></tbody></table>';
    container.innerHTML = html;
}

function editFeaturedField(field, cell) {
    makeEditable(cell, function(newValue) {
        var featured = getData('featured');
        featured[field] = newValue;
        setData('featured', featured);
    });
}

// --- Chart Tables ---

function renderAdminChart(containerId, headerKey, dataKey, chartIndex) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var headers = getData(headerKey);
    var data = getData(dataKey);
    if (!headers || !data) return;

    var colCount = headers.length;

    var html = '<div class="table-scroll"><table class="admin-table chart-editor-table" id="chart-table-' + chartIndex + '">';

    // === HEADER ROW ===
    html += '<thead><tr>';
    // Select-all checkbox
    html += '<th class="chart-select-col"><input type="checkbox" class="chart-select-all" id="sel-all-' + chartIndex + '" onchange="toggleSelectAllChartRows(' + chartIndex + ',this)" title="Select all rows"></th>';
    html += '<th class="chart-date-col">दिनांक</th>';
    headers.forEach(function(h, hi) {
        html += '<th style="min-width:90px;position:relative;">';
        html += '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">';
        html += '<span class="editable-cell chart-header-cell" onclick="editChartHeader(' + chartIndex + ',' + hi + ',this)" title="Click to rename">' + h + '</span>';
        html += '<button class="btn-admin btn-danger btn-xs col-del-btn" onclick="deleteChartColumn(' + chartIndex + ',' + hi + ')" title="Delete column ✕" style="padding:1px 7px;font-size:10px;margin-top:2px;">✕ Col</button>';
        html += '</div></th>';
    });
    html += '<th class="row-actions-col">Row Actions</th>';
    html += '</tr></thead>';

    // === DATA ROWS ===
    html += '<tbody>';
    data.forEach(function(row, ri) {
        html += '<tr class="chart-row" data-row="' + ri + '">';
        // Row checkbox
        html += '<td class="chart-select-cell"><input type="checkbox" class="chart-row-check" data-chart="' + chartIndex + '" data-row="' + ri + '" onchange="onChartRowCheckChange(' + chartIndex + ')"></td>';
        html += '<td class="editable-cell forfirtcolor chart-date-cell" onclick="editChartDate(' + chartIndex + ',' + ri + ',this)" title="Click to edit date">' + row.date + '</td>';
        for (var vi = 0; vi < colCount; vi++) {
            var val = (row.values && row.values[vi] !== undefined) ? row.values[vi] : '-';
            html += '<td class="editable-cell chart-value-cell" onclick="editChartValue(' + chartIndex + ',' + ri + ',' + vi + ',this)" title="Click to edit">' + val + '</td>';
        }
        html += '<td class="row-actions"><button class="btn-admin btn-danger btn-xs" onclick="deleteChartRow(' + chartIndex + ',' + ri + ')" title="Delete row">✕ Row</button></td>';
        html += '</tr>';
    });
    html += '</tbody>';

    // === FOOTER ===
    html += '<tfoot><tr>';
    html += '<td colspan="' + (colCount + 3) + '" style="text-align:left;padding:8px 6px;background:#f8fafc;">';
    html += '<button class="btn-admin btn-success" onclick="addChartRow(' + chartIndex + ')" style="margin-right:8px;">＋ Add Row</button>';
    html += '<button class="btn-admin btn-info" onclick="addChartColumnInline(' + chartIndex + ')" style="margin-right:8px;">＋ Add Column</button>';
    html += '<button class="btn-admin btn-danger chart-bulk-del-btn" id="bulk-del-' + chartIndex + '" onclick="deleteSelectedChartRows(' + chartIndex + ')" style="display:none;">🗑 Delete Selected</button>';
    html += '</td></tr></tfoot>';

    html += '</table></div>';
    container.innerHTML = html;
}

// Toggle all row checkboxes in a chart table
function toggleSelectAllChartRows(chartIndex, masterCb) {
    var checks = document.querySelectorAll('.chart-row-check[data-chart="' + chartIndex + '"]');
    checks.forEach(function(cb) {
        cb.checked = masterCb.checked;
        var row = cb.closest('tr');
        if (row) row.classList.toggle('chart-row-selected', masterCb.checked);
    });
    onChartRowCheckChange(chartIndex);
}

// Show/hide bulk-delete button based on selection count
function onChartRowCheckChange(chartIndex) {
    var checks = document.querySelectorAll('.chart-row-check[data-chart="' + chartIndex + '"]');
    var selected = 0;
    checks.forEach(function(cb) {
        var row = cb.closest('tr');
        if (cb.checked) {
            selected++;
            if (row) row.classList.add('chart-row-selected');
        } else {
            if (row) row.classList.remove('chart-row-selected');
        }
    });
    var bulkBtn = document.getElementById('bulk-del-' + chartIndex);
    if (bulkBtn) {
        bulkBtn.style.display = selected > 0 ? 'inline-block' : 'none';
        bulkBtn.textContent = '🗑 Delete Selected (' + selected + ')';
    }
    // Update select-all indeterminate state
    var selAll = document.getElementById('sel-all-' + chartIndex);
    if (selAll) {
        selAll.checked = selected === checks.length && checks.length > 0;
        selAll.indeterminate = selected > 0 && selected < checks.length;
    }
}

// Delete all selected rows in one go
function deleteSelectedChartRows(chartIndex) {
    var checks = document.querySelectorAll('.chart-row-check[data-chart="' + chartIndex + '"]:checked');
    if (checks.length === 0) return;
    if (!confirm('Delete ' + checks.length + ' selected row(s)?')) return;

    var keys = getChartKeys(chartIndex);
    var data = getData(keys.data);
    // Collect row indices in descending order so splicing doesn't shift indices
    var indices = [];
    checks.forEach(function(cb) { indices.push(parseInt(cb.getAttribute('data-row'), 10)); });
    indices.sort(function(a, b) { return b - a; });
    indices.forEach(function(ri) { data.splice(ri, 1); });

    setData(keys.data, data);
    renderAdminChart(getChartContainerId(chartIndex), keys.header, keys.data, chartIndex);
    showToast(checks.length + ' row(s) deleted!', 'error');
}

function getChartKeys(chartIndex) {
    var maps = [
        { header: 'chart1_headers', data: 'chart1_data' },
        { header: 'chart2_headers', data: 'chart2_data' },
        { header: 'chart3_headers', data: 'chart3_data' },
        { header: 'fullchart_headers', data: 'fullchart_data' },
        { header: 'prev_fullchart_headers', data: 'prev_fullchart_data' }
    ];
    return maps[chartIndex];
}

function getChartContainerId(chartIndex) {
    var ids = ['admin-chart1', 'admin-chart2', 'admin-chart3', 'admin-fullchart', 'admin-prev-fullchart'];
    return ids[chartIndex];
}

function editChartHeader(chartIndex, headerIndex, cell) {
    var keys = getChartKeys(chartIndex);
    makeEditable(cell, function(newValue) {
        var headers = getData(keys.header);
        headers[headerIndex] = newValue;
        setData(keys.header, headers);
    });
}

function editChartDate(chartIndex, rowIndex, cell) {
    var keys = getChartKeys(chartIndex);
    makeEditable(cell, function(newValue) {
        var data = getData(keys.data);
        data[rowIndex].date = newValue;
        setData(keys.data, data);
    });
}

function editChartValue(chartIndex, rowIndex, valueIndex, cell) {
    var keys = getChartKeys(chartIndex);
    makeEditable(cell, function(newValue) {
        var data = getData(keys.data);
        data[rowIndex].values[valueIndex] = newValue;
        setData(keys.data, data);
    });
}

function addChartRow(chartIndex) {
    var keys = getChartKeys(chartIndex);
    var headers = getData(keys.header);
    var data = getData(keys.data);
    var emptyValues = headers.map(function() { return '-'; });
    data.push({ date: 'NEW', values: emptyValues });
    setData(keys.data, data);
    renderAdminChart(getChartContainerId(chartIndex), keys.header, keys.data, chartIndex);
    showToast('Row added!');
}

function deleteChartRow(chartIndex, rowIndex) {
    if (!confirm('Delete row ' + (rowIndex + 1) + '?')) return;
    var keys = getChartKeys(chartIndex);
    var data = getData(keys.data);
    data.splice(rowIndex, 1);
    setData(keys.data, data);
    renderAdminChart(getChartContainerId(chartIndex), keys.header, keys.data, chartIndex);
    showToast('Row deleted!', 'error');
}

function addChartColumnInline(chartIndex) {
    var name = prompt('Enter new column (game) name:');
    if (!name || !name.trim()) return;
    var keys = getChartKeys(chartIndex);
    var headers = getData(keys.header);
    var data = getData(keys.data);
    headers.push(name.trim());
    data.forEach(function(row) {
        if (!row.values) row.values = [];
        row.values.push('-');
    });
    setData(keys.header, headers);
    setData(keys.data, data);
    renderAdminChart(getChartContainerId(chartIndex), keys.header, keys.data, chartIndex);
    showToast('Column "' + name.trim() + '" added!');
}

// Keep old name as alias
function addChartColumn(chartIndex) {
    addChartColumnInline(chartIndex);
}

function deleteChartColumn(chartIndex, colIndex) {
    var keys = getChartKeys(chartIndex);
    var headers = getData(keys.header);
    var colName = headers[colIndex] || ('Column ' + (colIndex + 1));
    if (!confirm('Delete column "' + colName + '"? This will remove all values in this column.')) return;
    headers.splice(colIndex, 1);
    var data = getData(keys.data);
    data.forEach(function(row) {
        if (row.values && row.values.length > colIndex) {
            row.values.splice(colIndex, 1);
        }
    });
    setData(keys.header, headers);
    setData(keys.data, data);
    renderAdminChart(getChartContainerId(chartIndex), keys.header, keys.data, chartIndex);
    showToast('Column "' + colName + '" deleted!', 'error');
}

// --- Marquee Editor ---

function renderAdminMarquee() {
    var container = document.getElementById('admin-marquee');
    if (!container) return;
    var marquee = getData('marquee');

    var html = '<textarea class="admin-textarea" id="marquee-input">' + (marquee || '') + '</textarea>';
    html += '<div class="mt-10"><button class="btn-admin" onclick="saveMarquee()">💾 Save Marquee</button></div>';
    container.innerHTML = html;
}

function saveMarquee() {
    var val = document.getElementById('marquee-input').value;
    setData('marquee', val);
    showToast('Marquee saved!');
}

// --- Hindi Text Editor ---

function renderAdminHindiText() {
    var container = document.getElementById('admin-hindi');
    if (!container) return;
    var text = getData('hindi_text');

    var html = '<input class="admin-input" id="hindi-input" value="' + (text || '') + '">';
    html += '<div class="mt-10"><button class="btn-admin" onclick="saveHindiText()">💾 Save</button></div>';
    container.innerHTML = html;
}

function saveHindiText() {
    var val = document.getElementById('hindi-input').value;
    setData('hindi_text', val);
    showToast('Hindi text saved!');
}

// --- Ad Content Editor (Easy Schedule Form & Raw HTML Dual Mode) ---

var currentAdEditorTab = 'easy';

function switchAdEditorTab(mode) {
    currentAdEditorTab = mode;
    renderAdminAdContent();
}

function renderAdminAdContent() {
    var container = document.getElementById('admin-ad');
    if (!container) return;

    var schedule = getData('ad_schedule') || (typeof DEFAULT_AD_SCHEDULE !== 'undefined' ? DEFAULT_AD_SCHEDULE : {});
    var rawContent = getData('ad_content') || '';

    var html = '<div style="margin-bottom:15px;display:flex;gap:10px;">';
    html += '<button class="btn-admin ' + (currentAdEditorTab === 'easy' ? 'btn-success' : 'btn-info') + '" onclick="switchAdEditorTab(\'easy\')" style="padding:10px 20px;font-size:13px;font-weight:700;">📋 Easy Schedule Editor (Name & Time)</button>';
    html += '<button class="btn-admin ' + (currentAdEditorTab === 'raw' ? 'btn-success' : 'btn-info') + '" onclick="switchAdEditorTab(\'raw\')" style="padding:10px 20px;font-size:13px;font-weight:700;">💻 Raw HTML Editor</button>';
    html += '</div>';

    if (currentAdEditorTab === 'easy') {
        html += '<div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:20px;">';
        
        // Header Titles
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">';
        html += '<div><label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">Top Header Line</label>';
        html += '<input class="admin-input" id="ad-top-header" value="' + (schedule.topHeader || '') + '" placeholder="e.g. --सीधे सट्टा कंपनी का No 1 खाईवाल--"></div>';
        html += '<div><label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">Khaiwal Subtitle / Name</label>';
        html += '<input class="admin-input" id="ad-khaiwal-name" value="' + (schedule.khaiwalName || '') + '" placeholder="e.g. KHAIWAL NAME"></div>';
        html += '</div>';

        // Game Schedule Timings List
        html += '<div style="margin-bottom:20px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:10px;">';
        html += '<label style="color:#0f172a;font-weight:900;font-size:15px;margin:0;">⏰ Game Timings Schedule List</label>';
        html += '<div><button class="btn-admin btn-info" onclick="syncAdScheduleFromPrimaryGames()">🔄 Import Games from Primary Results Table</button> ';
        html += '<button class="btn-admin btn-success" onclick="addAdScheduleRow()">➕ Add Timing Row</button></div>';
        html += '</div>';

        html += '<div class="table-scroll"><table class="admin-table">';
        html += '<thead><tr><th style="width:50px;">#</th><th style="width:60px;">Icon</th><th>Game Name (गेम का नाम)</th><th>Scheduled Time (समय)</th><th style="width:80px;">Action</th></tr></thead>';
        html += '<tbody>';

        var items = schedule.items || [];
        if (items.length === 0) {
            html += '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:20px;">No timing rows added yet. Click "+ Add Timing Row" above.</td></tr>';
        } else {
            items.forEach(function(item, idx) {
                html += '<tr>';
                html += '<td>' + (idx + 1) + '</td>';
                html += '<td style="font-size:22px;">⏰</td>';
                html += '<td><input class="admin-input" id="ad-item-name-' + idx + '" value="' + (item.name || '') + '" placeholder="e.g. कानपुर डे"></td>';
                html += '<td><input class="admin-input" id="ad-item-time-' + idx + '" value="' + (item.time || '') + '" placeholder="e.g. 12:30 Pm"></td>';
                html += '<td><button class="btn-admin btn-danger" onclick="deleteAdScheduleRow(' + idx + ')">❌</button></td>';
                html += '</tr>';
            });
        }
        html += '</tbody></table></div>';
        html += '</div>';

        // Rates & WhatsApp Link
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">';
        html += '<div><label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">Jodi Rate (जोड़ी रेट)</label>';
        html += '<input class="admin-input" id="ad-jodi-rate" value="' + (schedule.jodiRate || '') + '" placeholder="e.g. जोड़ी रेट 10-------960"></div>';
        html += '<div><label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">Haruf Rate (हरूफ रेट)</label>';
        html += '<input class="admin-input" id="ad-haruf-rate" value="' + (schedule.harufRate || '') + '" placeholder="e.g. हरूफ रेट 100-----960"></div>';
        html += '</div>';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;margin-bottom:15px;">';
        html += '<div><label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">WhatsApp Button Text</label>';
        html += '<input class="admin-input" id="ad-link-text" value="' + (schedule.linkText || '') + '" placeholder="e.g. Game play करने के लिये नीचे लिंक पर क्लिक करे"></div>';
        html += '<div><label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">WhatsApp Mobile Number</label>';
        html += '<input class="admin-input" id="ad-whatsapp-phone" value="' + (schedule.whatsappPhone || '917027405875') + '" placeholder="e.g. 917027405875"></div>';
        html += '<div><label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">WhatsApp Redirect Link</label>';
        html += '<input class="admin-input" id="ad-whatsapp-url" value="' + (schedule.whatsappUrl || 'https://wa.me/message/WTOZYC4GBMWNC1') + '" placeholder="https://wa.me/message/WTOZYC4GBMWNC1"></div>';
        html += '</div>';

        html += '<div style="margin-top:20px;text-align:right;">';
        html += '<button class="btn-admin" onclick="saveAdScheduleForm()" style="padding:12px 35px;font-size:15px;font-weight:900;">💾 Save & Update Homepage Advertisement</button>';
        html += '</div>';

        html += '</div>';
    } else {
        html += '<textarea class="admin-textarea" id="ad-input" style="min-height:350px;">' + (rawContent || '') + '</textarea>';
        html += '<div class="mt-10"><button class="btn-admin" onclick="saveAdContent()" style="padding:10px 25px;font-size:14px;">💾 Save Raw HTML</button></div>';
        html += '<p style="color:#64748b;font-size:12px;margin-top:5px;">Advanced Mode: Supports custom HTML tags</p>';
    }

    container.innerHTML = html;
}

function addAdScheduleRow() {
    var schedule = getData('ad_schedule') || (typeof DEFAULT_AD_SCHEDULE !== 'undefined' ? DEFAULT_AD_SCHEDULE : { items: [] });
    if (!schedule.items) schedule.items = [];
    schedule.items.push({ name: '', time: '' });
    setData('ad_schedule', schedule);
    renderAdminAdContent();
}

function deleteAdScheduleRow(index) {
    var schedule = getData('ad_schedule') || { items: [] };
    if (schedule.items && schedule.items[index] !== undefined) {
        schedule.items.splice(index, 1);
        setData('ad_schedule', schedule);
        renderAdminAdContent();
    }
}

function syncAdScheduleFromPrimaryGames() {
    var primary = getData('games_primary') || [];
    var schedule = getData('ad_schedule') || { items: [] };
    schedule.items = primary.map(function(g) {
        return { name: g.name, time: g.time };
    });
    setData('ad_schedule', schedule);
    renderAdminAdContent();
    showToast('Imported ' + primary.length + ' games from Primary Results Table!');
}

function saveAdScheduleForm() {
    var schedule = getData('ad_schedule') || {};
    schedule.topHeader = document.getElementById('ad-top-header').value.trim();
    schedule.khaiwalName = document.getElementById('ad-khaiwal-name').value.trim();
    schedule.jodiRate = document.getElementById('ad-jodi-rate').value.trim();
    schedule.harufRate = document.getElementById('ad-haruf-rate').value.trim();
    schedule.linkText = document.getElementById('ad-link-text').value.trim();
    schedule.whatsappPhone = document.getElementById('ad-whatsapp-phone').value.trim();
    if (document.getElementById('ad-whatsapp-url')) {
        schedule.whatsappUrl = document.getElementById('ad-whatsapp-url').value.trim();
    }

    var items = [];
    var i = 0;
    while (document.getElementById('ad-item-name-' + i)) {
        var nameVal = document.getElementById('ad-item-name-' + i).value.trim();
        var timeVal = document.getElementById('ad-item-time-' + i).value.trim();
        if (nameVal !== '') {
            items.push({ name: nameVal, time: timeVal });
        }
        i++;
    }
    schedule.items = items;

    var compiledHtml = (typeof compileAdContentFromSchedule === 'function')
        ? compileAdContentFromSchedule(schedule)
        : '';

    setData('ad_schedule', schedule);
    setData('ad_content', compiledHtml);
    showToast('Advertisement schedule saved and compiled successfully!');
}

function saveAdContent() {
    var val = document.getElementById('ad-input').value;
    setData('ad_content', val);
    showToast('Advertisement raw HTML saved!');
}

// --- Disclaimer Editor ---

function renderAdminDisclaimer() {
    var container = document.getElementById('admin-disclaimer');
    if (!container) return;
    var text = getData('disclaimer');

    var html = '<textarea class="admin-textarea" id="disclaimer-input">' + (text || '') + '</textarea>';
    html += '<div class="mt-10"><button class="btn-admin" onclick="saveDisclaimer()">💾 Save Disclaimer</button></div>';
    container.innerHTML = html;
}

function saveDisclaimer() {
    var val = document.getElementById('disclaimer-input').value;
    setData('disclaimer', val);
    showToast('Disclaimer saved!');
}

// --- Credentials Editor ---

function renderAdminCredentials() {
    var container = document.getElementById('admin-credentials');
    if (!container) return;
    var creds = getData('credentials');

    var html = '<div style="max-width:400px;">';
    html += '<label style="color:#ffd800;font-weight:700;margin-bottom:5px;display:block;">Username</label>';
    html += '<input class="admin-input" id="cred-username" value="' + (creds ? creds.username : '') + '" style="margin-bottom:15px;">';
    html += '<label style="color:#ffd800;font-weight:700;margin-bottom:5px;display:block;">New Password</label>';
    html += '<input class="admin-input" id="cred-password" type="password" value="' + (creds ? creds.password : '') + '" style="margin-bottom:15px;">';
    html += '<button class="btn-admin" onclick="saveCredentials()">💾 Save Credentials</button>';
    html += '</div>';
    container.innerHTML = html;
}

function saveCredentials() {
    var username = document.getElementById('cred-username').value.trim();
    var password = document.getElementById('cred-password').value.trim();
    if (!username || !password) {
        showToast('Both fields required!', 'error');
        return;
    }
    setData('credentials', { username: username, password: password });
    showToast('Credentials updated!');
}

// --- Firebase Editor ---

function renderAdminFirebase() {
    var container = document.getElementById('admin-firebase');
    if (!container) return;
    var config = typeof getFirebaseConfig === 'function' ? getFirebaseConfig() : {};

    var html = '<div style="max-width:600px;">';
    html += '<label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">API Key</label>';
    html += '<input class="admin-input" id="fb-api-key" value="' + (config.apiKey || '') + '" placeholder="AIzaSy..." style="margin-bottom:10px;">';
    html += '<label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">Database URL</label>';
    html += '<input class="admin-input" id="fb-db-url" value="' + (config.databaseURL || '') + '" placeholder="https://your-app-default-rtdb.firebaseio.com" style="margin-bottom:10px;">';
    html += '<label style="color:#0f172a;font-weight:700;margin-bottom:5px;display:block;">Project ID</label>';
    html += '<input class="admin-input" id="fb-project-id" value="' + (config.projectId || '') + '" placeholder="your-project-id" style="margin-bottom:15px;">';
    html += '<button class="btn-admin" onclick="saveFirebaseConfigHandler()">🔥 Save & Connect Firebase</button>';
    html += '</div>';
    container.innerHTML = html;
}

function saveFirebaseConfigHandler() {
    var apiKey = document.getElementById('fb-api-key').value.trim();
    var databaseURL = document.getElementById('fb-db-url').value.trim();
    var projectId = document.getElementById('fb-project-id').value.trim();

    var config = {
        apiKey: apiKey,
        databaseURL: databaseURL,
        projectId: projectId,
        authDomain: projectId ? projectId + '.firebaseapp.com' : '',
        storageBucket: projectId ? projectId + '.appspot.com' : ''
    };

    if (typeof saveFirebaseConfig === 'function') {
        saveFirebaseConfig(config);
    } else {
        setData('firebase_config', config);
    }
    showToast('Firebase credentials saved!');
}

// --- Reset Data ---

function resetData() {
    if (!confirm('⚠️ This will reset ALL data to defaults. Are you sure?')) return;
    if (!confirm('This action cannot be undone. Proceed?')) return;
    resetAllData();
    showToast('All data reset to defaults!', 'info');
    initAdminPage();
}

// ============================================================
// Initialize Admin Page
// ============================================================

function initAdminPage() {
    if (!checkAuth()) return;

    // Dashboard stats
    var primaryGames = getData('games_primary');
    var secondaryGames = getData('games_secondary');
    var totalGames = (primaryGames ? primaryGames.length : 0) + (secondaryGames ? secondaryGames.length : 0);
    
    var el1 = document.getElementById('stat-total-games');
    if (el1) el1.textContent = totalGames;
    var el2 = document.getElementById('stat-primary-games');
    if (el2) el2.textContent = primaryGames ? primaryGames.length : 0;
    var el3 = document.getElementById('stat-secondary-games');
    if (el3) el3.textContent = secondaryGames ? secondaryGames.length : 0;

    // Render all sections
    renderAdminFeatured();
    renderAdminPrimaryTable();
    renderAdminSecondaryTable();
    renderAdminChart('admin-chart1', 'chart1_headers', 'chart1_data', 0);
    renderAdminChart('admin-chart2', 'chart2_headers', 'chart2_data', 1);
    renderAdminChart('admin-chart3', 'chart3_headers', 'chart3_data', 2);
    renderAdminChart('admin-fullchart', 'fullchart_headers', 'fullchart_data', 3);
    renderAdminChart('admin-prev-fullchart', 'prev_fullchart_headers', 'prev_fullchart_data', 4);
    renderAdminMarquee();
    renderAdminHindiText();
    renderAdminAdContent();
    renderAdminDisclaimer();
    renderAdminFirebase();
    renderAdminCredentials();

    // Set first tab active
    switchTab('results');
}
