# Security Specification - Yanhal Holdings

## 1. Data Invariants
- A user profile (`/users/{userId}`) can only be created by the authenticated user with the matching UID.
- Once created, a user's `uid` and `email` are immutable.
- A user can only read their own profile.
- All user profiles must include a `photoURL` for identity verification.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)

### Identity & Authentication
1. **Unauthenticated Read**: Attempt to read `/users/userABC` without being signed in. (Expected: `PERMISSION_DENIED`)
2. **Identity Theft Read**: User A attempts to read `/users/userB`. (Expected: `PERMISSION_DENIED`)
3. **Identity Theft Write**: User A attempts to create `/users/userB`. (Expected: `PERMISSION_DENIED`)
4. **Phantom User Creation**: Attempt to create `/users/userABC` with a UID that doesn't match the current auth token. (Expected: `PERMISSION_DENIED`)

### Integrity & Schema
5. **Shadow Field Injection**: Attempt to create a user profile with an extra `isAdmin: true` field. (Expected: `PERMISSION_DENIED`)
6. **Type Poisoning**: Attempt to set `photoURL` to a boolean instead of a string. (Expected: `PERMISSION_DENIED`)
7. **Size Attack**: Attempt to set `displayName` to a 2MB string. (Expected: `PERMISSION_DENIED`)
8. **Null Poisoning**: Attempt to create a user profile missing the `photoURL` field. (Expected: `PERMISSION_DENIED`)

### Immutability & State
9. **Email Spoofing Update**: User attempts to change their `email` field after creation. (Expected: `PERMISSION_DENIED`)
10. **UID Takeover**: User attempts to change their `uid` field in their own document. (Expected: `PERMISSION_DENIED`)
11. **Orphaned Write**: Attempt to create a submission at `/submissions/` (if implemented) without being authenticated. (Expected: `PERMISSION_DENIED`)
12. **Terminal State Lock**: (Not applicable yet as no workflow states exist, but ensuring `createdAt` cannot be modified). (Expected: `PERMISSION_DENIED`)

## 3. Implementation Plan
- Use `rules_version = '2';`.
- Implement `isValidUser(data)` helper.
- use `affectedKeys().hasOnly()` for updates to prevent shadow fields.
- Default deny all.
