#!/bin/bash
# Multi-platform build and publish script for EasyDentalLab
# Usage: ./publish-release.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  EasyDentalLab Multi-Platform Release Publisher${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: ${GREEN}${VERSION}${NC}"
echo ""

# Confirm version
read -p "Is this the correct version? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted. Update version in package.json first.${NC}"
    exit 1
fi

# Step 1: Build renderer (TypeScript → JavaScript)
echo -e "\n${YELLOW}[1/8] Building renderer (TypeScript → JavaScript)...${NC}"
cd renderer-new
npm run build
cd ..

# Step 2: Build Windows x64
echo -e "\n${YELLOW}[2/8] Building Windows x64 installer...${NC}"
npm run dist:win-x64

# Step 3: Build macOS ARM64
echo -e "\n${YELLOW}[3/8] Building macOS ARM64 installer...${NC}"
npm run dist:mac-arm64

# Step 4: Build Linux x64
echo -e "\n${YELLOW}[4/8] Building Linux x64 AppImage...${NC}"
npm run dist:linux-x64

# Step 5: Fix Windows latest.yml (electron-builder uses dashes, GitHub normalizes to dots)
echo -e "\n${YELLOW}[5/8] Fixing Windows latest.yml...${NC}"
cd build
if [ -f "latest.yml" ]; then
    # Replace dashes with dots in filenames
    sed -i.bak "s/EasyDentalLab-Setup-${VERSION}/EasyDentalLab.Setup.${VERSION}/g" latest.yml
    rm latest.yml.bak
    echo -e "${GREEN}✓ latest.yml fixed${NC}"
fi

# Rename Windows installer to match latest.yml
if [ -f "EasyDentalLab Setup ${VERSION}.exe" ]; then
    mv "EasyDentalLab Setup ${VERSION}.exe" "EasyDentalLab.Setup.${VERSION}.exe"
    echo -e "${GREEN}✓ Windows installer renamed${NC}"
fi
if [ -f "EasyDentalLab Setup ${VERSION}.exe.blockmap" ]; then
    mv "EasyDentalLab Setup ${VERSION}.exe.blockmap" "EasyDentalLab.Setup.${VERSION}.exe.blockmap"
    echo -e "${GREEN}✓ Windows blockmap renamed${NC}"
fi

cd ..

# Step 6: Verify all files exist
echo -e "\n${YELLOW}[6/8] Verifying build artifacts...${NC}"
MISSING_FILES=0

# Windows files
if [ ! -f "build/EasyDentalLab.Setup.${VERSION}.exe" ]; then
    echo -e "${RED}✗ Missing: Windows installer${NC}"
    MISSING_FILES=1
fi
if [ ! -f "build/EasyDentalLab.Setup.${VERSION}.exe.blockmap" ]; then
    echo -e "${RED}✗ Missing: Windows blockmap${NC}"
    MISSING_FILES=1
fi
if [ ! -f "build/latest.yml" ]; then
    echo -e "${RED}✗ Missing: Windows metadata${NC}"
    MISSING_FILES=1
fi

# macOS files
if [ ! -f "build/EasyDentalLab-${VERSION}-arm64.dmg" ]; then
    echo -e "${RED}✗ Missing: macOS installer${NC}"
    MISSING_FILES=1
fi
if [ ! -f "build/latest-mac.yml" ]; then
    echo -e "${RED}✗ Missing: macOS metadata${NC}"
    MISSING_FILES=1
fi

# Linux files
if [ ! -f "build/EasyDentalLab-${VERSION}-x86_64.AppImage" ] && [ ! -f "build/EasyDentalLab-${VERSION}.AppImage" ]; then
    echo -e "${RED}✗ Missing: Linux AppImage${NC}"
    MISSING_FILES=1
fi
if [ ! -f "build/latest-linux.yml" ]; then
    echo -e "${RED}✗ Missing: Linux metadata${NC}"
    MISSING_FILES=1
fi

if [ $MISSING_FILES -eq 1 ]; then
    echo -e "\n${RED}Build verification failed. Check errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All build artifacts present${NC}"

# Step 7: Show file sizes
echo -e "\n${YELLOW}[7/8] Build artifact sizes:${NC}"
ls -lh build/*.exe build/*.dmg build/*.AppImage 2>/dev/null | awk '{print "  " $9 " — " $5}'

# Step 8: Commit and push
echo -e "\n${YELLOW}[8/8] Committing and pushing to GitHub...${NC}"
cd ..
git add -A
git commit -m "v${VERSION}: Multi-platform release

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main

# Step 9: Publish GitHub Release
echo -e "\n${YELLOW}Publishing GitHub Release v${VERSION}...${NC}"
cd EasyDentalLab-Desktop/build

gh release create "v${VERSION}" \
  "EasyDentalLab.Setup.${VERSION}.exe#Windows Installer (x64)" \
  "EasyDentalLab.Setup.${VERSION}.exe.blockmap#Windows Blockmap" \
  "latest.yml#Windows Auto-Update Metadata" \
  "EasyDentalLab-${VERSION}-arm64.dmg#macOS Installer (Apple Silicon)" \
  "latest-mac.yml#macOS Auto-Update Metadata" \
  "EasyDentalLab-${VERSION}"-*.AppImage"#Linux AppImage (x64)" \
  "latest-linux.yml#Linux Auto-Update Metadata" \
  --title "v${VERSION}" \
  --notes "Multi-platform release with auto-update support for Windows, macOS, and Linux.

**Windows (x64):** Auto-update enabled
**macOS (ARM64):** Manual download (unsigned — see Help → Installation)
**Linux (x64):** Auto-update enabled (AppImage)

See CLAUDE.md for detailed changelog."

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Release v${VERSION} published successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "View release: ${YELLOW}https://github.com/sarelroeloffze/EasyDentalLab/releases/tag/v${VERSION}${NC}"
echo ""
