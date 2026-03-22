// Genel Test Soru Havuzu (örnek yapı)
// Her modülden 2, rehber ve gdpr'den 2'şer soru olacak şekilde doldurulmalı
// Soru örnekleri: { q: 'Soru metni', opts: ['A', 'B', 'C', 'D'], correct: 0 }

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

// Not: Gerçek sorular ve cevaplar buraya eklenecek.
