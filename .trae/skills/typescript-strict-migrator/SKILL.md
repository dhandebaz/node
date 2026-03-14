---
name: "typescript-strict-migrator"
description: "Migrates projects to strict TypeScript mode with standard type definitions and no-any rules. Invoke when enabling strict mode or fixing type errors."
---

# TypeScript Strict Migrator

Upgrade to strict mode and ensure type safety.

## Strict Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Migration Strategies

1. **Enable strict mode**: Start with `strict: true`
2. **Address errors**: Use `@ts-expect-error` sparingly
3. **Avoid any**: Use `unknown` or `never`
4. **Type guards**: Implement custom type guards
5. **Utility types**: Use `Partial`, `Required`, `Readonly`, `Record`, `Pick`, `Omit`
6. **Generic types**: Use generics for reusable logic
7. **Discriminated unions**: For complex states

## Output Checklist

- [ ] Strict mode enabled in tsconfig.json
- [ ] noImplicitAny fixed
- [ ] strictNullChecks addressed
- [ ] Type errors resolved or documented
- [ ] noUnusedLocals/Parameters cleaned up
- [ ] Custom type guards implemented
- [ ] Standard utility types used
- [ ] Documentation of complex types
