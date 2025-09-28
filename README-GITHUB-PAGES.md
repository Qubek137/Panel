# Panel Sterowania - GitHub Pages

Mobilny panel sterowania z pogodą dla regionu Wieluń. Aplikacja działa w 100% offline bez potrzeby serwera.

## 🚀 Wdrożenie na GitHub Pages

### Automatyczne wdrożenie

\`\`\`bash
# 1. Zbuduj wersję GitHub Pages
./scripts/build-github-pages.sh

# 2. Commit i push
git add docs/
git commit -m "Deploy GitHub Pages version"
git push origin main
\`\`\`

### Konfiguracja w GitHub

1. Przejdź do **Settings** → **Pages**
2. Wybierz **Source**: "Deploy from a branch"
3. Wybierz **Branch**: `main`
4. Wybierz **Folder**: `/docs`
5. Kliknij **Save**

### Własna domena (opcjonalnie)

\`\`\`bash
# Ustaw zmienną środowiskową przed budowaniem
export CUSTOM_DOMAIN="twoja-domena.com"
./scripts/build-github-pages.sh
\`\`\`

## 📱 Funkcje aplikacji

### ✅ Pogoda offline
- **5 lokalizacji**: Wieluń, Częstochowa, Kalisz, Łódź, Sieradz
- **Symulacja danych**: Realistyczne dane pogodowe
- **Auto-refresh**: Aktualizacja co 5 minut
- **Animacje**: Smooth transitions i loading states

### 🎛️ Panel sterowania
- **6 systemów**: Oświetlenie, Temperatura, Bezpieczeństwo, Wentylacja, Energia, Woda
- **Haptic feedback**: Wibracje na dotyk (mobile)
- **Status tracking**: Śledzenie stanu wszystkich systemów
- **Toast notifications**: Powiadomienia o akcjach

### 📱 PWA Features
- **Instalowalna**: Dodaj do ekranu głównego
- **Offline-first**: Działa bez internetu
- **Service Worker**: Zaawansowane cache'owanie
- **Responsive**: Dostosowana do wszystkich urządzeń

## 🛠️ Struktura plików

\`\`\`
docs/                          # GitHub Pages deployment
├── index.html                 # Główna strona aplikacji
├── styles.css                 # Style CSS (bez frameworków)
├── script.js                  # Vanilla JavaScript
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker
├── offline.html               # Strona offline
├── images/                    # Obrazy WebP
│   ├── screenshot-mobile-weather.webp
│   └── screenshot-mobile-control.webp
├── icon-*.png                 # Ikony PWA (różne rozmiary)
├── favicon.ico                # Favicon
├── robots.txt                 # SEO
├── sitemap.xml                # Mapa strony
└── .nojekyll                  # Bypass Jekyll
\`\`\`

## 🎨 Technologie

### Frontend Stack
- **HTML5**: Semantyczny markup
- **CSS3**: Custom Properties, Flexbox, Grid
- **JavaScript ES6+**: Modules, Classes, Async/Await
- **PWA**: Service Worker, Web App Manifest

### Optymalizacje
- **WebP images**: 50-80% mniejsze pliki
- **Lazy loading**: Ładowanie obrazów na żądanie
- **CSS/JS minification**: Kompresja plików
- **Gzip compression**: Automatyczna kompresja GitHub Pages

### Responsywność
- **Mobile-first**: Projektowanie od najmniejszych ekranów
- **Breakpoints**: 320px, 480px, 768px, 1024px+
- **Touch-friendly**: Duże obszary dotykowe
- **Landscape support**: Orientacja pozioma

## 🔧 Rozwój lokalny

### Wymagania
- Przeglądarka z obsługą Service Workers
- Serwer HTTP (np. `python -m http.server`)

### Uruchomienie
\`\`\`bash
# Serwuj pliki lokalnie
cd docs
python -m http.server 8000

# Lub użyj Node.js
npx serve .

# Otwórz http://localhost:8000
\`\`\`

### Testowanie PWA
\`\`\`bash
# Testuj Service Worker
chrome://inspect/#service-workers

# Testuj offline mode
DevTools → Network → Offline

# Testuj instalację
DevTools → Application → Manifest
\`\`\`

## 📊 Performance

### Lighthouse Score (cel)
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 95+
- **PWA**: 100

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Optymalizacje
- **Critical CSS**: Inline w `<head>`
- **Resource hints**: Preload, prefetch
- **Image optimization**: WebP + lazy loading
- **Code splitting**: Modularny JavaScript

## 🔒 Bezpieczeństwo

### Content Security Policy
\`\`\`html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
\`\`\`

### HTTPS
- GitHub Pages automatycznie wymusza HTTPS
- Service Worker wymaga HTTPS do działania

## 🌐 SEO

### Meta tags
- Open Graph dla social media
- Twitter Cards
- Structured data (JSON-LD)

### Sitemap
- Automatycznie generowany `sitemap.xml`
- Rejestracja w Google Search Console

## 📈 Analytics (opcjonalnie)

### Google Analytics 4
\`\`\`html
 Dodaj przed </head> 
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
\`\`\`

## 🐛 Debugging

### Service Worker
\`\`\`javascript
// W DevTools Console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
\`\`\`

### Cache
\`\`\`javascript
// Wyczyść cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
\`\`\`

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- ✅ Pierwsza wersja GitHub Pages
- ✅ Pełna funkcjonalność offline
- ✅ PWA z Service Worker
- ✅ Responsywny design
- ✅ WebP images + lazy loading

## 🤝 Contributing

1. Fork repository
2. Stwórz branch: `git checkout -b feature/nazwa`
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/nazwa`
5. Stwórz Pull Request

## 📄 Licencja

MIT License - zobacz [LICENSE](LICENSE) dla szczegółów.

## 🆘 Wsparcie

- **Issues**: [GitHub Issues](../../issues)
- **Dokumentacja**: [Wiki](../../wiki)
- **Email**: support@example.com

---

**Panel Sterowania** - Mobilna aplikacja PWA dla regionu Wieluń 🏠📱
