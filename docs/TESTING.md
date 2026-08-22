# Testing and Quality Assurance Guide

This document outlines the testing strategy and commands for DayFlow HRMS.

## 1. Unit Tests
Run the date utility and authorization unit tests:
```bash
npx tsx --test scripts/dates.test.ts
npx tsx --test scripts/auth.test.ts
```

## 2. API Flow and Smoke Tests
To verify all REST endpoints end-to-end:
```bash
npm run dev
# in another terminal:
bash scripts/smoke.sh
```

## 3. Integration Tests
Run Prisma database seeded tests:
```bash
npm run test:integration
```
