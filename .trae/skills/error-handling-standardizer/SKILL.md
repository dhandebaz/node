---
name: "error-handling-standardizer"
description: "Creates consistent error handling with custom error classes, HTTP status mapping, and safe client messages. Invoke when standardizing error handling or exception management."
---

# Error Handling Standardizer

Build consistent, debuggable error handling across the application.

## Error Taxonomy

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public details?: any
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super("VALIDATION_ERROR", "Validation failed", 400, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super("NOT_FOUND", `${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403);
  }
}
```

## Error Handler Middleware

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Operational errors (known)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        trace_id: req.id,
      },
    });
  }

  // Programming errors (unknown)
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      trace_id: req.id,
    },
  });
};
```

## Best Practices

- Use custom error classes
- Distinguish operational vs programming errors
- Log all errors with context
- Never expose stack traces to clients
- Include trace IDs for debugging
- Monitor error rates by type
- Set up alerting for critical errors

## Output Checklist

- [ ] Custom error classes defined
- [ ] Error handler middleware
- [ ] HTTP status code mapping
- [ ] Structured logging setup
- [ ] Safe client error messages
- [ ] Async error wrapper
- [ ] Error monitoring/alerts
- [ ] Documentation of error codes
