# Contributing to QuotePart

## Stack

- **Framework**: Next.js (App Router), TypeScript strict
- **Styling**: Tailwind CSS
- **Tests**: Vitest (unit/integration) + Playwright (e2e)
- **CI**: GitHub Actions

## Setup

```bash
git clone https://github.com/<org>/quotepart
cd quotepart
nvm use
npm install
npm run dev
```

## Branch & Commit conventions

- Branch naming: `type/short-description` (e.g. `feat/equity-model-m3`)
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) — `feat/fix/chore/refactor/docs/test`
- One feature = one branch = one PR

## Running tests

```bash
npm test              # unit tests (watch mode)
npm run test:coverage # unit tests with coverage report
npm run test:e2e      # e2e tests (requires dev server or build)
npm run test:e2e:ui   # e2e with interactive UI
```

## TDD workflow

All domain logic (`src/domain/`) must be test-driven:

1. Write a failing test
2. Run it to confirm it fails
3. Write minimal code to make it pass
4. Refactor if needed
5. Commit

## Architecture

```
src/
  app/        — Next.js routes and layouts
  components/ — React components (UI only, no business logic)
  domain/     — Pure business logic (no React, fully testable)
  hooks/      — Custom React hooks
  lib/        — Shared utilities
tests/
  unit/       — Vitest tests (mirrors src/ structure)
  e2e/        — Playwright tests
```

## Data privacy

This app has no backend. All data stays client-side (URL params + localStorage). Never introduce server-side storage without explicit discussion.
