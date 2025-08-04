#!/bin/bash

# Skrypt do budowania statycznej wersji aplikacji

echo "🚀 Budowanie statycznej wersji Panel Sterowania..."
echo ""

# Sprawdź czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nie jest zainstalowany!"
    echo "Zainstaluj Node.js: pkg install nodejs"
    exit 1
fi

# Sprawdź czy npm jest zainstalowany
if ! command -v npm &> /dev/null; then
    echo "❌ npm nie jest zainstalowany!"
    echo "Zainstaluj npm: pkg install npm"
    exit 1
fi

# Wyczyść poprzednie buildy
echo "🧹 Czyszczenie poprzednich buildów..."
rm -rf .next out

# Zainstaluj zależności jeśli nie ma node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Instalowanie zależności..."
    npm install
fi

# Zbuduj aplikację statyczną
echo "🔨 Budowanie aplikacji..."
npm run build-static

# Sprawdź czy build się udał
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build zakończony pomyślnie!"
    echo ""
    echo "📁 Pliki statyczne znajdują się w folderze: out/"
    echo ""
    echo "🌐 Sposoby uruchomienia:"
    echo "1. Otwórz plik: out/index.html w przeglądarce"
    echo "2. Skopiuj folder 'out' na urządzenie mobilne"
    echo "3. Użyj Fully Kiosk Browser lub podobnej aplikacji"
    echo ""
    echo "📱 Dla Termux:"
    echo "   cp -r out /sdcard/panel-sterowania"
    echo "   Następnie otwórz: file:///sdcard/panel-sterowania/index.html"
    echo ""
    echo "🔧 Test lokalny:"
    echo "   npm run serve-static"
    echo ""
    
    # Pokaż rozmiar folderu out
    if command -v du &> /dev/null; then
        SIZE=$(du -sh out 2>/dev/null | cut -f1)
        echo "📊 Rozmiar aplikacji: $SIZE"
    fi
    
    # Lista głównych plików
    echo ""
    echo "📋 Główne pliki:"
    ls -la out/ | head -10
    
else
    echo ""
    echo "❌ Build nie powiódł się!"
    echo "Sprawdź błędy powyżej i spróbuj ponownie."
    exit 1
fi
