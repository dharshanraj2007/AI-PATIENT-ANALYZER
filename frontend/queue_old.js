/**
 * MedTriage AI — Queue Management
 * =================================
 * Handles queue data fetching, summary card updates,
 * live table rendering, filtering, and auto-refresh.
 */

const API_BASE = 'http://localhost:5000/api';
let autoRefreshInterval = null;
let avgServiceTime = 5; // default minutes per patient; overwritten by /api/queue/config
let knownHighRiskIds = new Set(); // tracks existing High patients to detect new arrivals

// ─── DOM Ready ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    initControls();
    await fetchQueueConfig();
    fetchQueueData();
});

// ═══════════════════════════════════════════════════
// FETCH QUEUE CONFIG — load avg_service_time once
// ═══════════════════════════════════════════════════
async function fetchQueueConfig() {
    try {
        const res = await fetch(`${API_BASE}/queue/config`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && typeof data.avg_service_time === 'number') {
                avgServiceTime = data.avg_service_time;
            }
        }
    } catch {
        // Use default (5 min) when config endpoint is unavailable
        console.warn('Could not fetch queue config — using default avg_service_time =', avgServiceTime);
    }
}

// ═══════════════════════════════════════════════════
// SIDEBAR (mobile)
// ═══════════════════════════════════════════════════
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// ═══════════════════════════════════════════════════
// CONTROLS — refresh, auto-refresh, filters
// ═══════════════════════════════════════════════════
function initControls() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        fetchQueueData();
    });

    // Auto-refresh toggle
    document.getElementById('autoRefreshToggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    });

    // Filter handlers
    document.getElementById('filterDepartment').addEventListener('change', applyFilters);
    document.getElementById('filterStatus').addEventListener('change', applyFilters);
}

// ═══════════════════════════════════════════════════
// AUTO-REFRESH — every 5 seconds (default: OFF)
// ═══════════════════════════════════════════════════
function startAutoRefresh() {
    if (autoRefreshInterval) return; // already running
    autoRefreshInterval = setInterval(fetchQueueData, 5000);
    document.getElementById('lastRefresh').textContent = 'Auto-refresh: every 5s';
}

function stopAutoRefresh() {
    if (!autoRefreshInterval) return; // already stopped
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    document.getElementById('lastRefresh').textContent = 'Auto-refresh: off';
}

// ═══════════════════════════════════════════════════
// FETCH QUEUE DATA — primary data loader
// ═══════════════════════════════════════════════════
async function fetchQueueData() {
    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
        // Fetch stats and full queue in parallel
        const [statsRes, queueRes] = await Promise.all([
            fetch(`${API_BASE}/queue/stats`),
            fetch(`${API_BASE}/queue/all`),
        ]);

        const stats = await statsRes.json();
        const queueData = await queueRes.json();

        if (!statsRes.ok || !stats.success) {
            throw new Error(stats.error || 'Failed to fetch queue stats');
        }

        // ── Update summary cards ───────────────────────
        updateSummaryCards(stats);

        // ── Build patients array from queue data ───────
        if (queueRes.ok && queueData.success) {
            const patients = buildPatientsList(queueData.queues);
            renderQueueTable(patients);
        }

        // ── Timestamp ──────────────────────────────────
        const now = new Date().toLocaleTimeString();
        document.getElementById('lastRefresh').textContent = `Last updated: ${now}`;
        document.getElementById('queueStatusBadge').textContent = '● Live';

    } catch (err) {
        console.warn('Queue fetch error:', err.message || err);
        document.getElementById('queueStatusBadge').textContent = '● Offline — Mock Data';
        document.getElementById('lastRefresh').textContent = 'Using demo data (backend not connected)';

        // ── Populate with mock data so the page is never empty ──
        const mockStats = {
            total_patients: 12,
            high_risk_count: 3,
            average_wait_time: 18,
        };
        updateSummaryCards(mockStats);

        const mockPatients = [
            { patient_id:'PT-4829', risk_level:'High',   department:'Emergency',         arrival_time:'14:02', priority_score:95, queue_position:1, est_wait:5,  status:'In Treatment' },
            { patient_id:'PT-7213', risk_level:'High',   department:'Cardiology',        arrival_time:'14:08', priority_score:90, queue_position:2, est_wait:10, status:'Waiting' },
            { patient_id:'PT-3051', risk_level:'High',   department:'Pulmonology',       arrival_time:'14:11', priority_score:85, queue_position:3, est_wait:12, status:'Waiting' },
            { patient_id:'PT-9467', risk_level:'Medium', department:'Internal Medicine', arrival_time:'13:45', priority_score:65, queue_position:4, est_wait:15, status:'Waiting' },
            { patient_id:'PT-1184', risk_level:'Medium', department:'Cardiology',        arrival_time:'13:52', priority_score:60, queue_position:5, est_wait:18, status:'Waiting' },
            { patient_id:'PT-6830', risk_level:'Medium', department:'Emergency',         arrival_time:'14:15', priority_score:55, queue_position:6, est_wait:20, status:'In Treatment' },
            { patient_id:'PT-2295', risk_level:'Medium', department:'Internal Medicine', arrival_time:'14:20', priority_score:50, queue_position:7, est_wait:22, status:'Waiting' },
            { patient_id:'PT-5502', risk_level:'Medium', department:'Pulmonology',       arrival_time:'14:22', priority_score:45, queue_position:8, est_wait:25, status:'Completed' },
            { patient_id:'PT-8741', risk_level:'Low',    department:'General Practice',  arrival_time:'13:30', priority_score:30, queue_position:9, est_wait:28, status:'Waiting' },
            { patient_id:'PT-4106', risk_level:'Low',    department:'General Practice',  arrival_time:'13:38', priority_score:25, queue_position:10, est_wait:30, status:'Waiting' },
            { patient_id:'PT-3378', risk_level:'Low',    department:'Internal Medicine', arrival_time:'14:25', priority_score:20, queue_position:11, est_wait:32, status:'Completed' },
            { patient_id:'PT-6019', risk_level:'Low',    department:'General Practice',  arrival_time:'14:30', priority_score:15, queue_position:12, est_wait:35, status:'Waiting' },
        ];
        renderQueueTable(mockPatients);
    }

    btn.disabled = false;
    btn.style.opacity = '1';
}

// ═══════════════════════════════════════════════════
// UPDATE SUMMARY CARDS
// ═══════════════════════════════════════════════════
function updateSummaryCards(stats) {
    const total = stats.total_patients ?? 0;
    const high = stats.high_risk_count ?? 0;
    const avgWait = stats.average_wait_time ?? 0;

    // Derive medium & low from per-department patient data
    // (stats endpoint gives high_risk_count; we compute the rest)
    let medium = 0;
    let low = 0;

    // If we already rendered the table we can count from DOM,
    // but safer to calculate from total - high and split evenly as fallback.
    // The /queue/all response gives us exact counts — see renderQueueTable.
    // For now set them; renderQueueTable will overwrite with exact values.
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statHigh').textContent = high;
    document.getElementById('statWait').textContent = avgWait + ' min';
}

// ═══════════════════════════════════════════════════
// BUILD FLAT PATIENTS LIST from /queue/all response
// ═══════════════════════════════════════════════════
function buildPatientsList(queues) {
    const patients = [];

    for (const [department, info] of Object.entries(queues)) {
        const list = info.patients || [];
        list.forEach((p, idx) => {
            patients.push({
                patient_id: p.patient_id || 'N/A',
                risk_level: p.risk_level || 'Low',
                department: department,
                arrival_time: p.arrival_time || '',
                priority_score: p.priority_score || 0,
                queue_position: idx + 1,
                // Dynamic wait: position in queue × avg service time
                est_wait: (idx + 1) * avgServiceTime,
                status: idx === 0 ? 'In Treatment' : 'Waiting',
            });
        });
    }

    // Sort by priority descending, then arrival ascending
    patients.sort((a, b) => {
        if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
        return a.arrival_time.localeCompare(b.arrival_time);
    });

    return patients;
}

// ═══════════════════════════════════════════════════
// RENDER QUEUE TABLE
// ═══════════════════════════════════════════════════
function renderQueueTable(patients) {
    const tbody = document.getElementById('queueTableBody');

    if (!patients || patients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="queue-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                        <p>No patients in queue</p>
                    </div>
                </td>
            </tr>`;
        document.getElementById('statMedium').textContent = '0';
        document.getElementById('statLow').textContent = '0';
        return;
    }

    // Count risk levels for summary cards
    let highCount = 0, mediumCount = 0, lowCount = 0;
    const currentHighIds = new Set();

    const rows = patients.map((p, i) => {
        const riskClass = p.risk_level.toLowerCase();
        if (riskClass === 'high') highCount++;
        else if (riskClass === 'medium') mediumCount++;
        else lowCount++;

        // Track high-risk IDs to detect new arrivals
        const isNewHigh = riskClass === 'high' && !knownHighRiskIds.has(p.patient_id);
        if (riskClass === 'high') currentHighIds.add(p.patient_id);

        const statusClass = p.status === 'In Treatment' ? 'in-treatment'
            : p.status === 'Completed' ? 'completed'
            : 'waiting';

        const arrivalDisplay = formatArrivalTime(p.arrival_time);
        const waitDisplay = Math.round(p.est_wait) + ' min';
        const shortId = p.patient_id.length > 8
            ? 'PT-' + p.patient_id.slice(-4).toUpperCase()
            : p.patient_id;

        const rowClass = isNewHigh ? ' class="high-risk-new"' : '';

        return `
            <tr${rowClass}>
                <td>${i + 1}</td>
                <td>${shortId}</td>
                <td><span class="risk-badge ${riskClass}"><span class="risk-badge-dot"></span>${p.risk_level}</span></td>
                <td><span class="dept-badge">${p.department}</span></td>
                <td>${arrivalDisplay}</td>
                <td>${waitDisplay}</td>
                <td><span class="status-badge ${statusClass}"><span class="status-dot"></span>${p.status}</span></td>
            </tr>`;
    });

    tbody.innerHTML = rows.join('');

    // Update the known set so the flash only fires once per patient
    knownHighRiskIds = currentHighIds;

    // Update medium & low cards with exact counts
    document.getElementById('statMedium').textContent = mediumCount;
    document.getElementById('statLow').textContent = lowCount;

    // Re-apply any active filters
    applyFilters();
}

// ═══════════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════════
function applyFilters() {
    const deptFilter = document.getElementById('filterDepartment').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const rows = document.querySelectorAll('#queueTableBody tr');

    rows.forEach(row => {
        const dept = row.querySelector('.dept-badge')?.textContent.trim() || '';
        const status = row.querySelector('.status-badge')?.textContent.trim() || '';
        const deptMatch = deptFilter === 'all' || dept === deptFilter;
        const statusMatch = statusFilter === 'all' || status === statusFilter;
        row.style.display = (deptMatch && statusMatch) ? '' : 'none';
    });
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function formatArrivalTime(isoString) {
    if (!isoString) return '--:--';
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return isoString;
    }
}


// ═══════════════════════════════════════════════════
// QUEUE STATUS PANEL — /api/queue-status with fallback
// ═══════════════════════════════════════════════════

/** Mock data used when the API is unavailable */
const MOCK_QUEUE_STATUS = {
    source: 'mock',
    your_position: 4,
    total_in_queue: 12,
    department: 'Emergency',
    estimated_wait_minutes: 18,
    average_wait_minutes: 22,
    longest_wait_minutes: 35,
    departments: {
        'Emergency':        { patients: 4, wait_minutes: 15 },
        'Cardiology':       { patients: 3, wait_minutes: 25 },
        'Internal Medicine': { patients: 2, wait_minutes: 12 },
        'Pulmonology':      { patients: 2, wait_minutes: 20 },
        'General Practice': { patients: 1, wait_minutes: 8 },
    },
};

/**
 * Fetch queue-status from multiple sources with graceful fallback:
 *  1. GET /api/queue-status  (ideal single endpoint)
 *  2. GET /api/queue/stats + /api/queue/all  (existing endpoints)
 *  3. Local mock data
 */
async function fetchQueueStatus() {
    const badge = document.getElementById('qspSourceBadge');
    badge.textContent = '● Connecting…';
    badge.className = 'qsp-source-badge';

    // ── Attempt 1: dedicated endpoint ───────────────────
    try {
        const res = await fetch(`${API_BASE}/queue-status`);
        if (res.ok) {
            const data = await res.json();
            if (data.success !== false) {
                badge.textContent = '● Live';
                badge.classList.add('live');
                renderQueueStatus(normaliseStatusPayload(data, 'api'));
                return;
            }
        }
    } catch { /* fall through */ }

    // ── Attempt 2: compose from existing endpoints ──────
    try {
        const [statsRes, allRes] = await Promise.all([
            fetch(`${API_BASE}/queue/stats`),
            fetch(`${API_BASE}/queue/all`),
        ]);
        if (statsRes.ok && allRes.ok) {
            const stats = await statsRes.json();
            const all   = await allRes.json();
            if (stats.success && all.success) {
                badge.textContent = '● Live';
                badge.classList.add('live');
                renderQueueStatus(composeFromExisting(stats, all));
                return;
            }
        }
    } catch { /* fall through */ }

    // ── Attempt 3: mock data ────────────────────────────
    badge.textContent = '● Mock Data';
    badge.classList.add('mock');
    renderQueueStatus(MOCK_QUEUE_STATUS);
}

/** Normalise whatever shape /api/queue-status returns */
function normaliseStatusPayload(data, source) {
    return {
        source,
        your_position:          data.your_position ?? data.position ?? 1,
        total_in_queue:         data.total_in_queue ?? data.total_patients ?? 0,
        department:             data.department ?? 'General',
        estimated_wait_minutes: data.estimated_wait_minutes ?? data.estimated_wait ?? 0,
        average_wait_minutes:   data.average_wait_minutes  ?? data.average_wait_time ?? 0,
        longest_wait_minutes:   data.longest_wait_minutes  ?? 0,
        departments:            data.departments ?? {},
    };
}

/** Build a status object from /queue/stats + /queue/all */
function composeFromExisting(stats, all) {
    const departments = {};
    let longestWait = 0;

    const waitsByDept = stats.wait_times_by_department || {};
    const perDept     = stats.patients_per_department  || {};

    // Build per-department info
    for (const [dept, info] of Object.entries(all.queues || {})) {
        const count = info.count ?? (info.patients ? info.patients.length : 0);
        const wait  = waitsByDept[dept] ?? count * avgServiceTime;
        departments[dept] = { patients: count, wait_minutes: Math.round(wait) };
        if (wait > longestWait) longestWait = wait;
    }

    // If there are patients, pick the first one's position
    let yourPos = 1, yourDept = 'General';
    const deptEntries = Object.entries(all.queues || {});
    for (const [dept, info] of deptEntries) {
        if (info.patients && info.patients.length > 0) {
            yourDept = dept;
            yourPos  = 1; // first patient in highest-priority dept
            break;
        }
    }

    return {
        source: 'composed',
        your_position:          yourPos,
        total_in_queue:         stats.total_patients ?? 0,
        department:             yourDept,
        estimated_wait_minutes: Math.round(yourPos * avgServiceTime),
        average_wait_minutes:   Math.round(stats.average_wait_time ?? 0),
        longest_wait_minutes:   Math.round(longestWait),
        departments,
    };
}

// ═══════════════════════════════════════════════════
// RENDER QUEUE STATUS PANEL
// ═══════════════════════════════════════════════════
function renderQueueStatus(data) {
    const { your_position, total_in_queue, department,
            estimated_wait_minutes, average_wait_minutes,
            longest_wait_minutes, departments } = data;

    // ── Position ring (SVG arc) ─────────────────────────
    const circumference = 2 * Math.PI * 52; // r=52
    const progress = total_in_queue > 0
        ? ((total_in_queue - your_position + 1) / total_in_queue)
        : 0;
    const offset = circumference * (1 - progress);

    const ring = document.getElementById('qspRingFill');
    ring.style.strokeDasharray  = circumference;
    ring.style.strokeDashoffset = offset;

    // Color the ring based on position
    if (your_position <= 2)      ring.style.stroke = 'var(--risk-low)';
    else if (your_position <= 5) ring.style.stroke = 'var(--accent-blue)';
    else                         ring.style.stroke = 'var(--risk-medium)';

    document.getElementById('qspPositionValue').textContent = `#${your_position}`;
    document.getElementById('qspPosNum').textContent        = `#${your_position}`;
    document.getElementById('qspAhead').textContent         = Math.max(0, your_position - 1);
    document.getElementById('qspTotalQueue').textContent     = total_in_queue;
    document.getElementById('qspDept').textContent           = department;

    // ── Wait time cards ─────────────────────────────────
    const maxWaitRef = Math.max(longest_wait_minutes, 60); // for bar scale

    document.getElementById('qspEstWait').textContent     = `${estimated_wait_minutes} min`;
    document.getElementById('qspAvgWait').textContent     = `${average_wait_minutes} min`;
    document.getElementById('qspLongestWait').textContent  = `${longest_wait_minutes} min`;

    document.getElementById('qspEstBar').style.width      = `${Math.min(100, (estimated_wait_minutes / maxWaitRef) * 100)}%`;
    document.getElementById('qspAvgBar').style.width      = `${Math.min(100, (average_wait_minutes  / maxWaitRef) * 100)}%`;
    document.getElementById('qspLongestBar').style.width   = `${Math.min(100, (longest_wait_minutes  / maxWaitRef) * 100)}%`;

    // ── Department breakdown ────────────────────────────
    const deptList = document.getElementById('qspDeptList');
    const maxDeptWait = Math.max(...Object.values(departments).map(d => d.wait_minutes), 1);

    let deptHTML = '';
    // Sort by wait time descending
    const sorted = Object.entries(departments).sort((a, b) => b[1].wait_minutes - a[1].wait_minutes);
    for (const [deptName, info] of sorted) {
        const pct = Math.round((info.wait_minutes / maxDeptWait) * 100);
        deptHTML += `
            <div class="qsp-dept-row">
                <span class="qsp-dept-name">${deptName}</span>
                <div class="qsp-dept-bar-wrap">
                    <div class="qsp-dept-bar" style="width:${pct}%"></div>
                </div>
                <span class="qsp-dept-wait-val">${info.wait_minutes} min</span>
                <span class="qsp-dept-count">${info.patients} pts</span>
            </div>`;
    }
    deptList.innerHTML = deptHTML;
}

// ── Load queue status on page load + tie to refresh ────
document.addEventListener('DOMContentLoaded', () => {
    fetchQueueStatus();

    // Also refresh the status panel whenever the main refresh button is clicked
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchQueueStatus);
    }
});
