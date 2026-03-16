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

const MODULE_NAMES = {
  1: 'Şifre Güvenliği',
  2: 'Ağ Güvenliği',
  3: 'Mobil Güvenlik',
  4: 'Sosyal Mühendislik',
  5: 'Phishing & Zararlı Yazılımlar',
  6: 'Veri Gizliliği & Bulut',
  7: 'Sunum Güvenliği',
  8: 'Güvenli İletişim',
  9: 'Hesap & Platform Güvenliği',
  10: 'Seyahat Güvenliği',
  11: 'Yapay Zeka Güvenliği',
  12: 'Sosyal Medya Güvenliği',
  13: 'Siber Zorbalık'
};

const MODULE_XP = {
  1: 300, 2: 350, 3: 400, 4: 350, 5: 300, 6: 400, 7: 450,
  8: 350, 9: 500, 10: 400, 11: 300, 12: 400, 13: 300
};

const DEFAULT_MODULE_VIDEO_URL = 'https://www.youtube.com/embed/RTj7vA3a2BE';

const MODULE_VIDEO_URLS = {
  1: 'https://youtu.be/SHiMaDUPmzQ',
  2: 'https://youtu.be/gxaz_lfwgvE',
  3: 'https://youtu.be/sNQ83nqk1Dw',
  4: 'https://youtu.be/mZA-x6Ulwl0',
  5: 'https://youtu.be/90jA5q7n1AY',
  6: 'https://youtu.be/Glr2dJOO-EE',
  7: 'https://youtu.be/UDXudENAJSg',
  8: 'https://youtu.be/uA7EF91QQmM',
  9: 'https://youtu.be/djduU78tqGA',
  10: 'https://youtu.be/CzLPeXujLAM',
  11: DEFAULT_MODULE_VIDEO_URL,
  12: 'https://youtu.be/vhpb8bZdMa4',
  13: 'https://youtu.be/vhpb8bZdMa4'
};

// Quiz/Senaryo verilerini çakışmasız şekilde topla.
function getModuleQuestions() {
  if (Array.isArray(window.moduleQuestions)) return window.moduleQuestions;
  if (Array.isArray(window.questions)) return window.questions;
  return [];
}

function prepareQuestionForDisplay(q) {
  if (!q || !Array.isArray(q.opts) || typeof q.correct !== 'number') return;
  if (Array.isArray(q._displayOpts) && typeof q._displayCorrect === 'number') return;

  const pairs = q.opts.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === q.correct
  }));

  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pairs[i];
    pairs[i] = pairs[j];
    pairs[j] = tmp;
  }

  q._displayOpts = pairs.map(p => p.text);
  q._displayCorrect = pairs.findIndex(p => p.isCorrect);
}

function clearQuestionDisplayOrder(questions) {
  if (!Array.isArray(questions)) return;
  questions.forEach(q => {
    if (!q || typeof q !== 'object') return;
    delete q._displayOpts;
    delete q._displayCorrect;
  });
}

function auditQuizQuestionQuality(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return;

  const counts = [0, 0, 0, 0];
  const longestBias = [];

  questions.forEach((q, idx) => {
    if (!q || !Array.isArray(q.opts) || typeof q.correct !== 'number') return;
    if (q.correct >= 0 && q.correct < counts.length) counts[q.correct]++;

    const lengths = q.opts.map(opt => String(opt || '').replace(/\s+/g, ' ').trim().length);
    const maxLen = Math.max.apply(null, lengths);
    const maxCount = lengths.filter(len => len === maxLen).length;
    if (maxCount === 1 && lengths[q.correct] === maxLen) {
      longestBias.push(idx + 1);
    }
  });

  const maxCount = Math.max.apply(null, counts);
  const minCount = Math.min.apply(null, counts);
  if (maxCount - minCount > 2) {
    console.warn('[BYTE Quiz] Dogru sik dagilimi dengesiz olabilir:', counts);
  }
  if (longestBias.length > 0) {
    console.warn('[BYTE Quiz] Dogru cevap en uzun sik olabilir. Soru no:', longestBias.join(', '));
  }
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
      done = users[session].completedModules.map(v => Number(v)).filter(v => v >= 1 && v <= 13);
    }
  } catch (e) {}

  const current = getCurrentModuleNumber();

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
      if (meta) meta.textContent = 'Aktif · ' + (MODULE_XP[n] || 0) + ' XP';
      return;
    }

    if (done.indexOf(n) !== -1) {
      badge.classList.add('done');
      if (meta) meta.textContent = '✓ Tamamlandı · ' + (MODULE_XP[n] || 0) + ' XP';
      return;
    }

    badge.classList.add('locked');
    if (meta) meta.textContent = '🔒 Kilitli · ' + (MODULE_XP[n] || 0) + ' XP';
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

function getCompletedModulesSafe() {
  try {
    const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
    const session = localStorage.getItem('byte_session');
    const done = (session && users[session] && Array.isArray(users[session].completedModules))
      ? users[session].completedModules
      : [];
    return done.map(function (v) { return Number(v); }).filter(function (v) { return v >= 1 && v <= 13; });
  } catch (e) {
    return [];
  }
}

function canAccessModule(target, doneList) {
  if (!(target >= 1 && target <= 13)) return false;
  if (target === 1) return true;
  const done = Array.isArray(doneList) ? doneList : [];
  return done.indexOf(target) !== -1 || done.indexOf(target - 1) !== -1;
}

function openModuleFromSidebar(target) {
  const num = Number(target);
  if (!Number.isFinite(num)) return false;
  const done = getCompletedModulesSafe();
  if (canAccessModule(num, done)) {
    window.location.href = 'modul' + num + '.html';
    return true;
  }
  return false;
}

function normalizeSidebarNavigation() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const items = sidebar.querySelectorAll('.module-item');
  items.forEach(function (item) {
    const badge = item.querySelector('.mod-num, .mn');
    if (!badge) return;

    const modNo = parseInt((badge.textContent || '').replace(/\D/g, ''), 10);
    if (!Number.isFinite(modNo) || modNo < 1 || modNo > 13) return;

    item.onclick = function () {
      if (!openModuleFromSidebar(modNo)) {
        showToast('warn', '🔒 Kilitli', 'Önceki modülü tamamla.');
      }
    };
  });
}

function normalizeSidebarLabels() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.querySelectorAll('.module-item').forEach(function (item) {
    const badge = item.querySelector('.mod-num, .mn');
    if (!badge) return;

    const modNo = parseInt((badge.textContent || '').replace(/\D/g, ''), 10);
    if (!Number.isFinite(modNo) || modNo < 1 || modNo > 13) return;

    const nameEl = item.querySelector('.mod-name');
    if (nameEl && MODULE_NAMES[modNo]) {
      nameEl.textContent = MODULE_NAMES[modNo];
      nameEl.style.removeProperty('color');
    }

    badge.textContent = String(modNo).padStart(2, '0');
  });
}

function normalizeYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return DEFAULT_MODULE_VIDEO_URL;

  if (/youtube\.com\/embed\//i.test(url) || /youtu\.be\//i.test(url)) {
    if (/youtu\.be\//i.test(url)) {
      const shortId = url.split('/').pop().split('?')[0];
      return 'https://www.youtube.com/embed/' + shortId;
    }
    return url;
  }

  const match = url.match(/[?&]v=([^&#]+)/i);
  if (match && match[1]) {
    return 'https://www.youtube.com/embed/' + match[1];
  }

  return url;
}

function getModuleVideoUrl(moduleNum) {
  return normalizeYouTubeEmbedUrl(MODULE_VIDEO_URLS[moduleNum] || DEFAULT_MODULE_VIDEO_URL);
}

function getYouTubeWatchUrl(url) {
  if (!url || typeof url !== 'string') return 'https://www.youtube.com/';

  if (/youtu\.be\//i.test(url)) {
    const shortId = url.split('/').pop().split('?')[0];
    return 'https://www.youtube.com/watch?v=' + shortId;
  }

  const embedMatch = url.match(/youtube\.com\/embed\/([^?&#/]+)/i);
  if (embedMatch && embedMatch[1]) {
    return 'https://www.youtube.com/watch?v=' + embedMatch[1];
  }

  const watchMatch = url.match(/[?&]v=([^&#]+)/i);
  if (watchMatch && watchMatch[1]) {
    return 'https://www.youtube.com/watch?v=' + watchMatch[1];
  }

  return url;
}

function injectStandardVideoStyles() {
  if (document.getElementById('byte-standard-video-styles')) return;

  const style = document.createElement('style');
  style.id = 'byte-standard-video-styles';
  style.textContent = [
    '.video-wrapper{position:relative;border:1px solid var(--border);border-radius:14px;overflow:hidden;background:#000;box-shadow:0 0 30px rgba(96,200,240,.12);margin-bottom:18px;}',
    '.video-yt{display:block;width:100%;aspect-ratio:16/9;border:0;background:#000;}',
    '.video-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:18px;background:linear-gradient(160deg,rgba(6,15,30,.72),rgba(5,13,32,.72));cursor:pointer;}',
    '.video-overlay.hidden{display:none;}',
    '.play-hint{margin-top:8px;font-size:.74rem;color:var(--text-dim);font-family:\'Orbitron\',sans-serif;letter-spacing:1px;}',
    '.byte-standard-video .vs-label{font-family:\'Orbitron\',sans-serif;font-size:.76rem;letter-spacing:2px;color:var(--cyan);margin-bottom:10px;}',
    '.byte-standard-video .vs-title{font-size:1.2rem;font-weight:800;color:#fff;margin-bottom:8px;max-width:640px;}',
    '.byte-standard-video .vs-sub{font-size:.88rem;line-height:1.6;color:var(--text-dim);max-width:720px;}',
    '.byte-standard-video .play-big{width:72px;height:72px;border-radius:999px;display:grid;place-items:center;background:rgba(96,200,240,.18);border:1px solid rgba(96,200,240,.45);color:#fff;font-size:1.8rem;margin-top:18px;box-shadow:0 12px 32px rgba(0,0,0,.28);}',
    '.byte-standard-video .video-link-subtle{margin-top:36px;font-size:.84rem;color:#d7e4ef;opacity:.88;text-decoration:none;letter-spacing:.35px;border-bottom:1px dotted rgba(215,228,239,.58);padding:4px 6px;border-radius:8px;display:inline-block;transition:color .2s ease, opacity .2s ease, border-color .2s ease, text-shadow .2s ease, transform .2s ease, box-shadow .2s ease;}',
    '.byte-standard-video .video-link-subtle:hover{opacity:1;color:#ffffff;border-bottom-color:rgba(255,255,255,.98);text-shadow:0 0 12px rgba(255,255,255,.5);transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.28),0 0 14px rgba(255,255,255,.2);}',
    '@media (max-width: 768px){.byte-standard-video .vs-title{font-size:1rem;}.byte-standard-video .vs-sub{font-size:.82rem;}}'
  ].join('');
  document.head.appendChild(style);
}

function createStandardVideoWrapper(copy, url) {
  const wrapper = document.createElement('div');
  wrapper.className = 'video-wrapper byte-standard-video';

  const iframe = document.createElement('iframe');
  iframe.className = 'video-yt';
  iframe.id = 'yt-frame';
  iframe.src = url;
  iframe.title = copy.title || 'BYTE Academy Video';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';

  const overlay = document.createElement('div');
  overlay.className = 'video-overlay';
  overlay.id = 'vid-overlay';
  overlay.onclick = function () {
    if (typeof window.startVideo === 'function') {
      window.startVideo();
    }
  };

  const label = document.createElement('div');
  label.className = 'vs-label';
  label.textContent = copy.label;

  const title = document.createElement('div');
  title.className = 'vs-title';
  title.textContent = copy.title;

  const sub = document.createElement('div');
  sub.className = 'vs-sub';
  sub.textContent = copy.sub;

  const playBig = document.createElement('div');
  playBig.className = 'play-big';
  playBig.textContent = '▶';

  const hint = document.createElement('div');
  hint.className = 'play-hint';
  hint.textContent = 'Oynatmaya başla';

  const ytLink = document.createElement('a');
  ytLink.className = 'video-link-subtle';
  ytLink.href = getYouTubeWatchUrl(url);
  ytLink.target = '_blank';
  ytLink.rel = 'noopener noreferrer';
  ytLink.textContent = "YouTube'da izle";
  ytLink.onclick = function (e) {
    e.stopPropagation();
  };

  overlay.appendChild(label);
  overlay.appendChild(title);
  overlay.appendChild(sub);
  overlay.appendChild(playBig);
  overlay.appendChild(hint);
  overlay.appendChild(ytLink);

  wrapper.appendChild(iframe);
  wrapper.appendChild(overlay);
  return wrapper;
}

function extractStandardVideoCopy(moduleNum, panel) {
  const titleEl = panel ? panel.querySelector('.mod-title') : null;
  const descEl = panel ? panel.querySelector('.mod-desc') : null;
  const legacyLabel = panel ? panel.querySelector('.vs-label') : null;
  const legacyTitle = panel ? panel.querySelector('.vs-title') : null;
  const legacySub = panel ? panel.querySelector('.vs-sub') : null;
  const moduleLabel = String(moduleNum || '').padStart(2, '0');

  return {
    label: (legacyLabel && legacyLabel.textContent.trim()) || ('BYTE ACADEMY — MODÜL ' + moduleLabel),
    title: (legacyTitle && legacyTitle.textContent.trim()) || (titleEl && titleEl.textContent.replace(/\s+/g, ' ').trim()) || 'BYTE Academy Video Dersi',
    sub: (legacySub && legacySub.textContent.trim()) || (descEl && descEl.textContent.replace(/\s+/g, ' ').trim()) || 'Bu modülün video anlatımını başlatmak için oynat tuşunu kullan.'
  };
}

function normalizeModuleVideo() {
  const moduleNum = getCurrentModuleNumber();
  if (typeof moduleNum !== 'number') return;

  const panel = document.getElementById('panel-1');
  if (!panel) return;

  injectStandardVideoStyles();

  const videoUrl = getModuleVideoUrl(moduleNum);
  const watchUrl = getYouTubeWatchUrl(videoUrl);
  const copy = extractStandardVideoCopy(moduleNum, document);
  const existingWrapper = panel.querySelector('.video-wrapper');

  if (existingWrapper) {
    existingWrapper.classList.add('byte-standard-video');

    const frame = existingWrapper.querySelector('#yt-frame, iframe');
    if (frame) {
      frame.id = 'yt-frame';
      frame.classList.add('video-yt');
      frame.setAttribute('src', videoUrl);
      frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      frame.setAttribute('loading', 'lazy');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    }

    let overlay = existingWrapper.querySelector('#vid-overlay, .video-overlay');
    if (!overlay) {
      overlay = createStandardVideoWrapper(copy, videoUrl).querySelector('.video-overlay');
      existingWrapper.appendChild(overlay);
    }
    overlay.id = 'vid-overlay';
    overlay.classList.add('video-overlay');
    overlay.onclick = function () {
      if (typeof window.startVideo === 'function') {
        window.startVideo();
      }
    };

    const label = overlay.querySelector('.vs-label') || overlay.appendChild(document.createElement('div'));
    label.className = 'vs-label';
    label.textContent = copy.label;

    const title = overlay.querySelector('.vs-title') || overlay.appendChild(document.createElement('div'));
    title.className = 'vs-title';
    title.textContent = copy.title;

    const sub = overlay.querySelector('.vs-sub') || overlay.appendChild(document.createElement('div'));
    sub.className = 'vs-sub';
    sub.textContent = copy.sub;

    const playBig = overlay.querySelector('.play-big') || overlay.appendChild(document.createElement('div'));
    playBig.className = 'play-big';
    playBig.textContent = '▶';

    const hint = overlay.querySelector('.play-hint') || overlay.appendChild(document.createElement('div'));
    hint.className = 'play-hint';
    hint.textContent = 'Oynatmaya başla';

    let ytLink = overlay.querySelector('.video-link-subtle');
    if (!ytLink) {
      ytLink = overlay.appendChild(document.createElement('a'));
    }
    ytLink.className = 'video-link-subtle';
    ytLink.href = watchUrl;
    ytLink.target = '_blank';
    ytLink.rel = 'noopener noreferrer';
    ytLink.textContent = "YouTube'da izle";
    ytLink.onclick = function (e) {
      e.stopPropagation();
    };
    return;
  }

  const legacyPlayer = panel.querySelector('.video-player');
  if (legacyPlayer) {
    legacyPlayer.replaceWith(createStandardVideoWrapper(copy, videoUrl));
    return;
  }

  const placeholderCard = panel.firstElementChild;
  if (placeholderCard) {
    placeholderCard.replaceWith(createStandardVideoWrapper(copy, videoUrl));
  }
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

  // Trigger playback on first click for modules that rely on shared handler.
  const frame = document.getElementById('yt-frame');
  if (frame) {
    const src = frame.getAttribute('src') || '';
    if (src && !/autoplay=1/.test(src)) {
      const hasQuery = src.indexOf('?') !== -1;
      frame.setAttribute('src', src + (hasQuery ? '&' : '?') + 'autoplay=1&playsinline=1&enablejsapi=1');
    }

    // Best-effort: ask YouTube iframe to play with sound after user gesture.
    try {
      setTimeout(function () {
        if (!frame.contentWindow) return;
        frame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        frame.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        frame.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
      }, 250);
    } catch (e) {
      // Ignore cross-frame command failures.
    }
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
  prepareQuestionForDisplay(q);
  const displayOpts = Array.isArray(q._displayOpts) ? q._displayOpts : q.opts;
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
      <div class="options">${displayOpts.map((o, i) => `<button class="option-btn" id="opt-${i}" onclick="answerQ(${i})"><div class="option-letter">${L[i]}</div><span>${o}</span></button>`).join('')}</div>
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
  const correctIdx = typeof q._displayCorrect === 'number' ? q._displayCorrect : q.correct;
  const ok = i === correctIdx;
  
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
  
  if (!ok) document.getElementById('opt-' + correctIdx).classList.add('correct');
  
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
  clearQuestionDisplayOrder(quizQuestions);
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
    if (openModuleFromSidebar(target)) return;
  }
  showToast('warn', '🔒 Kilitli', 'Önceki modülü tamamla.');
}

function goTo(url) {
  window.location.href = url;
}

function byteSpeak() {
  if (!('speechSynthesis' in window)) {
    showToast('warn', '🔇 Desteklenmiyor', 'Tarayıcın ses sentezini desteklemiyor.');
    return;
  }

  const moduleTextById = {
    1: 'Modül bir. Siber güvenliğe giriş. Dijital tehditleri tanıyacak ve güvenli davranışın temelini öğreneceksin.',
    2: 'Modül iki. Ağ güvenliği. Açık Wi-Fi riskleri, Evil Twin saldırıları ve güvenli bağlantı adımlarını öğreneceksin.',
    3: 'Modül üç. Mobil güvenlik. Uygulama izinleri, smishing saldırıları ve çalınan cihaz senaryolarında doğru adımları göreceksin.',
    4: 'Modül dört. Sosyal mühendislik. Kimlik taklidi, aciliyet tuzakları ve psikolojik manipülasyona karşı savunmayı öğreneceksin.',
    5: 'Modül beş. Phishing ve zararlı yazılımlar. Sahte bağlantıları ayırt edip cihazını kötü amaçlı yazılımlardan korumayı öğreneceksin.',
    6: 'Modül altı. Veri gizliliği ve bulut. Verini sınıflandırmayı, paylaşım risklerini ve güvenli depolama alışkanlıklarını öğreneceksin.',
    7: 'Modül yedi. Dijital kimlik. Kimlik avı, hesap ele geçirme ve doğrulama pratikleriyle kimliğini koruyacaksın.',
    8: 'Modül sekiz. Güvenli iletişim. Mesajlaşma, dosya paylaşımı ve kanal güvenliği için doğru yöntemleri uygulayacaksın.',
    9: 'Modül dokuz. Hesap ve platform güvenliği. Parola hijyeni, iki aşamalı doğrulama ve oturum yönetimini güçlendireceksin.',
    10: 'Modül on. Seyahat güvenliği. Hareket halindeyken cihaz, ağ ve veri güvenliğini nasıl koruyacağını öğreneceksin.',
    11: 'Modül on bir. Yapay zeka güvenliği. Prompt hijyeni, veri sızıntısı riskleri ve güvenli yapay zeka kullanımını öğreneceksin.',
    12: 'Modül on iki. Sosyal medya güvenliği. Hesap koruması, görünürlük ayarları ve içerik güvenliği becerilerini geliştireceksin.',
    13: 'Modül on üç. Siber zorbalık. Dijital şiddeti tanıma, kanıt toplama ve doğru destek adımlarını öğreneceksin.'
  };

  const match = (window.location.pathname || '').match(/modul(\d+)\.html/i);
  const moduleId = match ? Number(match[1]) : NaN;
  const text = moduleTextById[moduleId] || 'BYTE Akademi modül dinleme özelliği aktif. Başlıktan modül özetini dinleyebilirsin.';

  window.speechSynthesis.cancel();

  const avatar = document.getElementById('byteAvatar');
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'tr-TR';
  utter.rate = 0.92;
  utter.pitch = 1.04;

  const voices = window.speechSynthesis.getVoices();
  const trVoice = voices.find((v) => /^tr/i.test(v.lang || ''));
  if (trVoice) utter.voice = trVoice;

  utter.onstart = function () {
    if (avatar) avatar.classList.add('speaking');
    showToast('info', '🤖 BYTE Konuşuyor', 'Modül özeti okunuyor...');
  };
  utter.onend = function () {
    if (avatar) avatar.classList.remove('speaking');
  };
  utter.onerror = function () {
    if (avatar) avatar.classList.remove('speaking');
    showToast('warn', '🔇 Ses Hatası', 'Tarayıcıda Türkçe ses paketi olmayabilir.');
  };

  if (!voices || voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = function () {
      const loaded = window.speechSynthesis.getVoices();
      const trLoaded = loaded.find((v) => /^tr/i.test(v.lang || ''));
      if (trLoaded) utter.voice = trLoaded;
      window.speechSynthesis.speak(utter);
    };
    return;
  }

  window.speechSynthesis.speak(utter);
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


// ── SIDEBAR TOGGLE ────────────────────────────────
function initSidebarToggle() {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Inject toggle button after sidebar in DOM
  var btn = document.createElement('button');
  btn.id = 'sidebar-toggle';
  btn.title = 'Menüyü Gizle/Göster';
  btn.textContent = '‹';
  btn.onclick = toggleSidebar;
  sidebar.parentNode.insertBefore(btn, sidebar.nextSibling);

  // Check if navigated from dashboard
  var fromDash = sessionStorage.getItem('byteFromDashboard');
  sessionStorage.removeItem('byteFromDashboard');

  if (!fromDash) {
    // Collapse without animation on initial load
    sidebar.classList.add('no-anim');
    sidebar.classList.add('collapsed');
    btn.classList.add('collapsed');
    btn.textContent = '›';
    requestAnimationFrame(function () {
      sidebar.classList.remove('no-anim');
    });
  }
}

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var btn = document.getElementById('sidebar-toggle');
  if (!sidebar || !btn) return;
  var collapsed = sidebar.classList.toggle('collapsed');
  btn.classList.toggle('collapsed', collapsed);
  btn.textContent = collapsed ? '›' : '‹';
}

// ── PROGRESS KAYDETME ──────────────────────────────────
function initModuleUI() {
  const xpEl = document.getElementById('xp-count');
  if (xpEl) xpEl.textContent = String(xp);

  normalizeModuleVideo();
  normalizeSidebarLabels();
  normalizeSidebarNavigation();
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
    auditQuizQuestionQuality(getModuleQuestions());
    renderQuestion();
  }

  buildAutoModuleNav();
  initSidebarToggle();
}

// Ensure inline onclick handlers can find shared functions without overriding
// module-specific handlers that intentionally customize quiz/scenario behavior.
const sharedHandlers = {
  goStep,
  completeStep,
  startVideo,
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
  skipVideo,
  toggleSidebar
};

Object.keys(sharedHandlers).forEach((key) => {
  if (typeof window[key] !== 'function') {
    window[key] = sharedHandlers[key];
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModuleUI);
} else {
  initModuleUI();
}

// ── PWA SERVICE WORKER KAYDI ─────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=3').catch(() => {});
  });
}
