#!/bin/bash

# Skrypt do testowania statycznej wersji

echo "🧪 Testowanie statycznej wersji Panel Sterowania..."
echo ""

# Sprawdź czy folder out istnieje
if [ ! -d "out" ]; then
    echo "❌ Folder 'out' nie istnieje!"
    echo "Najpierw zbuduj aplikację: ./scripts/build-static.sh"
    exit 1
fi

# Sprawdź główne pliki
echo "📋 Sprawdzanie głównych plików..."

FILES=("index.html" "_next/static" "manifest.json")
for file in "${FILES[@]}"; do
    if [ -e "out/$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - BRAK"
    fi
done

echo ""

# Sprawdź rozmiary plików
echo "📊 Rozmiary głównych plików:"
if [ -f "out/index.html" ]; then
    SIZE=$(wc -c < "out/index.html")
    echo "   index.html: ${SIZE} bajtów"
fi

if [ -d "out/_next/static" ]; then
    SIZE=$(du -sh "out/_next/static" 2>/dev/null | cut -f1)
    echo "   _next/static: $SIZE"
fi

echo ""

# Test otwarcia w przeglądarce (jeśli dostępna)
echo "🌐 Testowanie w przeglądarce..."

# Sprawdź czy można uruchomić serwer testowy
if command -v python3 &> /dev/null; then
    echo "🐍 Uruchamianie serwera testowego Python..."
    cd out
    echo "   Serwer dostępny na: http://localhost:8000"
    echo "   Naciśnij Ctrl+C aby zatrzymać"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🐍 Uruchamianie serwera testowego Python 2..."
    cd out
    echo "   Serwer dostępny na: http://localhost:8000"
    echo "   Naciśnij Ctrl+C aby zatrzymać"
    python -m SimpleHTTPServer 8000
elif command -v npx &> /dev/null; then
    echo "📦 Uruchamianie serwera testowego npm..."
    npx serve out -s -p 8000
else
    echo "ℹ️  Brak dostępnego serwera HTTP"
    echo "   Możesz otworzyć bezpośrednio: out/index.html"
    echo ""
    echo "📱 Dla urządzeń mobilnych:"
    echo "   1. Skopiuj folder 'out' na urządzenie"
    echo "   2. Otwórz index.html w przeglądarce mobilnej"
    echo "   3. Lub użyj: file:///ścieżka/do/out/index.html"
fi
