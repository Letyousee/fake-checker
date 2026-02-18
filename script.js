/* ============================================================
   INSTAGRAM FAKE FOLLOWER CHECKER
   fake-checker-script.js — BuyRealFollows.com
   ============================================================ */

'use strict';

/* ─── BENCHMARK TIERS ────────────────────────────────────────── */
const TIERS = [
  { name: 'Nano',     min: 1000,    max: 10000,   avgER: 4.5 },
  { name: 'Micro',    min: 10001,   max: 100000,  avgER: 3 },
  { name: 'Mid-Tier', min: 100001,  max: 500000,  avgER: 2.5 },
  { name: 'Macro',    min: 500001,  max: 1000000, avgER: 1.5 },
  { name: 'Mega',     min: 1000001, max: Infinity, avgER: 1 }
];

/* ─── RISK LEVELS ────────────────────────────────────────────── */
const RISK_LEVELS = {
  excellent: {
    label: 'Highly Authentic',
    icon: '✅',
    color: '#10b981',
    bg: '#d1fae5',
    border: '#34d399'
  },
  good: {
    label: 'Mostly Real',
    icon: '👍',
    color: '#3b82f6',
    bg: '#dbeafe',
    border: '#60a5fa'
  },
  moderate: {
    label: 'Moderate Risk',
    icon: '⚠️',
    color: '#f59e0b',
    bg: '#fef3c7',
    border: '#fbbf24'
  },
  high: {
    label: 'High Risk',
    icon: '⛔',
    color: '#ef4444',
    bg: '#fee2e2',
    border: '#f87171'
  },
  critical: {
    label: 'Mostly Fake',
    icon: '🚫',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#dc2626'
  }
};

/* ─── MAIN ANALYSIS FUNCTION ─────────────────────────────────── */
function analyzeFakeFollowers() {
  clearError();

  // Get input values
  const followers  = parseFloat(document.getElementById('followers').value);
  const avgLikes   = parseFloat(document.getElementById('avg-likes').value);
  
  // Optional fields (provide defaults if not filled)
  const following  = parseFloat(document.getElementById('following').value) || 0;
  const posts      = parseFloat(document.getElementById('posts').value) || Math.max(50, Math.round(followers * 0.005)); // Estimate ~0.5% of followers
  const avgComments = parseFloat(document.getElementById('avg-comments').value) || Math.round(avgLikes * 0.05); // Estimate 5% of likes

  // Validation - only require followers and avg likes
  if (!followers || followers <= 0) {
    showError('Please enter total followers');
    return;
  }
  if (!avgLikes && avgLikes !== 0) {
    showError('Please enter average likes per post');
    return;
  }
  if (avgLikes < 0) {
    showError('Likes cannot be negative');
    return;
  }

  // Run analysis
  const analysis = performAnalysis(followers, following, posts, avgLikes, avgComments);

  // Display results
  displayResults(analysis);
}

/* ─── CORE ANALYSIS ALGORITHM ────────────────────────────────── */
function performAnalysis(followers, following, posts, avgLikes, avgComments) {
  let authenticityScore = 100;
  const redFlags = [];
  const greenFlags = [];

  // Calculate metrics
  const engagementRate = ((avgLikes + avgComments) / followers) * 100;
  const lcRatio = avgComments > 0 ? avgLikes / avgComments : 0;
  const ffRatio = following > 0 ? followers / following : followers;
  const postsPerFollower = posts / followers;

  const tier = getTier(followers);

  // ═══════════════════════════════════════════════════════════
  // INDICATOR 1: Engagement Rate (Weight: 35%)
  // ═══════════════════════════════════════════════════════════
  if (engagementRate < tier.avgER * 0.3) {
    authenticityScore -= 35;
    redFlags.push('Very low engagement rate for follower count (possible bot followers)');
  } else if (engagementRate < tier.avgER * 0.5) {
    authenticityScore -= 20;
    redFlags.push('Below-average engagement rate suggests inactive audience');
  } else if (engagementRate < tier.avgER) {
    authenticityScore -= 10;
    redFlags.push('Engagement rate is slightly below tier average');
  } else if (engagementRate >= tier.avgER) {
    greenFlags.push('Healthy engagement rate for follower count');
  }

  // ═══════════════════════════════════════════════════════════
  // INDICATOR 2: Like-to-Comment Ratio (Weight: 20%)
  // ═══════════════════════════════════════════════════════════
  if (lcRatio > 100) {
    authenticityScore -= 25;
    redFlags.push(`Extremely high like-to-comment ratio (${lcRatio.toFixed(0)}:1) indicates bot-generated likes`);
  } else if (lcRatio > 50) {
    authenticityScore -= 15;
    redFlags.push(`High like-to-comment ratio (${lcRatio.toFixed(0)}:1) suggests low-quality engagement`);
  } else if (lcRatio > 30) {
    authenticityScore -= 8;
    redFlags.push('Above-average like-to-comment ratio');
  } else if (lcRatio < 3 && lcRatio > 0) {
    authenticityScore -= 20;
    redFlags.push(`Unusually low like-to-comment ratio (${lcRatio.toFixed(1)}:1) suggests engagement pods or comment bots`);
  } else if (lcRatio >= 10 && lcRatio <= 20) {
    greenFlags.push('Natural like-to-comment ratio');
  }

  // ═══════════════════════════════════════════════════════════
  // INDICATOR 3: Follower-to-Following Ratio (Weight: 15%)
  // ═══════════════════════════════════════════════════════════
  if (ffRatio < 0.3 && followers > 1000) {
    authenticityScore -= 15;
    redFlags.push('Following significantly more accounts than followers (mass follow strategy)');
  } else if (ffRatio < 0.5 && followers > 5000) {
    authenticityScore -= 10;
    redFlags.push('High following count relative to followers');
  } else if (ffRatio > 10 && followers > 10000) {
    greenFlags.push('Strong follower-to-following ratio');
  }

  // ═══════════════════════════════════════════════════════════
  // INDICATOR 4: Content Volume Analysis (Weight: 15%)
  // ═══════════════════════════════════════════════════════════
  if (postsPerFollower < 0.0005 && followers > 10000) {
    authenticityScore -= 18;
    redFlags.push('Very few posts for large follower count (likely bought followers)');
  } else if (postsPerFollower < 0.001 && followers > 5000) {
    authenticityScore -= 10;
    redFlags.push('Low post volume relative to follower count');
  } else if (posts > 500 && followers > 10000) {
    greenFlags.push('Active posting history');
  }

  // ═══════════════════════════════════════════════════════════
  // INDICATOR 5: Round Number Check (Weight: 10%)
  // ═══════════════════════════════════════════════════════════
  if (isRoundNumber(followers)) {
    authenticityScore -= 10;
    redFlags.push(`Suspiciously round follower count: ${followers.toLocaleString()}`);
  }

  // ═══════════════════════════════════════════════════════════
  // INDICATOR 6: Engagement Consistency (Weight: 5%)
  // ═══════════════════════════════════════════════════════════
  if (avgLikes === 0 && avgComments === 0 && followers > 1000) {
    authenticityScore -= 5;
    redFlags.push('Zero engagement with significant follower count');
  } else if (engagementRate >= tier.avgER * 1.2) {
    greenFlags.push('Above-average engagement rate');
  }

  // Clamp score
  authenticityScore = Math.max(0, Math.min(100, Math.round(authenticityScore)));

  // Calculate fake percentage
  const fakePercentage = 100 - authenticityScore;

  // Breakdown
  const breakdown = calculateBreakdown(fakePercentage, redFlags);

  // Risk level
  const riskLevel = determineRiskLevel(fakePercentage);

  return {
    authenticityScore,
    fakePercentage,
    breakdown,
    riskLevel,
    redFlags,
    greenFlags,
    metrics: {
      engagementRate: engagementRate.toFixed(2),
      lcRatio: lcRatio > 0 ? lcRatio.toFixed(1) + ':1' : 'N/A',
      ffRatio: ffRatio.toFixed(1) + ':1',
      postsPerFollower: (postsPerFollower * 1000).toFixed(2)
    }
  };
}

/* ─── HELPER FUNCTIONS ───────────────────────────────────────── */

function getTier(followers) {
  for (const tier of TIERS) {
    if (followers >= tier.min && followers <= tier.max) return tier;
  }
  return TIERS[TIERS.length - 1];
}

function isRoundNumber(num) {
  if (num < 1000) return false;
  const roundNumbers = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
  return roundNumbers.some(round => num % round === 0);
}

function calculateBreakdown(fakePercentage, redFlags) {
  const realPercentage = 100 - fakePercentage;

  // Distribute fake followers
  let suspicious = 0;
  let inactive = 0;

  // If high LC ratio detected = bots
  const hasLCFlag = redFlags.some(flag => flag.includes('like-to-comment'));
  if (hasLCFlag) {
    suspicious = fakePercentage * 0.7;
    inactive = fakePercentage * 0.3;
  } else {
    suspicious = fakePercentage * 0.4;
    inactive = fakePercentage * 0.6;
  }

  return {
    real: Math.round(realPercentage),
    suspicious: Math.round(suspicious),
    inactive: Math.round(inactive)
  };
}

function determineRiskLevel(fakePercentage) {
  if (fakePercentage <= 10) return RISK_LEVELS.excellent;
  if (fakePercentage <= 25) return RISK_LEVELS.good;
  if (fakePercentage <= 40) return RISK_LEVELS.moderate;
  if (fakePercentage <= 60) return RISK_LEVELS.high;
  return RISK_LEVELS.critical;
}

/* ─── DISPLAY RESULTS ────────────────────────────────────────── */

function displayResults(analysis) {
  const resultsEl = document.getElementById('results');

  // Reset animations
  resultsEl.querySelectorAll('.result-animate').forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  });

  // Primary score
  document.getElementById('fake-percentage').textContent = analysis.fakePercentage + '%';
  document.getElementById('authenticity-score').innerHTML = 
    'Authenticity Score: <span>' + analysis.authenticityScore + '</span>/100';

  // Risk badge
  const badge = document.getElementById('risk-badge');
  badge.textContent = analysis.riskLevel.icon + ' ' + analysis.riskLevel.label;
  badge.style.background = analysis.riskLevel.bg;
  badge.style.border = '1px solid ' + analysis.riskLevel.border;
  badge.style.color = analysis.riskLevel.color;

  // Pie chart
  drawPieChart(analysis.breakdown);

  // Breakdown percentages
  document.getElementById('real-pct').textContent = analysis.breakdown.real + '%';
  document.getElementById('suspicious-pct').textContent = analysis.breakdown.suspicious + '%';
  document.getElementById('inactive-pct').textContent = analysis.breakdown.inactive + '%';

  // Red flags
  const redFlagsList = document.getElementById('red-flags-list');
  if (analysis.redFlags.length > 0) {
    redFlagsList.innerHTML = analysis.redFlags.map(flag => 
      '<div class="flag-item">' + flag + '</div>'
    ).join('');
  } else {
    redFlagsList.innerHTML = '<div class="no-flags">No red flags detected</div>';
  }

  // Green flags
  const greenFlagsList = document.getElementById('green-flags-list');
  if (analysis.greenFlags.length > 0) {
    greenFlagsList.innerHTML = analysis.greenFlags.map(flag => 
      '<div class="flag-item">' + flag + '</div>'
    ).join('');
  } else {
    greenFlagsList.innerHTML = '<div class="no-flags">No positive signals detected</div>';
  }

  // Detail metrics
  document.getElementById('detail-er').textContent = analysis.metrics.engagementRate + '%';
  document.getElementById('detail-ratio').textContent = analysis.metrics.lcRatio;
  document.getElementById('detail-ff-ratio').textContent = analysis.metrics.ffRatio;
  document.getElementById('detail-posts-ratio').textContent = analysis.metrics.postsPerFollower + ' per 1K';

  // Meaning box
  displayMeaning(analysis);

  // CTA
  displayCTA(analysis);

  // Show results
  resultsEl.style.display = 'block';
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ─── PIE CHART ──────────────────────────────────────────────── */

function drawPieChart(breakdown) {
  const svg = document.getElementById('pie-chart');
  svg.innerHTML = '';

  const data = [
    { value: breakdown.real, color: '#10b981' },
    { value: breakdown.suspicious, color: '#f59e0b' },
    { value: breakdown.inactive, color: '#ef4444' }
  ];

  let currentAngle = -90;
  const cx = 100, cy = 100, radius = 80;

  data.forEach(segment => {
    if (segment.value === 0) return;

    const angle = (segment.value / 100) * 360;
    const endAngle = currentAngle + angle;

    const x1 = cx + radius * Math.cos((currentAngle * Math.PI) / 180);
    const y1 = cy + radius * Math.sin((currentAngle * Math.PI) / 180);
    const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArc = angle > 180 ? 1 : 0;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`);
    path.setAttribute('fill', segment.color);
    path.setAttribute('stroke', '#fff');
    path.setAttribute('stroke-width', '2');

    svg.appendChild(path);

    currentAngle = endAngle;
  });
}

/* ─── MEANING TEXT ───────────────────────────────────────────── */

function displayMeaning(analysis) {
  const meanings = {
    excellent: 'This account has a highly authentic audience with minimal fake followers. The engagement metrics are strong and consistent. Continue focusing on organic growth strategies.',
    good: 'This account has a mostly genuine audience with some questionable followers. Overall health is good, but there\'s room for improvement in audience quality.',
    moderate: 'This account has a concerning number of fake or low-quality followers. This impacts reach and engagement. Consider auditing your growth strategy and removing inactive accounts.',
    high: 'This account has a significant fake follower problem. The majority of the audience appears to be inactive or fraudulent. Immediate action is needed to rebuild with real followers.',
    critical: 'This account is predominantly made up of fake followers. Engagement is severely impacted. A complete audience cleanse and rebuild is strongly recommended.'
  };

  document.getElementById('meaning-title').textContent = 'What This Means';
  document.getElementById('meaning-text').textContent = meanings[analysis.riskLevel === RISK_LEVELS.excellent ? 'excellent' :
    analysis.riskLevel === RISK_LEVELS.good ? 'good' :
    analysis.riskLevel === RISK_LEVELS.moderate ? 'moderate' :
    analysis.riskLevel === RISK_LEVELS.high ? 'high' : 'critical'];
}

/* ─── CTA VARIANTS ───────────────────────────────────────────── */

function displayCTA(analysis) {
  const ctas = {
    excellent: {
      head: '✨ Maintain Your Authenticity',
      sub: 'Your audience is genuine. Keep growing with real engagement.',
      href: 'https://www.buyrealfollows.com/'
    },
    good: {
      head: '📈 Optimize Your Growth',
      sub: 'Build on your solid foundation with targeted real followers.',
      href: 'https://www.buyrealfollows.com/buy-instagram-followers/'
    },
    moderate: {
      head: '🔧 Clean & Rebuild Your Audience',
      sub: 'Remove fake followers and replace them with real, engaged users.',
      href: 'https://www.buyrealfollows.com/buy-instagram-followers/'
    },
    high: {
      head: '🚨 Urgent: Rebuild Your Audience',
      sub: 'Fake followers are killing your reach. Start fresh with real engagement.',
      href: 'https://www.buyrealfollows.com/buy-instagram-followers/'
    },
    critical: {
      head: '🆘 Complete Audience Overhaul Needed',
      sub: 'Your account needs a full reset with genuine, active followers.',
      href: 'https://www.buyrealfollows.com/buy-instagram-followers/'
    }
  };

  const level = analysis.riskLevel === RISK_LEVELS.excellent ? 'excellent' :
    analysis.riskLevel === RISK_LEVELS.good ? 'good' :
    analysis.riskLevel === RISK_LEVELS.moderate ? 'moderate' :
    analysis.riskLevel === RISK_LEVELS.high ? 'high' : 'critical';

  const cta = ctas[level];

  document.getElementById('cta-head').textContent = cta.head;
  document.getElementById('cta-sub').textContent = cta.sub;
  document.getElementById('cta-link').href = cta.href;
}

/* ─── ERROR HANDLING ─────────────────────────────────────────── */

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = 'block';
}

function clearError() {
  const el = document.getElementById('error-msg');
  el.style.display = 'none';
  el.textContent = '';
}

/* ─── ENTER KEY SUPPORT ──────────────────────────────────────── */

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
    analyzeFakeFollowers();
  }
});
