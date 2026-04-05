#!/bin/bash
# PHASE 2C: Friends Count Fix
# Risk: VERY LOW (single number change in seed data)

set -e

echo "════════════════════════════════════════════════════════"
echo "  PHASE 2C: FRIENDS COUNT FIX"
echo "════════════════════════════════════════════════════════"
echo ""

# Backup
cp src/data/seed.js src/data/seed.js.phase2c.backup
echo "✓ Backup created"
echo ""

echo "Fixing friends count from 48 to 8..."

# Simple sed replacement
sed -i '' 's/friendsCount: 48,/friendsCount: 8,/' src/data/seed.js

# Verify it changed
if grep -q "friendsCount: 8," src/data/seed.js; then
    echo "✓ Friends count updated to 8"
else
    echo "❌ Failed to update friends count"
    mv src/data/seed.js.phase2c.backup src/data/seed.js
    exit 1
fi

echo ""

# Syntax check
echo "Checking syntax..."
if node -c src/data/seed.js 2>/dev/null; then
    echo "✓ Syntax valid"
else
    echo "❌ Syntax error!"
    mv src/data/seed.js.phase2c.backup src/data/seed.js
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ PHASE 2C COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Test:"
echo "  1. npm start"
echo "  2. Login"
echo "  3. Go to Profile page"
echo "  4. Verify 'Friends' count shows 8 (not 48)"
echo ""
echo "Deploy:"
echo "  git add src/data/seed.js"
echo "  git commit -m 'Phase 2C: Fix friends count to accurate 8'"
echo "  git push"
echo ""
