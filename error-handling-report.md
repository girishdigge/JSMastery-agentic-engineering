# Error Handling Investigation Report - Next.js API Routes

## Summary

This Next.js project (003-mcp-server) uses **basic try/catch error handling within API route handlers**, with no centralized error middleware, custom error classes, or shared error formatting utilities. Error handling is ad-hoc and duplicated across routes. No error boundaries or global error handlers exist in the application code.

## Evidence

### 1. Current API Route Error Handling (`app/api/users/route.ts`)

The project has one API route at `/api/users` with the following pattern:

```typescript
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
```

**Issues identified:**
- No specific error type checking (e.g., Prisma errors, validation errors)
- Generic 500 status for all errors
- No structured error response (missing error code, details, or type)
- Console logging is basic (no structured logging)
- Error handling is duplicated between GET and POST

### 2. Page-Level Error Handling (`app/page.tsx`)

The home page has a try/catch for data fetching:

```typescript
try {
  [users, posts] = await Promise.all([
    prisma.user.findMany({...}),
    prisma.post.findMany({...}),
  ]);
} catch (e) {
  console.error("Error fetching data:", e);
  error = "Failed to load data. Make sure your DATABASE_URL is configured.";
}
```

**Issues:**
- No error boundaries (no `app/error.tsx` files)
- No structured error state
- Generic error message

### 3. Prisma Client (`lib/prisma.ts`)

No error handling wrapper - direct Prisma usage:

```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
```

### 4. Next.js Documentation (from `node_modules/next/dist/docs/`)

The Next.js 16.2.10 docs reference several error handling patterns that are **NOT** implemented:

- `error.js` file convention for route segment error boundaries
- `unstable_catchError` for component-level error recovery
- `global-error.js` for root layout error handling
- `notFound()` and `redirect()` functions for expected errors
- Server Functions with `useActionState` pattern
- Custom `_error.js` component for pages directory (this app uses App Router)

## Findings

### What's Present
- Basic try/catch in API route handlers
- Simple NextResponse.json error responses
- Console.error logging
- Error message string on the home page

### What's Missing
1. **No centralized error middleware** - each route handles errors independently
2. **No custom error classes** - no way to distinguish error types
3. **No structured error responses** - missing error codes, types, or metadata
4. **No error formatting utilities** - duplicated error response logic
5. **No error boundaries** - `app/error.tsx` doesn't exist
6. **No global error handler** - `app/global-error.tsx` doesn't exist
7. **No specific error handling** - Prisma errors (e.g., unique constraint violations) aren't distinguished
8. **No validation error handling** - POST requests don't validate request body before database operations

### Error Scenarios Not Handled
- Prisma unique constraint violations (e.g., duplicate email)
- Prisma foreign key errors (e.g., invalid authorId)
- Prisma record not found errors
- Request validation errors (malformed JSON, missing fields)
- Database connection errors
- 404 cases (e.g., fetching a specific user by ID)

## Recommendations

### Immediate Actions (High Priority)

1. **Create error formatting utility**
   ```typescript
   // lib/error.ts
   export class AppError extends Error {
     constructor(
       public message: string,
       public statusCode: number = 500,
       public code?: string
     ) {
       super(message);
     }
   }
   
   export function formatError(error: unknown) {
     if (error instanceof AppError) {
       return { error: error.message, statusCode: error.statusCode, code: error.code };
     }
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
       // Handle specific Prisma errors
     }
     return { error: "Internal server error", statusCode: 500 };
   }
   ```

2. **Add error boundaries**
   - Create `app/error.tsx` for route-level error handling
   - Consider `app/global-error.tsx` for root layout errors

3. **Add request validation**
   - Validate request body before Prisma operations
   - Return 400 for validation errors instead of letting them cascade

4. **Add specific error handling for Prisma errors**
   - 409 for unique constraint violations
   - 404 for record not found
   - 400 for validation errors

### Medium-Term Actions

5. **Create centralized error middleware (if needed)**
   - Consider a wrapper pattern or custom server if error handling grows

6. **Implement structured logging**
   - Replace `console.error` with a logging library
   - Include request context, error codes, and stack traces

7. **Add error types**
   - Create specific error classes: `ValidationError`, `NotFoundError`, `DatabaseError`

### Long-Term Considerations

8. **Error reporting integration**
   - Consider Sentry or similar for production error tracking

9. **Client-side error recovery**
   - Implement `unstable_retry()` in error components

## Conclusion

The current error handling is minimal and lacks structure. While basic try/catch works, the absence of centralized patterns means:
- Inconsistent error responses across routes
- No way to distinguish error types programmatically
- Poor debugging experience without structured logging
- No client-side error recovery boundaries

Implementing the recommendations above would provide consistent, maintainable error handling aligned with Next.js best practices.
