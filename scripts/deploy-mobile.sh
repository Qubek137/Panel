#!/bin/bash

# Skrypt do wdrożenia na urządzenie mobilne

echo "📱 Wdrażanie Panel Sterowania na urządzenie mobilne..."
echo ""

# Sprawdź czy folder out istnieje
if [ ! -d "out" ]; then
    echo "❌ Folder 'out' nie istnieje!"
    echo "Najpierw zbuduj aplikację: ./scripts/build-static.sh"
    exit 1
fi

# Sprawdź czy termux-setup-storage jest dostępne
if command -v termux-setup-storage &> /dev/null; then
    echo "📂 Konfigurowanie dostępu do pamięci..."
    termux-setup-storage
fi

# Utwórz folder na karcie SD
MOBILE_PATH="/sdcard/panel-sterowania"
echo "📁 Tworzenie folderu: $MOBILE_PATH"
mkdir -p "$MOBILE_PATH"

# Skopiuj pliki
echo "📋 Kopiowanie plików..."
cp -r out/* "$MOBILE_PATH/"

# Sprawdź czy kopiowanie się udało
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Wdrożenie zakończone pomyślnie!"
    echo ""
    echo "📱 Aplikacja została skopiowana do:"
    echo "   $MOBILE_PATH"
    echo ""
    echo "🌐 Sposoby uruchomienia:"
    echo "1. Otwórz w przeglądarce:"
    echo "   file:///sdcard/panel-sterowania/index.html"
    echo ""
    echo "2. Fully Kiosk Browser:"
    echo "   - Otwórz Fully Kiosk Browser"
    echo "   - Przejdź do: file:///sdcard/panel-sterowania/"
    echo "   - Ustaw jako stronę startową"
    echo ""
    echo "3. Chrome Mobile:"
    echo "   - Otwórz Chrome"
    echo "   - W pasku adresu wpisz: file:///sdcard/panel-sterowania/"
    echo "   - Dodaj do ekranu głównego"
    echo ""
    echo "📊 Pliki na urządzeniu:"
    ls -la "$MOBILE_PATH" | head -10
    
else
    echo ""
    echo "❌ Kopiowanie nie powiodło się!"
    echo "Sprawdź uprawnienia do zapisu na karcie SD."
    exit 1
fi
