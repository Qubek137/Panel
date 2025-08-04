#!/bin/bash

# Skrypt do budowania wersji kompatybilnej z GitHub Pages

echo "🚀 Budowanie wersji GitHub Pages..."
echo ""

# Sprawdź czy folder public istnieje
if [ ! -d "public" ]; then
    echo "❌ Folder 'public' nie istnieje!"
    echo "Upewnij się, że jesteś w głównym folderze projektu."
    exit 1
fi

# Utwórz folder docs dla GitHub Pages
echo "📁 Tworzenie folderu docs..."
rm -rf docs
mkdir -p docs

# Skopiuj wszystkie pliki z public do docs
echo "📋 Kopiowanie plików..."
cp -r public/* docs/

# Sprawdź czy kopiowanie się udało
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build GitHub Pages zakończony pomyślnie!"
    echo ""
    echo "📁 Pliki znajdują się w folderze: docs/"
    echo ""
    echo "🌐 Następne kroki:"
    echo "1. Commit i push do repozytorium GitHub"
    echo "2. W ustawieniach repo włącz GitHub Pages"
    echo "3. Wybierz źródło: 'Deploy from a branch'"
    echo "4. Wybierz branch: 'main' i folder: '/docs'"
    echo ""
    echo "📊 Struktura plików:"
    ls -la docs/ | head -10
    
    # Pokaż rozmiar
    if command -v du &> /dev/null; then
        SIZE=$(du -sh docs 2>/dev/null | cut -f1)
        echo ""
        echo "📊 Rozmiar: $SIZE"
    fi
    
else
    echo ""
    echo "❌ Kopiowanie nie powiodło się!"
    exit 1
fi
