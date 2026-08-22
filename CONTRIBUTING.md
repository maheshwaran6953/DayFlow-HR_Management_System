# Contributing Guidelines

Thank you for contributing to **Dayflow HRMS**! Please follow these guidelines to keep the codebase clean, tested, and consistent.

## 🌿 Branch Naming Conventions

All work should take place on dedicated topic branches following these patterns:

- `feat/<short-description>` — New features or feature extensions (e.g. `feat/rest-api-migration`)
- `fix/<short-description>` — Bug fixes (e.g. `fix/profile-params-type`)
- `docs/<short-description>` — Documentation changes (e.g. `docs/update-readme`)
- `chore/<short-description>` — Maintenance, dependencies, or tooling updates
- `test/<short-description>` — Unit or integration tests (e.g. `test/dates-helper`)

## 💬 Commit Message Format

We follow standard conventional commit messages:

`<type>(<scope>): <brief description>`

### Allowed Types:
- `feat`: New feature or capability
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `ux`: User experience, loading states, toasts, or UI updates
- `chore`: Tooling, build scripts, package updates

### Examples:
- `feat(api): convert auth API functions to REST endpoints`
- `fix(auth): resolve session state initialization`
- `test(dates): add unit tests for date utilities`
- `docs: update README setup section`

## 📝 DECISIONS.md Etiquette

- `DECISIONS.md` is **append-only**.
- Add new entries at the bottom with a bold bullet point title.
- **Never edit or delete past decision entries**, as team members rely on historical context.

## 🧪 Pre-Commit Verification

Before submitting a pull request, run all verification steps:

```bash
# 1. Run ESLint checks
npm run lint

# 2. Run unit tests
npm run test:dates

# 3. Verify production build succeeds
npm run build
```
