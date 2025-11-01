# Security Guidelines

## 🔒 Secrets Management

This repository uses environment variables to keep sensitive credentials secure.

### Current Status ✅

- ✅ **Source code is clean** - No hardcoded secrets in current `main` branch
- ✅ **Environment files ignored** - `.env` and `.env.local` are in `.gitignore`
- ✅ **Template provided** - `.env.example` shows required variables
- ⚠️ **Git history contains exposed secrets** - Requires cleanup before going public

### Exposed Secrets in Git History

**CRITICAL:** The following secrets were committed in early commits and need rotation:

1. **MongoDB URI** - Username: `[REDACTED]`, Password: `[REDACTED]`
   - Exposed in commits: `52e071e`, `b135c13`, `42928495`, and 8 more
   - Location: `src/lib/mongodb.ts` (now fixed)

2. **Firebase API Key** - `[REDACTED]`
   - Exposed in commits: `52e071e`, `b135c13`, `42928495`, and more
   - Location: `src/lib/firebase.ts` (now fixed)

---

## 🚨 Required Actions Before Making Repository Public

### Step 1: Rotate MongoDB Credentials

**Why:** The database password `asesh` is exposed in git history.

**How:**

1. **Login to MongoDB Atlas**
   ```
   https://cloud.mongodb.com/
   ```

2. **Create a new database user:**
   - Go to: Database Access → Add New Database User
   - Username: Choose a new username (e.g., `smart-healthcare-prod`)
   - Password: Generate a strong password (use password manager)
   - Privileges: Select "Read and write to any database"
   - Click "Add User"

3. **Update your local `.env` file:**
   ```bash
   MONGODB_URI=mongodb+srv://NEW_USERNAME:NEW_PASSWORD@cluster0.s5idn.mongodb.net/smart-healthcare?retryWrites=true&w=majority
   ```

4. **Delete the old user:**
   - Go to: Database Access
   - Find user `aseshnemal`
   - Click "Delete" (three dots menu)

5. **Update IP Whitelist (optional but recommended):**
   - Go to: Network Access
   - Add your deployment server IPs only
   - Remove `0.0.0.0/0` (Allow from Anywhere) if present

### Step 2: Secure Firebase Configuration

**Why:** Firebase Web API key is public by design but should have restrictions.

**Option A: Add Security Rules (Recommended)**

1. **Go to Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **Select your project:** `smart-healthcare-system-78580`

3. **Add Application Restrictions:**
   - Go to: Project Settings → General
   - Under "Your apps" → Web apps
   - Click Settings (gear icon)
   - Add "App Check" for additional security

4. **Configure Authentication Domain Restrictions:**
   - Go to: Authentication → Settings → Authorized domains
   - Remove any unwanted domains
   - Add only your production domain

5. **Set Firestore Security Rules:**
   - Go to: Firestore Database → Rules
   - Ensure read/write rules require authentication

**Option B: Regenerate API Key (If Concerned)**

1. Go to: Project Settings → General
2. Under "Your apps" → Web app
3. Delete existing web app
4. Add new web app with new configuration
5. Update `.env` with new credentials

### Step 3: Clean Git History

**Why:** Exposed secrets are permanently in git history until removed.

**Method 1: Using BFG Repo-Cleaner (Recommended)**

```bash
# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
cd /tmp
git clone --mirror https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git

# Create a file with secrets to remove
cat > secrets.txt << 'EOF'
[REDACTED_MONGODB_CREDENTIALS]@cluster0.s5idn.mongodb.net
[REDACTED_FIREBASE_API_KEY]-Owheowo
EOF

# Remove secrets from all commits
bfg --replace-text secrets.txt Smart-Healthcare-System-for-Urban-Hospitals.git

# Clean up
cd Smart-Healthcare-System-for-Urban-Hospitals.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push to overwrite history (DESTRUCTIVE!)
git push --force
```

**Method 2: Using git-filter-repo**

```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Clone fresh copy
cd /tmp
git clone https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git
cd Smart-Healthcare-System-for-Urban-Hospitals

# Create expressions file
cat > ../filter-expressions.txt << 'EOF'
regex:[REDACTED_MONGODB_CREDENTIALS]@cluster0\.s5idn\.mongodb\.net==>REMOVED_MONGODB_URI
regex:[REDACTED_FIREBASE_API_KEY]-Owheowo==>REMOVED_FIREBASE_KEY
EOF

# Run filter
git filter-repo --replace-text ../filter-expressions.txt --force

# Force push
git remote add origin https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git
git push --force --all
git push --force --tags
```

**⚠️ WARNING:**
- History rewriting will change all commit hashes
- All contributors must re-clone the repository
- Open pull requests will break
- Better to do this BEFORE making repository public

### Step 4: Delete Local Secret Files

```bash
cd /Users/aseshnemal/Desktop/app/Smart-Healthcare-System-for-Urban-Hospitals/smart-healthcare-system

# Delete redundant env file
rm .env.local

# Keep only .env (which is gitignored)
# Verify .env has rotated credentials
cat .env
```

### Step 5: Verify Security

```bash
# Check no secrets are tracked
git ls-files | grep -E "\.env$|\.env\.local"
# Should only show: .env.example

# Check .gitignore is working
git status
# Should NOT show .env or .env.local in untracked files

# Search for any remaining hardcoded secrets
grep -r "mongodb+srv://aseshnemal" smart-healthcare-system/src/
grep -r "[REDACTED_FIREBASE_API_KEY]" smart-healthcare-system/src/
# Both should return nothing
```

---

## 📋 Security Checklist Before Going Public

- [ ] Rotate MongoDB credentials (new user + password)
- [ ] Delete old MongoDB user `aseshnemal`
- [ ] Add Firebase domain restrictions
- [ ] Configure Firebase App Check (optional)
- [ ] Clean git history with BFG or filter-repo
- [ ] Force push cleaned history
- [ ] Delete `.env.local` file locally
- [ ] Verify `.env` and `.env.local` are gitignored
- [ ] Update deployment environment variables
- [ ] Test application with new credentials
- [ ] Scan repository with secret detection tool
- [ ] Enable GitHub secret scanning (Settings → Security)
- [ ] Add `.env.example` documentation to README

---

## 🛡️ Best Practices Going Forward

### 1. Never Commit Secrets
- Always use environment variables
- Keep `.env` files in `.gitignore`
- Use `.env.example` as a template

### 2. Use Secret Scanning Tools

**GitHub Secret Scanning:**
- Automatically enabled for public repos
- Go to: Settings → Code security and analysis
- Enable "Secret scanning"

**Pre-commit Hook:**
```bash
# Install gitleaks
brew install gitleaks

# Add to .git/hooks/pre-commit
#!/bin/bash
gitleaks protect --staged --verbose
```

**VS Code Extension:**
- Install: "GitGuardian" extension
- Scans for secrets in real-time

### 3. Separate Development and Production Secrets

```bash
# Development (.env.local - gitignored)
MONGODB_URI=mongodb://localhost:27017/dev

# Production (Vercel/deployment platform)
MONGODB_URI=mongodb+srv://prod-user:strong-pass@...
```

### 4. Use Secret Management Services

For production deployments:
- **Vercel:** Environment Variables in dashboard
- **GitHub Actions:** Repository Secrets
- **AWS:** AWS Secrets Manager
- **Azure:** Azure Key Vault
- **HashiCorp Vault:** Enterprise secret management

### 5. Regular Security Audits

```bash
# Check for exposed secrets
npm audit

# Scan dependencies
npm install -g snyk
snyk test

# Git history scan
trufflehog git file://. --only-verified
```

---

## 🔐 Environment Variables Reference

### Required for Development

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster/database

# Admin Authentication
ADMIN_JWT_SECRET=random-secret-minimum-32-chars
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password
ADMIN_NAME=Admin Name
ADMIN_SEED_TOKEN=random-token

# Firebase (Client-side - NEXT_PUBLIC_ prefix required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Optional for Production

```bash
# NextAuth (if implementing)
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://yourdomain.com
```

---

## 📞 Incident Response

**If a secret is accidentally committed:**

1. **Stop immediately** - Do NOT push to remote
2. **Remove from latest commit:**
   ```bash
   git reset HEAD~1
   # Fix the files
   git add .
   git commit -m "Fixed: removed secrets"
   ```

3. **If already pushed:**
   - Assume the secret is compromised
   - Rotate credentials immediately
   - Use git history cleaning tools
   - Force push cleaned history

4. **Report to team/supervisor**

---

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://github.com/newren/git-filter-repo)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

**Last Updated:** November 1, 2025  
**Status:** ⚠️ Repository contains exposed secrets in git history - DO NOT make public until remediation is complete
