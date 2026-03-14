---
name: "unit-test-generator"
description: "Generates unit tests for business logic with high coverage and mock isolation. Invoke when writing new features or fixing bugs."
---

# Unit Test Generator

Generate robust unit tests for critical business logic.

## Test Structure (Vitest/Jest)

```typescript
import { describe, it, expect, vi } from "vitest";
import { calculateOrderTotal } from "./order-service";

describe("calculateOrderTotal", () => {
  it("should calculate total for a single item", () => {
    const items = [{ price: 100, quantity: 1 }];
    const total = calculateOrderTotal(items);
    expect(total).toBe(100);
  });

  it("should handle multiple items", () => {
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ];
    const total = calculateOrderTotal(items);
    expect(total).toBe(250);
  });

  it("should apply discounts correctly", () => {
    const items = [{ price: 100, quantity: 1 }];
    const discount = 0.1;
    const total = calculateOrderTotal(items, discount);
    expect(total).toBe(90);
  });
});
```

## Mocking Best Practices

- Use `vi.mock()` for external dependencies
- Mock only what's necessary
- Reset mocks between tests (`afterEach`)
- Avoid deep mocking when possible
- Use `vi.fn()` for callback verification
- Verify mock call arguments

## Output Checklist

- [ ] High branch/line coverage
- [ ] Edge cases (empty, null, extreme)
- [ ] Error conditions tested
- [ ] External dependencies mocked
- [ ] Deterministic results
- [ ] Readable test descriptions
- [ ] Fast execution
- [ ] Clean up after each test
