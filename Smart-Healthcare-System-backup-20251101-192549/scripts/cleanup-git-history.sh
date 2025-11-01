#!/bin/bash
# Git History Cleanup Script for Smart Healthcare System
# This script removes exposed secrets from git history

set -e

echo "=================================================="
echo "Git History Cleanup - Smart Healthcare System"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  All commit hashes will change!"
echo "⚠️  All contributors must re-clone after this!"
echo ""
read -p "Have you rotated MongoDB and Firebase credentials? (yes/no): " ROTATED

if [ "$ROTATED" != "yes" ]; then
    echo "❌ Please rotate credentials first! See SECURITY.md"
    exit 1
fi

echo ""
read -p "Do you want to proceed with history cleanup? (yes/no): " PROCEED

if [ "$PROCEED" != "yes" ]; then
    echo "❌ Aborted by user"
    exit 1
fi

echo ""
echo "📋 Checking prerequisites..."

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo is not installed"
    echo ""
    echo "Install with:"
    echo "  pip3 install git-filter-repo"
    echo ""
    echo "Or using Homebrew:"
    echo "  brew install git-filter-repo"
    exit 1
fi

echo "✓ git-filter-repo found"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

echo "✓ In git repository"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

echo "✓ No uncommitted changes"
echo ""

# Create backup
echo "📦 Creating backup..."
BACKUP_DIR="../Smart-Healthcare-System-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✓ Backup created at: $BACKUP_DIR"
echo ""

# Create expressions file
echo "📝 Creating filter expressions..."
cat > /tmp/filter-expressions.txt << 'EOF'
# MongoDB credentials
regex:mongodb\+srv://[REDACTED_MONGODB_CREDENTIALS]@cluster0\.s5idn\.mongodb\.net/smart-healthcare==>mongodb+srv://REDACTED:REDACTED@cluster/database
regex:[REDACTED_MONGODB_CREDENTIALS]@cluster0\.s5idn==>REDACTED:REDACTED@cluster
regex:[REDACTED_MONGODB_CREDENTIALS]@==>REDACTED:REDACTED@

# Firebase API Key
regex:[REDACTED_FIREBASE_API_KEY]-Owheowo==>REDACTED_FIREBASE_API_KEY

# Firebase Config (full object)
regex:apiKey: "[REDACTED_FIREBASE_API_KEY]-Owheowo"==>apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
regex:authDomain: "smart-healthcare-system-78580\.firebaseapp\.com"==>authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
regex:projectId: "smart-healthcare-system-78580"==>projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
regex:storageBucket: "smart-healthcare-system-78580\.firebasestorage\.app"==>storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
regex:messagingSenderId: "770624571519"==>messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
regex:appId: "1:770624571519:web:4fc309e569d5b22946574a"==>appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
regex:measurementId: "G-YTLLNKXWCL"==>measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
EOF

echo "✓ Filter expressions created"
echo ""

# Show what will be replaced
echo "🔍 Secrets that will be removed:"
echo "  - MongoDB URI with credentials"
echo "  - Firebase API Key"
echo "  - Firebase configuration values"
echo ""

# Run filter-repo
echo "🧹 Cleaning git history..."
echo "This may take a few minutes..."
echo ""

git filter-repo \
    --replace-text /tmp/filter-expressions.txt \
    --force \
    --refs refs/heads/main

echo ""
echo "✓ History cleaned successfully!"
echo ""

# Cleanup
rm /tmp/filter-expressions.txt

# Show statistics
echo "📊 Repository statistics:"
git count-objects -vH

echo ""
echo "=================================================="
echo "✅ Git history cleanup complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Verify the changes:"
echo "   git log --all --oneline | head -20"
echo "   git grep '[REDACTED_MONGODB_CREDENTIALS]'"
echo "   git grep '[REDACTED_FIREBASE_API_KEY]'"
echo ""
echo "2. Add your remote back:"
echo "   git remote add origin https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git"
echo ""
echo "3. Force push to GitHub (⚠️  DESTRUCTIVE!):"
echo "   git push --force --all"
echo "   git push --force --tags"
echo ""
echo "4. All team members must re-clone:"
echo "   rm -rf Smart-Healthcare-System-for-Urban-Hospitals"
echo "   git clone https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git"
echo ""
echo "📦 Backup location: $BACKUP_DIR"
echo ""
