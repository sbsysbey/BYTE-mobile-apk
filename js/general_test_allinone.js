// GENEL TEST — TÜM KODLAR BİRLEŞTİRİLDİ
// Soru havuzu, ekran ve seçim fonksiyonları tek dosyada

// --- SORU HAVUZU ---
const GENERAL_TEST_QUESTIONS = [
  // Modül 1
  { mod: 1, q: 'Güçlü bir şifre nasıl olmalıdır?', opts: ['Uzun ve karmaşık', 'Sadece doğum tarihi', 'Sadece isim', '123456'], correct: 0 },
  { mod: 1, q: 'Şifrenizi kimlerle paylaşmalısınız?', opts: ['Kimseyle', 'Arkadaşınızla', 'Ailenizle', 'Sosyal medyada'], correct: 0 },
  // Modül 2
  { mod: 2, q: 'Açık Wi-Fi kullanırken neye dikkat etmelisiniz?', opts: ['VPN kullanmak', 'Her siteye girmek', 'Şifreyi paylaşmak', 'Hiçbir şeye dikkat etmemek'], correct: 0 },
  { mod: 2, q: 'Ağ güvenliği için ilk adım nedir?', opts: ['Güçlü parola', 'Açık ağ', 'Paylaşılan hesap', 'Şifresiz ağ'], correct: 0 },
  // Modül 3
  { mod: 3, q: 'Mobil cihazlarda hangi uygulamalar risklidir?', opts: ['Kaynağı belirsiz uygulamalar', 'Resmi mağaza uygulamaları', 'Güncel uygulamalar', 'Hiçbiri'], correct: 0 },
  { mod: 3, q: 'Smishing nedir?', opts: ['SMS ile oltalama', 'E-posta ile virüs', 'Fiziksel saldırı', 'Telefon görüşmesi'], correct: 0 },
  // Modül 4
  { mod: 4, q: 'Sosyal mühendislik saldırısı nedir?', opts: ['İnsanları kandırarak bilgi almak', 'Yazılım güncellemek', 'Donanım değiştirmek', 'Ağ kurmak'], correct: 0 },
  { mod: 4, q: 'Kimlik taklidi saldırısında amaç nedir?', opts: ['Kişi gibi davranmak', 'Cihazı bozmak', 'Ağ kurmak', 'Veri silmek'], correct: 0 },
  // Modül 5
  { mod: 5, q: 'Phishing saldırısı nedir?', opts: ['Sahte site ile bilgi çalmak', 'Donanım bozmak', 'Ağ kurmak', 'Şifreyi değiştirmek'], correct: 0 },
  { mod: 5, q: 'Zararlı yazılım nasıl bulaşır?', opts: ['Bilinmeyen dosya açınca', 'Güvenli siteden', 'Güncelleme yapınca', 'Hiçbir zaman'], correct: 0 },
  // Modül 6
  { mod: 6, q: 'Veri gizliliği neden önemlidir?', opts: ['Kişisel bilgiler korunur', 'Daha hızlı internet', 'Daha çok reklam', 'Hiçbir önemi yok'], correct: 0 },
  { mod: 6, q: 'Bulut depolamada neye dikkat edilmeli?', opts: ['Güçlü şifre', 'Herkese açık paylaşım', 'Şifresiz dosya', 'Rastgele paylaşım'], correct: 0 },
  // Modül 7
  { mod: 7, q: 'Dijital kimlik nedir?', opts: ['Sanal ortamdaki kimliğimiz', 'Fiziksel kimlik', 'Ehliyet', 'Pasaport'], correct: 0 },
  { mod: 7, q: 'Kimlik avı saldırısında ne yapılmalı?', opts: ['Şüpheli linke tıklamamak', 'Her linke tıklamak', 'Şifreyi paylaşmak', 'Yanıt vermek'], correct: 0 },
  // Modül 8
  { mod: 8, q: 'Güvenli iletişim için ne yapılmalı?', opts: ['Şifreli mesajlaşma', 'Açık mesaj', 'Herkese açık paylaşım', 'Şifresiz e-posta'], correct: 0 },
  { mod: 8, q: 'Dosya paylaşırken neye dikkat edilmeli?', opts: ['Kaynağı bilmek', 'Her dosyayı açmak', 'Şifresiz paylaşmak', 'Hiçbirine dikkat etmemek'], correct: 0 },
  // Modül 9
  { mod: 9, q: 'Parola hijyeni nedir?', opts: ['Şifreleri düzenli değiştirmek', 'Aynı şifreyi kullanmak', 'Şifreyi paylaşmak', 'Şifreyi yazmak'], correct: 0 },
  { mod: 9, q: 'İki aşamalı doğrulama ne sağlar?', opts: ['Ek güvenlik', 'Daha yavaş giriş', 'Daha çok reklam', 'Hiçbir şey'], correct: 0 },
  // Modül 10
  { mod: 10, q: 'Seyahat sırasında cihaz güvenliği için ne yapılmalı?', opts: ['Cihazı kilitlemek', 'Açık bırakmak', 'Şifreyi paylaşmak', 'Herkese açık Wi-Fi'], correct: 0 },
  { mod: 10, q: 'Yabancı ağlara bağlanırken neye dikkat edilmeli?', opts: ['Güvenli ağ seçmek', 'Her ağa bağlanmak', 'Şifreyi paylaşmak', 'Açık ağ'], correct: 0 },
  // Modül 11
  { mod: 11, q: 'Yapay zeka güvenliği neden önemlidir?', opts: ['Veri sızıntısını önler', 'Daha hızlı internet', 'Daha çok reklam', 'Hiçbir önemi yok'], correct: 0 },
  { mod: 11, q: 'Prompt hijyeni nedir?', opts: ['Güvenli komut kullanmak', 'Her komutu yazmak', 'Şifreyi paylaşmak', 'Yanlış bilgi vermek'], correct: 0 },
  // Modül 12
  { mod: 12, q: 'Sosyal medya güvenliği için ne yapılmalı?', opts: ['Gizlilik ayarlarını kontrol etmek', 'Her paylaşımı herkese açık yapmak', 'Şifreyi paylaşmak', 'Hiçbir şey yapmamak'], correct: 0 },
  { mod: 12, q: 'İçerik güvenliği nedir?', opts: ['Zararlı içerikten korunmak', 'Her içeriği paylaşmak', 'Şifreyi paylaşmak', 'Yanlış bilgi yaymak'], correct: 0 },
  // Modül 13
  { mod: 13, q: 'Siber zorbalık nedir?', opts: ['Dijital ortamda taciz', 'Fiziksel saldırı', 'Telefon araması', 'Hiçbiri'], correct: 0 },
  { mod: 13, q: 'Zorbalık karşısında ilk adım nedir?', opts: ['Kanıt toplamak', 'Sessiz kalmak', 'Yanıt vermek', 'Hiçbir şey yapmamak'], correct: 0 },
  // Rehber
  { mod: 'rehber', q: 'Rehberde hangi bilgi bulunur?', opts: ['Kısa özetler', 'Şifreler', 'Kişisel veri', 'Reklam'], correct: 0 },
  { mod: 'rehber', q: 'Cheat sheet nedir?', opts: ['Kısa yol rehberi', 'Uzun makale', 'Şifre', 'Hiçbiri'], correct: 0 },
  // GDPR
  { mod: 'gdpr', q: 'GDPR nedir?', opts: ['Veri koruma yönetmeliği', 'Bir yazılım', 'Donanım', 'Şifre'], correct: 0 },
  { mod: 'gdpr', q: 'Unutulma hakkı neyi ifade eder?', opts: ['Verinin silinmesini isteme hakkı', 'Şifreyi unutmak', 'Cihazı sıfırlamak', 'Hiçbiri'], correct: 0 }
];

// --- 30 soruluk havuzdan rastgele 30 soru seçen fonksiyon ---
function getRandomGeneralTestQuestions() {
  if (!Array.isArray(GENERAL_TEST_QUESTIONS) || GENERAL_TEST_QUESTIONS.length < 30) {
    alert('Genel test için yeterli soru yok!');
    return [];
  }
  // Her modülden 2, rehber ve gdpr'den 2'şer soru seç
  const grouped = {};
  GENERAL_TEST_QUESTIONS.forEach(q => {
    if (!grouped[q.mod]) grouped[q.mod] = [];
    grouped[q.mod].push(q);
  });
  let selected = [];
  for (let mod = 1; mod <= 13; mod++) {
    if (grouped[mod] && grouped[mod].length >= 2) {
      const shuffled = grouped[mod].sort(() => Math.random() - 0.5);
      selected = selected.concat(shuffled.slice(0, 2));
    }
  }
  ['rehber', 'gdpr'].forEach(mod => {
    if (grouped[mod] && grouped[mod].length >= 2) {
      const shuffled = grouped[mod].sort(() => Math.random() - 0.5);
      selected = selected.concat(shuffled.slice(0, 2));
    }
  });
  if (selected.length !== 30) {
    alert('Genel test için tam 30 soru bulunamadı!');
    return [];
  }
  return selected.sort(() => Math.random() - 0.5);
}

// --- Genel Test Ekranı ve Cevaplama Akışı ---
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
