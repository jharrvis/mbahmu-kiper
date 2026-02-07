# 🛵 Nenek Gaul Scooter - Development Roadmap

## 🎮 Gameplay Enhancements

### 1. Power-Ups System
| Power-Up | Efek | Durasi |
|----------|------|--------|
| 🛡️ **Perisai** | Kebal dari 1x tabrakan | 10 detik |
| ⚡ **Turbo** | Kecepatan 2x + skor bonus | 5 detik |
| 🧲 **Magnet** | Tarik buah otomatis | 8 detik |
| 👻 **Hantu** | Tembus obstacle | 5 detik |

### 2. Combo System
- Kumpulkan 3 buah berturut-turut = **COMBO x2**
- 5 buah berturut-turut = **COMBO x3**
- Visual feedback: angka combo muncul di layar

### 3. Obstacle Variety
- 🚧 **Barikade** - Harus lompat tinggi (double tap)
- 🛒 **Gerobak Sayur** - Gerak maju-mundur
- 🐕 **Anjing Liar** - Mengejar nenek sebentar
- 💧 **Genangan Air** - Slow down

---

## 🌍 Level & Environment

### 4. Multiple Stages/Themes
| Stage | Background | Obstacle Unik |
|-------|------------|---------------|
| **Pasar Tradisional** | Toko, gerobak | Pedagang, motor |
| **Komplek Perumahan** | Rumah2, pohon | Anak main bola |
| **Jalan Raya** | Gedung tinggi | Mobil, bus |
| **Pantai** | Laut, pasir | Kepiting, payung |

### 5. Day/Night Cycle
- Siang: Normal gameplay
- Sore: Warna sunset, obstacle lebih banyak
- Malam: Gelap, nenek bawa senter (visibility terbatas)

---

## 🏆 Progression & Rewards

### 6. Achievement System
```
🏅 "Pelari Pemula" - Capai skor 100
🥈 "Nenek Gesit" - Capai skor 500 tanpa kena
🥇 "Legend Jalanan" - Capai skor 1000
🎖️ "Kolektor Buah" - Kumpulkan 50 buah dalam 1 game
```

### 7. Daily Challenges
- "Kumpulkan 20 jeruk hari ini"
- "Lompati 10 kucing tanpa kena"
- Reward: Unlock skin/character

### 8. Leaderboard
- Global leaderboard (Firebase/Supabase)
- Weekly reset
- Share skor ke WhatsApp/sosmed

---

## 👵 Character & Customization

### 9. Unlockable Characters
| Character | Skill | Unlock |
|-----------|-------|--------|
| **Nenek Default** | Normal | - |
| **Nenek Sporty** | Lompat lebih tinggi | Skor 500 |
| **Kakek Gaul** | Lari lebih cepat | Skor 1000 |
| **Nenek Ninja** | Double jump | Collect 100 buah |

### 10. Scooter Skins
- Vespa klasik
- Motor listrik
- Skateboard
- Kursi roda sport

---

## 📱 Technical & UX

### 11. Tutorial Interaktif
- First-time player gets guided tutorial
- "Tap untuk lompat!" dengan animasi tangan

### 12. Haptic Feedback (Mobile)
- Vibrate saat kena obstacle
- Light vibrate saat collect item

### 13. Sound Enhancements
- Ambient sound (suara pasar, motor lewat)
- Voice acting nenek: "Aduh!", "Hore!", "Awas!"

---

## 💡 Quick Wins (Prioritas Tinggi)

1. **Double Jump** - Tap 2x untuk lompat lebih tinggi
2. **Score Multiplier** - Semakin lama survive, skor per buah naik
3. **Particle Effects** - Sparkle saat collect buah
4. **Screen Shake** - Saat kena obstacle
5. **High Score Badge** - "NEW HIGH SCORE!" celebration

---

## ⭐ Recommended First Implementation

1. **Power-Ups** - Impact besar ke gameplay
2. **Achievement System** - Membuat player ingin main lagi
3. **Double Jump** - Mudah diimplementasi, gameplay lebih seru

---

*Last Updated: 2026-02-08*
