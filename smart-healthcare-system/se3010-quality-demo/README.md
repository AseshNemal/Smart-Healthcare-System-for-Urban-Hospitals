# SE3010 Quality Engineering Demo (Isolated)

This folder contains an assignment-focused Playwright test suite that runs **on top of the existing project** without changing core app behavior.

## Purpose

- Keep the original system and existing tests untouched.
- Demonstrate modern automated quality checks for SE3010.
- Show CI-ready continuous validation and test evidence generation.

## Scope and structure

```
se3010-quality-demo/
├── playwright.se3010.config.ts        # isolated Playwright configuration
├── tests/
│   ├── smoke-navigation.spec.ts        # public smoke + navbar navigation
│   ├── login-ui.spec.ts                # login UI rendering + empty-form validation
│   └── protected-route.spec.ts         # unauthorized dashboard redirect behavior
└── ci-cd/
    └── github-actions-playwright.yml   # reference CI workflow copy
```

## Current execution snapshot

- **Tool:** Playwright
- **Browser project:** Chromium
- **Spec files:** 3
- **Total tests:** 5
- **Latest local result:** 5/5 passed
- **Latest recorded duration:** ~17.4s

Validated behaviors:
- Public page smoke checks
- Login form presence and HTML5 required-field validation
- Protected route redirect (`/dashboard` → `/login` when unauthenticated)

## Test cases mapped to quality goals

1. **Public smoke validation**
   - Home page renders key content.
   - About and Contact navigation works.

2. **Login UI validation**
   - Login fields and buttons are visible.
   - Empty submit triggers required-field checks.

3. **Access-control validation**
   - Unauthorized dashboard access redirects to login.

Quality contribution:
- Functional correctness
- UI regression prevention
- Security behavior verification

## Local execution

Run from `smart-healthcare-system/`:

```bash
npx playwright test --config=se3010-quality-demo/playwright.se3010.config.ts
```

Open report:

```bash
npx playwright show-report playwright-report-se3010
```

## CI/CD setup (active)

Active workflow file:

- `.github/workflows/se3010-playwright.yml`

Reference copy:

- `se3010-quality-demo/ci-cd/github-actions-playwright.yml`

### What the workflow does

1. Checkout repository
2. Setup Node.js 24
3. Install dependencies (`npm install`)
4. Install Playwright Chromium
5. Start app via Playwright web server (`npm run dev`)
6. Run isolated SE3010 suite
7. Upload Playwright HTML/JSON report artifact

### CI secrets required

Add as repository secrets:

- `MONGODB_URI`
- `ADMIN_JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`
- `ADMIN_SEED_TOKEN`

### Firebase in CI

This suite does not require real public Firebase values in GitHub settings.
The workflow uses safe placeholder `NEXT_PUBLIC_FIREBASE_*` values only to allow app startup for UI-focused checks.

## Live demo script (short)

1. Show `se3010-quality-demo/tests/` (3 spec files).
2. Run isolated Playwright command.
3. Show pass output (`5 passed`).
4. Open `playwright-report-se3010/index.html` as evidence.
5. Show `.github/workflows/se3010-playwright.yml` and explain CI flow.
6. Conclude: each push/PR can automatically validate quality before merge.

## QE impact summary

- **Early defect detection:** catches regressions soon after changes.
- **Automation:** reduces manual repetitive checks.
- **Continuous testing:** runs as CI quality gate on PR/push.
- **Traceability:** report artifacts provide audit-ready evidence.

## Feature file list

- `.github/workflows/se3010-playwright.yml`
- `se3010-quality-demo/playwright.se3010.config.ts`
- `se3010-quality-demo/tests/smoke-navigation.spec.ts`
- `se3010-quality-demo/tests/login-ui.spec.ts`
- `se3010-quality-demo/tests/protected-route.spec.ts`
- `se3010-quality-demo/ci-cd/github-actions-playwright.yml`
- `playwright-report-se3010/index.html`
- `playwright-report-se3010/results.json`
