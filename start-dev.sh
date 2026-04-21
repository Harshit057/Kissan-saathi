#!/bin/bash
# Quick Start Script for KisaanSathi & आपनGaon
# Starts all services needed for local development

set -e

echo "🌾 KisanSathi & आपनGaon - Dev Environment Setup"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if prerequisites are installed
check_prerequisites() {
  echo -e "${YELLOW}Checking prerequisites...${NC}"
  
  if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
  fi
  
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
  fi
  
  if ! command -v pnpm &> /dev/null && ! command -v npm &> /dev/null; then
    echo "❌ npm or pnpm is not installed"
    exit 1
  fi
  
  echo -e "${GREEN}✓ All prerequisites installed${NC}"
}

# Setup backend
setup_backend() {
  echo -e "\n${YELLOW}Setting up backend...${NC}"
  
  cd backend
  
  if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
  fi
  
  # Activate venv
  if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
  elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
  fi
  
  echo "Installing backend dependencies..."
  pip install -q -r requirements.txt
  
  # Check for .env file
  if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update backend/.env with your database credentials${NC}"
  fi
  
  cd ..
  echo -e "${GREEN}✓ Backend setup complete${NC}"
}

# Setup frontend
setup_frontend() {
  echo -e "\n${YELLOW}Setting up frontend...${NC}"
  
  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    if command -v pnpm &> /dev/null; then
      pnpm install -q
    else
      npm install -q
    fi
  fi
  
  # Check for .env.local file
  if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
  fi
  
  echo -e "${GREEN}✓ Frontend setup complete${NC}"
}

# Check database
check_database() {
  echo -e "\n${YELLOW}Checking database...${NC}"
  
  if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found${NC}"
    echo "Make sure PostgreSQL is running and accessible"
    return
  fi
  
  if psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    
    if psql -U postgres -l | grep -q "kisaan_saathi"; then
      echo -e "${GREEN}✓ Database 'kisaan_saathi' exists${NC}"
    else
      echo -e "${YELLOW}⚠️  Database 'kisaan_saathi' not found${NC}"
      echo "Creating database..."
      createdb kisaan_saathi
      psql kisaan_saathi -c "CREATE EXTENSION postgis;"
      echo -e "${GREEN}✓ Database created and PostGIS enabled${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running${NC}"
    echo "Start PostgreSQL and run this script again"
  fi
}

# Start services
start_services() {
  echo -e "\n${YELLOW}Starting services...${NC}"
  
  # Backend
  echo -e "\n${GREEN}Starting backend server...${NC}"
  cd backend
  if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
  elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
  fi
  uvicorn app.main:app --reload --port 8000 &
  BACKEND_PID=$!
  cd ..
  
  sleep 2
  
  # Frontend
  echo -e "${GREEN}Starting frontend dev server...${NC}"
  if command -v pnpm &> /dev/null; then
    pnpm run dev &
  else
    npm run dev &
  fi
  FRONTEND_PID=$!
  
  sleep 2
  
  # Success message
  echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✓ Services started successfully!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
  echo ""
  echo "📱 Frontend:  http://localhost:3000"
  echo "🔌 Backend:   http://localhost:8000"
  echo "📚 API Docs:  http://localhost:8000/docs"
  echo ""
  echo "Press Ctrl+C to stop all services"
  echo ""
  
  # Wait for Ctrl+C
  wait $BACKEND_PID $FRONTEND_PID
}

# Main execution
main() {
  check_prerequisites
  setup_backend
  setup_frontend
  check_database
  start_services
}

main
