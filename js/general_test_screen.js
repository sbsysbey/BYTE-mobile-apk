// Genel Test Ekranı ve Cevaplama Akışı
// Bu dosya genel-test.html ile birlikte çalışır

let generalTestQuestions = [];
let currentGeneralQ = 0;
let generalTestAnswers = [];

function renderGeneralTestQuestion() {
  const area = document.getElementById('test-area');
  if (!area) return;
  const q = generalTestQuestions[currentGeneralQ];
  if (!q) return;
  const L = ['A', 'B', 'C', 'D'];
  let html = `<div class="question-card">
    <div class="question-num">SORU ${currentGeneralQ + 1} / 30</div>
    <div class="question-text">${q.q}</div>
    <div class="options">`;
  q.opts.forEach((opt, i) => {
    html += `<button class="option-btn${generalTestAnswers[currentGeneralQ]===i?' selected':''}" onclick="selectGeneralTestAnswer(${i})">${L[i]}. ${opt}</button>`;
  });
  html += `</div></div>`;
  area.innerHTML = html;
  document.getElementById('prev-btn').style.display = currentGeneralQ > 0 ? '' : 'none';
  document.getElementById('next-btn').style.display = currentGeneralQ < 29 ? '' : 'none';
  document.getElementById('finish-btn').style.display = currentGeneralQ === 29 ? '' : 'none';
}

function selectGeneralTestAnswer(i) {
  generalTestAnswers[currentGeneralQ] = i;
  renderGeneralTestQuestion();
}

document.getElementById('prev-btn').onclick = function() {
  if (currentGeneralQ > 0) {
    currentGeneralQ--;
    renderGeneralTestQuestion();
  }
};
document.getElementById('next-btn').onclick = function() {
  if (currentGeneralQ < 29) {
    currentGeneralQ++;
    renderGeneralTestQuestion();
  }
};
document.getElementById('finish-btn').onclick = function() {
  finishGeneralTest();
};

function finishGeneralTest() {
  let correct = 0;
  for (let i = 0; i < 30; i++) {
    if (generalTestAnswers[i] === generalTestQuestions[i].correct) correct++;
  }
  const result = document.getElementById('test-result');
  result.style.display = '';
  if (correct >= 23) {
    result.innerHTML = `<div class='test-success'>Tebrikler! ${correct}/30 doğru ile testi geçtiniz.<br>Sertifikanız aktif oldu.</div>`;
    // Sertifika hakkı kazananı localStorage'a kaydet
    try {
      const session = localStorage.getItem('byte_session');
      const users = JSON.parse(localStorage.getItem('byte_users') || '{}');
      if (session && users[session]) {
        users[session].passedGeneralTest = true;
        localStorage.setItem('byte_users', JSON.stringify(users));
      }
    } catch(e) {}
    setTimeout(function(){ window.location.href = 'certificate.html'; }, 2000);
  } else {
    result.innerHTML = `<div class='test-fail'>${correct}/30 doğru ile testi geçemediniz.<br>En az 23 doğru yapmalısınız.<br><button onclick='restartGeneralTest()'>Tekrar Dene</button></div>`;
  }
  document.getElementById('test-area').style.display = 'none';
  document.getElementById('test-controls').style.display = 'none';
}

function restartGeneralTest() {
  generalTestAnswers = [];
  currentGeneralQ = 0;
  document.getElementById('test-area').style.display = '';
  document.getElementById('test-controls').style.display = '';
  document.getElementById('test-result').style.display = 'none';
  renderGeneralTestQuestion();
}

window.onload = function() {
  generalTestQuestions = getRandomGeneralTestQuestions();
  generalTestAnswers = [];
  currentGeneralQ = 0;
  renderGeneralTestQuestion();
};
