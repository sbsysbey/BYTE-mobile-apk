// ── USERS DB — localStorage kalıcı ───────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem('byte_users') || '{}'); } catch(e) { return {}; }
}
function saveUsers(users) {
  localStorage.setItem('byte_users', JSON.stringify(users));
}
function getSession() {
  return localStorage.getItem('byte_session') || null;
}
function saveSession(user) {
  localStorage.setItem('byte_session', user);
}
function clearSession() {
  localStorage.removeItem('byte_session');
}

let currentUser = null;

// ── SCREENS ───────────────────────────────────
function showScreen(name, tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'login' && tab) switchTab(tab);
}

// ── TABS ──────────────────────────────────────
function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('register-error').style.display = 'none';
}

// ── LOGIN ─────────────────────────────────────
function doLogin() {
  const user = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  const users = getUsers();

  if (!user || !pass) {
    showErr(err, 'Kullanıcı adı ve şifre boş bırakılamaz.'); return;
  }
  if (users[user] && users[user].pass === pass) {
    err.style.display = 'none';
    currentUser = user;
    saveSession(user);
    loadDashboard(user);
    showScreen('dashboard');
    toast('👋', 'Hoş Geldin!', 'Tekrar aramızdasın, ' + user + '!', 'success');
  } else {
    showErr(err, 'Kullanıcı adı veya şifre hatalı.');
    document.getElementById('login-pass').value = '';
  }
}

// ── REGISTER ──────────────────────────────────
function doRegister() {
  const user = document.getElementById('reg-user').value.trim().toLowerCase();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const err = document.getElementById('register-error');
  const users = getUsers();

  if (!user || !pass) { showErr(err, 'Tüm alanları doldur.'); return; }
  if (user.length < 3) { showErr(err, 'Kullanıcı adı en az 3 karakter olmalı.'); return; }
  if (pass.length < 6) { showErr(err, 'Şifre en az 6 karakter olmalı.'); return; }
  if (pass !== pass2) { showErr(err, 'Şifreler eşleşmiyor.'); return; }
  if (users[user]) { showErr(err, 'Bu kullanıcı adı zaten alınmış.'); return; }

  users[user] = { pass, xp: 0, level: 1, completedModules: [] };
  saveUsers(users);
  err.style.display = 'none';
  currentUser = user;
  saveSession(user);
  loadDashboard(user);
  showScreen('dashboard');
  toast('🎉', 'Hoş Geldin!', 'Hesabın oluşturuldu! BYTE seni bekliyor.', 'success');
    setTimeout(() => toast('🤖', 'BYTE Diyor ki:', 'Modul 1e basla ve ilk rozetini kazan!', 'info'), 1200);
}

function showErr(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

// ── MODULE DEFINITIONS ───────────────────────
const MODULES = [
  { n:1,  name:'Şifre Güvenliği',  icon:'🔑',  xp:300,  file:'modul1.html',  badge:'ŞİFRE EFENDİSİ',  bicon:'🔐' },
  { n:2,  name:'Ağ Güvenliği',       icon:'🌐',  xp:350,  file:'modul2.html',  badge:'AĞ KORUYUCU',      bicon:'🌐' },
  { n:3,  name:'Mobil Güvenlik',     icon:'📲', xp:400,  file:'modul3.html',  badge:'MOBİL KORUYUCU',    bicon:'📱' },
  { n:4,  name:'Sosyal Mühendislik', icon:'🎭',  xp:350,  file:'modul4.html',  badge:'İKNA KALKANI',         bicon:'🎭' },
  { n:5,  name:'Phishing & Zararlı Yazılımlar',   icon:'🎣',  xp:300,  file:'modul5.html',  badge:'PHİSHİNG AVCISI',        bicon:'🎣' },
  { n:6,  name:'Veri Gizliliği & Bulut',        icon:'☁️',  xp:400,  file:'modul6.html',  badge:'VERİ BEKÇİSİ',     bicon:'🔏' },
  { n:7,  name:'Sunum Güvenliği',    icon:'🎤',  xp:450,  file:'modul7.html',  badge:'GÜVENLİ SUNUMCU',        bicon:'🖥️' },
  { n:8,  name:'Güvenli İletişim',     icon:'📡',  xp:350,  file:'modul8.html',  badge:'GÜVENLİ KANAL',       bicon:'📡' },
  { n:9,  name:'Hesap & Platform Güvenliği',        icon:'🪪',  xp:500,  file:'modul9.html',  badge:'HESAP KALKANI',     bicon:'🪪' },
  { n:10, name:'Seyahat Güvenliği',        icon:'✈️',  xp:400,  file:'modul10.html', badge:'SEYAHAT KALKANI',    bicon:'✈️' },
  { n:11,  name:'Yapay Zeka Güvenliği',  icon:'🤖',  xp:300,  file:'modul11.html',  badge:'AI KALKANI',  bicon:'🛡️' },
  { n:12,  name:'Sosyal Medya Güvenliği',  icon:'📸',  xp:400,  file:'modul12.html',  badge:'SOSYAL KALKAN',  bicon:'📸' },
  { n:13,  name:'Siber Zorbalık',  icon:'💬',  xp:300,  file:'modul13.html',  badge:'DİJİTAL CESARET',  bicon:'🦋' },

];
const TOTAL_XP = 3920;
const TOTAL_MODULE_COUNT = MODULES.length;
const QUIZ_TOTAL_MAP = {1:10,2:10,3:10,4:10,5:10,6:10,7:10,8:10,9:10,10:10,11:10,12:10,13:10};

// ── DASHBOARD LOAD ────────────────────────────
function loadDashboard(user) {
  const users = getUsers();
  const u = users[user];
  if (!u) return;

  let done = Array.isArray(u.completedModules)
    ? Array.from(new Set(u.completedModules.map(function(v) { return Number(v); }).filter(function(v) { return v >= 1 && v <= 13; })))
    : [];

  // Reconcile late-module completion records that may be missing due to prior flow issues.
  const qs = (u.quizStats && typeof u.quizStats === 'object') ? u.quizStats : {};
  const hasQuiz11 = !!(qs['11'] && Number(qs['11'].total) > 0);
  const hasQuiz13 = !!(qs['13'] && Number(qs['13'].total) > 0);
  const m13MarkedDone = localStorage.getItem('byte_m13_done_' + user) === '1';
  let reconciled = false;

  // Normal learning flow cannot reach module 12 without finishing module 11.
  if (!done.includes(11) && (hasQuiz11 || done.includes(12))) {
    done.push(11);
    reconciled = true;
  }

  // If module 13 quiz result exists, module 13 has been entered/completed by user flow.
  if (!done.includes(13) && (hasQuiz13 || m13MarkedDone)) {
    done.push(13);
    reconciled = true;
  }

  if (reconciled) {
    done.sort(function(a, b) { return a - b; });
    u.completedModules = done;
    users[user] = u;
    saveUsers(users);
  }

  const doneCount = done.length;
  // Derive XP from completed modules (always accurate)
  const XP_MAP = {1:300, 2:350, 3:400, 4:350, 5:300, 6:400, 7:450, 8:350, 9:500, 10:400, 11:300, 12:400, 13:300};
  const earnedXP = done.reduce(function(sum, mn) { return sum + (XP_MAP[mn] || 0); }, 0);
  const pct = Math.round(doneCount / MODULES.length * 100);

  // Topbar & header
  document.getElementById('dash-username').textContent = user;
  document.getElementById('ws-greeting').textContent = 'Hoş geldin, ' + user + '! 👋';
    document.getElementById('cert-name').textContent = user;
    // Level: tamamlanan modül sayısı kadar
    document.getElementById('dash-level').textContent = 'Lv.' + doneCount;

    // Dinamik dashboard mesajı
    const wsSubEl = document.querySelector('.ws-sub');
    let nextModule = MODULES.find(m => !done.includes(m.n));
    let msg = '';
    if (doneCount === 0) {
      msg = 'Henüz hiç modül tamamlamadın. Hadi ilk modüle başla ve ilk rozetini kazan!';
    } else if (!nextModule) {
      msg = doneCount + ' modül tamamladın. Tüm rozetleri kazandın! Tebrikler!';
    } else {
      msg = doneCount + ' modül tamamladın. Harika gidiyorsun! Modül ' + nextModule.n + ' seni bekliyor — ' + nextModule.name + ' dünyasına hazır mısın?';
    }
    if (wsSubEl) wsSubEl.textContent = msg;

  // XP
  document.getElementById('dash-xp').textContent = earnedXP;
  document.getElementById('sc-xp').textContent = earnedXP;
  document.getElementById('dash-xp-fill').style.width = Math.min((earnedXP % 500) / 500 * 100, 100) + '%';

  // Stats cards
  document.getElementById('sc-mod-trend').textContent = doneCount + '/' + TOTAL_MODULE_COUNT;
  document.getElementById('sc-mods').textContent = doneCount;
  document.getElementById('sc-badges').textContent = doneCount;
  document.getElementById('map-progress-label').textContent = doneCount + ' / ' + TOTAL_MODULE_COUNT + ' tamamlandı';
  document.getElementById('badge-count-label').textContent = doneCount + ' / ' + TOTAL_MODULE_COUNT + ' kazanıldı';

  // Quiz summary: total correct / total solved questions across modules.
  const quizStats = (u.quizStats && typeof u.quizStats === 'object') ? u.quizStats : {};
  let quizCorrectTotal = 0;
  let quizQuestionTotal = 0;
  MODULES.forEach(function(m) {
    const totalQ = QUIZ_TOTAL_MAP[m.n] || 0;
    const row = quizStats[String(m.n)] || quizStats[m.n];
    if (row && typeof row.correct === 'number' && typeof row.total === 'number') {
      const safeTotal = Math.max(0, Math.min(totalQ || row.total, row.total));
      const safeCorrect = Math.max(0, Math.min(safeTotal, row.correct));
      quizCorrectTotal += safeCorrect;
      quizQuestionTotal += safeTotal;
      return;
    }

    // Migration fallback for previously completed modules without per-module quiz records.
    if (done.includes(m.n) && totalQ > 0) {
      quizCorrectTotal += totalQ;
      quizQuestionTotal += totalQ;
    }
  });

  const quizPct = quizQuestionTotal > 0 ? Math.round((quizCorrectTotal / quizQuestionTotal) * 100) : 0;
  const quizValEl = document.getElementById('sc-quiz');
  const quizTrendEl = document.getElementById('sc-quiz-trend');
  if (quizValEl) quizValEl.textContent = quizCorrectTotal + '/' + quizQuestionTotal;
  if (quizTrendEl) quizTrendEl.textContent = '%' + quizPct;

  // Progress map — render rows
  const mapEl = document.getElementById('progress-map-list');
  mapEl.innerHTML = MODULES.map(function(m, i) {
    const isDone = done.includes(m.n);
    const isNext = !isDone && (i === 0 || done.includes(MODULES[i-1].n));
    const isLast = i === MODULES.length - 1;
    const lineClass = isDone ? 'done' : 'locked';
    const circleClass = isDone ? 'done' : (isNext ? 'active' : 'locked');
    const circleText = isDone ? '✓' : (String(m.n).padStart(2,'0'));

    if (isDone) {
      return '<div class="pm-row">' +
        '<div class="pm-connector">' +
          '<div class="pm-circle done">✓</div>' +
          (isLast ? '' : '<div class="pm-line done"></div>') +
        '</div>' +
        '<div class="pm-card done" onclick="openModule(' + m.n + ')">' +
          '<div class="pm-card-left">' +
            '<div class="pm-card-icon">' + m.icon + '</div>' +
            '<div><div class="pm-card-title">Modül ' + String(m.n).padStart(2,'0') + ' — ' + m.name + '</div>' +
            '<div class="pm-card-meta">5 Adım · ' + m.xp + ' XP</div></div>' +
          '</div>' +
          '<div class="pm-card-right">' +
            '<div class="pm-prog-bar"><div class="pm-prog-fill done" style="width:100%"></div></div>' +
            '<div class="pm-xp">' + m.xp + ' / ' + m.xp + ' XP</div>' +
            '<div class="pm-status done-s">✓ Tamamlandı</div>' +
            '<button class="pm-action-btn review" onclick="event.stopPropagation();openModule(' + m.n + ')">Tekrar Gör</button>' +
          '</div>' +
        '</div></div>';
    } else if (isNext) {
      return '<div class="pm-row">' +
        '<div class="pm-connector">' +
          '<div class="pm-circle active">' + String(m.n).padStart(2,'0') + '</div>' +
          (isLast ? '' : '<div class="pm-line locked"></div>') +
        '</div>' +
        '<div class="pm-card active-card">' +
          '<div class="pm-card-left">' +
            '<div class="pm-card-icon">' + m.icon + '</div>' +
            '<div><div class="pm-card-title">Modül ' + String(m.n).padStart(2,'0') + ' — ' + m.name + '</div>' +
            '<div class="pm-card-meta">5 Adım · ' + m.xp + ' XP</div></div>' +
          '</div>' +
          '<div class="pm-card-right">' +
            '<div class="pm-prog-bar"><div class="pm-prog-fill active" style="width:0%"></div></div>' +
            '<div class="pm-xp">0 / ' + m.xp + ' XP</div>' +
            '<div class="pm-status active-s">▶ Sıradaki</div>' +
            '<button class="pm-action-btn start" onclick="openModule(' + m.n + ')">Başla →</button>' +
          '</div>' +
        '</div></div>';
    } else {
      return '<div class="pm-row">' +
        '<div class="pm-connector">' +
          '<div class="pm-circle locked">' + String(m.n).padStart(2,'0') + '</div>' +
          (isLast ? '' : '<div class="pm-line locked"></div>') +
        '</div>' +
        '<div class="pm-card locked-card">' +
          '<div class="pm-card-left">' +
            '<div class="pm-card-icon" style="opacity:.4">' + m.icon + '</div>' +
            '<div><div class="pm-card-title" style="color:var(--text-dim)">Modül ' + String(m.n).padStart(2,'0') + ' — ' + m.name + '</div>' +
            '<div class="pm-card-meta">5 Adım · ' + m.xp + ' XP</div></div>' +
          '</div>' +
          '<div class="pm-card-right"><div class="pm-status locked-s">🔒 Kilitli</div></div>' +
        '</div></div>';
    }
  }).join('');

  // Badges grid
  const badgesEl = document.getElementById('badges-grid');
  badgesEl.innerHTML = MODULES.map(function(m) {
    const earned = done.includes(m.n);
    return '<div class="badge-item ' + (earned ? 'earned' : 'locked-b') + '">' +
      '<div class="badge-emoji">' + m.bicon + '</div>' +
      '<div class="badge-name">' + m.badge + '</div>' +
      '<div class="badge-mod">Modül ' + String(m.n).padStart(2,'0') + '</div>' +
    '</div>';
  }).join('');

  // Certificate
  document.getElementById('cert-bar-fill').style.width = pct + '%';
  document.getElementById('cert-pct').textContent = '%' + pct;
  if (doneCount >= MODULES.length) {
    document.getElementById('cert-info-text').innerHTML = 'Tüm modüller tamamlandı! <strong style="color:var(--yellow)">Sertifikan hazır. 🎉</strong>';
    document.getElementById('cert-progress-text').textContent = TOTAL_MODULE_COUNT + '/' + TOTAL_MODULE_COUNT;
  } else {
    document.getElementById('cert-info-text').innerHTML = 'Sertifika için <strong style="color:var(--yellow)">' + TOTAL_MODULE_COUNT + ' modülün tamamını</strong> bitirmen gerekiyor.';
    document.getElementById('cert-progress-text').textContent = doneCount + '/' + TOTAL_MODULE_COUNT;
  }
  document.getElementById('cert-sub').innerHTML = 'BYTE Academy tarafından verilmiştir.<br>' + doneCount + ' Modül · ' + earnedXP + ' XP';

  const certBtn = document.getElementById('cert-open-btn');
  if (certBtn) {
    if (doneCount >= MODULES.length) {
      certBtn.disabled = false;
      certBtn.style.opacity = '1';
      certBtn.style.cursor = 'pointer';
      certBtn.textContent = 'Sertifikayı Aç';
      certBtn.onclick = function() { window.location.href = 'certificate.html'; };
    } else {
      certBtn.disabled = true;
      certBtn.style.opacity = '.6';
      certBtn.style.cursor = 'not-allowed';
      certBtn.textContent = '13/13 ile Açılır';
      certBtn.onclick = function(ev) { ev.preventDefault(); return false; };
    }
  }

  // Landing preview grid — unlock completed ones
  updateLandingGrid(done);
}

// ── LANDING GRID UPDATE ───────────────────────
function updateLandingGrid(done) {
  var grid = document.querySelector('.modules-grid');
  if (!grid) return;
  var html = '';
  MODULES.forEach(function(m) {
    var isDone = done.indexOf(m.n) !== -1;
    var card = '<div class="mod-prev-card' + (isDone ? ' completed' : '') + '"';
    if (isDone) { card += ' onclick="window.location.href=\'' + m.file + '\'"'; }
    card += '><div class="mp-num ' + (isDone ? 'done' : 'locked') + '">' + String(m.n).padStart(2,'0') + '</div>';
    card += '<div class="mp-info"><div class="mp-name">' + m.icon + ' ' + m.name + '</div><div class="mp-xp">&#9889; ' + m.xp + ' XP</div></div>';
    card += '<span class="mp-lock"' + (isDone ? ' style="color:var(--green)"' : '') + '>' + (isDone ? '&#10003;' : '&#128274;') + '</span></div>';
    html += card;
  });
  grid.innerHTML = html;
}

// ── LOGOUT ────────────────────────────────────
function doLogout() {
  currentUser = null;
  clearSession();
  showScreen('landing');
  toast('👋', 'Görüşürüz!', 'Başarıyla çıkış yapıldı.', 'info');
}

// ── MODULE OPEN ───────────────────────────────
function openModule(n) {
  const files = {
    1: 'modul1.html', 2: 'modul2.html', 3: 'modul3.html',
    4: 'modul4.html', 5: 'modul5.html', 6: 'modul6.html',
    7: 'modul7.html', 8: 'modul8.html', 9: 'modul9.html',
    10: 'modul10.html', 11: 'modul11.html', 12: 'modul12.html',
    13: 'modul13.html'
  };
  if (files[n]) {
    toast('📖', 'Modül ' + n + ' Açılıyor', 'Yükleniyor...', 'info');
    setTimeout(() => { window.location.href = files[n]; }, 600);
  }
}

// ── TOAST ─────────────────────────────────────
function toast(icon, title, sub, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = '<div class="t-icon">' + icon + '</div><div><div class="t-title">' + title + '</div><div class="t-sub">' + sub + '</div></div>';
  c.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 350); }, 3500);
}

// ── INIT — oturum kontrolü ────────────────────
(function init() {
  const savedUser = getSession();
  if (savedUser) {
    const users = getUsers();
    if (users[savedUser]) {
      currentUser = savedUser;
      loadDashboard(savedUser);
      showScreen('dashboard');
      return;
    }
    clearSession();
  }
  showScreen('landing');
})();

// ── VIDEO MODAL ───────────────────────────────
function openVideo() {
  var modal = document.getElementById('hero-video-modal');
  var src = document.getElementById('hero-video-src');
  var video = document.getElementById('hero-video');
  // Mobile check (screen width < 768px)
  var isMobile = window.innerWidth < 768;
  src.src = isMobile ? 'videos/BYTE_s.mp4' : 'videos/BYTE.mp4';
  video.load();
  video.play();
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeVideo() {
  var modal = document.getElementById('hero-video-modal');
  var video = document.getElementById('hero-video');
  video.pause();
  video.currentTime = 0;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', function() {
  var modal = document.getElementById('hero-video-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeVideo();
    });
  }
});

// ── PWA SERVICE WORKER KAYDI ─────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

