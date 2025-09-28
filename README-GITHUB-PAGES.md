# Panel Sterowania - GitHub Pages Deployment

## 🌟 Real Weather API Integration

Aplikacja teraz używa **prawdziwego API pogodowego** z Open-Meteo dla trzech lokalizacji:
- **Konopnica** (51.221°N, 18.5696°E)
- **Warszawa** (52.2298°N, 21.0118°E) 
- **Wieluń** (51.3538°N, 18.8236°E)

## 🚀 Funkcjonalności

### ☁️ Prawdziwe dane pogodowe
- Aktualna temperatura, wilgotność, prędkość wiatru
- Warunki pogodowe z ikonami
- Wschód i zachód słońca
- Prognoza godzinowa (następne 6 godzin)
- Automatyczne odświeżanie co 10 minut

### 📱 Mobilna nawigacja
- **Swipe left/right** - przełączanie pogoda ↔ panel sterowania
- **Swipe up/down** - zmiana lokalizacji (tylko w widoku pogody)
- **Haptic feedback** - wibracje przy dotykach
- **Touch-friendly** - zoptymalizowane dla urządzeń mobilnych

### 🔄 Inteligentne cache'owanie
- **API Rate Limiting** - maksymalnie 9000 wywołań/dzień
- **Smart caching** - dane cache'owane na 30 minut
- **Offline fallback** - statyczne dane gdy brak internetu
- **Service Worker** - pełna funkcjonalność offline

### 📊 Monitoring API
- Licznik pozostałych wywołań API
- Status połączenia (ONLINE/OFFLINE)
- Informacje o błędach API
- Automatyczne przełączanie na cache

## 🛠️ Deployment na GitHub Pages

### 1. Przygotowanie repozytorium

\`\`\`bash
# Sklonuj lub utwórz repozytorium
git clone https://github.com/[username]/[repository-name].git
cd [repository-name]

# Zainstaluj zależności
npm install
\`\`\`

### 2. Build i deployment

\`\`\`bash
# Zbuduj aplikację dla GitHub Pages
./scripts/build-github-pages.sh

# Dodaj pliki do git
git add docs/
git commit -m "Deploy weather app with real API to GitHub Pages"
git push origin main
\`\`\`

### 3. Konfiguracja GitHub Pages

1. Idź do **Settings** → **Pages** w swoim repozytorium
2. W sekcji **Source** wybierz:
   - **Deploy from a branch**
   - **Branch**: `main`
   - **Folder**: `/docs`
3. Kliknij **Save**

### 4. Dostęp do aplikacji

Aplikacja będzie dostępna pod adresem:
\`\`\`
https://[username].github.io/[repository-name]/
\`\`\`

## 🔧 Konfiguracja API

### Open-Meteo API
- **Dostawca**: [Open-Meteo](https://open-meteo.com/)
- **Limit**: 10,000 wywołań/dzień (darmowe)
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Bez klucza API** - publiczne API

### Parametry API
\`\`\`javascript
const apiUrl = `https://api.open-meteo.com/v1/forecast?
  latitude=${lat}&longitude=${lon}&
  daily=weather_code,sunrise,sunset,sunshine_duration&
  hourly=temperature_2m,relative_humidity_2m,rain,snowfall,surface_pressure,visibility,precipitation,wind_speed_10m&
  current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&
  timezone=auto&forecast_days=1`
\`\`\`

## 📱 PWA Features

### Instalacja jako aplikacja
- Manifest.json z pełną konfiguracją
- Ikony w różnych rozmiarach
- Standalone mode
- Splash screen

### Service Worker
- Cache'owanie statycznych plików
- Cache'owanie odpowiedzi API
- Offline functionality
- Background sync (przyszłość)

### Optymalizacje
- WebP images z fallback
- Lazy loading
- Minifikacja CSS/JS
- Gzip compression

## 🎯 Użytkowanie

### Nawigacja gestami
1. **Pogoda → Panel**: Swipe w lewo
2. **Panel → Pogoda**: Swipe w prawo  
3. **Zmiana lokalizacji**: Swipe góra/dół (tylko w pogodzie)

### Funkcje pogodowe
- Automatyczne odświeżanie
- Cache'owanie danych
- Fallback na dane offline
- Monitoring limitów API

### Panel sterowania
- 6 przycisków sterowania
- Haptic feedback
- Visual feedback
- Symulacja akcji

## 🔍 Monitoring i debugging

### Console logs
\`\`\`javascript
// Sprawdź status API
console.log('API calls remaining:', weatherApp.apiCalls)

// Sprawdź cache
console.log('Cached data:', localStorage.getItem('weather_konopnica'))

// Service Worker status
navigator.serviceWorker.ready.then(reg => console.log('SW ready:', reg))
\`\`\`

### Local Storage
- `api_calls` - liczba wykonanych wywołań API
- `api_last_reset` - ostatni reset licznika
- `weather_[location]` - cache'owane dane pogodowe

## 🚨 Troubleshooting

### Problem z API
- Sprawdź limit wywołań w konsoli
- Sprawdź połączenie internetowe
- Sprawdź cache w Local Storage

### Problem z GitHub Pages
- Sprawdź czy folder `/docs` istnieje
- Sprawdź ustawienia Pages w repozytorium
- Sprawdź czy `.nojekyll` jest w folderze docs

### Problem z PWA
- Sprawdź manifest.json
- Sprawdź Service Worker w DevTools
- Sprawdź HTTPS (wymagane dla PWA)

## 📈 Przyszłe ulepszenia

- [ ] Push notifications dla alertów pogodowych
- [ ] Więcej lokalizacji
- [ ] Prognoza 7-dniowa
- [ ] Mapy pogodowe
- [ ] Eksport danych
- [ ] Personalizacja interfejsu
- [ ] Integracja z IoT devices

## 📄 Licencja

MIT License - możesz swobodnie używać, modyfikować i dystrybuować.

---

**Aplikacja gotowa do użycia! 🎉**

Prawdziwe dane pogodowe, pełna funkcjonalność offline, intuicyjna nawigacja gestami i profesjonalny deployment na GitHub Pages.
