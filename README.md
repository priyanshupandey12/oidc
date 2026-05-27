# Antigravity OIDC Provider

A high-performance, strictly typed OpenID Connect and OAuth 2.0 Identity Provider built with Node.js, Express, Drizzle ORM, and PostgreSQL.

## Features
- **OAuth 2.0 Authorization Code Flow**: Fully implemented secure token exchange.
- **OpenID Connect Core**: Built-in Discovery (`/.well-known/openid-configuration`), UserInfo, and JWKS endpoints.
- **JWT & RS256**: Industry-standard JSON Web Tokens signed asymmetrically with RS256.
- **Granular Consent**: Beautiful built-in consent screens for third-party app authorization.
- **Premium Minimalist UI**: An ultra-clean, document-style interface with a built-in OAuth flow simulator.

## Endpoints

### OpenID Connect
* `GET /.well-known/openid-configuration` (Discovery)
* `GET /public/jwks` (JSON Web Key Set)
* `GET /oauth2/authorize` (Authorization)
* `POST /validation/token` (Token Exchange)
* `GET /info/userinfo` (User Info)

### Identity Management
* `POST /auth/register` (User Registration)
* `POST /auth/login` (User Login)
* `POST /clients/register` (OAuth Client Registration)

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Setup environment variables (requires `DATABASE_URL`, `SESSION_SECRET`, `PRIVATE_KEY`, etc.)
4. Run migrations/sync database.
5. Start the server: `npm run dev`

### Simulating the Flow
Open `http://localhost:3000` in your browser. Register an account, log in, and use the "Test the OAuth Flow" section on your dashboard to instantly create a client and simulate an end-to-end authorization sequence.

---

## Roadmap: Reaching 100% Specification Compliance
While the core Authorization Code Flow is fully functional, to reach 100% compliance with advanced OIDC and modern OAuth 2.0 security specs, the following features should be considered for future development:

1. **PKCE (Proof Key for Code Exchange)**
   - Crucial for mobile apps and Single Page Applications (SPAs) where client secrets cannot be securely stored.
   - *Requires adding `code_challenge` validation in `/authorize` and `code_verifier` validation in `/token`.*
2. **Token Revocation Endpoint (RFC 7009)**
   - Allows clients to actively notify the IdP that a token (refresh or access) is no longer needed so it can be invalidated in the database.
3. **RP-Initiated Logout (OIDC)**
   - Allows a third-party application to redirect users back to the IdP with an `id_token_hint` to cleanly end the user's global session across all apps.
4. **Strict Scope Enforcement**
   - The `/info/userinfo` endpoint should strictly filter returned data based on the granted scopes (e.g., only return email data if the `email` scope was actually requested and granted).
