#!/bin/bash

# Image optimization script
echo "🖼️ Optimizing images for web..."

# Create optimized images directory
mkdir -p public/images/optimized

# Function to convert and optimize images
optimize_image() {
    local input_file="$1"
    local output_file="$2"
    local quality="$3"
    
    if command -v cwebp >/dev/null 2>&1; then
        # Use WebP if available
        cwebp -q "$quality" "$input_file" -o "${output_file%.png}.webp"
        echo "✅ Converted $input_file to WebP"
    elif command -v convert >/dev/null 2>&1; then
        # Use ImageMagick if available
        convert "$input_file" -quality "$quality" -strip "$output_file"
        echo "✅ Optimized $input_file"
    else
        # Fallback - just copy
        cp "$input_file" "$output_file"
        echo "⚠️ No optimization tools found, copied $input_file"
    fi
}

# Optimize existing images
if [ -d "public/images" ]; then
    for img in public/images/*.{png,jpg,jpeg}; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            optimize_image "$img" "public/images/optimized/$filename" 80
        fi
    done
fi

# Generate favicon in multiple sizes if source exists
if [ -f "public/favicon-source.png" ]; then
    echo "🎯 Generating favicon variants..."
    
    sizes=(16 32 72 96 128 144 152 192 384 512)
    
    for size in "${sizes[@]}"; do
        if command -v convert >/dev/null 2>&1; then
            convert public/favicon-source.png -resize "${size}x${size}" "public/icon-${size}x${size}.png"
            echo "✅ Generated ${size}x${size} icon"
        fi
    done
    
    # Generate ICO file
    if command -v convert >/dev/null 2>&1; then
        convert public/favicon-source.png -resize 32x32 public/favicon.ico
        echo "✅ Generated favicon.ico"
    fi
    
    # Generate Apple touch icon
    if command -v convert >/dev/null 2>&1; then
        convert public/favicon-source.png -resize 180x180 public/apple-touch-icon.png
        echo "✅ Generated Apple touch icon"
    fi
fi

# Create placeholder images if they don't exist
create_placeholder() {
    local width="$1"
    local height="$2"
    local filename="$3"
    local text="$4"
    
    if command -v convert >/dev/null 2>&1; then
        convert -size "${width}x${height}" xc:#3b82f6 \
                -fill white -gravity center \
                -pointsize 24 -annotate +0+0 "$text" \
                "public/$filename"
        echo "✅ Created placeholder: $filename"
    fi
}

# Create screenshot placeholders if they don't exist
if [ ! -f "public/images/screenshot-mobile-weather.webp" ]; then
    create_placeholder 390 844 "images/screenshot-mobile-weather.png" "Weather\nView"
    if command -v cwebp >/dev/null 2>&1; then
        cwebp -q 80 "public/images/screenshot-mobile-weather.png" -o "public/images/screenshot-mobile-weather.webp"
        rm "public/images/screenshot-mobile-weather.png"
    fi
fi

if [ ! -f "public/images/screenshot-mobile-control.webp" ]; then
    create_placeholder 390 844 "images/screenshot-mobile-control.png" "Control\nPanel"
    if command -v cwebp >/dev/null 2>&1; then
        cwebp -q 80 "public/images/screenshot-mobile-control.png" -o "public/images/screenshot-mobile-control.webp"
        rm "public/images/screenshot-mobile-control.png"
    fi
fi

# Compress CSS and JS files
echo "🗜️ Compressing CSS and JS files..."

if command -v terser >/dev/null 2>&1; then
    terser public/script.js -c -m -o public/script.min.js
    echo "✅ Minified JavaScript"
fi

if command -v cleancss >/dev/null 2>&1; then
    cleancss -o public/styles.min.css public/styles.css
    echo "✅ Minified CSS"
fi

# Generate image optimization report
echo "📊 Image optimization report:"
echo "   - Original images: $(find public -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | wc -l)"
echo "   - WebP images: $(find public -name "*.webp" | wc -l)"
echo "   - Icon variants: $(find public -name "icon-*.png" | wc -l)"
echo "   - Total image size: $(du -sh public/images 2>/dev/null | cut -f1 || echo "N/A")"

echo "🎉 Image optimization complete!"
echo "💡 Tips:"
echo "   - Use WebP format for better compression"
echo "   - Implement lazy loading for better performance"
echo "   - Consider using responsive images with srcset"
