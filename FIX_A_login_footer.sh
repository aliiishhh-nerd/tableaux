#!/bin/bash
# FIX A: Login Footer Links
# Risk: VERY LOW - Isolated to one component, pure UI change
# Files Modified: src/pages/AuthPage.js

set -e  # Exit on error

echo "═══════════════════════════════════════════════"
echo "FIX A: Login Footer Links"
echo "═══════════════════════════════════════════════"
echo ""

cd ~/Downloads/tableaux

# Backup
cp src/pages/AuthPage.js src/pages/AuthPage.js.backup_$(date +%s)

# Find the closing </div> before the last export and add footer
# AuthPage structure: outer div > form/content > footer (new) > closing div

# Create the footer HTML
cat > /tmp/login_footer.txt << 'FOOTER'
      
      {/* Footer Links */}
      <div style={{ 
        marginTop: '32px', 
        paddingTop: '24px', 
        borderTop: '1px solid var(--border)',
        display: 'flex', 
        justifyContent: 'center', 
        gap: '24px' 
      }}>
        <a href="/blog" style={{ 
          fontSize: '13px', 
          color: 'var(--ink2)', 
          textDecoration: 'none' 
        }}>
          Blog
        </a>
        <a href="/faq" style={{ 
          fontSize: '13px', 
          color: 'var(--ink2)', 
          textDecoration: 'none' 
        }}>
          Help & FAQ
        </a>
        <a href="/about" style={{ 
          fontSize: '13px', 
          color: 'var(--ink2)', 
          textDecoration: 'none' 
        }}>
          About
        </a>
      </div>
FOOTER

# Insert footer before the last closing div of the auth card
# Find line with "export default" and insert before the </div> above it
python3 << 'PYTHON'
import re

with open('src/pages/AuthPage.js', 'r') as f:
    content = f.read()

with open('/tmp/login_footer.txt', 'r') as f:
    footer = f.read()

# Find the last </div> before "export default"
# Pattern: look for the closing </div> that ends the auth card

# Strategy: Find "export default AuthPage" and work backwards
export_pos = content.find('export default')
if export_pos == -1:
    print("ERROR: Could not find 'export default'")
    exit(1)

# Find the last </div> before export
content_before_export = content[:export_pos]
last_closing_div = content_before_export.rfind('</div>')

if last_closing_div == -1:
    print("ERROR: Could not find closing </div>")
    exit(1)

# Insert footer before this closing div
new_content = content[:last_closing_div] + footer + '\n' + content[last_closing_div:]

with open('src/pages/AuthPage.js', 'w') as f:
    f.write(new_content)

print("✓ Footer links inserted")
PYTHON

# Syntax check
echo ""
echo "Running syntax check..."
node -c src/pages/AuthPage.js || {
    echo "❌ Syntax error! Restoring backup..."
    cp src/pages/AuthPage.js.backup_* src/pages/AuthPage.js
    exit 1
}

echo "✓ Syntax valid"
echo ""

# Test build
echo "Running test build..."
npm run build > /tmp/build.log 2>&1 || {
    echo "❌ Build failed! Check /tmp/build.log"
    echo "Restoring backup..."
    cp src/pages/AuthPage.js.backup_* src/pages/AuthPage.js
    exit 1
}

echo "✓ Build successful"
echo ""
echo "═══════════════════════════════════════════════"
echo "✅ FIX A COMPLETE"
echo "═══════════════════════════════════════════════"
echo ""
echo "Changes:"
echo "  - Added Blog, Help & FAQ, About links to login page footer"
echo ""
echo "Next steps:"
echo "  1. Test locally: npm start"
echo "  2. Check login page has footer links"
echo "  3. Commit: git add src/pages/AuthPage.js"
echo "  4. Commit: git commit -m 'Fix: add footer links to login page'"
echo "  5. Push: git push"
echo ""
