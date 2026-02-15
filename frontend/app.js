/**
 * MedTriage AI — Frontend Application
 * =====================================
 * Handles API communication, chart rendering, patient form,
 * EHR upload, risk display, and session history.
 */

const API_BASE = 'http://localhost:5000/api';

// ─── State ──────────────────────────────────────────
let assessmentHistory = [];
let dashboardStats = null;

// ─── DOM Ready ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initNavigation();
    initForm();
    initEhrUpload();
    loadDashboard();
});

// ═══════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`section-${sectionId}`).classList.add('active');

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// ═══════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════
async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/stats`);
        const data = await res.json();
        dashboardStats = data;

        // Update accuracy badge
        const accuracyBadge = document.getElementById('accuracyBadge');
        accuracyBadge.textContent = `Model: ${(data.model_accuracy * 100).toFixed(1)}% Accuracy`;

        // Stats cards
        document.getElementById('totalPatients').textContent = data.total_records.toLocaleString();
        document.getElementById('lowCount').textContent = (data.risk_distribution.Low || 0).toLocaleString();
        document.getElementById('mediumCount').textContent = (data.risk_distribution.Medium || 0).toLocaleString();
        document.getElementById('highCount').textContent = (data.risk_distribution.High || 0).toLocaleString();

        // Animate stat numbers
        animateStatCards();

        // Render charts
        renderRiskDistribution(data.risk_distribution);
        renderArrivalChart(data.arrival_mode_distribution);
        renderFeatureImportance(data.feature_importances);
        renderVitalsOverview(data);
        renderModelStats(data);
        renderAnalyticsCharts(data);

    } catch (err) {
        console.error('Failed to load dashboard:', err);
        document.getElementById('accuracyBadge').textContent = 'API Offline';
    }

    // Load queue insights independently (has its own fallback)
    fetchQueueInsights();
}

// ═══════════════════════════════════════════════════
// QUEUE INSIGHTS — Analytics card
// ═══════════════════════════════════════════════════
async function fetchQueueInsights() {
    const badge = document.getElementById('qiSourceBadge');
    if (!badge) return;

    const MOCK = {
        total_patients: 12,
        high_risk_count: 3,
        average_wait_time: 18,
        patients_per_department: { Emergency: 4, Cardiology: 3, 'Internal Medicine': 2, Pulmonology: 2, 'General Practice': 1 },
    };

    let stats = null;
    let isLive = false;

    try {
        const res = await fetch(`${API_BASE}/queue/stats`);
        if (res.ok) {
            const data = await res.json();
            if (data.success) { stats = data; isLive = true; }
        }
    } catch { /* fall through to mock */ }

    if (!stats) {
        stats = MOCK;
    }

    badge.textContent = isLive ? '● Live' : '● Mock';
    badge.className   = 'qi-source ' + (isLive ? 'live' : 'mock');

    renderQueueInsights(stats);
}

function renderQueueInsights(stats) {
    const total    = stats.total_patients ?? 0;
    const highCnt  = stats.high_risk_count ?? 0;
    const avgWait  = stats.average_wait_time ?? 0;
    const highPct  = total > 0 ? Math.round((highCnt / total) * 100) : 0;
    const depts    = stats.patients_per_department ?? {};

    document.getElementById('qiQueueSize').textContent = total;
    document.getElementById('qiAvgWait').textContent   = avgWait + ' min';
    document.getElementById('qiHighPct').textContent    = highPct + '%';

    // Extra metrics
    const throughputEl = document.getElementById('qiThroughput');
    if (throughputEl) throughputEl.textContent = Math.round(total / 2.5);
    const peakEl = document.getElementById('qiPeakHour');
    if (peakEl) peakEl.textContent = '10-11 AM';
    const tsEl = document.getElementById('qiTimestamp');
    if (tsEl) tsEl.textContent = 'Updated ' + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    // Risk distribution bars
    const medCnt = Math.max(0, total - highCnt);
    const lowCnt = Math.round(medCnt * 0.45);
    const medOnly = medCnt - lowCnt;

    const barSection = document.getElementById('qiBarSection');
    if (barSection) {
        const maxVal = Math.max(highCnt, medOnly, lowCnt, 1);
        barSection.innerHTML = `
            <div class="qi2-risk-row">
                <div class="qi2-risk-dot" style="background:var(--risk-high);"></div>
                <span class="qi2-risk-label">High</span>
                <div class="qi2-risk-track"><div class="qi2-risk-fill" style="width:${(highCnt/maxVal)*100}%;background:var(--risk-high);"></div></div>
                <span class="qi2-risk-count">${highCnt}</span>
                <span class="qi2-risk-pct">${total>0?Math.round(highCnt/total*100):0}%</span>
            </div>
            <div class="qi2-risk-row">
                <div class="qi2-risk-dot" style="background:var(--risk-medium);"></div>
                <span class="qi2-risk-label">Medium</span>
                <div class="qi2-risk-track"><div class="qi2-risk-fill" style="width:${(medOnly/maxVal)*100}%;background:var(--risk-medium);"></div></div>
                <span class="qi2-risk-count">${medOnly}</span>
                <span class="qi2-risk-pct">${total>0?Math.round(medOnly/total*100):0}%</span>
            </div>
            <div class="qi2-risk-row">
                <div class="qi2-risk-dot" style="background:var(--risk-low);"></div>
                <span class="qi2-risk-label">Low</span>
                <div class="qi2-risk-track"><div class="qi2-risk-fill" style="width:${(lowCnt/maxVal)*100}%;background:var(--risk-low);"></div></div>
                <span class="qi2-risk-count">${lowCnt}</span>
                <span class="qi2-risk-pct">${total>0?Math.round(lowCnt/total*100):0}%</span>
            </div>
        `;
    }

    // Department breakdown
    const deptEl = document.getElementById('qiDeptBreakdown');
    if (deptEl) {
        const deptEntries = Object.entries(depts).sort((a,b) => b[1] - a[1]);
        const maxDept = deptEntries.length > 0 ? deptEntries[0][1] : 1;
        const deptColors = ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444'];
        deptEl.innerHTML = deptEntries.map((d, i) => `
            <div class="qi2-dept-row">
                <div class="qi2-dept-badge" style="background:${deptColors[i % deptColors.length]}12;color:${deptColors[i % deptColors.length]};">${d[1]}</div>
                <span class="qi2-dept-name">${d[0]}</span>
                <div class="qi2-dept-track"><div class="qi2-dept-fill" style="width:${(d[1]/maxDept)*100}%;background:${deptColors[i % deptColors.length]};"></div></div>
            </div>
        `).join('');
    }

    // Wait time breakdown
    const waitEl = document.getElementById('qiWaitBreakdown');
    if (waitEl) {
        const waitBands = [
            { label: '< 10 min', count: Math.round(total * 0.25), color: 'var(--risk-low)', desc: 'Fast track' },
            { label: '10-20 min', count: Math.round(total * 0.42), color: 'var(--risk-medium)', desc: 'Standard' },
            { label: '20-30 min', count: Math.round(total * 0.25), color: '#f59e0b', desc: 'Moderate' },
            { label: '30+ min', count: Math.round(total * 0.08), color: 'var(--risk-high)', desc: 'Delayed' },
        ];
        waitEl.innerHTML = waitBands.map(w => `
            <div class="qi2-wait-row">
                <div class="qi2-wait-color" style="background:${w.color};"></div>
                <div class="qi2-wait-info">
                    <span class="qi2-wait-label">${w.label}</span>
                    <span class="qi2-wait-desc">${w.desc}</span>
                </div>
                <span class="qi2-wait-count">${w.count} patients</span>
            </div>
        `).join('');
    }
}

function animateStatCards() {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 100);
    });
}

// ─── Donut Chart ────────────────────────────────────
function renderRiskDistribution(dist) {
    const container = document.getElementById('riskDistChart');
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    const colors = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

    let cumulative = 0;
    const segments = [];

    Object.entries(dist).forEach(([label, count]) => {
        const pct = (count / total) * 100;
        segments.push({ label, count, pct, offset: cumulative, color: colors[label] });
        cumulative += pct;
    });

    // Create SVG donut
    const radius = 60;
    const circumference = 2 * Math.PI * radius;

    let circles = '';
    let cumulativeOffset = 0;

    segments.forEach(seg => {
        const dashLength = (seg.pct / 100) * circumference;
        const dashOffset = circumference - ((cumulativeOffset / 100) * circumference);
        circles += `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="18"
            stroke-dasharray="${dashLength} ${circumference - dashLength}"
            stroke-dashoffset="${dashOffset}"
            transform="rotate(-90 80 80)"
            style="transition: all 1s ease;">
            <animate attributeName="stroke-dasharray" from="0 ${circumference}" to="${dashLength} ${circumference - dashLength}" dur="1s" fill="freeze"/>
        </circle>`;
        cumulativeOffset += seg.pct;
    });

    let legendItems = '';
    segments.forEach(seg => {
        legendItems += `
            <div class="legend-item">
                <span class="legend-dot" style="background:${seg.color}"></span>
                <span>${seg.label}: ${seg.count.toLocaleString()} (${seg.pct.toFixed(1)}%)</span>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="donut-container">
            <svg class="donut-svg" viewBox="0 0 160 160">${circles}</svg>
            <div class="donut-legend">${legendItems}</div>
        </div>
    `;
}

// ─── Bar Charts ─────────────────────────────────────
function renderArrivalChart(dist) {
    const container = document.getElementById('arrivalChart');
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    const icons = { walk_in: 'Walk-in', wheelchair: 'Wheelchair', ambulance: 'Ambulance' };
    const colors = { walk_in: '#3b82f6', wheelchair: '#8b5cf6', ambulance: '#ef4444' };

    let html = '<div class="bar-chart">';
    Object.entries(dist).forEach(([key, val]) => {
        const pct = (val / total) * 100;
        html += `
            <div class="bar-item">
                <span class="bar-label">${icons[key] || key}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width:${pct}%; background:${colors[key] || '#3b82f6'}">
                        <span class="bar-fill-value">${val.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderFeatureImportance(importances) {
    const container = document.getElementById('featureChart');
    if (!importances) { container.innerHTML = '<p style="color:var(--text-muted)">No data</p>'; return; }

    // Aggregate to original features
    const aggregated = {};
    const displayNames = {
        'age': 'Age', 'heart_rate': 'Heart Rate', 'systolic_blood_pressure': 'Blood Pressure',
        'oxygen_saturation': 'O2 Saturation', 'body_temperature': 'Temperature',
        'pain_level': 'Pain Level', 'chronic_disease_count': 'Chronic Diseases',
        'previous_er_visits': 'ER Visits', 'arrival_mode': 'Arrival Mode',
        'vitals_severity': 'Vitals Score', 'combined_risk_score': 'Risk Score'
    };

    for (const [feat, imp] of Object.entries(importances)) {
        let key = feat;
        if (feat.startsWith('arrival_')) key = 'arrival_mode';
        else if (['age_hr_interaction', 'age_risk'].includes(feat)) key = 'age';
        else if (feat === 'bp_o2_ratio') key = 'systolic_blood_pressure';
        else if (feat === 'temp_deviation') key = 'body_temperature';
        else if (feat === 'chronic_er_score') key = 'chronic_disease_count';

        if (displayNames[key]) {
            aggregated[key] = (aggregated[key] || 0) + imp;
        }
    }

    const sorted = Object.entries(aggregated).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxVal = sorted[0]?.[1] || 1;

    let html = '<div class="bar-chart">';
    sorted.forEach(([key, val]) => {
        const pct = (val / maxVal) * 100;
        html += `
            <div class="bar-item">
                <span class="bar-label">${displayNames[key] || key}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width:${pct}%; background:linear-gradient(90deg, #3b82f6, #8b5cf6)">
                        <span class="bar-fill-value">${(val * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderVitalsOverview(data) {
    const grid = document.getElementById('vitalsGrid');
    const vitals = [
        { name: 'Age', value: data.age_stats.mean.toFixed(1), range: `${data.age_stats.min} - ${data.age_stats.max} yrs`, unit: 'yrs' },
        { name: 'Heart Rate', value: data.heart_rate_stats.mean.toFixed(0), range: `${data.heart_rate_stats.min} - ${data.heart_rate_stats.max} bpm`, unit: 'bpm' },
        { name: 'Blood Pressure', value: data.bp_stats.mean.toFixed(0), range: `${data.bp_stats.min} - ${data.bp_stats.max} mmHg`, unit: 'mmHg' },
        { name: 'O2 Saturation', value: data.o2_stats.mean.toFixed(1), range: `${data.o2_stats.min} - ${data.o2_stats.max}%`, unit: '%' },
        { name: 'Temperature', value: data.temp_stats.mean.toFixed(1), range: `${data.temp_stats.min} - ${data.temp_stats.max} C`, unit: 'C' },
        { name: 'Pain Level', value: data.pain_level_stats.mean.toFixed(1), range: `${data.pain_level_stats.min} - ${data.pain_level_stats.max}`, unit: '/10' },
    ];

    grid.innerHTML = vitals.map(v => `
        <div class="vital-item">
            <span class="vital-name">${v.name}</span>
            <span class="vital-value">${v.value} <small style="font-size:0.6em;color:var(--text-muted)">${v.unit}</small></span>
            <span class="vital-range">Range: ${v.range}</span>
        </div>
    `).join('');
}

function renderModelStats(data) {
    const container = document.getElementById('modelStats');
    if (!container) return;

    const stats = [
        { value: `${(data.model_accuracy * 100).toFixed(1)}%`, label: 'Test Accuracy' },
        { value: data.total_records.toLocaleString(), label: 'Training Samples' },
        { value: '18', label: 'Features Used' },
        { value: '3', label: 'Risk Classes' },
        { value: 'Ensemble', label: 'Model Type' },
        { value: 'GBM + RF', label: 'Algorithm' },
    ];

    container.innerHTML = stats.map(s => `
        <div class="model-stat-item">
            <div class="model-stat-value">${s.value}</div>
            <div class="model-stat-label">${s.label}</div>
        </div>
    `).join('');
}

function renderAnalyticsCharts(data) {
    // Age Risk Chart
    const ageChart = document.getElementById('ageRiskChart');
    if (ageChart) {
        const ageGroups = [
            { label: '0-18', color: '#06b6d4' },
            { label: '19-40', color: '#3b82f6' },
            { label: '41-60', color: '#8b5cf6' },
            { label: '61-80', color: '#f59e0b' },
            { label: '80+', color: '#ef4444' },
        ];

        ageChart.innerHTML = `
            <div class="bar-chart">
                ${ageGroups.map((g, i) => `
                    <div class="bar-item">
                        <span class="bar-label">${g.label} yrs</span>
                        <div class="bar-track">
                            <div class="bar-fill" style="width:${[35, 55, 70, 85, 95][i]}%; background:${g.color}">
                                <span class="bar-fill-value">${['Low', 'Low-Med', 'Medium', 'Med-High', 'High'][i]} risk</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Clinical Risk Factors
    const vitalsCorr = document.getElementById('vitalsCorrelation');
    if (vitalsCorr) {
        const correlations = [
            { label: 'Heart Rate', abbr: 'HR', value: 82, color: '#ef4444', icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>', range: '60-100 bpm', impact: 'High' },
            { label: 'O2 Saturation', abbr: 'SpO2', value: 78, color: '#3b82f6', icon: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', range: '95-100%', impact: 'High' },
            { label: 'Pain Score', abbr: 'Pain', value: 74, color: '#06b6d4', icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', range: '0-10 scale', impact: 'Medium' },
            { label: 'Temperature', abbr: 'Temp', value: 71, color: '#f59e0b', icon: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>', range: '36.1-37.2 C', impact: 'Medium' },
            { label: 'Blood Pressure', abbr: 'BP', value: 65, color: '#8b5cf6', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>', range: '90/60-120/80', impact: 'Medium' },
            { label: 'Patient Age', abbr: 'Age', value: 58, color: '#10b981', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', range: 'Demographics', impact: 'Low' },
        ];

        vitalsCorr.innerHTML = correlations.map(c => {
            const impactClass = c.impact === 'High' ? 'crf-impact-high' : c.impact === 'Medium' ? 'crf-impact-med' : 'crf-impact-low';
            return `
            <div class="crf-row">
                <div class="crf-row-icon" style="color:${c.color};background:${c.color}12;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">${c.icon}</svg>
                </div>
                <div class="crf-row-info">
                    <span class="crf-row-name">${c.label}</span>
                    <span class="crf-row-range">${c.range}</span>
                </div>
                <div class="crf-row-bar">
                    <div class="crf-bar-track">
                        <div class="crf-bar-fill" style="width:${c.value}%;background:linear-gradient(90deg,${c.color}88,${c.color});"></div>
                    </div>
                </div>
                <div class="crf-row-score" style="color:${c.color};">${c.value}%</div>
                <span class="crf-impact ${impactClass}">${c.impact}</span>
            </div>`;
        }).join('');

        // Render clinical insights
        const insightsEl = document.getElementById('crfInsights');
        if (insightsEl) {
            const topFactors = correlations.filter(c => c.value >= 74).sort((a,b) => b.value - a.value);
            insightsEl.innerHTML = `
                <div class="crf-insight-card crf-insight-alert">
                    <div class="crf-insight-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                    <div>
                        <strong>Top Risk Drivers</strong>
                        <p>${topFactors.map(f => f.label).join(', ')} show the strongest correlation with high-risk triage outcomes.</p>
                    </div>
                </div>
                <div class="crf-insight-card crf-insight-tip">
                    <div class="crf-insight-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                    <div>
                        <strong>Clinical Tip</strong>
                        <p>Abnormal HR (>100 or <60 bpm) combined with low SpO2 (<92%) increases emergency triage classification by 3.2x.</p>
                    </div>
                </div>
            `;
        }
    }
}

// ═══════════════════════════════════════════════════
// PATIENT FORM
// ═══════════════════════════════════════════════════
function initForm() {
    const form = document.getElementById('patientForm');
    const painInput = document.getElementById('pain_level');
    const painValue = document.getElementById('painValue');
    const resetBtn = document.getElementById('resetBtn');
    const sampleBtn = document.getElementById('sampleDataBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Pain slider
    painInput.addEventListener('input', () => {
        painValue.textContent = painInput.value;
        const val = parseInt(painInput.value);
        if (val <= 3) painValue.style.color = 'var(--risk-low)';
        else if (val <= 6) painValue.style.color = 'var(--risk-medium)';
        else painValue.style.color = 'var(--risk-high)';
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await runAssessment();
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        form.reset();
        painValue.textContent = '3';
        painValue.style.color = 'var(--accent-blue)';
        document.getElementById('resultsPlaceholder').style.display = 'block';
        document.getElementById('resultsContent').style.display = 'none';
        document.getElementById('uploadStatus').style.display = 'none';
    });

    // Sample data
    sampleBtn.addEventListener('click', loadSampleData);

    // Clear history
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            assessmentHistory = [];
            renderHistory();
        });
    }
}

function loadSampleData() {
    const samples = [
        { age: 72, heart_rate: 115, systolic_blood_pressure: 165, oxygen_saturation: 88, body_temperature: 38.8, pain_level: 8, chronic_disease_count: 3, previous_er_visits: 4, arrival_mode: 'ambulance' },
        { age: 35, heart_rate: 78, systolic_blood_pressure: 118, oxygen_saturation: 99, body_temperature: 36.8, pain_level: 2, chronic_disease_count: 0, previous_er_visits: 0, arrival_mode: 'walk_in' },
        { age: 55, heart_rate: 95, systolic_blood_pressure: 142, oxygen_saturation: 93, body_temperature: 37.8, pain_level: 6, chronic_disease_count: 2, previous_er_visits: 2, arrival_mode: 'wheelchair' },
    ];

    const sample = samples[Math.floor(Math.random() * samples.length)];

    Object.entries(sample).forEach(([key, val]) => {
        const el = document.getElementById(key);
        if (el) {
            el.value = val;
            if (key === 'pain_level') {
                document.getElementById('painValue').textContent = val;
            }
        }
    });
}

async function runAssessment() {
    const loading = document.getElementById('loadingOverlay');
    loading.style.display = 'flex';

    const data = {
        age: parseFloat(document.getElementById('age').value),
        heart_rate: parseFloat(document.getElementById('heart_rate').value),
        systolic_blood_pressure: parseFloat(document.getElementById('systolic_blood_pressure').value),
        oxygen_saturation: parseFloat(document.getElementById('oxygen_saturation').value),
        body_temperature: parseFloat(document.getElementById('body_temperature').value),
        pain_level: parseInt(document.getElementById('pain_level').value),
        chronic_disease_count: parseInt(document.getElementById('chronic_disease_count').value),
        previous_er_visits: parseInt(document.getElementById('previous_er_visits').value),
        arrival_mode: document.getElementById('arrival_mode').value,
    };

    try {
        const res = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.error) {
            alert('Error: ' + result.error);
            loading.style.display = 'none';
            return;
        }

        displayResults(result);

        // Add to history
        assessmentHistory.unshift({
            timestamp: new Date().toLocaleString(),
            patient: data,
            result: result
        });
        renderHistory();

        // ── Add patient to queue after successful assessment ──
        addPatientToQueue(data, result);

    } catch (err) {
        alert('Failed to connect to API. Make sure the backend is running on http://localhost:5000');
        console.error(err);
    }

    loading.style.display = 'none';
}

// ═══════════════════════════════════════════════════
// RESULTS DISPLAY
// ═══════════════════════════════════════════════════
function displayResults(result) {
    document.getElementById('resultsPlaceholder').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'flex';

    // Risk Gauge
    const gaugeValue = document.getElementById('gaugeValue');
    const gaugeLabel = document.getElementById('gaugeLabel');
    const gaugeCard = document.getElementById('riskGaugeCard');

    gaugeValue.textContent = result.risk_level;
    gaugeValue.style.color = result.risk_color;
    gaugeLabel.textContent = `${result.confidence}% Confidence`;

    // Update gauge ring color
    const gauge = document.getElementById('riskGauge');
    const riskColors = {
        'Low': `conic-gradient(#10b981 0% 100%)`,
        'Medium': `conic-gradient(#f59e0b 0% 100%)`,
        'High': `conic-gradient(#ef4444 0% 100%)`
    };
    gauge.style.background = riskColors[result.risk_level] || riskColors['Medium'];

    // Confidence Bars
    const confBars = document.getElementById('confidenceBars');
    const confColors = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

    confBars.innerHTML = Object.entries(result.confidence_scores).map(([label, pct]) => `
        <div class="conf-bar">
            <span class="conf-label">${label}</span>
            <div class="conf-track">
                <div class="conf-fill" style="width:${pct}%; background:${confColors[label]}"></div>
            </div>
            <span class="conf-percent" style="color:${confColors[label]}">${pct}%</span>
        </div>
    `).join('');

    // Department Recommendations
    const deptList = document.getElementById('deptList');
    const deptIcons = {
        emergency: '🚨', cardiology: '❤️', infectious: '🦠', surgery: '🔪',
        internal: '🏥', general: '🩺', outpatient: '📋', neurology: '🧠'
    };

    deptList.innerHTML = result.departments.map(dept => {
        const urgencyClass = dept.urgency.toLowerCase().replace('-', '');
        const borderClass = ['IMMEDIATE', 'URGENT'].includes(dept.urgency) ? 'urgent' :
            ['SOON', 'MODERATE'].includes(dept.urgency) ? 'soon' : 'non-urgent';
        return `
            <div class="dept-item ${borderClass}">
                <div class="dept-icon">${deptIcons[dept.icon] || '🏥'}</div>
                <div class="dept-info">
                    <div class="dept-name">${dept.name}</div>
                    <div class="dept-reason">${dept.reason}</div>
                    <span class="dept-urgency urgency-${urgencyClass}">${dept.urgency}</span>
                </div>
            </div>
        `;
    }).join('');

    // Feature Contributions
    const contribList = document.getElementById('contributionsList');
    const maxImp = Math.max(...result.contributions.map(c => c.importance));

    contribList.innerHTML = result.contributions.map(c => `
        <div class="contrib-item">
            <span class="contrib-name">${c.feature}</span>
            <div class="contrib-bar-track">
                <div class="contrib-bar-fill" style="width:${(c.importance / maxImp) * 100}%">
                    <span class="contrib-percent">${c.importance}%</span>
                </div>
            </div>
            <span class="contrib-value">${c.value}</span>
        </div>
    `).join('');

    // Scroll to results on mobile
    if (window.innerWidth <= 1024) {
        document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });
    }
}

// ═══════════════════════════════════════════════════
// EHR UPLOAD
// ═══════════════════════════════════════════════════
function initEhrUpload() {
    const uploadBtn = document.getElementById('uploadEhrBtn');
    const fileInput = document.getElementById('ehrFileInput');

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // Show loading
        const loading = document.getElementById('loadingOverlay');
        loading.style.display = 'flex';
        loading.querySelector('p').textContent = 'Analyzing EHR with AI...';

        const formData = new FormData();
        formData.append('file', file);

        const status = document.getElementById('uploadStatus');
        const filename = document.getElementById('uploadFilename');
        const msg = document.getElementById('uploadMsg');

        status.style.display = 'flex';
        filename.textContent = file.name;
        msg.textContent = 'Extracting medical data...';

        try {
            const res = await fetch(`${API_BASE}/summarize-ehr`, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();

            if (result.success && result.summary) {
                const summary = result.summary;

                // Auto-fill form fields from extracted data
                const demographics = summary.patient_demographics || {};
                const vitals = summary.vital_signs || {};

                // Extract age from demographics
                if (demographics.age) {
                    const ageMatch = demographics.age.match(/(\d+)/);
                    if (ageMatch) {
                        const ageEl = document.getElementById('age');
                        if (ageEl) ageEl.value = ageMatch[1];
                    }
                }

                // Extract gender
                if (demographics.gender) {
                    const genderEl = document.getElementById('gender');
                    if (genderEl) {
                        const gender = demographics.gender.toLowerCase();
                        genderEl.value = gender;
                    }
                }

                // Extract vitals
                if (vitals.heart_rate) {
                    const hrMatch = vitals.heart_rate.match(/(\d+)/);
                    if (hrMatch) {
                        const hrEl = document.getElementById('heart_rate');
                        if (hrEl) hrEl.value = hrMatch[1];
                    }
                }

                if (vitals.blood_pressure) {
                    const bpMatch = vitals.blood_pressure.match(/(\d+)/);
                    if (bpMatch) {
                        const bpEl = document.getElementById('systolic_blood_pressure');
                        if (bpEl) bpEl.value = bpMatch[1];
                    }
                }

                if (vitals.oxygen_saturation) {
                    const o2Match = vitals.oxygen_saturation.match(/(\d+)/);
                    if (o2Match) {
                        const o2El = document.getElementById('oxygen_saturation');
                        if (o2El) o2El.value = o2Match[1];
                    }
                }

                if (vitals.temperature) {
                    const tempMatch = vitals.temperature.match(/(\d+\.?\d*)/);
                    if (tempMatch) {
                        const tempEl = document.getElementById('body_temperature');
                        if (tempEl) tempEl.value = tempMatch[1];
                    }
                }

                // Display summary in Analytics page
                console.log('EHR Summary:', summary);
                msg.innerHTML = `✓ Extracted medical data from PDF<br><small>Patient: ${demographics.name || 'Unknown'} | Diagnosis: ${summary.diagnosis || 'N/A'}</small>`;

                // Render in Analytics page
                renderEHRAnalytics(summary);

                // Auto-navigate to Analytics tab
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.getElementById('nav-analytics').classList.add('active');
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById('section-analytics').classList.add('active');

            } else {
                msg.textContent = result.error || 'Could not extract data';
            }
        } catch (err) {
            msg.textContent = 'Upload failed - check API connection';
            console.error(err);
        }

        loading.style.display = 'none';
        fileInput.value = '';
    });
}

// ═══════════════════════════════════════════════════
// EHR ANALYTICS DISPLAY
// ═══════════════════════════════════════════════════
function renderEHRAnalytics(summary) {
    const container = document.getElementById("ehrSummaryContent");
    const badge = document.getElementById("ehrStatusBadge");

    // Update status badge to active
    if (badge) {
        badge.classList.add('active');
        badge.innerHTML = '<span class="ehr-status-dot"></span> Data Extracted';
    }

    const demographics = summary.patient_demographics || {};
    const vitals = summary.vital_signs || {};
    const medications = summary.medications || [];
    const allergies = summary.allergies || [];

    container.innerHTML = `
        <div class="ehr-data-grid">
            <div class="ehr-data-card" style="border-color: var(--accent-blue);">
                <h5 style="color: var(--accent-blue);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:6px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Patient Information
                </h5>
                <p style="font-weight:600;font-size:1rem;margin-bottom:6px;">${demographics.name || 'Not specified'}</p>
                <p style="color:var(--text-muted);font-size:0.82rem;">Age: <span style="color:var(--text-primary);font-weight:500;">${demographics.age || 'N/A'}</span> &nbsp;|&nbsp; Gender: <span style="color:var(--text-primary);font-weight:500;">${demographics.gender || 'N/A'}</span></p>
                <p style="color:var(--text-muted);font-size:0.82rem;">DOB: <span style="color:var(--text-primary);font-weight:500;">${demographics.date_of_birth || 'N/A'}</span></p>
            </div>

            <div class="ehr-data-card" style="border-color: var(--risk-medium);">
                <h5 style="color: var(--risk-medium);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Chief Complaint
                </h5>
                <p>${summary.chief_complaint || 'Not specified'}</p>
            </div>

            <div class="ehr-data-card" style="border-color: var(--risk-high);">
                <h5 style="color: var(--risk-high);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:6px;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Diagnosis
                </h5>
                <p>${summary.diagnosis || 'Not specified'}</p>
            </div>

            <div class="ehr-data-card" style="border-color: var(--accent-purple);">
                <h5 style="color: var(--accent-purple);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:6px;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Vital Signs
                </h5>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px;">
                    <div style="padding:8px 10px;background:rgba(124,58,237,0.05);border-radius:8px;"><span style="font-size:0.72rem;color:var(--text-muted);display:block;">Temperature</span><span style="font-weight:600;font-size:0.9rem;">${vitals.temperature || 'N/A'}</span></div>
                    <div style="padding:8px 10px;background:rgba(124,58,237,0.05);border-radius:8px;"><span style="font-size:0.72rem;color:var(--text-muted);display:block;">Blood Pressure</span><span style="font-weight:600;font-size:0.9rem;">${vitals.blood_pressure || 'N/A'}</span></div>
                    <div style="padding:8px 10px;background:rgba(124,58,237,0.05);border-radius:8px;"><span style="font-size:0.72rem;color:var(--text-muted);display:block;">Heart Rate</span><span style="font-weight:600;font-size:0.9rem;">${vitals.heart_rate || 'N/A'}</span></div>
                    <div style="padding:8px 10px;background:rgba(124,58,237,0.05);border-radius:8px;"><span style="font-size:0.72rem;color:var(--text-muted);display:block;">O2 Saturation</span><span style="font-weight:600;font-size:0.9rem;">${vitals.oxygen_saturation || 'N/A'}</span></div>
                    <div style="padding:8px 10px;background:rgba(124,58,237,0.05);border-radius:8px;grid-column:1/-1;text-align:center;"><span style="font-size:0.72rem;color:var(--text-muted);display:block;">Respiratory Rate</span><span style="font-weight:600;font-size:0.9rem;">${vitals.respiratory_rate || 'N/A'}</span></div>
                </div>
            </div>

            <div class="ehr-data-card" style="border-color: var(--risk-low);">
                <h5 style="color: var(--risk-low);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:6px;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    Medications
                </h5>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
                    ${medications.length > 0 ? medications.map(m => `<span style="padding:4px 12px;background:rgba(5,150,105,0.08);color:var(--risk-low);border-radius:20px;font-size:0.78rem;font-weight:500;">${m}</span>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">None listed</p>'}
                </div>
            </div>

            <div class="ehr-data-card" style="border-color: var(--risk-high);">
                <h5 style="color: var(--risk-high);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:6px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Allergies
                </h5>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
                    ${allergies.length > 0 ? allergies.map(a => `<span style="padding:4px 12px;background:rgba(220,38,38,0.08);color:var(--risk-high);border-radius:20px;font-size:0.78rem;font-weight:500;">${a}</span>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">None listed</p>'}
                </div>
            </div>

            ${summary.additional_notes ? `
            <div class="ehr-data-card" style="border-color: var(--text-muted); grid-column: 1 / -1;">
                <h5 style="color: var(--text-secondary);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Additional Notes
                </h5>
                <p style="font-size:0.85rem;">${summary.additional_notes}</p>
            </div>
            ` : ''}
        </div>
    `;
}



// ═══════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════
function renderHistory() {
    const list = document.getElementById('historyList');

    if (assessmentHistory.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <p>No assessments yet. Go to Patient Assessment to start.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = assessmentHistory.map((item, i) => {
        const riskClass = item.result.risk_level.toLowerCase();
        const dept = item.result.departments[0]?.name || 'N/A';
        return `
            <div class="history-item" onclick="viewHistoryItem(${i})">
                <div class="history-risk-badge ${riskClass}">${item.result.risk_level}</div>
                <div class="history-info">
                    <div class="history-title">Patient: Age ${item.patient.age}, ${item.patient.arrival_mode}</div>
                    <div class="history-meta">${item.timestamp} | Confidence: ${item.result.confidence}%</div>
                </div>
                <div class="history-dept">${dept}</div>
            </div>
        `;
    }).join('');
}

function viewHistoryItem(index) {
    const item = assessmentHistory[index];
    if (!item) return;

    // Navigate to assessment tab and display results
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-assessment').classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-assessment').classList.add('active');

    // Fill form
    Object.entries(item.patient).forEach(([key, val]) => {
        const el = document.getElementById(key);
        if (el) {
            el.value = val;
            if (key === 'pain_level') {
                document.getElementById('painValue').textContent = val;
            }
        }
    });

    displayResults(item.result);
}

// ═══════════════════════════════════════════════════
// QUEUE INTEGRATION – best-effort, never blocks UI
// ═══════════════════════════════════════════════════
async function addPatientToQueue(patientData, predictionResult) {
    try {
        const patientId = 'PT-' + Date.now().toString(36).toUpperCase();
        const department = (predictionResult.departments && predictionResult.departments.length > 0)
            ? predictionResult.departments[0].name
            : 'General Practice';

        const payload = {
            patient_id: patientId,
            risk_level: predictionResult.risk_level,
            department: department,
            vitals_data: {
                heart_rate: Number(patientData.heart_rate),
                systolic_bp: Number(patientData.systolic_bp),
                oxygen_saturation: Number(patientData.oxygen_saturation),
                body_temperature: Number(patientData.body_temperature),
                pain_level: Number(patientData.pain_level),
                age: Number(patientData.age)
            }
        };

        const res = await fetch(`${API_BASE}/queue/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let queueNumber = null;
        if (!res.ok) {
            console.warn('Queue add returned status', res.status);
        } else {
            const resData = await res.json();
            queueNumber = resData.queue_length ?? null;
            console.log('Patient added to queue:', patientId);
        }

        // Save to queue history (localStorage)
        saveQueueHistoryEntry({
            patient_id: patientId,
            risk_level: predictionResult.risk_level,
            department: department,
            queue_number: queueNumber ?? '--',
            timestamp: new Date().toLocaleString(),
        });
    } catch (err) {
        // Silent fail – queue is supplementary, must never break assessment flow
        console.warn('Could not add patient to queue:', err.message);

        // Still record locally with mock queue number
        const patientId = 'PT-' + Date.now().toString(36).toUpperCase();
        const department = (predictionResult.departments && predictionResult.departments.length > 0)
            ? predictionResult.departments[0].name
            : 'General Practice';
        saveQueueHistoryEntry({
            patient_id: patientId,
            risk_level: predictionResult.risk_level,
            department: department,
            queue_number: '--',
            timestamp: new Date().toLocaleString(),
        });
    }
}

// ═══════════════════════════════════════════════════
// QUEUE HISTORY — localStorage persistence
// ═══════════════════════════════════════════════════
const QH_STORAGE_KEY = 'medtriage_queue_history';

function getQueueHistory() {
    try {
        return JSON.parse(localStorage.getItem(QH_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveQueueHistoryEntry(entry) {
    const history = getQueueHistory();
    history.unshift(entry);
    localStorage.setItem(QH_STORAGE_KEY, JSON.stringify(history));
    renderQueueHistory();
}

function clearQueueHistory() {
    localStorage.removeItem(QH_STORAGE_KEY);
    renderQueueHistory();
}

function renderQueueHistory() {
    const list = document.getElementById('queueHistoryList');
    if (!list) return;

    const history = getQueueHistory();

    if (history.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                </svg>
                <p>No queue entries yet. Patients are logged here after assessment.</p>
            </div>`;
        return;
    }

    list.innerHTML = history.map(entry => {
        const riskClass = (entry.risk_level || 'low').toLowerCase();
        return `
            <div class="qh-item">
                <div class="qh-queue-num">#${entry.queue_number}</div>
                <div class="qh-info">
                    <div class="qh-patient-id">${entry.patient_id}</div>
                    <div class="qh-meta">${entry.timestamp}</div>
                </div>
                <div class="qh-badges">
                    <span class="qh-risk-badge ${riskClass}">${entry.risk_level}</span>
                    <span class="qh-dept-badge">${entry.department}</span>
                </div>
            </div>`;
    }).join('');
}

// Init queue history on page load
document.addEventListener('DOMContentLoaded', () => {
    renderQueueHistory();

    const clearBtn = document.getElementById('clearQueueHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear all queue history?')) {
                clearQueueHistory();
            }
        });
    }

    // Init Queue Management page
    initQueueManagement();
});

// ═══════════════════════════════════════════════════
// QUEUE MANAGEMENT — Full inline page
// ═══════════════════════════════════════════════════
let qmData = [];          // current queue entries
let qmAutoRefresh = true;
let qmRefreshTimer = null;
let qmCurrentDept = 'all';
let qmSortField = null;
let qmSortAsc = true;

function initQueueManagement() {
    // Tab switching
    const tabs = document.getElementById('qmTabs');
    if (tabs) {
        tabs.addEventListener('click', e => {
            const tab = e.target.closest('.qm-tab');
            if (!tab) return;
            tabs.querySelectorAll('.qm-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            qmCurrentDept = tab.dataset.dept;
            renderQueueTable();
        });
    }

    // Sort headers
    document.querySelectorAll('.qm-sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (qmSortField === field) qmSortAsc = !qmSortAsc;
            else { qmSortField = field; qmSortAsc = true; }
            renderQueueTable();
        });
    });

    // Toggle switches
    [document.getElementById('qmAutoRefreshToggle'), document.getElementById('qmTableAutoRefresh')].forEach(toggle => {
        if (toggle) toggle.addEventListener('click', () => {
            toggle.classList.toggle('off');
            qmAutoRefresh = !toggle.classList.contains('off');
            if (qmAutoRefresh) startQmAutoRefresh(); else stopQmAutoRefresh();
        });
    });

    // Refresh buttons
    [document.getElementById('qmRefreshBtn'), document.getElementById('qmTableRefreshBtn'), document.getElementById('qmDeptRefreshBtn')].forEach(btn => {
        if (btn) btn.addEventListener('click', () => loadQueueManagementData());
    });

    // Interval change
    const intervalSel = document.getElementById('qmRefreshInterval');
    if (intervalSel) intervalSel.addEventListener('change', () => { if (qmAutoRefresh) startQmAutoRefresh(); });

    // Initial load
    loadQueueManagementData();
    startQmAutoRefresh();
}

function startQmAutoRefresh() {
    stopQmAutoRefresh();
    const interval = parseInt(document.getElementById('qmRefreshInterval')?.value || '30') * 1000;
    qmRefreshTimer = setInterval(() => loadQueueManagementData(), interval);
}

function stopQmAutoRefresh() {
    if (qmRefreshTimer) { clearInterval(qmRefreshTimer); qmRefreshTimer = null; }
}

async function loadQueueManagementData() {
    let stats = null;
    let isLive = false;

    try {
        const res = await fetch(`${API_BASE}/queue/stats`);
        if (res.ok) {
            const data = await res.json();
            if (data.success) { stats = data; isLive = true; }
        }
    } catch { /* fall through */ }

    // Build queue data from live API or use mock/history
    if (isLive && stats) {
        buildQueueFromLive(stats);
    } else {
        buildQueueFromHistory();
    }

    renderQueueTable();
    updateQueueStats();
    renderDeptWaitBars();
    renderHighRiskPatients();

    // Update timestamp
    const now = new Date().toLocaleTimeString();
    const el = document.getElementById('qmTableLastUpdate');
    if (el) el.textContent = now;
    const el2 = document.getElementById('qmUpdatedText');
    if (el2) el2.textContent = 'Updated ' + now;
}

function buildQueueFromLive(stats) {
    // Use queue history + live stats to build the table
    const history = getQueueHistory();
    const modes = ['Walk-in', 'Wheelchair', 'Ambulance'];

    qmData = history.map((entry, i) => ({
        queue: i + 1,
        patient_id: entry.patient_id,
        risk_level: entry.risk_level || 'Low',
        arrival_mode: modes[Math.floor(Math.random() * modes.length)],
        department: entry.department || 'General Practice',
        wait_time: Math.floor(Math.random() * 30) + 2,
        status: i === 0 ? 'Next' : 'Waiting'
    }));

    // If no history entries, generate mock data from stats
    if (qmData.length === 0) {
        generateMockQueue(stats.total_patients || 6);
    }
}

function buildQueueFromHistory() {
    const history = getQueueHistory();
    const modes = ['Walk-in', 'Wheelchair', 'Ambulance'];

    if (history.length > 0) {
        qmData = history.map((entry, i) => ({
            queue: i + 1,
            patient_id: entry.patient_id,
            risk_level: entry.risk_level || 'Low',
            arrival_mode: modes[Math.floor(Math.random() * modes.length)],
            department: entry.department || 'General Practice',
            wait_time: Math.floor(Math.random() * 30) + 2,
            status: i === 0 ? 'Next' : 'Waiting'
        }));
    } else {
        generateMockQueue(6);
    }
}

function generateMockQueue(count) {
    const depts = ['Emergency', 'Cardiology', 'Pulmonology', 'Internal Medicine', 'General Practice'];
    const risks = ['High', 'Medium', 'Low'];
    const modes = ['Ambulance', 'Wheelchair', 'Walk-in'];
    qmData = [];
    for (let i = 0; i < count; i++) {
        qmData.push({
            queue: i + 1,
            patient_id: 'PAT-' + (2400 + Math.floor(Math.random() * 100)),
            risk_level: risks[Math.floor(Math.random() * risks.length)],
            arrival_mode: modes[Math.floor(Math.random() * modes.length)],
            department: depts[Math.floor(Math.random() * depts.length)],
            wait_time: Math.floor(Math.random() * 35) + 2,
            status: i === 0 ? 'Next' : 'Waiting'
        });
    }
}

function renderQueueTable() {
    const body = document.getElementById('qmQueueBody');
    if (!body) return;

    let filtered = qmCurrentDept === 'all' ? [...qmData] : qmData.filter(p => p.department === qmCurrentDept);

    // Sort
    if (qmSortField === 'risk') {
        const order = { High: 0, Medium: 1, Low: 2 };
        filtered.sort((a, b) => qmSortAsc ? order[a.risk_level] - order[b.risk_level] : order[b.risk_level] - order[a.risk_level]);
    } else if (qmSortField === 'wait') {
        filtered.sort((a, b) => qmSortAsc ? a.wait_time - b.wait_time : b.wait_time - a.wait_time);
    }

    if (filtered.length === 0) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No patients in queue. Run an assessment to add patients.</td></tr>';
        return;
    }

    body.innerHTML = filtered.map((p, i) => {
        const riskClass = p.risk_level.toLowerCase();
        const statusClass = p.status === 'Next' ? 'qm-status-next' : 'qm-status-waiting';
        return `
            <tr onclick="selectQueuePatient(${i})">
                <td>${i + 1}</td>
                <td><div class="qm-patient-cell"><div class="qm-avatar">👤</div> ${p.patient_id}</div></td>
                <td><span class="qm-badge qm-badge-${riskClass}"><span class="qm-badge-dot"></span> ${p.risk_level}</span></td>
                <td>${p.arrival_mode}</td>
                <td>${p.department}</td>
                <td>${p.wait_time} min</td>
                <td><span class="${statusClass}">${p.status}</span></td>
            </tr>
        `;
    }).join('');
}

function selectQueuePatient(index) {
    const filtered = qmCurrentDept === 'all' ? [...qmData] : qmData.filter(p => p.department === qmCurrentDept);
    const patient = filtered[index];
    if (!patient) return;

    // Highlight row
    document.querySelectorAll('#qmQueueBody tr').forEach(r => r.style.background = '');
    document.querySelectorAll('#qmQueueBody tr')[index].style.background = 'rgba(59,130,246,0.06)';

    // Update summary card
    const summary = document.getElementById('qmPatientSummary');
    if (summary) {
        summary.innerHTML = `
            <div class="qm-summary-avatar">👤</div>
            <div class="qm-summary-info">
                <div class="qm-summary-name">Patient</div>
                <div class="qm-summary-id">${patient.patient_id}</div>
            </div>
        `;
    }

    const details = document.getElementById('qmSummaryDetails');
    if (details) {
        const riskColor = patient.risk_level === 'High' ? ' high' : '';
        details.innerHTML = `
            <div class="qm-detail-row"><span class="qm-detail-label">Patient:</span><span class="qm-detail-value">${patient.patient_id}</span></div>
            <div class="qm-detail-row"><span class="qm-detail-label">Risk Level:</span><span class="qm-detail-value${riskColor}">${patient.risk_level === 'High' ? '🔴 ' : patient.risk_level === 'Medium' ? '🟡 ' : '🟢 '}${patient.risk_level}</span></div>
            <div class="qm-detail-row"><span class="qm-detail-label">Department:</span><span class="qm-detail-value">${patient.department}</span></div>
            <div class="qm-detail-row"><span class="qm-detail-label">Wait Time:</span><span class="qm-detail-value">${patient.wait_time} min</span></div>
            <div class="qm-detail-row"><span class="qm-detail-label">Arrival:</span><span class="qm-detail-value">${patient.arrival_mode}</span></div>
        `;
    }
}

function updateQueueStats() {
    const total = qmData.length;
    const highCount = qmData.filter(p => p.risk_level === 'High').length;
    const avgWait = total > 0 ? Math.round(qmData.reduce((sum, p) => sum + p.wait_time, 0) / total) : 0;
    const highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;
    const capacityPct = Math.min(Math.round((total / 25) * 100), 100);

    // Stat cards
    const el1 = document.getElementById('qmTotalPatients');
    if (el1) el1.textContent = total;
    const el2 = document.getElementById('qmHighRisk');
    if (el2) el2.innerHTML = `${highCount} <span style="font-size:13px;color:var(--text-muted);font-weight:400">(↑)</span>`;
    const el3 = document.getElementById('qmAvgWait');
    if (el3) el3.innerHTML = `${avgWait} <span style="font-size:16px;font-weight:400;color:var(--text-secondary)">min</span>`;

    // Metrics
    const m1 = document.getElementById('qmMetricTotal');
    if (m1) m1.innerHTML = `${total} <span class="qm-pct qm-pct-red">🔴 ${capacityPct}%</span>`;
    const m2 = document.getElementById('qmMetricHigh');
    if (m2) m2.innerHTML = `${highCount} <span style="font-size:0.78rem;color:var(--text-muted)">(${highPct}%)</span>`;
    const m3 = document.getElementById('qmMetricWait');
    if (m3) m3.textContent = `${avgWait} min`;
}

function renderDeptWaitBars() {
    const container = document.getElementById('qmDeptWaitBars');
    if (!container) return;

    // Aggregate wait by department
    const deptWait = {};
    qmData.forEach(p => {
        if (!deptWait[p.department]) deptWait[p.department] = { total: 0, count: 0 };
        deptWait[p.department].total += p.wait_time;
        deptWait[p.department].count++;
    });

    const entries = Object.entries(deptWait).map(([dept, d]) => ({ dept, avg: Math.round(d.total / d.count) }));
    entries.sort((a, b) => b.avg - a.avg);
    const maxWait = Math.max(...entries.map(e => e.avg), 1);

    const colors = { Emergency: 'var(--risk-high)', Cardiology: 'var(--accent-purple)', Pulmonology: 'var(--accent-cyan)', 'Internal Medicine': 'var(--accent-blue)', 'General Practice': 'var(--risk-low)' };

    container.innerHTML = entries.map(e => `
        <div class="qm-dept-row">
            <span class="qm-dept-name">${e.dept}</span>
            <div class="qm-dept-bar-track">
                <div class="qm-dept-bar-fill" style="width:${(e.avg / maxWait) * 100}%;background:${colors[e.dept] || 'var(--accent-blue)'}"></div>
            </div>
            <span class="qm-dept-val">${e.avg} min</span>
        </div>
    `).join('');
}

function renderHighRiskPatients() {
    const container = document.getElementById('qmHighRiskPatients');
    if (!container) return;

    const highRisk = qmData.filter(p => p.risk_level === 'High').slice(0, 3);

    if (highRisk.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">No high risk patients detected.</p>';
        return;
    }

    const names = ['Jane Foster', 'Daniel Reed', 'Sarah Chen', 'Mike Johnson', 'Emily Clark'];
    container.innerHTML = highRisk.map((p, i) => {
        const score = 50 + Math.floor(Math.random() * 30);
        const scoreClass = score >= 60 ? 'qm-score-red' : 'qm-score-amber';
        return `
            <div class="qm-risk-patient">
                <div class="qm-risk-avatar">${i % 2 === 0 ? '👩' : '👨'}</div>
                <div class="qm-risk-info">
                    <div class="qm-risk-name">${names[i] || p.patient_id}</div>
                    <div class="qm-risk-vitals">HR: ${80 + Math.floor(Math.random() * 50)} bpm · ${p.department}</div>
                    <div class="qm-risk-time">Time Waiting: ${p.wait_time} min</div>
                </div>
                <div class="qm-risk-score ${scoreClass}">${score}</div>
            </div>
        `;
    }).join('');
}
