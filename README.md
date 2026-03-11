# IWA-SPA – Insecure Online Pharmacy

> ⚠️ **WARNING: This is an intentionally insecure application for security training and DevSecOps demonstrations ONLY.**
> **Never deploy to a public or production environment.**
> See [DISCLAIMER.md](DISCLAIMER.md) for full details.

An intentionally insecure full-stack web application modelled on an online pharmacy, suitable for demonstrating and testing security tooling (SAST/DAST/IAST), code reviews, and developer security training.

## Tech Stack

- **Frontend**: React 18 + Vite + Material UI
- **Backend**: Node.js + Express + SQLite (raw SQL, no ORM)
- **Auth**: JWT (intentionally misconfigured – no expiry, insecure secret)
- **Package manager**: npm workspaces

## Intentional Vulnerabilities

| Category | Examples |
|---|---|
| A01 Broken Access Control | IDOR on orders, missing server-side auth on admin routes |
| A02 Cryptographic Failures | Plaintext password storage, insecure JWT |
| A03 Injection | SQL injection in login, search, product filters; simulated command injection |
| A05 Security Misconfiguration | CORS `*`, no CSP, verbose stack traces, DB served statically |
| A07 Auth Failures | No lockout, no rate limiting, predictable reset tokens |
| XSS | Reflected, stored, and DOM-based XSS sinks |
| Business Logic | Client-editable prices, no prescription validation |
| File Upload | Any file type, original filename, web-accessible storage |

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Initialise the database
npm run db:init

# 3. Start frontend (port 5173) and backend (port 4000)
npm run dev
```

Visit http://localhost:5173

**Demo users:**
- `user / user123` (regular user)
- `admin / admin123` (admin)

## Build & Run (Production-style)

```bash
npm run build
npm run start
# Visit http://localhost:4000
```

## Docker

```bash
# Build
docker build -t insecure-pharmacy .

# Run
docker run -p 3000:3000 insecure-pharmacy
# Visit http://localhost:3000
```

## Project Structure

```
apps/
  frontend/     React + Vite SPA
  backend/      Express + SQLite API
packages/
  shared/       Shared TypeScript types
docker/         Dockerfile + dev compose
.github/
  workflows/    CI build + security scanning
  ISSUE_TEMPLATE/
```

## Security Testing Scenarios

- **SAST**: A number of workflows are provided, e.g. (`.github/workflows/codeql.yml`)
- **DAST**: Point DAST Scanner at `http://localhost:5173`
- **Manual**: Walk through purchase, admin, and upload flows

## License

GPLv3 – **THIS SOFTWARE IS PROVIDED "AS IS" WITH NO WARRANTY.**
