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

To activate it in real CI:
1. Copy it to `.github/workflows/se3010-playwright.yml`.
2. Add required secrets in repository settings.
3. Push to trigger on PR/push.

## Live demo talk track (short)

1. **Tool setup**: "We use Playwright for fast browser-level automated checks."
2. **Execution**: Run the isolated command and show all tests passing.
3. **Evidence**: Open HTML report to show pass/fail traceability.
4. **Quality value**:
   - catches regressions early,
   - automates repetitive verification,
   - gives continuous quality feedback in CI/CD.

## Quality Engineering contribution summary

- **Early defect detection**: smoke + route guard failures surface immediately after code changes.
- **Automation**: repeatable checks replace manual exploratory re-runs for baseline behaviors.
- **Continuous testing**: CI workflow executes tests for each push/PR, creating a quality gate before merge.
- **Traceability**: report artifacts provide objective evidence for quality audits and review.
