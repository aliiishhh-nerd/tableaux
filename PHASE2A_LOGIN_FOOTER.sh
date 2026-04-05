#!/bin/bash
# PHASE 2A: Login Footer Links
# Risk: VERY LOW (only adds 3 links to login page)

set -e

echo "════════════════════════════════════════════════════════"
echo "  PHASE 2A: LOGIN FOOTER LINKS"
echo "════════════════════════════════════════════════════════"
echo ""

# Check if Phase 1 was applied
if ! grep -q "toasts," src/hooks/useApp.js; then
    echo "❌ ERROR: Phase 1 must be applied first!"
    echo "Run PHASE1_FIX.sh before this script."
    exit 1
fi

echo "✓ Phase 1 detected"
echo ""

# Backup
cp src/pages/AuthPage.js src/pages/AuthPage.js.phase2a.backup
echo "✓ Backup created"
echo ""

# Add footer links to AuthPage
echo "Adding footer links..."

# Find the closing </div> before the last </div> and add footer
sed -i '' '/<\/div>$/,/<\/div>$/{
    /<\/div>$/{
        i\
\
      {/* Footer Links */}\
      <div style={{ marginTop: \"24px\", display: \"flex\", gap: \"20px\", justifyContent: \"center\", fontSize: \"13px\" }}>\
        <a href=\"/blog\" style={{ color: \"var(--ink2)\", textDecoration: \"none\" }}>Blog</a>\
        <a href=\"/faq\" style={{ color: \"var(--ink2)\", textDecoration: \"none\" }}>Help & FAQ</a>\
        <a href=\"/about\" style={{ color: \"var(--ink2)\", textDecoration: \"none\" }}>About</a>\
      </div>

    }
}' src/pages/AuthPage.js

echo "✓ Footer links added"
echo ""

# Syntax check
echo "Checking syntax..."
if node -c src/pages/AuthPage.js 2>/dev/null; then
    echo "✓ Syntax valid"
else
    echo "❌ Syntax error!"
    mv src/pages/AuthPage.js.phase2a.backup src/pages/AuthPage.js
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ PHASE 2A COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Test:"
echo "  1. npm start"
echo "  2. Go to login page"
echo "  3. Verify Blog, Help & FAQ, About links at bottom"
echo ""
echo "Deploy:"
echo "  git add src/pages/AuthPage.js"
echo "  git commit -m 'Phase 2A: Add footer links to login page'"
echo "  git push"
echo ""
