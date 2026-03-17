#!/bin/bash

# Quick Start Script for Product Management Tests
# This script sets up the environment and runs initial tests

echo "🚀 Setting up Product Management E2E Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is not supported. Please upgrade to v18 or higher."
    exit 1
fi

print_status "Node.js version check passed ✓"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_status "npm version check passed ✓"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before running tests."
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies."
    exit 1
fi

print_status "Dependencies installed ✓"

# Install Playwright browsers
print_status "Installing Playwright browsers..."
npm run test:install

if [ $? -ne 0 ]; then
    print_error "Failed to install Playwright browsers."
    exit 1
fi

print_status "Playwright browsers installed ✓"

# Check if frontend is running
print_status "Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null; then
    print_status "Frontend is running ✓"
else
    print_warning "Frontend is not running. Starting frontend..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            print_status "Frontend started ✓"
            break
        fi
        sleep 2
        if [ $i -eq 30 ]; then
            print_error "Frontend failed to start within 60 seconds."
            exit 1
        fi
    done
fi

# Check if backend is running
print_status "Checking if backend is running..."
if curl -s http://localhost:3001 > /dev/null; then
    print_status "Backend is running ✓"
else
    print_warning "Backend is not running. Please start the backend manually:"
    echo "cd backend && npm run start:dev"
    print_warning "Skipping backend-dependent tests..."
fi

# Run a quick smoke test
print_status "Running smoke test..."
npx playwright test tests/product-management/product-management.spec.ts --grep "should display product management page correctly" --reporter=list

if [ $? -eq 0 ]; then
    print_status "Smoke test passed ✓"
else
    print_warning "Smoke test failed. Check your setup and try again."
fi

# Display next steps
echo ""
print_status "Setup completed! 🎉"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Ensure both frontend and backend are running"
echo "3. Run tests with: npm test"
echo "4. View test reports with: npm run test:report"
echo ""
echo "Useful commands:"
echo "- Run all tests: npm test"
echo "- Run tests in headed mode: npm run test:headed"
echo "- Run tests with UI: npm run test:ui"
echo "- Debug tests: npm run test:debug"
echo "- View documentation: cat README-TESTS.md"
echo ""

# Cleanup function
cleanup() {
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Stopping frontend server..."
        kill $FRONTEND_PID 2>/dev/null
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

print_status "Ready to run tests! 🧪"
