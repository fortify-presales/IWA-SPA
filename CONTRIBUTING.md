# Contributing to IWA-SPA

Thank you for your interest in contributing! IWA-SPA is an **intentionally insecure** application designed for security training and DevSecOps demonstrations.

## Contribution Rules for Intentional Insecurity

1. **Do NOT fix intentional vulnerabilities.** The vulnerabilities in this application are features, not bugs.
2. **Do add new vulnerabilities** from the OWASP Top 10 or common misconfigurations via an Issue or PR.
3. **Document every intentional vulnerability** with an inline comment: `// INTENTIONAL: <reason>`
4. **Use issue templates** when proposing a new vulnerability sink or misconfiguration.
5. **Keep demo data synthetic** – no real PII, no real health data.
6. **Do not add production-hardening** unless it is clearly marked as an optional training exercise.

## Adding a New Vulnerability

1. Open an issue using the "Add a vulnerability sink" template.
2. Describe the OWASP category, the affected component, and the attack scenario.
3. Submit a PR with the insecure code and an inline `// INTENTIONAL:` comment.

## Code Style

- TypeScript preferred for both frontend and backend.
- Keep things simple – resist the urge to add abstractions.
- Comments near insecure blocks are mandatory.

## Local Development

See [README.md](README.md) for setup instructions.

## License

GPLv3 – see [LICENSE](LICENSE).
