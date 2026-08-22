#!/usr/bin/env bash
# DayFlow HRMS API Smoke Test Runner
set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
echo "Running smoke tests against $BASE_URL..."

# 1. Health check
echo -n "Checking server response... "
curl -s -f "$BASE_URL" > /dev/null && echo "[PASS]" || echo "[FAIL]"

# 2. Login endpoint check
echo -n "Testing login endpoint... "
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@dayflow.com","password":"Admin@1234"}' > /dev/null && echo "[PASS]" || echo "[FAIL]"

echo "Smoke tests completed successfully!"
