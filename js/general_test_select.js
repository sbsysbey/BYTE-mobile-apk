// 30 soruluk havuzdan rastgele 30 soru seçen fonksiyon
// (Soruların karışık gelmesi için kullanılacak)

function getRandomGeneralTestQuestions() {
  // GENERAL_TEST_QUESTIONS global olarak yüklü olmalı
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
      // Rastgele 2 soru seç
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
  // Sonuç 30 soru olmalı
  if (selected.length !== 30) {
    alert('Genel test için tam 30 soru bulunamadı!');
    return [];
  }
  // Soruları karıştır
  return selected.sort(() => Math.random() - 0.5);
}
