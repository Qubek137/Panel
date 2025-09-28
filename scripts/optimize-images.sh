#!/bin/bash

# Image optimization script
TARGET_DIR=${1:-"public"}

echo "🖼️ Optimizing images in $TARGET_DIR..."

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Target directory $TARGET_DIR does not exist"
    exit 1
fi

# Function to optimize PNG files
optimize_png() {
    local file="$1"
    echo "   Optimizing PNG: $(basename "$file")"
    
    # Use built-in tools or skip if not available
    if command -v pngcrush >/dev/null 2>&1; then
        pngcrush -reduce -brute "$file" "${file}.tmp" && mv "${file}.tmp" "$file"
    elif command -v optipng >/dev/null 2>&1; then
        optipng -o7 "$file"
    else
        echo "   ⚠️ No PNG optimizer found, skipping"
    fi
}

# Function to optimize JPEG files
optimize_jpg() {
    local file="$1"
    echo "   Optimizing JPEG: $(basename "$file")"
    
    if command -v jpegoptim >/dev/null 2>&1; then
        jpegoptim --max=85 --strip-all "$file"
    elif command -v jpegtran >/dev/null 2>&1; then
        jpegtran -optimize -progressive "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    else
        echo "   ⚠️ No JPEG optimizer found, skipping"
    fi
}

# Function to convert to WebP if possible
convert_to_webp() {
    local file="$1"
    local webp_file="${file%.*}.webp"
    
    if command -v cwebp >/dev/null 2>&1; then
        echo "   Converting to WebP: $(basename "$file")"
        cwebp -q 85 "$file" -o "$webp_file"
        
        # Keep original file as fallback
        echo "   ✅ Created WebP version: $(basename "$webp_file")"
    fi
}

# Find and optimize images
find "$TARGET_DIR" -type f $$ -name "*.png" -o -name "*.PNG" $$ | while read -r file; do
    optimize_png "$file"
    convert_to_webp "$file"
done

find "$TARGET_DIR" -type f $$ -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPG" -o -name "*.JPEG" $$ | while read -r file; do
    optimize_jpg "$file"
    convert_to_webp "$file"
done

# Optimize SVG files
if command -v svgo >/dev/null 2>&1; then
    find "$TARGET_DIR" -type f -name "*.svg" | while read -r file; do
        echo "   Optimizing SVG: $(basename "$file")"
        svgo "$file"
    done
fi

# Generate image manifest for lazy loading
echo "📋 Generating image manifest..."
cat > "$TARGET_DIR/images-manifest.json" << EOF
{
  "generated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "images": [
EOF

# Add image entries to manifest
first=true
find "$TARGET_DIR" -type f $$ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.svg" $$ | while read -r file; do
    relative_path=${file#$TARGET_DIR/}
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    
    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$TARGET_DIR/images-manifest.json"
    fi
    
    echo "    {" >> "$TARGET_DIR/images-manifest.json"
    echo "      \"path\": \"$relative_path\"," >> "$TARGET_DIR/images-manifest.json"
    echo "      \"size\": $size" >> "$TARGET_DIR/images-manifest.json"
    echo -n "    }" >> "$TARGET_DIR/images-manifest.json"
done

cat >> "$TARGET_DIR/images-manifest.json" << EOF

  ]
}
EOF

echo "✅ Image optimization complete!"
echo "📊 Summary:"
echo "   - PNG files: $(find "$TARGET_DIR" -name "*.png" | wc -l)"
echo "   - JPEG files: $(find "$TARGET_DIR" -name "*.jpg" -o -name "*.jpeg" | wc -l)"
echo "   - WebP files: $(find "$TARGET_DIR" -name "*.webp" | wc -l)"
echo "   - SVG files: $(find "$TARGET_DIR" -name "*.svg" | wc -l)"
echo "   - Total size: $(du -sh "$TARGET_DIR" | cut -f1)"
