#!/bin/bash

# Production Readiness Check Script
# This script verifies that the application is ready for production deployment

set -e

echo "🔍 Running Production Readiness Checks..."
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Counters
PASSED=0
WARNINGS=0
FAILED=0

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASSED=$((PASSED + 1))
}

check_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    FAILED=$((FAILED + 1))
}

# 1. Check environment variables
echo ""
echo "1. Environment Configuration"
echo "----------------------------"

if [ -f .env ]; then
    check_pass ".env file exists"
    
    # Check critical environment variables
    if grep -q "DATABASE_URL=" .env && ! grep -q "DATABASE_URL=\"postgresql://username:password" .env; then
        check_pass "DATABASE_URL is configured"
    else
        check_fail "DATABASE_URL needs to be configured"
    fi
    
    if grep -q "JWT_SECRET=" .env && ! grep -q "development-jwt-secret" .env; then
        check_pass "JWT_SECRET is set to production value"
    else
        check_warning "JWT_SECRET should be changed for production"
    fi
else
    check_fail ".env file is missing"
fi

# 2. Check dependencies
echo ""
echo "2. Dependencies"
echo "---------------"

if [ -f package-lock.json ] || [ -f pnpm-lock.yaml ]; then
    check_pass "Lock file exists"
else
    check_fail "No lock file found (package-lock.json or pnpm-lock.yaml)"
fi

# Check for security vulnerabilities
echo "Checking for vulnerabilities..."
AUDIT_RESULT=$(pnpm audit --json 2>/dev/null || echo "{}")
if echo "$AUDIT_RESULT" | grep -q '"severity":"high"' || echo "$AUDIT_RESULT" | grep -q '"severity":"critical"'; then
    check_fail "High or critical vulnerabilities found"
else
    check_warning "Only moderate/low vulnerabilities found (if any)"
fi

# 3. Check TypeScript compilation
echo ""
echo "3. Code Quality"
echo "---------------"

echo "Running TypeScript compilation check..."
if cd services/estimate-service && npx tsc --noEmit --skipLibCheck 2>/dev/null; then
    check_pass "TypeScript compilation successful"
else
    check_fail "TypeScript compilation errors found"
fi
cd ../..

# 4. Check database
echo ""
echo "4. Database"
echo "-----------"

if command -v docker-compose >/dev/null 2>&1; then
    if docker-compose ps | grep -q "postgres.*Up"; then
        check_pass "PostgreSQL is running"
    else
        check_warning "PostgreSQL is not running (needed for local testing)"
    fi
else
    check_warning "Docker Compose not found (needed for local database)"
fi

# Check Prisma
if [ -d node_modules/.prisma ]; then
    check_pass "Prisma client is generated"
else
    check_fail "Prisma client not generated"
fi

# 5. Check documentation
echo ""
echo "5. Documentation"
echo "----------------"

[ -f README.md ] && check_pass "README.md exists" || check_fail "README.md missing"
[ -f CHANGELOG.md ] && check_pass "CHANGELOG.md exists" || check_fail "CHANGELOG.md missing"
[ -f .gitignore ] && check_pass ".gitignore exists" || check_fail ".gitignore missing"

# 6. Check CI/CD
echo ""
echo "6. CI/CD Configuration"
echo "----------------------"

if [ -f .github/workflows/ci.yml ]; then
    check_pass "CI/CD workflow configured"
else
    check_fail "CI/CD workflow missing"
fi

# 7. Check Docker configuration
echo ""
echo "7. Docker Configuration"
echo "-----------------------"

[ -f Dockerfile ] && check_pass "Dockerfile exists" || check_warning "Dockerfile missing"
[ -f docker-compose.yml ] && check_pass "docker-compose.yml exists" || check_warning "docker-compose.yml missing"

# Summary
echo ""
echo "========================================"
echo "Production Readiness Summary"
echo "========================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ Application is READY for production!${NC}"
    else
        echo -e "${YELLOW}⚠️  Application is READY for production with warnings.${NC}"
        echo "   Please review the warnings above before deploying."
    fi
    exit 0
else
    echo -e "${RED}❌ Application is NOT ready for production.${NC}"
    echo "   Please fix the failed checks above before deploying."
    exit 1
fi
