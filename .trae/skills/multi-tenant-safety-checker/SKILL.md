---
name: "multi-tenant-safety-checker"
description: "Ensures tenant isolation at query and policy level using RLS and automated testing. Invoke when working on multi-tenancy, RLS, or data security."
---

# Multi-tenant Safety Checker

Ensure complete tenant isolation and prevent data leakage.

## Row Level Security (RLS)

### PostgreSQL RLS Setup

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for users table
CREATE POLICY tenant_isolation_policy ON users
  USING (tenant_id = current_setting('app.tenant_id')::INTEGER);

-- Force RLS even for table owners
ALTER TABLE users FORCE ROW LEVEL SECURITY;
```

### Application-Level Tenant Context

```typescript
// middleware/tenant-context.ts
export class TenantContext {
  async withTenant<T>(
    tenantId: number,
    callback: () => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      // Set tenant context for this transaction
      await tx.$executeRaw`SET LOCAL app.tenant_id = ${tenantId}`;

      // Execute queries within tenant context
      return callback();
    });
  }
}
```

## Standardized RLS Policy Naming

- All tenant isolation policies must follow the pattern: `tenant_isolation_<table_name>`
- All admin policies must follow the pattern: `admin_access_<table_name>`
- All public access policies must follow the pattern: `public_access_<table_name>`

## RLS Enforcement Strategy

```sql
-- Dynamic RLS application for all tables with tenant_id
DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON public.%I', t, t);
    EXECUTE format('CREATE POLICY tenant_isolation_%I ON public.%I FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()))', t, t);
    
    -- Ensure index on tenant_id
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_tenant_id ON public.%I(tenant_id)', t, t);
  END LOOP;
END $$;
```

## Tenant Isolation Checklist

### Database Level

- [ ] All tables have `tenant_id` column
- [ ] `tenant_id` is NOT NULL on all tables
- [ ] Row Level Security enabled on all tables
- [ ] RLS policies created for all tables
- [ ] RLS enforced even for table owners
- [ ] Composite indexes include tenant_id

### Application Level

- [ ] Tenant context set on every request
- [ ] Tenant ID validated from JWT/session
- [ ] No raw SQL without tenant filter
- [ ] API endpoints validate tenant access
- [ ] Background jobs include tenant context

## Best Practices

1. **Always use RLS**: Don't rely on application logic alone
2. **Force RLS**: Even for table owners (FORCE ROW LEVEL SECURITY)
3. **Test thoroughly**: Automated tests for cross-tenant access
4. **Audit regularly**: Monthly RLS configuration audits
5. **Composite indexes**: tenant_id first in all indexes
6. **Tenant validation**: Verify user belongs to tenant
7. **Monitor**: Log cross-tenant access attempts
