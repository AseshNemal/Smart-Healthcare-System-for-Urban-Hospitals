# 🚀 Quick Test Reference Guide

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- business-logic.test.ts
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

---

## 📊 Current Test Status

**✅ ALL TESTS PASSING**

```
Test Suites: 6 passed, 6 total
Tests:       106 passed, 106 total  
Time:        ~1 second
Status:      100% Pass Rate
```

---

## 📁 Test File Locations

```
src/__tests__/
├── api/
│   └── admin-login.test.ts          (22 tests) ✅
├── business-logic.test.ts           (27 tests) ✅
├── components/
│   └── ui.test.tsx                  (13 tests) ✅
├── integration/
│   └── reports.test.ts              (12 tests) ✅
├── models/
│   └── schemas.test.ts              (18 tests) ✅
└── utils/
    └── helpers.test.ts              (14 tests) ✅
```

---

## 📈 Coverage Summary

| Area | Tests | Coverage | Grade |
|------|-------|----------|-------|
| Business Logic | 27 | 100% | ⭐ A |
| API Auth | 22 | 100% | ⭐ A |
| Models | 18 | 100% | ⭐ A |
| Utilities | 14 | 100% | ⭐ A |
| UI Components | 13 | Strong | ✅ B+ |
| Integration | 12 | 100% | ⭐ A |

**Overall: A (Excellent)**

---

## 📚 Documentation Files

1. **TEST_COVERAGE_REPORT.md** - Detailed analysis
2. **TESTING_SUMMARY.md** - Executive summary  
3. **TEST_RESULTS.txt** - Visual report
4. **QUICK_TEST_GUIDE.md** - This file

---

## ✨ Key Features

### ✅ Test Quality
- Meaningful assertions
- Well-structured code
- Clear test names
- Proper mocking

### ✅ Coverage Areas
- ✅ Positive cases
- ✅ Negative cases
- ✅ Edge cases
- ✅ Error handling
- ✅ Security testing

### ✅ Test Categories
- Input validation
- Business logic
- Authentication
- Error handling
- Data transformations
- Integration flows

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Run tests once
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html

# Run specific test
npm test -- -t "should calculate total revenue"

# Run tests for specific file
npm test -- helpers.test.ts

# Update snapshots (if any)
npm test -- -u
```

---

## 🎯 Test Metrics

- **Total Tests:** 106
- **Pass Rate:** 100%
- **Execution Time:** ~1 second
- **Test Suites:** 6
- **Failed Tests:** 0
- **Skipped Tests:** 0

---

## 📝 Quick Tips

### Writing New Tests
```typescript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = setupTestData();
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### Best Practices
- ✅ Use descriptive test names
- ✅ Follow AAA pattern
- ✅ Test one thing at a time
- ✅ Use meaningful assertions
- ✅ Clean up after tests
- ✅ Mock external dependencies

---

## 🚨 Troubleshooting

### Tests Not Running?
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Coverage Not Updating?
```bash
# Delete coverage folder
rm -rf coverage

# Run coverage again
npm run test:coverage
```

---

## 📞 Support

For questions about tests:
- Check TEST_COVERAGE_REPORT.md
- Check TESTING_SUMMARY.md  
- Review test files in `src/__tests__/`

---

**Last Updated:** October 18, 2025  
**Status:** ✅ All Systems Go  
**Team:** K.H.A.A. Ranasinghe, M.A.N. Tharushka, D.M. Senevirathne, L.A.U. Nemal
