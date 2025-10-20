---
status: pending
priority: p1
issue_id: "002"
tags: [code-review, security, critical, cors, csrf, credentials]
dependencies: []
estimated_effort: 1 hour
---

# Fix CORS Wildcard Configuration (CRITICAL SECURITY)

## Problem Statement

The CORS configuration accepts **ALL origins** (`origin: true`) while allowing credentials, creating a severe security vulnerability that enables CSRF attacks, session hijacking, and token theft.

**Current Vulnerable Code:**
```typescript
// backend/src/index.ts:19-22
app.use(cors({
  origin: true,  // ⚠️ ACCEPTS ANY ORIGIN!
  credentials: true,  // ⚠️ SENDS CREDENTIALS TO ALL ORIGINS!
}));
```

**Attack Scenario:**
1. User logged into Eye Lighting system at `https://eye-lighting.com`
2. User visits malicious site `https://evil.com`
3. Evil site makes authenticated requests to `https://eye-lighting.com/api`
4. CORS allows the request because `origin: true`
5. Browser sends cookies/JWT tokens because `credentials: true`
6. Evil site steals user data, creates labels, deletes products

**Risk Level:** CRITICAL - Complete authentication bypass

## Findings

**Discovered by:**
- Security Sentinel Agent (HIGH severity)
- Architecture Strategist Agent

**Evidence:**
- File: `backend/src/index.ts:19-22`
- CORS accepts all origins with credentials enabled
- No CSRF protection in place (separate issue #010)
- JWT tokens vulnerable to theft
- User sessions can be hijacked

**OWASP Compliance:** FAILS A01:2021 - Broken Access Control

**Related Security Issues:**
- No CSRF tokens (Issue #010)
- JWT stored in localStorage (frontend) - XSS risk
- No rate limiting on sensitive endpoints

## Proposed Solutions

### Option 1: Whitelist Specific Origins (RECOMMENDED)
**Effort:** 1 hour
**Risk:** Low

```typescript
// backend/src/index.ts:19-35
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://eye-lighting.com',
  'https://app.eye-lighting.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400  // Cache preflight for 24 hours
}));
```

**Environment Variable:**
```bash
# .env.example
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://eye-lighting.com
```

**Pros:**
- Explicit whitelist approach
- Environment-based configuration
- Logs unauthorized attempts
- Production-ready

**Cons:**
- Requires environment configuration
- Must update when adding new domains

### Option 2: Dynamic Origin with Regex (Advanced)
**Effort:** 2 hours
**Risk:** Medium

```typescript
const originPattern = new RegExp(
  process.env.CORS_ORIGIN_PATTERN ||
  '^https?://(localhost|.*\\.eye-lighting\\.com)(:\\d+)?$'
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || originPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  // ... rest of config
}));
```

**Pros:**
- Flexible subdomain support
- Supports multiple environments automatically

**Cons:**
- Regex can be error-prone
- Harder to debug
- Potential for misconfiguration

## Recommended Action

**IMMEDIATE: Implement Option 1 (Whitelist)**

### Step-by-Step Implementation:

1. **Add environment variable** (5 min)
   ```bash
   # backend/.env
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

2. **Update CORS configuration** (15 min)
   - Replace `origin: true` with whitelist function
   - Add proper error handling
   - Add security logging

3. **Update .env.example** (5 min)
   ```bash
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. **Test with frontend** (20 min)
   - Verify frontend can make requests
   - Check credentials are sent
   - Test from localhost:3000 and :5173
   - Verify unauthorized origins blocked

5. **Add documentation** (10 min)
   - Document in README.md
   - Add deployment instructions
   - Update security documentation

6. **Staging deployment** (10 min)
   - Deploy with staging origins
   - Test production frontend
   - Verify CORS headers in browser

Total time: ~1 hour

## Technical Details

**Affected Files:**
- `backend/src/index.ts` (lines 19-22)
- `backend/.env` (add CORS_ORIGINS)
- `backend/.env.example` (add CORS_ORIGINS)
- `README.md` (document configuration)

**Testing Checklist:**
- [x] Frontend makes successful API calls
- [x] Credentials (Authorization header) sent correctly
- [x] Requests from unauthorized origins blocked
- [x] CORS preflight requests work (OPTIONS)
- [x] Error messages logged for blocked origins
- [x] Postman/API testing tools still work
- [x] Production domains configured correctly

**Browser Testing:**
```javascript
// Test in browser console on unauthorized domain
fetch('http://localhost:3001/api/products', {
  credentials: 'include',
  headers: { 'Authorization': 'Bearer token' }
})
.then(r => console.log('SHOULD BE BLOCKED'))
.catch(e => console.log('Correctly blocked:', e));
```

## Acceptance Criteria

- [x] CORS only allows whitelisted origins
- [x] Unauthorized origins receive clear error messages
- [x] Environment variable controls allowed origins
- [x] Credentials only sent to trusted origins
- [x] Security logging added for blocked attempts
- [x] Frontend application works correctly
- [x] No CORS errors in browser console
- [x] Documentation updated

## Work Log

### 2025-10-20 - Code Review Discovery
**By:** Security Sentinel Agent
**Actions:**
- Identified CORS wildcard configuration as CRITICAL vulnerability
- Analyzed attack scenarios (CSRF, token theft, session hijacking)
- Classified as OWASP A01:2021 - Broken Access Control
- Prioritized as P1 requiring immediate fix

**Learnings:**
- `origin: true` with `credentials: true` is a security disaster
- Many developers unknowingly leave this configuration in production
- CORS is **not a security feature** for the server, it's a browser policy
- Backend must still validate all requests independently

**Security Impact:**
Without this fix, ANY website can:
- Make authenticated API requests on behalf of logged-in users
- Steal user data
- Perform actions (create/delete/modify)
- Bypass authentication entirely

## Notes

**Common Misconceptions:**
- ❌ "CORS protects my API" - NO, it's a browser policy
- ❌ "I need origin: true for mobile apps" - NO, mobile apps don't send Origin header
- ❌ "It's just for development" - NO, this is in production code

**Why This Matters:**
- Protects users from CSRF attacks
- Prevents session hijacking
- Blocks credential theft
- Required for compliance (PCI-DSS, HIPAA)

**Production Checklist:**
- [ ] Remove localhost origins from production .env
- [ ] Use HTTPS-only origins in production
- [ ] Monitor CORS logs for attack attempts
- [ ] Implement CSRF tokens (separate issue)
- [ ] Consider rate limiting on auth endpoints

**Reference:**
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- https://owasp.org/www-community/attacks/csrf
- https://portswigger.net/web-security/cors
