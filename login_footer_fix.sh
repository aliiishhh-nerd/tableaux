#!/bin/bash
set -e

echo "Adding footer links to login page..."

# Backup
cp src/pages/AuthPage.js src/pages/AuthPage.js.backup

# Add footer links before closing </div>
# This adds 3 simple links at the bottom of the login modal

cat > /tmp/footer_patch.txt << 'FOOTER'
      {/* Footer Links */}
      <div style={{ marginTop: "24px", display: "flex", gap: "20px", justifyContent: "center", fontSize: "13px" }}>
        <a href="/blog" style={{ color: "var(--ink2)", textDecoration: "none" }}>Blog</a>
        <a href="/faq" style={{ color: "var(--ink2)", textDecoration: "none" }}>Help & FAQ</a>
        <a href="/about" style={{ color: "var(--ink2)", textDecoration: "none" }}>About</a>
      </div>
FOOTER

# Find the line with "Don't have an account?" and add footer after it
sed -i '' "/Don't have an account/a\\
$(cat /tmp/footer_patch.txt)
" src/pages/AuthPage.js

echo "✓ Footer links added"
