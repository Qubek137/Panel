# Panel Sterowania - GitHub Pages

Responsywna strona mobilna w 100% kompatybilna z GitHub Pages.

## 🚀 Szybki start

### 1. Struktura plików

\`\`\`
public/
├── index.html          # Główna strona
├── styles.css          # Style CSS (bez Tailwind)
├── script.js           # JavaScript aplikacji
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── offline.html       # Strona offline
├── images/            # Obrazy WebP
└── icons/             # Ikony PWA
\`\`\`

### 2. Wdrożenie na GitHub Pages

\`\`\`bash
# 1. Zbuduj wersję GitHub Pages
./scripts/build-github-pages.sh

# 2. Commit i push
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main

# 3. Włącz GitHub Pages w ustawieniach repo
# Settings > Pages > Source: Deploy from branch
# Branch: main, Folder: /docs
\`\`\`

## 🎯 Funkcje

### ✅ W pełni lokalne
- ❌ **Brak zewnętrznych CDN**
- ✅ Wszystkie pliki lokalne
- ✅ Obrazy WebP (skompresowane)
- ✅ Lazy loading obrazów
- ✅ Service Worker (offline)

### ✅ Responsywny design
- 📱 **320px+** - Bardzo małe telefony
- 📱 **360px+** - Standardowe telefony  
- 📱 **768px+** - Tablety
- 💻 **1024px+** - Desktop

### ✅ PWA Features
- 📱 Instalowalna jako aplikacja
- 🔄 Działa offline
- 🔔 Push notifications (gotowe)
- 📊 Background sync

## 🛠️ Technologie

### Vanilla Stack
- **HTML5** - Semantyczny markup
- **CSS3** - Flexbox, Grid, Custom Properties
- **JavaScript ES6+** - Modules, Classes, Async/Await
- **Service Worker** - Offline support
- **Web App Manifest** - PWA

### Brak frameworków
- ❌ React/Vue/Angular
- ❌ Tailwind/Bootstrap
- ❌ jQuery
- ✅ Vanilla JavaScript
- ✅ Pure CSS

## 📱 Funkcjonalność

### Pogoda (Offline)
- 🌤️ 5 lokalizacji (Wieluń, Łódź, Warszawa...)
- 🔄 Automatyczne odświeżanie
- 📊 Temperatura, wilgotność, wiatr
- 🕒 Timestamp ostatniej aktualizacji

### Panel sterowania
- 🎛️ 6 przycisków sterowania
- 💫 Haptic feedback (wibracje)
- 🎨 Kolorowe przyciski z gradientami
- ⚡ Animacje i przejścia

### Gesty dotykowe
- ⬅️➡️ Swipe poziomy - zmiana widoku
- ⬆️⬇️ Swipe pionowy - zmiana lokalizacji
- 👆 Tap - aktywacja przycisków
- 📳 Haptic feedback

## 🎨 Personalizacja

### Zmiana kolorów
\`\`\`css
/* public/styles.css */
:root {
    --primary-color: #3b82f6;    /* Niebieski */
    --primary-dark: #1e40af;     /* Ciemny niebieski */
    --text-primary: #1f2937;     /* Ciemny tekst */
}
\`\`\`

### Dodanie nowych przycisków
\`\`\`javascript
// public/script.js - ControlPanel.executeControlAction()
const actions = {
    '7': () => console.log('Nowy przycisk'),
    // ...
};
\`\`\`

### Zmiana lokalizacji pogodowych
\`\`\`javascript
// public/script.js - Config.locations
const Config = {
    locations: [
        { name: "Nowa Lokalizacja", locationKey: "123456" }
    ]
};
\`\`\`

## 🔧 Optymalizacja

### Obrazy WebP
\`\`\`bash
# Konwertuj obrazy na WebP
./scripts/optimize-images.sh

# Ręczna konwersja
cwebp -q 80 input.png -o output.webp
\`\`\`

### Lazy Loading
\`\`\`html
<!-- Automatyczne lazy loading -->
<img src="image.webp" loading="lazy" alt="Opis">

<!-- Z fallback -->
<img src="image.webp" 
     onerror="this.src='image.png'" 
     loading="lazy" 
     alt="Opis">
\`\`\`

### Service Worker Cache
\`\`\`javascript
// Automatyczne cachowanie plików
const STATIC_FILES = [
    './',
    './index.html',
    './styles.css',
    './script.js'
];
\`\`\`

## 📊 Wydajność

### Rozmiary plików
- **HTML**: ~15KB (gzipped: ~5KB)
- **CSS**: ~25KB (gzipped: ~7KB)  
- **JavaScript**: ~20KB (gzipped: ~6KB)
- **Obrazy WebP**: ~50-80% mniejsze niż PNG
- **Całość**: ~2-3MB (z ikonami)

### Czas ładowania
- **First Paint**: <1s
- **Interactive**: <2s
- **Offline**: Instant (po cache)

## 🔍 SEO & Accessibility

### Meta tags
\`\`\`html
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
\`\`\`

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Reduced motion support

## 🚨 Rozwiązywanie problemów

### Aplikacja nie ładuje się
1. **Sprawdź console** (F12)
2. **Wyczyść cache** (Ctrl+Shift+R)
3. **Sprawdź Service Worker** (Application tab)

### Obrazy nie wyświetlają się
1. **Sprawdź ścieżki** - relatywne do index.html
2. **Konwertuj na WebP** - `./scripts/optimize-images.sh`
3. **Dodaj fallback** - `onerror="this.src='backup.png'"`

### GitHub Pages nie działa
1. **Sprawdź folder docs/** - musi zawierać index.html
2. **Włącz Pages** - Settings > Pages > /docs
3. **Sprawdź branch** - main/master
4. **Poczekaj** - może potrwać 10 minut

## 📈 Analytics & Monitoring

### Google Analytics (opcjonalne)
\`\`\`html
<!-- Dodaj przed </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
\`\`\`

### Error Monitoring
\`\`\`javascript
// public/script.js - już zaimplementowane
window.addEventListener('error', (e) => {
    console.error('App error:', e.error);
    // Wyślij do serwisu monitoringu
});
\`\`\`

## 🔄 Aktualizacje

### Wersjonowanie
\`\`\`javascript
// public/sw.js
const CACHE_NAME = 'panel-sterowania-v1.0.1'; // Zwiększ wersję
\`\`\`

### Auto-update
\`\`\`javascript
// Service Worker automatycznie aktualizuje cache
// Użytkownicy dostaną nową wersję przy następnym odwiedzeniu
\`\`\`

---

**🎉 Aplikacja gotowa do wdrożenia na GitHub Pages!**

**URL przykładowy**: `https://username.github.io/repository-name/`
