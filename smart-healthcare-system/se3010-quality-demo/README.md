# SE3010 Quality Engineering Demo (Isolated)

This folder provides an **assignment-ready Playwright demo** without changing the main project configuration.

## Why this folder exists

- Keeps the original app behavior and existing test setup untouched.
- Adds a separate, explainable quality-engineering test suite.
- Demonstrates practical SDLC quality gates and CI/CD-ready automation.

## Folder structure

```
se3010-quality-demo/
├── playwright.se3010.config.ts      # isolated Playwright config for assignment demo
├── tests/
│   ├── smoke-navigation.spec.ts      # public page and navigation smoke coverage
│   ├── login-ui.spec.ts              # login form/validation coverage
│   └── protected-route.spec.ts       # route protection behavior coverage
└── ci-cd/
    └── github-actions-playwright.yml # CI/CD pipeline example
```

## Current execution summary

- **Tool:** Playwright
- **Browser:** Chromium
- **Total tests:** 5
- **Total spec files:** 3
- **Latest local result:** 5 passed
- **Latest local duration:** ~17.4 seconds

Covered checks:
- public smoke navigation,
- login form rendering and empty-field validation,
- protected route redirect behavior.

## Suggested SE3010 test cases

1. **Public smoke test**
   - Verify home page loads with key hero text.
   - Verify navigation to About and Contact pages.

2. **Login UI test**
   - Verify login fields and actions render.
   - Verify browser required-field validation triggers when submitting empty form.

3. **Security behavior test (route protection)**
   - Verify unauthenticated access to `/dashboard` redirects to `/login`.

These cases demonstrate:
- functional validation,
- UI regression prevention,
- and access-control quality checks.

## Run locally (from `smart-healthcare-system/`)

```bash
npx playwright test --config=se3010-quality-demo/playwright.se3010.config.ts
```

Open report:

```bash
npx playwright show-report playwright-report-se3010
```

## CI/CD integration

A ready GitHub Actions sample is included at:

- `se3010-quality-demo/ci-cd/github-actions-playwright.yml`

The active workflow in the repository root is:

- `.github/workflows/se3010-playwright.yml`

To activate it in real CI:
1. Copy it to `.github/workflows/se3010-playwright.yml`.
2. Add required repository **secrets** for sensitive values.
3. Push to trigger on PR/push.

### Current CI workflow behavior

The workflow currently:

1. Checks out the repository.
2. Sets up **Node.js 24**.
3. Runs `npm install` inside `smart-healthcare-system/`.
4. Installs Playwright Chromium.
5. Starts the app through Playwright's `webServer` using `npm run dev`.
6. Runs the isolated SE3010 test suite.
7. Uploads the HTML/JSON report as an artifact.

### Secrets used by CI

Only sensitive values are required as GitHub repository secrets:

- `MONGODB_URI`
- `ADMIN_JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`
- `ADMIN_SEED_TOKEN`

### Firebase handling in CI

This SE3010 suite does **not** require real public Firebase values in GitHub.
To allow the app to boot in CI without exposing public config, the workflow uses
safe placeholder `NEXT_PUBLIC_FIREBASE_*` values directly in the workflow.

## Live demo talk track (short)

1. **Tool setup**: "We use Playwright for fast browser-level automated checks."
2. **Execution**: Run the isolated command and show all tests passing.
3. **Evidence**: Open HTML report to show pass/fail traceability.
4. **Quality value**:
   - catches regressions early,
   - automates repetitive verification,
   - gives continuous quality feedback in CI/CD.

### Suggested live demo sequence

1. Open `se3010-quality-demo/tests/` and briefly show the three spec files.
2. Run the local Playwright command.
3. Show the terminal result: **5 passed**.
4. Open `playwright-report-se3010/index.html`.
5. Open `.github/workflows/se3010-playwright.yml` and explain the CI stages.
6. Explain that every push/PR can automatically validate quality before merge.

## Quality Engineering contribution summary

- **Early defect detection**: smoke + route guard failures surface immediately after code changes.
- **Automation**: repeatable checks replace manual exploratory re-runs for baseline behaviors.
- **Continuous testing**: CI workflow executes tests for each push/PR, creating a quality gate before merge.
- **Traceability**: report artifacts provide objective evidence for quality audits and review.

## Files included in this feature

- `.github/workflows/se3010-playwright.yml`
- `se3010-quality-demo/playwright.se3010.config.ts`
- `se3010-quality-demo/tests/smoke-navigation.spec.ts`
- `se3010-quality-demo/tests/login-ui.spec.ts`
- `se3010-quality-demo/tests/protected-route.spec.ts`
- `se3010-quality-demo/ci-cd/github-actions-playwright.yml`
- `playwright-report-se3010/index.html`
- `playwright-report-se3010/results.json`
