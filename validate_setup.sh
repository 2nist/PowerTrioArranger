#!/bin/bash

# Device Validation Script
# Run this after aligning devices to check for common issues

echo "=========================================="
echo "Power Trio Arranger - Device Validator"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/Matthew/PowerTrioArranger"
ERRORS=0
WARNINGS=0

echo "Checking project setup..."
echo ""

# Check 1: Verify project structure
echo "📁 Checking project structure..."
if [ -d "$PROJECT_ROOT" ]; then
    echo -e "${GREEN}✓${NC} Project root exists: $PROJECT_ROOT"
else
    echo -e "${RED}✗${NC} Project root not found: $PROJECT_ROOT"
    ERRORS=$((ERRORS+1))
fi

# Check 2: Verify package.json
if [ -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json exists"
else
    echo -e "${RED}✗${NC} package.json not found"
    ERRORS=$((ERRORS+1))
fi

# Check 3: Check for max-api in node_modules (should NOT exist)
if [ -d "$PROJECT_ROOT/node_modules/max-api" ]; then
    echo -e "${RED}✗${NC} max-api found in node_modules (MUST REMOVE!)"
    echo "   Fix: cd $PROJECT_ROOT && npm uninstall max-api"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓${NC} max-api not in node_modules (correct)"
fi

# Check 4: Verify JavaScript files exist
echo ""
echo "📝 Checking JavaScript files..."
JS_FILES=(
    "shared/dict_init.js"
    "shared/dict_helpers.js"
    "shared/apc64_comms.js"
    "shared/music_theory.js"
    "track_1_chord_lab/logic.js"
    "track_2_sequencer/sequencer.js"
    "track_4_drums/groove_wanderer_bridge.js"
    "track_5_bass/bass_follower.js"
)

for file in "${JS_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (missing)"
        ERRORS=$((ERRORS+1))
    fi
done

# Check 5: Verify Max search path setup
echo ""
echo "🔍 Checking Max search path..."
MAX_PACKAGE_PATH="$HOME/Documents/Max 9/Packages/PowerTrioArranger"
if [ -L "$MAX_PACKAGE_PATH" ] || [ -d "$MAX_PACKAGE_PATH" ]; then
    echo -e "${GREEN}✓${NC} Max Package path exists"
    if [ -L "$MAX_PACKAGE_PATH" ]; then
        TARGET=$(readlink "$MAX_PACKAGE_PATH")
        echo "   Symlink target: $TARGET"
    fi
else
    echo -e "${YELLOW}⚠${NC} Max Package path not found"
    echo "   Optional: Create symlink with:"
    echo "   ln -s $PROJECT_ROOT $MAX_PACKAGE_PATH"
    WARNINGS=$((WARNINGS+1))
fi

# Check 6: Verify device files exist
echo ""
echo "🎛️  Checking device files..."
DEVICE_FILES=(
    "Application Docs/M4LDevices/Track_1_Chord_Lab.amxd"
    "Application Docs/M4LDevices/Track_2_Sequencer.amxd"
    "Application Docs/M4LDevices/Track_3_Global_Brain.amxd"
    "Application Docs/M4LDevices/Track_4_Bridge.amxd"
    "Application Docs/M4LDevices/Track_5_Bass_Follower.amxd"
)

for file in "${DEVICE_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo -e "${GREEN}✓${NC} $(basename "$file")"
    else
        echo -e "${RED}✗${NC} $(basename "$file") (missing)"
        ERRORS=$((ERRORS+1))
    fi
done

# Check 7: Verify documentation
echo ""
echo "📚 Checking documentation..."
DOC_FILES=(
    "Application Docs/DEVICE_ALIGNMENT_PROCEDURE.md"
    "Application Docs/QUICK_FIX_GUIDE.md"
    "Application Docs/DEVICE_WIRING_CHECKLIST.md"
    "Application Docs/APC64_PROTOCOL.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo -e "${GREEN}✓${NC} $(basename "$file")"
    else
        echo -e "${YELLOW}⚠${NC} $(basename "$file") (missing)"
        WARNINGS=$((WARNINGS+1))
    fi
done

# Summary
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open each .amxd device in Max"
    echo "2. Follow DEVICE_ALIGNMENT_PROCEDURE.md"
    echo "3. Test devices in Ableton"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo "Project is OK but could be improved"
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Fix errors before proceeding with device alignment"
fi

echo ""
echo "=========================================="

# Exit with error code if there are errors
if [ $ERRORS -gt 0 ]; then
    exit 1
else
    exit 0
fi
