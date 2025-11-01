#!/bin/bash
# Security Verification Script
# Checks if repository is safe to make public

set -e

echo "=================================================="
echo "🔒 Security Verification Check"
echo "=================================================="
echo ""

ISSUES=0

# Check 1: Verify .env files are not tracked
echo "📋 Check 1: Environment files not tracked..."
TRACKED_ENV=$(git ls-files | grep -E "^\.env$|^\.env\.local$" || true)
if [ -n "$TRACKED_ENV" ]; then
    echo "❌ FAIL: .env files are tracked by git!"
    echo "   Found: $TRACKED_ENV"
    ISSUES=$((ISSUES+1))
else
    echo "✅ PASS: No .env files tracked"
fi
echo ""

# Check 2: Verify .gitignore has env files
echo "📋 Check 2: .gitignore includes env files..."
if grep -q "^\.env$" .gitignore && grep -q "^\.env.local$" .gitignore; then
    echo "✅ PASS: .gitignore properly configured"
else
    echo "❌ FAIL: .gitignore missing env file patterns"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Check 3: Check current code for hardcoded secrets
echo "📋 Check 3: No hardcoded secrets in current code..."
MONGO_SECRET=$(git ls-files | xargs grep -l "REDACTED:REDACTED@" 2>/dev/null || true)
FIREBASE_SECRET=$(git ls-files | xargs grep -l "REDACTED_FIREBASE_API_KEY" 2>/dev/null || true)

if [ -n "$MONGO_SECRET" ] || [ -n "$FIREBASE_SECRET" ]; then
    echo "❌ FAIL: Hardcoded secrets found in tracked files!"
    [ -n "$MONGO_SECRET" ] && echo "   MongoDB: $MONGO_SECRET"
    [ -n "$FIREBASE_SECRET" ] && echo "   Firebase: $FIREBASE_SECRET"
    ISSUES=$((ISSUES+1))
else
    echo "✅ PASS: No hardcoded secrets in current code"
fi
echo ""

# Check 4: Check git history for secrets
echo "📋 Check 4: Git history clean (this may take a moment)..."
MONGO_HISTORY=$(git log --all --source -S "REDACTED:REDACTED@" --oneline 2>/dev/null | head -5 || true)
FIREBASE_HISTORY=$(git log --all --source -S "REDACTED_FIREBASE_API_KEY" --oneline 2>/dev/null | head -5 || true)

if [ -n "$MONGO_HISTORY" ] || [ -n "$FIREBASE_HISTORY" ]; then
    echo "❌ FAIL: Secrets found in git history!"
    if [ -n "$MONGO_HISTORY" ]; then
        echo "   MongoDB credentials in commits:"
        echo "$MONGO_HISTORY" | sed 's/^/     /'
    fi
    if [ -n "$FIREBASE_HISTORY" ]; then
        echo "   Firebase key in commits:"
        echo "$FIREBASE_HISTORY" | sed 's/^/     /'
    fi
    echo ""
    echo "   ⚠️  Run: ./scripts/cleanup-git-history.sh"
    ISSUES=$((ISSUES+1))
else
    echo "✅ PASS: Git history is clean"
fi
echo ""

# Check 5: Verify mongodb.ts uses environment variables
echo "📋 Check 5: MongoDB connection uses env vars..."
if grep -q "process.env.MONGODB_URI" src/lib/mongodb.ts; then
    echo "✅ PASS: MongoDB properly configured"
else
    echo "❌ FAIL: MongoDB not using environment variables"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Check 6: Verify firebase.ts uses environment variables
echo "📋 Check 6: Firebase config uses env vars..."
if grep -q "process.env.NEXT_PUBLIC_FIREBASE" src/lib/firebase.ts; then
    echo "✅ PASS: Firebase properly configured"
else
    echo "❌ FAIL: Firebase not using environment variables"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Check 7: Verify .env.example exists
echo "📋 Check 7: .env.example template exists..."
if [ -f ".env.example" ]; then
    echo "✅ PASS: .env.example found"
else
    echo "❌ FAIL: .env.example not found"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Check 8: Verify local .env exists (for development)
echo "📋 Check 8: Local .env file exists..."
if [ -f ".env" ]; then
    echo "✅ PASS: .env found (for local development)"
else
    echo "⚠️  WARNING: .env not found"
    echo "   Create one from .env.example for local development"
fi
echo ""

# Check 9: Verify no .env.local exists (redundant)
echo "📋 Check 9: No redundant .env.local..."
if [ ! -f ".env.local" ]; then
    echo "✅ PASS: No .env.local (using .env only)"
else
    echo "⚠️  WARNING: .env.local exists (redundant)"
    echo "   Consider removing it to avoid confusion"
fi
echo ""

# Summary
echo "=================================================="
if [ $ISSUES -eq 0 ]; then
    echo "✅ SECURITY CHECK PASSED!"
    echo ""
    echo "Repository appears safe for current code."
    echo ""
    if [ -n "$MONGO_HISTORY" ] || [ -n "$FIREBASE_HISTORY" ]; then
        echo "⚠️  HOWEVER: Git history still contains secrets!"
        echo ""
        echo "Before making repository public:"
        echo "1. Rotate MongoDB credentials"
        echo "2. Secure Firebase configuration"
        echo "3. Run: ./scripts/cleanup-git-history.sh"
        echo "4. Force push cleaned history"
        echo ""
        echo "See: PRE_PUBLIC_CHECKLIST.md"
    else
        echo "🎉 Repository is READY to be made public!"
        echo ""
        echo "Final checklist:"
        echo "✓ Current code has no hardcoded secrets"
        echo "✓ Git history is clean"
        echo "✓ Environment files properly configured"
        echo ""
        echo "You can now safely:"
        echo "  - Make repository public on GitHub"
        echo "  - Enable GitHub secret scanning"
        echo "  - Share repository URL"
    fi
else
    echo "❌ SECURITY CHECK FAILED!"
    echo ""
    echo "Found $ISSUES issue(s) that must be fixed."
    echo ""
    echo "Next steps:"
    echo "1. Review errors above"
    echo "2. Follow remediation steps in SECURITY.md"
    echo "3. Run this script again to verify"
    echo ""
    echo "⚠️  DO NOT make repository public until all checks pass!"
fi
echo "=================================================="
echo ""

exit $ISSUES
