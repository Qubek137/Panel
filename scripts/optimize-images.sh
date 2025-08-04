#!/bin/bash

# Skrypt do optymalizacji obrazów (WebP conversion)

echo "🖼️  Optymalizacja obrazów..."
echo ""

# Sprawdź czy cwebp jest zainstalowane
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp nie jest zainstalowane!"
    echo ""
    echo "Instalacja:"
    echo "Ubuntu/Debian: sudo apt install webp"
    echo "macOS: brew install webp"
    echo "Termux: pkg install libwebp"
    exit 1
fi

# Funkcja do konwersji PNG/JPG na WebP
convert_to_webp() {
    local input_file="$1"
    local output_file="${input_file%.*}.webp"
    local quality="${2:-80}"
    
    echo "🔄 Konwertowanie: $input_file -> $output_file"
    cwebp -q "$quality" "$input_file" -o "$output_file"
    
    if [ $? -eq 0 ]; then
        # Pokaż oszczędność miejsca
        original_size=$(wc -c < "$input_file")
        webp_size=$(wc -c < "$output_file")
        savings=$((100 - (webp_size * 100 / original_size)))
        echo "✅ Oszczędność: ${savings}%"
    else
        echo "❌ Błąd konwersji: $input_file"
    fi
}

# Konwertuj obrazy w folderze public/images
if [ -d "public/images" ]; then
    echo "📁 Przetwarzanie public/images..."
    find public/images -type f $$ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" $$ | while read -r file; do
        convert_to_webp "$file" 85
    done
fi

# Konwertuj ikony (niższa jakość dla mniejszych plików)
if [ -d "public/icons" ]; then
    echo "📁 Przetwarzanie public/icons..."
    find public/icons -type f $$ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" $$ | while read -r file; do
        convert_to_webp "$file" 90
    done
fi

# Optymalizuj screenshoty
if [ -f "public/images/screenshot-mobile-weather.png" ]; then
    convert_to_webp "public/images/screenshot-mobile-weather.png" 75
fi

if [ -f "public/images/screenshot-mobile-control.png" ]; then
    convert_to_webp "public/images/screenshot-mobile-control.png" 75
fi

echo ""
echo "✅ Optymalizacja obrazów zakończona!"
echo ""
echo "💡 Wskazówki:"
echo "- Użyj obrazów WebP w HTML: <img src='image.webp' alt='...'>"
echo "- Dodaj fallback: <img src='image.webp' onerror=\"this.src='image.png'\">"
echo "- Lazy loading: <img src='image.webp' loading='lazy'>"
