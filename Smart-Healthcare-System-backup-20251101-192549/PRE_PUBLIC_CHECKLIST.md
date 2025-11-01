# 🚨 PRE-PUBLIC REPOSITORY CHECKLIST

**Status:** ⚠️ NOT READY FOR PUBLIC - Secrets exposed in git history

---

## ✅ Completed

- [x] **Source code cleaned** - No hardcoded secrets in current code
- [x] **Environment files secured** - `.env` and `.env.local` in `.gitignore`
- [x] **Template created** - `.env.example` available
- [x] **Redundant files removed** - Deleted `.env.local`
- [x] **Documentation created** - `SECURITY.md` guide written
- [x] **Cleanup script ready** - `scripts/cleanup-git-history.sh`

---

## ❌ Required Before Going Public

### 1. Rotate MongoDB Credentials (CRITICAL)

**Current exposed credentials:**
- Username: `aseshnemal`
- Password: `asesh`
- Cluster: `cluster0.s5idn.mongodb.net`

**Action required:**
1. Login to MongoDB Atlas: https://cloud.mongodb.com/
2. Create new user with strong password
3. Update local `.env` file with new credentials
4. Test application works with new credentials
5. Delete old user `aseshnemal` from MongoDB Atlas

**How to verify:**
```bash
# Should connect successfully with new credentials
npm run dev
# Check MongoDB Atlas → Metrics → Connections
```

---

### 2. Secure Firebase Configuration (IMPORTANT)

**Current exposed API key:**
- `[REDACTED_FIREBASE_API_KEY]-Owheowo`

**Action required:**
Choose one option:

**Option A - Add Restrictions (Recommended):**
1. Go to: https://console.firebase.google.com/
2. Project Settings → General
3. Under "Your apps" → Configure security
4. Add domain restrictions
5. Enable Firebase App Check

**Option B - Regenerate Key:**
1. Delete current web app in Firebase Console
2. Create new web app
3. Update `.env` with new credentials
4. Test authentication still works

**How to verify:**
```bash
# Test Firebase auth works
npm run dev
# Try logging in with Google
```

---

### 3. Clean Git History (CRITICAL)

**Exposed in commits:**
- 10+ commits contain MongoDB credentials
- 5+ commits contain Firebase API key

**Action required:**
```bash
# Run the cleanup script
cd /Users/aseshnemal/Desktop/app/Smart-Healthcare-System-for-Urban-Hospitals/smart-healthcare-system
./scripts/cleanup-git-history.sh

# Follow the prompts
```

**Or manually:**
```bash
# Install git-filter-repo
pip3 install git-filter-repo

# See SECURITY.md for detailed steps
```

**How to verify:**
```bash
# Should return nothing
git grep "[REDACTED_MONGODB_CREDENTIALS]" $(git rev-list --all)
git grep "[REDACTED_FIREBASE_API_KEY]" $(git rev-list --all)
```

---

### 4. Force Push Clean History (DESTRUCTIVE)

**Action required:**
```bash
# Add remote (if removed by filter-repo)
git remote add origin https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git

# Force push (⚠️ rewrites history)
git push --force --all
git push --force --tags
```

**Warning:**
- All commit hashes will change
- Open PRs will break
- All team members must re-clone

---

### 5. Update Deployment Environment

**If already deployed to Vercel/Netlify/etc:**

1. Update environment variables in deployment dashboard
2. Use NEW MongoDB credentials
3. Use CURRENT Firebase credentials (or new if regenerated)
4. Redeploy application

**Vercel example:**
```
Settings → Environment Variables
→ Update MONGODB_URI
→ Update all NEXT_PUBLIC_FIREBASE_*
→ Redeploy
```

---

### 6. Final Security Verification

**Run these checks:**

```bash
cd /Users/aseshnemal/Desktop/app/Smart-Healthcare-System-for-Urban-Hospitals/smart-healthcare-system

# 1. Check no secrets in tracked files
git ls-files | xargs grep -l "mongodb+srv://aseshnemal" || echo "✓ Clean"
git ls-files | xargs grep -l "[REDACTED_FIREBASE_API_KEY]" || echo "✓ Clean"

# 2. Check git history is clean
git log --all --source -S "[REDACTED_MONGODB_CREDENTIALS]" --oneline || echo "✓ Clean"
git log --all --source -S "[REDACTED_FIREBASE_API_KEY]" --oneline || echo "✓ Clean"

# 3. Check .env files are ignored
git status
# Should NOT show .env or .env.local

# 4. Verify .gitignore is correct
cat .gitignore | grep "\.env"
# Should show .env and .env.local

# 5. Test application still works
npm run dev
# Visit http://localhost:3000
# Test: Login, Create appointment, View dashboard
```

---

### 7. Enable GitHub Security Features

**After repository is public:**

1. **Secret Scanning:**
   - Go to: Repository → Settings → Code security and analysis
   - Enable "Secret scanning"
   - Enable "Push protection"

2. **Dependabot:**
   - Enable "Dependency graph"
   - Enable "Dependabot alerts"
   - Enable "Dependabot security updates"

3. **Code Scanning (optional):**
   - Enable "Code scanning" with CodeQL

---

## 📋 Pre-Flight Checklist

Before running `git push --force`:

- [ ] MongoDB credentials rotated and tested
- [ ] Old MongoDB user deleted
- [ ] Firebase security configured
- [ ] Git history cleaned with script
- [ ] No secrets in `git log --all`
- [ ] `.env` files not tracked
- [ ] Application tested with new credentials
- [ ] Deployment environment updated
- [ ] Team notified about force push
- [ ] Backup created

---

## 🚀 Making Repository Public

**Only after ALL above steps are complete:**

1. Go to: https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals
2. Settings → Danger Zone → Change visibility
3. Click "Change to public"
4. Type repository name to confirm
5. Enable secret scanning immediately

---

## 📞 Emergency Contacts

**If you accidentally expose secrets:**

1. **Stop immediately** - Don't make repo public
2. Rotate credentials right away
3. Re-run history cleanup
4. Contact team/instructor

**Resources:**
- MongoDB Support: https://www.mongodb.com/support
- Firebase Support: https://firebase.google.com/support
- GitHub Support: https://support.github.com/

---

## ⏱️ Estimated Time

- MongoDB rotation: 10 minutes
- Firebase security: 15 minutes  
- Git history cleanup: 20 minutes
- Testing: 15 minutes
- **Total: ~60 minutes**

---

**Last Updated:** November 1, 2025  
**Next Review:** Before making repository public

---

## 🎯 Quick Start

**I want to clean this up NOW:**

```bash
# 1. Rotate MongoDB (do this in Atlas dashboard first!)
# 2. Then run these commands:

cd /Users/aseshnemal/Desktop/app/Smart-Healthcare-System-for-Urban-Hospitals/smart-healthcare-system

# Install git-filter-repo
pip3 install git-filter-repo

# Run cleanup script
./scripts/cleanup-git-history.sh

# Verify
git grep "aseshnemal" $(git rev-list --all) | wc -l  # Should be 0

# Force push (after confirming above!)
git remote add origin https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git
git push --force --all
git push --force --tags

# Make public in GitHub settings
```

**Read SECURITY.md for detailed instructions!**
