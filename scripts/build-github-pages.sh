#!/bin/bash

# Build script for GitHub Pages deployment
echo "🚀 Building for GitHub Pages..."

# Create docs directory (GitHub Pages source)
rm -rf docs
mkdir -p docs

# Build Next.js app
echo "📦 Building Next.js application..."
npm run build

# Copy built files to docs directory
echo "📁 Copying files to docs directory..."
cp -r out/* docs/

# Copy public files (they should already be in out, but just in case)
cp -r public/* docs/ 2>/dev/null || true

# Create .nojekyll file to bypass Jekyll processing
touch docs/.nojekyll

# Create CNAME file if domain is specified
if [ ! -z "$GITHUB_PAGES_DOMAIN" ]; then
    echo "$GITHUB_PAGES_DOMAIN" > docs/CNAME
    echo "🌐 Added CNAME for domain: $GITHUB_PAGES_DOMAIN"
fi

# Optimize images if script exists
if [ -f "./scripts/optimize-images.sh" ]; then
    echo "🖼️ Optimizing images..."
    ./scripts/optimize-images.sh docs
fi

# Create deployment info
cat > docs/deployment-info.json << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "1.2.0",
  "features": [
    "Real Weather API (Open-Meteo)",
    "PWA Support",
    "Offline Functionality",
    "Service Worker",
    "API Rate Limiting",
    "Touch Navigation",
    "Haptic Feedback"
  ],
  "locations": [
    "Konopnica",
    "Warszawa", 
    "Wieluń"
  ],
  "apiProvider": "Open-Meteo",
  "maxApiCalls": 9000
}
EOF

echo "✅ Build complete!"
echo "📊 Deployment info:"
echo "   - Build time: $(date)"
echo "   - Output directory: docs/"
echo "   - Files: $(find docs -type f | wc -l)"
echo "   - Size: $(du -sh docs | cut -f1)"

echo ""
echo "🔧 Next steps:"
echo "1. git add docs/"
echo "2. git commit -m 'Deploy to GitHub Pages'"
echo "3. git push origin main"
echo "4. Enable GitHub Pages in repository settings"
echo "5. Set source to 'Deploy from a branch' -> 'main' -> '/docs'"

echo ""
echo "🌐 Your app will be available at:"
echo "   https://[username].github.io/[repository-name]/"
