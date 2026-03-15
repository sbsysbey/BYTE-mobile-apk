// ══════════════════════════════════════════════════════════════
// BYTE ACADEMY — MODÜLLER ORTAK JAVASCRIPT
// Her modülün paylaştığı temel fonksiyonlar
// ══════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
// YETKİ KONTROLÜ
// ──────────────────────────────────────────────────────────────
(function checkAuth() {
  const session = localStorage.getItem('byte_session');
  const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
  if (!session || !users[session]) {
    window.location.href = 'index.html';
  }
})();

// ──────────────────────────────────────────────────────────────
// GLOBAL DURUMLAR (Her modül kendi verilerini ekler)
// ──────────────────────────────────────────────────────────────

// XP'yi localStorage'dan yükle
function loadXP() {
  try {
    const session = localStorage.getItem('byte_session');
    const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
    if (session && users[session] && users[session].xp) {
      return users[session].xp;
    }
  } catch(e) {}
  return 0;
}

let currentStep = 1;
let xp = loadXP();  // localStorage'dan yükle
let badgeCount = 2;
let isPlaying = false;
let progress = 0;
let playInterval = null;
let completedSteps = new Set();
let quizCorrect = 0;
let currentQ = 0;
let answered = false;
let startTime = Date.now();
let rewardedQuizQuestions = new Set();

// Quiz/Senaryo verilerini çakışmasız şekilde topla.
function getModuleQuestions() {
  if (Array.isArray(window.moduleQuestions)) return window.moduleQuestions;
  if (Array.isArray(window.questions)) return window.questions;
  return [];
}

function getSceneFeedbacks() {
  if (Array.isArray(window.moduleSceneFeedbacks)) return window.moduleSceneFeedbacks;
  if (Array.isArray(window.sceneFeedbacks)) return window.sceneFeedbacks;
  return [];
}

function getCurrentModuleNumber() {
  const fromPath = (window.location.pathname || '').match(/modul(\d+)\.html$/i);
  const fromHref = (window.location.href || '').match(/modul(\d+)\.html/i);
  const m = fromPath || fromHref;
  return m ? parseInt(m[1], 10) : null;
}

function getCompletedModulesCount() {
  try {
    const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
    const session = localStorage.getItem('byte_session');
    if (!session || !users[session]) return 0;
    const done = Array.isArray(users[session].completedModules) ? users[session].completedModules : [];
    return done.length;
  } catch (e) {
    return 0;
  }
}

function saveQuizResult(correctCount, totalCount) {
  try {
    const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
    const session = localStorage.getItem('byte_session');
    if (!session || !users[session]) return;

    const moduleNum = getCurrentModuleNumber();
    if (typeof moduleNum !== 'number') return;

    const safeTotal = Math.max(0, Number(totalCount) || 0);
    const safeCorrect = Math.max(0, Math.min(safeTotal, Number(correctCount) || 0));

    if (!users[session].quizStats || typeof users[session].quizStats !== 'object') {
      users[session].quizStats = {};
    }

    const key = String(moduleNum);
    const prev = users[session].quizStats[key];
    // Keep the best correct score for the same module.
    if (!prev || safeCorrect > (Number(prev.correct) || 0)) {
      users[session].quizStats[key] = { correct: safeCorrect, total: safeTotal };
      localStorage.setItem('byte_users', JSON.stringify(users));
    }
  } catch (e) {}
}

function updateTopbarBadgeCount() {
  const badgeEl = document.querySelector('.mod-badge-top');
  if (!badgeEl) return;

  const count = getCompletedModulesCount();
  badgeCount = count;
  badgeEl.innerHTML = '🏅 <span id="badge-count">' + count + '</span> Rozet';
}

function syncSidebarModuleState() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let done = [];
  try {
    const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
    const session = localStorage.getItem('byte_session');
    if (session && users[session] && Array.isArray(users[session].completedModules)) {
      done = users[session].completedModules;
    }
  } catch (e) {}

  const current = getCurrentModuleNumber();
  const xpByModule = {
    1: 300, 2: 350, 3: 400, 4: 350, 5: 300, 6: 400, 7: 450,
    8: 350, 9: 500, 10: 400, 11: 300, 12: 400, 13: 300
  };

  sidebar.querySelectorAll('.module-item').forEach(item => {
    const badge = item.querySelector('.mod-num, .mn');
    if (!badge) return;

    const n = parseInt((badge.textContent || '').replace(/\D/g, ''), 10);
    if (!n || n < 1 || n > 13) return;

    const meta = item.querySelector('.mod-meta');

    item.classList.remove('active');

    badge.classList.remove('locked', 'done', 'active2', 'act', 'active');

    if (typeof current === 'number' && n === current) {
      item.classList.add('active');
      badge.classList.add('active2');
      if (meta) meta.textContent = 'Aktif · ' + (xpByModule[n] || 0) + ' XP';
      return;
    }

    if (done.indexOf(n) !== -1) {
      badge.classList.add('done');
      if (meta) meta.textContent = '✓ Tamamlandı · ' + (xpByModule[n] || 0) + ' XP';
      return;
    }

    badge.classList.add('locked');
    if (meta) meta.textContent = '🔒 Kilitli · ' + (xpByModule[n] || 0) + ' XP';
  });
}

function buildAutoModuleNav() {
  const panel5 = document.getElementById('panel-5');
  if (!panel5 || document.getElementById('auto-module-nav')) return;

  const existingNav = panel5.querySelector('.next-lessons, #mod-nav-btns');
  if (existingNav) existingNav.style.display = 'none';

  const navWrap = document.createElement('div');
  navWrap.id = 'auto-module-nav';
  navWrap.className = 'next-lessons';

  function makeCard(num, name, xp, target) {
    const card = document.createElement('div');
    card.className = 'next-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = '<div class="next-num">' + num + '</div><div class="next-name">' + name + '</div><div class="next-xp">' + xp + '</div>';
    card.onclick = function () {
      goTo(target);
    };
    card.onkeydown = function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goTo(target);
      }
    };
    return card;
  }

  const dashboardCard = makeCard('BYTE', 'Anasayfa', 'İlerlemeni görüntüle', 'index.html');

  const moduleNum = getCurrentModuleNumber();
  let nextCard;

  if (typeof moduleNum === 'number' && moduleNum >= 1 && moduleNum < 13) {
    const nextModule = moduleNum + 1;
    const nextLabel = String(nextModule).padStart(2, '0');
    nextCard = makeCard('MODÜL ' + nextLabel, 'Sonraki Modüle Geç', 'Devam Et', 'modul' + nextModule + '.html');
  } else {
    nextCard = makeCard('REHBER', 'Kaynak Merkezi', 'Program yol haritası', 'rehber.html');
  }

  navWrap.appendChild(dashboardCard);
  navWrap.appendChild(nextCard);
  panel5.appendChild(navWrap);
}


// ──────────────────────────────────────────────────────────────
// ADIM YÖNETİMİ
// ──────────────────────────────────────────────────────────────
function goStep(n) {
  currentStep = n;
  const steps = document.querySelectorAll('[class*="step-"]');
  Array.from(document.querySelectorAll('[id^="step-btn-"]')).forEach(btn => {
    btn.classList.remove('active');
  });
  const activeStepBtn = document.getElementById('step-btn-' + n);
  if (activeStepBtn) activeStepBtn.classList.add('active');
  
  // İçerik alanlarını gizle/göster
  Array.from(document.querySelectorAll('.lesson-panel')).forEach((el, idx) => {
    el.style.display = 'none';
  });
  
  const stepEl = document.getElementById('panel-' + n);
  if (stepEl) stepEl.style.display = 'block';

  // Ensure quiz content is available when user enters step 3.
  if (n === 3) {
    const quizArea = document.getElementById('quiz-area');
    if (quizArea && Array.isArray(getModuleQuestions()) && getModuleQuestions().length > 0 && !quizArea.innerHTML.trim()) {
      renderQuestion();
    }
  }

  if (n === 5) {
    const moduleNum = getCurrentModuleNumber();
    if (typeof moduleNum === 'number') {
      saveProgress(moduleNum);
      updateTopbarBadgeCount();
    }
    buildAutoModuleNav();
  }
  
  window.scrollTo(0, 0);
}

// ──────────────────────────────────────────────────────────────
// ADIM TAMAMLAMA ve XP
// ──────────────────────────────────────────────────────────────
function completeStep(n) {
  if (completedSteps.has(n)) {
    goStep(n + 1);
    return;
  }
  completedSteps.add(n);

  // Global policy: each module step is worth 50 XP.
  const earned = 50;
  addXP(earned, ['', 'Video Ders', 'Okuma', 'Quiz', 'Senaryo', 'Rozet'][n] + ' tamamlandı!');

  const dot = document.getElementById('dot-' + n);
  if (dot) {
    dot.classList.remove('active', 'pending');
    dot.classList.add('done');
    dot.textContent = '✓';
  }

  goStep(n + 1);
}

// ──────────────────────────────────────────────────────────────
// VİDEO YÖNETİMİ
// ──────────────────────────────────────────────────────────────
function startVideo() {
  // Hide video overlay to reveal YouTube iframe
  const overlay = document.getElementById('vid-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

function skipVideo() {
  completeStep(1);
}

function togglePlay() {
  const btn = document.getElementById('play-ctrl') || document.getElementById('play-btn');
  if (btn) {
    isPlaying = !isPlaying;
    if(document.getElementById('play-ctrl'))
      document.getElementById('play-ctrl').textContent = isPlaying ? '⏸ Duraklat' : '▶ Oynat';
    if(document.getElementById('play-btn'))
      document.getElementById('play-btn').textContent = isPlaying ? '⏸' : '▶';
  }
}

function seekBack() {
  progress = Math.max(0, progress - 10);
  document.getElementById('progress-fill').style.width = progress + '%';
}

function seekTo(event) {
  if (!event.currentTarget) return;
  const r = event.currentTarget.getBoundingClientRect();
  progress = ((event.clientX - r.left) / r.width) * 100;
  document.getElementById('progress-fill').style.width = progress + '%';
}

function setChapter(el, title, time) {
  document.querySelectorAll('.ch-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

// ──────────────────────────────────────────────────────────────
// QUIZ YÖNETİMİ
// ──────────────────────────────────────────────────────────────
function renderQuestion() {
  const quizQuestions = getModuleQuestions();
  if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) return;

  if (currentQ >= quizQuestions.length) {
    showResult();
    return;
  }
  
  const q = quizQuestions[currentQ];
  answered = false;
  
  const quizFill = document.getElementById('quiz-fill') || document.getElementById('qprog');
  const qLabel = document.getElementById('q-label');
  const qScore = document.getElementById('q-score');
  
  if (quizFill) quizFill.style.width = ((currentQ + 1) / quizQuestions.length * 100) + '%';
  if (qLabel) qLabel.textContent = 'Soru ' + (currentQ + 1) + ' / ' + quizQuestions.length;
  if (qScore) qScore.textContent = quizCorrect + ' / ' + quizQuestions.length + ' Doğru';
  
  const L = ['A', 'B', 'C', 'D'];
  const quizArea = document.getElementById('quiz-area');
  if (!quizArea) return;
  
  quizArea.innerHTML = `
    <div class="question-card">
      <div class="question-num">SORU ${currentQ + 1}</div>
      <div class="question-text">${q.q}</div>
      <div class="options">${q.opts.map((o, i) => `<button class="option-btn" id="opt-${i}" onclick="answerQ(${i})"><div class="option-letter">${L[i]}</div><span>${o}</span></button>`).join('')}</div>
      <div class="feedback-box" id="feedback"></div>
    </div>
    <div class="quiz-actions" id="q-actions" style="display:none;"><button class="btn btn-primary" onclick="nextQuestion()">${currentQ < quizQuestions.length - 1 ? 'Sonraki Soru →' : 'Sonucu Gör →'}</button></div>
  `;
}

function answerQ(i) {
  if (answered) return;
  answered = true;
  const quizQuestions = getModuleQuestions();
  if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) return;
  
  const q = quizQuestions[currentQ];
  const ok = i === q.correct;
  
  if (ok) {
    quizCorrect++;

    // Global policy: +10 XP per correct quiz answer, once per question.
    if (!rewardedQuizQuestions.has(currentQ)) {
      rewardedQuizQuestions.add(currentQ);
      addXP(10, 'Quiz sorusu doğru cevaplandı!');
    }
  }
  
  const qScore = document.getElementById('q-score');
  if (qScore) qScore.textContent = quizCorrect + ' / ' + quizQuestions.length + ' Doğru';
  
  document.querySelectorAll('.option-btn').forEach(b => (b.disabled = true));
  document.getElementById('opt-' + i).classList.add(ok ? 'correct' : 'wrong');
  
  if (!ok) document.getElementById('opt-' + q.correct).classList.add('correct');
  
  const fb = document.getElementById('feedback');
  if (fb) {
    fb.textContent = (ok ? '✓ ' : '✗ ') + (ok ? q.fb.correct : q.fb.wrong);
    fb.className = 'feedback-box show ' + (ok ? 'correct' : 'wrong');
  }
  
  const qActions = document.getElementById('q-actions');
  if (qActions) qActions.style.display = 'flex';
}

function nextQuestion() {
  const quizQuestions = getModuleQuestions();
  if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) return;
  currentQ++;
  if (currentQ < quizQuestions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function nextQ() {
  nextQuestion();
}

function showResult() {
  const quizQuestions = getModuleQuestions();
  if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) return;
  const sumCorrect = document.getElementById('sum-correct');
  if (sumCorrect) sumCorrect.textContent = quizCorrect;
  
  const passed = quizCorrect >= Math.ceil(quizQuestions.length * 0.7);
  saveQuizResult(quizCorrect, quizQuestions.length);
  const quizArea = document.getElementById('quiz-area');
  if (!quizArea) return;
  
  quizArea.innerHTML = `
    <div class="question-card" style="text-align:center;padding:36px;">
      <div style="font-size:3rem;margin-bottom:14px;">${passed ? '🏆' : '📚'}</div>
      <div style="font-family:'Orbitron',sans-serif;font-size:1.1rem;color:${passed ? 'var(--green)' : 'var(--yellow)'};margin-bottom:8px;">${passed ? 'BAŞARILI!' : 'TEKRAR DENEYEBİLİRSİN'}</div>
      <div style="font-size:.90rem;color:var(--text-dim);margin-bottom:22px;">${quizCorrect} / ${quizQuestions.length} doğru · ${passed ? 'Senaryoya hazırsın.' : Math.ceil(quizQuestions.length * 0.7) + ' veya üzeri gerekli.'}</div>
      <button class="btn btn-primary" onclick="completeStep(3)">Senaryoya Geç →</button>
      ${!passed ? '<button class="btn btn-green" style="margin-left:10px;" onclick="restartQuiz()">Tekrar Dene</button>' : ''}
    </div>
  `;
}

function restartQuiz() {
  const quizQuestions = getModuleQuestions();
  currentQ = 0;
  quizCorrect = 0;
  const qScore = document.getElementById('q-score');
  if (qScore) qScore.textContent = '0 / ' + quizQuestions.length + ' Doğru';
  renderQuestion();
}

// ──────────────────────────────────────────────────────────────
// SENARYO YÖNETİMİ
// ──────────────────────────────────────────────────────────────
function pickScene(i) {
  if (document.querySelector('.scene-opt.chosen-correct,.scene-opt.chosen-wrong')) return;
  const sceneFeedbackList = getSceneFeedbacks();
  
  const opts = document.querySelectorAll('.scene-opt');
  const fb = sceneFeedbackList[i];
  if (!fb) return;
  
  opts[i].classList.add(fb.correct ? 'chosen-correct' : 'chosen-wrong');
  if (!fb.correct && fb.correct_idx !== undefined && opts[fb.correct_idx]) {
    opts[fb.correct_idx].classList.add('chosen-correct');
  }
  
  opts.forEach(o => (o.disabled = true));
  
  const fbEl = document.getElementById('byte-fb-text');
  if (fbEl) fbEl.innerHTML = fb.text;
  
  const fbContainer = document.getElementById('byte-fb') || document.getElementById('scenario-feedback');
  if (fbContainer) fbContainer.classList.add('show');
  
  const nextBtn = document.getElementById('scene-next') || document.getElementById('scenario-next');
  if (nextBtn) nextBtn.style.display = 'block';
}

// ──────────────────────────────────────────────────────────────
// TOAST BİLDİRİMLERİ
// ──────────────────────────────────────────────────────────────
function showToast(type, title, sub) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const icons = {
    xp: '⚡',
    info: '🎣',
    warn: '⚠️',
    success: '✓',
    error: '✗'
  };
  t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><div><div class="toast-title">${title}</div><div class="toast-sub">${sub}</div></div>`;
  c.appendChild(t);
  
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

// ──────────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ──────────────────────────────────────────────────────────────
function tryNav() {
  let target = arguments.length > 0 ? Number(arguments[0]) : NaN;
  if (Number.isNaN(target)) {
    const evt = window.event;
    const sourceEl = evt && evt.currentTarget ? evt.currentTarget : null;
    if (sourceEl) {
      const badge = sourceEl.querySelector('.mod-num, .mn');
      if (badge) {
        const parsed = parseInt((badge.textContent || '').replace(/\D/g, ''), 10);
        if (!Number.isNaN(parsed)) target = parsed;
      }
    }
  }
  if (!Number.isNaN(target) && target >= 1 && target <= 13) {
    try {
      const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
      const session = localStorage.getItem('byte_session');
      const done = (session && users[session] && users[session].completedModules) ? users[session].completedModules : [];
      const canEnter = target === 1 || done.indexOf(target) !== -1 || done.indexOf(target - 1) !== -1;
      if (canEnter) {
        window.location.href = 'modul' + target + '.html';
        return;
      }
    } catch (e) {}
  }
  showToast('warn', '🔒 Kilitli', 'Önceki modülü tamamla.');
}

function goTo(url) {
  window.location.href = url;
}

function byteSpeak() {
  showToast('info', 'BYTE Söylüyor', 'Modül dinleme özelliği burada oynatılabilir...');
}

function togglePw() {
  const input = document.querySelector('.sm-input');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function chooseScenario(el, correct) {
  // Her modülde override edilebilir
  pickScene(Array.from(document.querySelectorAll('.scene-opt')).indexOf(el));
}

function addXP(amount, msg) {
  xp += amount;

  // update persistent storage immediately
  try {
    const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
    const session = localStorage.getItem('byte_session');
    if (session && users[session]) {
      users[session].xp = xp;
      localStorage.setItem('byte_users', JSON.stringify(users));
    }
  } catch (e) {}

  const el = document.getElementById('xp-count');
  if (el) {
    el.textContent = xp;
    el.style.transform = 'scale(1.3)';
    el.style.color = '#fff';
    setTimeout(() => {
      el.style.transform = 'scale(1)';
      el.style.color = '';
    }, 400);
  }
  const miniFill = document.getElementById('xp-mini-fill');
  if (miniFill) miniFill.style.width = Math.min((xp % 500) / 500 * 100, 100) + '%';

  const finalXp = document.getElementById('final-xp');
  if (finalXp) finalXp.textContent = xp;

  showToast('xp', 'XP Kazandın!', msg);
}

function ensureModuleCompletion(moduleNum) {
  try {
    var m = Number(moduleNum);
    if (!(m >= 1 && m <= 13)) return false;

    var users = JSON.parse(localStorage.getItem('byte_users') || '{}');
    var session = localStorage.getItem('byte_session');
    if (!session || !users[session]) return false;

    var u = users[session];
    var done = Array.isArray(u.completedModules) ? u.completedModules : [];
    done = done.map(function(v) { return Number(v); }).filter(function(v) { return v >= 1 && v <= 13; });
    if (done.indexOf(m) === -1) done.push(m);
    u.completedModules = Array.from(new Set(done)).sort(function(a, b) { return a - b; });

    // Keep xp aligned with current runtime state.
    u.xp = xp;
    users[session] = u;
    localStorage.setItem('byte_users', JSON.stringify(users));
    localStorage.setItem('byte_m_done_' + session + '_' + m, '1');
    return true;
  } catch (e) {
    return false;
  }
}

function saveProgress(moduleNum) {
  ensureModuleCompletion(moduleNum);

  updateTopbarBadgeCount();
  syncSidebarModuleState();
}

// ──────────────────────────────────────────────────────────────
// SİDEBAR FONKSİYONLARI
// ──────────────────────────────────────────────────────────────
function sidebarClick(n) {
  var done = [];
  try {
    var u = JSON.parse(localStorage.getItem('byte_users') || '{}');
    var s = localStorage.getItem('byte_session');
    if (s && u[s]) done = u[s].completedModules || [];
  } catch (e) {}
  var files = {
    1: 'modul1.html',
    2: 'modul2.html',
    3: 'modul3.html',
    4: 'modul4.html',
    5: 'modul5.html',
    6: 'modul6.html',
    7: 'modul7.html',
    8: 'modul8.html',
    9: 'modul9.html',
    10: 'modul10.html',
    11: 'modul11.html',
    12: 'modul12.html',
    13: 'modul13.html'
  };
  if (n === 2) return;
  if (done.indexOf(n - 1) !== -1 || n === 1) {
    window.location.href = files[n];
  } else {
    showToast('warn', '🔒 Modül Kilitli', 'Önce önceki modülü tamamla!');
  }
}


// ── PROGRESS KAYDETME ──────────────────────────────────
function initModuleUI() {
  const xpEl = document.getElementById('xp-count');
  if (xpEl) xpEl.textContent = String(xp);

  updateTopbarBadgeCount();
  syncSidebarModuleState();

  const finalXp = document.getElementById('final-xp');
  if (finalXp) finalXp.textContent = String(xp);

  // Keep step labels consistent across all modules.
  for (let i = 1; i <= 5; i++) {
    const stepLabel = document.querySelector('#step-btn-' + i + ' .step-xp');
    if (stepLabel) stepLabel.textContent = '+50 XP';
  }

  // Default to first step view on every module page.
  if (document.getElementById('panel-1')) {
    goStep(1);
  }

  // Initialize quiz only when module-specific questions are present.
  if (document.getElementById('quiz-area') && getModuleQuestions().length > 0) {
    renderQuestion();
  }

  buildAutoModuleNav();
}

// Ensure inline onclick handlers can always find these functions.
Object.assign(window, {
  goStep,
  completeStep,
  togglePlay,
  seekBack,
  seekTo,
  setChapter,
  answerQ,
  nextQuestion,
  nextQ,
  restartQuiz,
  pickScene,
  chooseScenario,
  tryNav,
  goTo,
  byteSpeak,
  togglePw,
  sidebarClick,
  addXP,
  saveQuizResult,
  ensureModuleCompletion,
  saveProgress,
  skipVideo
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModuleUI);
} else {
  initModuleUI();
}

// ── PWA SERVICE WORKER KAYDI ─────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
