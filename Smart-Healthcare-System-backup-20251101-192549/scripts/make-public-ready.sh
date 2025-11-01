#!/bin/bash
# Automated Git History Cleanup - Makes repository 100% ready for public
set -e

echo "=================================================="
echo "🚀 Automated Repository Cleanup"
echo "=================================================="
echo ""

# Add git-filter-repo to PATH
export PATH="/Users/aseshnemal/Library/Python/3.13/bin:$PATH"

# Verify git-filter-repo is available
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo not found. Installing..."
    pip3 install git-filter-repo --user
    export PATH="/Users/aseshnemal/Library/Python/3.13/bin:$PATH"
fi

echo "✓ git-filter-repo ready"
echo ""

# Create backup
echo "📦 Creating backup..."
BACKUP_DIR="../Smart-Healthcare-System-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✓ Backup created at: $BACKUP_DIR"
echo ""

# Create expressions file for git-filter-repo
echo "📝 Creating filter expressions..."
cat > /tmp/filter-expressions.txt << 'EOF'
# MongoDB credentials - remove actual values
mongodb+srv://[REDACTED_MONGODB_CREDENTIALS]@cluster0.s5idn.mongodb.net/smart-healthcare==>mongodb+srv://REDACTED:REDACTED@cluster/database
[REDACTED_MONGODB_CREDENTIALS]@cluster0.s5idn==>REDACTED:REDACTED@cluster
[REDACTED_MONGODB_CREDENTIALS]@==>REDACTED:REDACTED@

# Firebase API Key
[REDACTED_FIREBASE_API_KEY]-Owheowo==>REDACTED_FIREBASE_API_KEY

# Firebase Config values
"[REDACTED_FIREBASE_API_KEY]-Owheowo"==>process.env.NEXT_PUBLIC_FIREBASE_API_KEY
"smart-healthcare-system-78580.firebaseapp.com"==>process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
"smart-healthcare-system-78580"==>process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
"smart-healthcare-system-78580.firebasestorage.app"==>process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
"770624571519"==>process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
"1:770624571519:web:4fc309e569d5b22946574a"==>process.env.NEXT_PUBLIC_FIREBASE_APP_ID
"G-YTLLNKXWCL"==>process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
EOF

echo "✓ Filter expressions created"
echo ""

# Run git-filter-repo
echo "🧹 Cleaning git history..."
echo "This will rewrite all commits to remove secrets..."
echo ""

git-filter-repo \
    --replace-text /tmp/filter-expressions.txt \
    --force

echo ""
echo "✓ History cleaned successfully!"
echo ""

# Cleanup
rm /tmp/filter-expressions.txt

# Re-add remote (filter-repo removes it)
echo "🔗 Re-adding remote..."
git remote add origin https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git

echo ""
echo "=================================================="
echo "✅ Repository is now 100% READY for public!"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Verify changes:"
echo "   git log --oneline | head -10"
echo ""
echo "2. Push to GitHub (⚠️  Force push - rewrites history):"
echo "   git push --force --all"
echo "   git push --force --tags"
echo ""
echo "3. Make repository public:"
echo "   Go to GitHub Settings → Change to public"
echo ""
echo "4. Enable secret scanning immediately after:"
echo "   Settings → Code security → Enable all"
echo ""
echo "📦 Backup saved at: $BACKUP_DIR"
echo ""
