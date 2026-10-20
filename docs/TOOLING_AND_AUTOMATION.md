# Tooling and Automation Documentation — Styly Admin Dashboard

This document details all project-local and developer tooling installed, configured, or integrated into the repository to guarantee a safe, reproducible engineering workflow.

---

## Tooling Inventory

### 1. Vitest Test Runner
- **Package & Version**: `vitest@5.0.5`
- **Source**: npm registry via `pnpm`
- **Installation Scope**: Workspace development dependency (`devDependencies` in `package.json`)
- **Purpose**: Fast, native Vite-powered unit and integration test runner for client components, auth stores, and transport layers.
- **Access / Permissions**: Local process execution only; no network access or external telemetry.
- **How to Use**:
  ```bash
  # Run all tests once
  pnpm test

  # Run tests in watch mode during development
  pnpm test:watch
  ```
- **How to Remove**:
  ```bash
  pnpm remove -w -D vitest
  rm vitest.config.ts
  ```

---

### 2. Testing Library & DOM Environment
- **Packages & Versions**:
  - `@testing-library/react@16.3.3`
  - `@testing-library/jest-dom@7.0.1`
  - `jsdom@30.1.3`
- **Source**: npm registry via `pnpm`
- **Installation Scope**: Workspace development dependency (`devDependencies` in `package.json`)
- **Purpose**: Provides DOM simulation (`jsdom`) and accessible React component testing primitives to verify route protection, state updates, and accessibility attributes.
- **Access / Permissions**: In-memory JS environment simulation only.
- **How to Use**:
  Included automatically in tests matching `client/src/**/*.test.{ts,tsx}`.
- **How to Remove**:
  ```bash
  pnpm remove -w -D @testing-library/react @testing-library/jest-dom jsdom
  rm client/src/test/setup.ts
  ```

---

### 3. TypeScript Type Checking Script
- **Script**: `pnpm check` (`tsc --noEmit`)
- **Purpose**: Strictly verifies that all TypeScript source files and test files conform to type specifications.
- **How to Use**:
  ```bash
  pnpm check
  ```

---

### 4. Production Build Script
- **Script**: `pnpm build` (`vite build`)
- **Purpose**: Generates optimized production static assets to `dist/public`.
- **How to Use**:
  ```bash
  pnpm build
  ```

---

### 5. Automated CI/CD Workflow
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Push to branch `main`
- **Purpose**: Automated build and zero-downtime atomic symlink release onto the Styly production VPS via SSH.
- **Environment**: GitHub Actions runner with Node.js pinned via `.nvmrc`.
