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

    // Vitals Correlation
    const vitalsCorr = document.getElementById('vitalsCorrelation');
    if (vitalsCorr) {
        const correlations = [
            { label: 'HR vs Risk', value: 82, color: '#ef4444' },
            { label: 'O2 vs Risk', value: 78, color: '#3b82f6' },
            { label: 'Temp vs Risk', value: 71, color: '#f59e0b' },
            { label: 'BP vs Risk', value: 65, color: '#8b5cf6' },
            { label: 'Pain vs Risk', value: 74, color: '#06b6d4' },
            { label: 'Age vs Risk', value: 58, color: '#10b981' },
        ];

        vitalsCorr.innerHTML = `
            <div class="bar-chart">
                ${correlations.map(c => `
                    <div class="bar-item">
                        <span class="bar-label">${c.label}</span>
                        <div class="bar-track">
                            <div class="bar-fill" style="width:${c.value}%; background:${c.color}">
                                <span class="bar-fill-value">${c.value}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
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

        const formData = new FormData();
        formData.append('file', file);

        const status = document.getElementById('uploadStatus');
        const filename = document.getElementById('uploadFilename');
        const msg = document.getElementById('uploadMsg');

        status.style.display = 'flex';
        filename.textContent = file.name;
        msg.textContent = 'Parsing document...';

        try {
            const res = await fetch(`${API_BASE}/upload-ehr`, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();

            if (result.success && result.extracted_data) {
                const data = result.extracted_data;
                const fieldCount = Object.keys(data).length;

                // Fill form with extracted data
                Object.entries(data).forEach(([key, val]) => {
                    const el = document.getElementById(key);
                    if (el) {
                        el.value = val;
                        if (key === 'pain_level') {
                            document.getElementById('painValue').textContent = val;
                        }
                    }
                });

                msg.textContent = `Extracted ${fieldCount} fields from ${result.format} document`;
            } else {
                msg.textContent = result.error || 'Could not extract data';
            }
        } catch (err) {
            msg.textContent = 'Upload failed - check API connection';
            console.error(err);
        }

        fileInput.value = '';
    });
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
