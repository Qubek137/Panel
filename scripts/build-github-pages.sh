#!/bin/bash

# Build script for GitHub Pages deployment
echo "🚀 Building GitHub Pages version..."

# Create docs directory for GitHub Pages
mkdir -p docs

# Copy public files to docs
echo "📁 Copying files to docs directory..."
cp -r public/* docs/

# Create .nojekyll file to bypass Jekyll processing
touch docs/.nojekyll

# Create CNAME file if domain is specified
if [ ! -z "$CUSTOM_DOMAIN" ]; then
    echo "$CUSTOM_DOMAIN" > docs/CNAME
    echo "🌐 Added custom domain: $CUSTOM_DOMAIN"
fi

# Optimize HTML files
echo "🔧 Optimizing HTML files..."
find docs -name "*.html" -type f -exec sed -i 's/  */ /g' {} \;

# Create robots.txt
cat > docs/robots.txt << EOF
User-agent: *
Allow: /

Sitemap: https://$(basename $(pwd)).github.io/sitemap.xml
EOF

# Create sitemap.xml
cat > docs/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://$(basename $(pwd)).github.io/</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>
EOF

# Generate icons if they don't exist
if [ ! -f "docs/icon-192x192.png" ]; then
    echo "🎨 Generating missing icons..."
    # This would normally use a tool like ImageMagick
    # For now, copy favicon as placeholder
    cp docs/favicon.ico docs/icon-72x72.png 2>/dev/null || true
    cp docs/favicon.ico docs/icon-96x96.png 2>/dev/null || true
    cp docs/favicon.ico docs/icon-128x128.png 2>/dev/null || true
    cp docs/favicon.ico docs/icon-144x144.png 2>/dev/null || true
    cp docs/favicon.ico docs/icon-152x152.png 2>/dev/null || true
    cp docs/favicon.ico docs/icon-192x192.png 2>/dev/null || true
    cp docs/favicon.ico docs/icon-384x384.png 2>/dev/null || true
    cp docs/favicon.ico docs/icon-512x512.png 2>/dev/null || true
    cp docs/favicon.ico docs/apple-touch-icon.png 2>/dev/null || true
    cp docs/favicon.ico docs/favicon-32x32.png 2>/dev/null || true
    cp docs/favicon.ico docs/favicon-16x16.png 2>/dev/null || true
fi

# Validate files
echo "✅ Validating build..."
if [ -f "docs/index.html" ] && [ -f "docs/styles.css" ] && [ -f "docs/script.js" ]; then
    echo "✅ Build successful!"
    echo "📊 Build statistics:"
    echo "   - HTML files: $(find docs -name "*.html" | wc -l)"
    echo "   - CSS files: $(find docs -name "*.css" | wc -l)"
    echo "   - JS files: $(find docs -name "*.js" | wc -l)"
    echo "   - Image files: $(find docs -name "*.png" -o -name "*.jpg" -o -name "*.webp" -o -name "*.ico" | wc -l)"
    echo "   - Total size: $(du -sh docs | cut -f1)"
else
    echo "❌ Build failed - missing required files"
    exit 1
fi

echo "🎉 GitHub Pages build complete!"
echo "📝 Next steps:"
echo "   1. git add docs/"
echo "   2. git commit -m 'Deploy GitHub Pages'"
echo "   3. git push origin main"
echo "   4. Enable GitHub Pages in repository settings"
