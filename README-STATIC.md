# Panel Sterowania - Wersja Statyczna (Offline)

Mobilny panel sterowania z pogodą dla regionu Wieluń - **działa całkowicie offline** bez potrzeby serwera.

## 🚀 Szybki start

### 1. Budowanie aplikacji statycznej

\`\`\`bash
# Zainstaluj zależności
npm install

# Zbuduj wersję statyczną
npm run build-static

# Lub użyj skryptu
./scripts/build-static.sh
\`\`\`

### 2. Uruchomienie offline

\`\`\`bash
# Otwórz bezpośrednio w przeglądarce
open out/index.html

# Lub uruchom lokalny serwer testowy
npm run serve-static
\`\`\`

## 📱 Wdrożenie na urządzenie mobilne

### Termux (Android)

\`\`\`bash
# Zbuduj aplikację
./scripts/build-static.sh

# Wdróż na urządzenie
./scripts/deploy-mobile.sh

# Otwórz w przeglądarce
# file:///sdcard/panel-sterowania/index.html
\`\`\`

### Ręczne kopiowanie

1. Zbuduj aplikację: `npm run build-static`
2. Skopiuj folder `out/` na urządzenie mobilne
3. Otwórz `index.html` w przeglądarce mobilnej

## 🌐 Kompatybilność przeglądarek

### ✅ Obsługiwane przeglądarki mobilne:
- **Chrome Mobile** (Android/iOS)
- **Safari Mobile** (iOS)
- **Firefox Mobile** (Android)
- **Fully Kiosk Browser** (Android) - **ZALECANE**
- **Samsung Internet** (Android)
- **Edge Mobile** (Android/iOS)

### 📱 Zalecane aplikacje kiosk:
- **Fully Kiosk Browser** - najlepsza dla kiosków
- **Kiosk Browser Lockdown** - dodatkowe zabezpieczenia
- **SureLock** - enterprise kiosk mode

## 🔧 Funkcje offline

### ✅ Co działa offline:
- ✅ Pełny interfejs użytkownika
- ✅ Wszystkie animacje i przejścia
- ✅ Gesty dotykowe (swipe, tap)
- ✅ Haptic feedback (wibracje)
- ✅ Symulowane dane pogodowe
- ✅ Panel sterowania (6 przycisków)
- ✅ Responsywny design (320px+)
- ✅ PWA functionality

### ❌ Co wymaga internetu:
- ❌ Rzeczywiste dane pogodowe z AccuWeather
- ❌ Aktualizacje aplikacji
- ❌ Zewnętrzne API

## 📊 Dane pogodowe offline

Aplikacja używa **statycznych danych pogodowych** dla:
- Wieluń Piaski
- Konopnica  
- Wieluń
- Łódź
- Warszawa

Dane są **symulowane** i zmieniają się w czasie aby naśladować rzeczywiste warunki.

## 🎛️ Panel sterowania

6 przycisków sterowania:
1. **Oświetlenie** (żółty)
2. **Temperatura** (czerwony)
3. **Bezpieczeństwo** (niebieski)
4. **System Audio** (zielony)
5. **Wentylacja** (fioletowy)
6. **Alarm** (pomarańczowy)

## 📁 Struktura plików

\`\`\`
out/
├── index.html              # Główna strona aplikacji
├── _next/static/           # Zasoby statyczne (CSS, JS)
├── manifest.json           # PWA manifest
├── offline.html           # Strona offline
├── favicon.ico            # Ikona aplikacji
└── *.png                  # Ikony PWA
\`\`\`

## 🔧 Konfiguracja

### Zmiana danych pogodowych

Edytuj plik `lib/static-weather-data.ts`:

\`\`\`typescript
export const staticWeatherData = {
  "location_key": [
    {
      location: "Nazwa lokalizacji",
      temperature: 15,
      humidity: 60,
      windSpeed: 10,
      condition: "Słonecznie",
      description: "pogodnie",
      icon: "sunny"
    }
  ]
}
\`\`\`

### Dodanie nowych przycisków

Edytuj `app/page.tsx` - sekcja `controlButtons`:

\`\`\`typescript
const controlButtons = [
  {
    id: 7,
    label: "Nowy przycisk",
    color: "bg-pink-500 hover:bg-pink-600",
    textColor: "text-white",
  }
]
\`\`\`

## 🎨 Personalizacja

### Zmiana kolorów

Edytuj `app/globals.css`:

\`\`\`css
:root {
  --primary: oklch(0.205 0 0);     /* Kolor główny */
  --background: oklch(1 0 0);      /* Tło */
  --foreground: oklch(0.145 0 0);  /* Tekst */
}
\`\`\`

### Zmiana układu

Aplikacja używa **CSS Grid** dla przycisków:
- `grid-cols-2` - 2 kolumny
- `grid-rows-3` - 3 rzędy

## 📱 Optymalizacje mobilne

### Rozmiary ekranów:
- **320px+** - Bardzo małe telefony
- **360px+** - Standardowe telefony  
- **768px+** - Tablety
- **1024px+** - Desktop

### Touch targets:
- **Minimum 48x48px** dla wszystkich przycisków
- **Gesture support** - swipe, tap, long press
- **Haptic feedback** - wibracje przy interakcji

## 🚨 Rozwiązywanie problemów

### Aplikacja nie ładuje się

1. **Sprawdź ścieżkę pliku:**
   \`\`\`
   file:///storage/emulated/0/panel-sterowania/index.html
   \`\`\`

2. **Sprawdź uprawnienia plików:**
   \`\`\`bash
   chmod -R 755 out/
   \`\`\`

3. **Wyczyść cache przeglądarki**

### Przyciski nie działają

1. **Sprawdź JavaScript:**
   - Otwórz Developer Tools (F12)
   - Sprawdź Console na błędy

2. **Sprawdź touch events:**
   - Upewnij się że przeglądarka obsługuje touch

### Dane pogodowe nie zmieniają się

1. **Odśwież stronę** - dane odświeżają się co 5 minut
2. **Sprawdź timestamp** - wyświetlany na dole karty pogody

## 📞 Wsparcie

### Logi debugowania

Otwórz Developer Tools (F12) i sprawdź:
- **Console** - błędy JavaScript
- **Network** - problemy z zasobami
- **Application** - PWA i storage

### Testowanie

\`\`\`bash
# Test kompletności plików
./scripts/test-static.sh

# Test na lokalnym serwerze
npm run serve-static
\`\`\`

## 🔄 Aktualizacje

Aby zaktualizować aplikację:

1. Pobierz nową wersję kodu
2. Zbuduj ponownie: `npm run build-static`
3. Zastąp stare pliki nowymi z folderu `out/`

## 📈 Wydajność

### Rozmiar aplikacji:
- **~2-5 MB** - kompletna aplikacja
- **~500KB** - główne pliki HTML/CSS/JS
- **~1-2MB** - ikony i zasoby

### Czas ładowania:
- **<1s** - na lokalnym storage
- **<3s** - z karty SD
- **Instant** - po pierwszym załadowaniu

---

**Aplikacja działa w 100% offline - nie potrzebuje internetu ani serwera!** 🚀
