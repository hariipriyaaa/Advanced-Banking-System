#!/bin/bash

echo "🏦 Banking DSA Project - Setup Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if command -v node &> /dev/null
then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION installed${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js v18+${NC}"
    exit 1
fi

# Check g++
echo -e "${BLUE}Checking C++ compiler...${NC}"
if command -v g++ &> /dev/null
then
    GCC_VERSION=$(g++ --version | head -n1)
    echo -e "${GREEN}✓ $GCC_VERSION installed${NC}"
else
    echo -e "${RED}✗ g++ not found. Please install g++${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 1: Compiling C++ Core...${NC}"
cd cpp-core
g++ -std=c++17 -o banking_system banking_system.cpp
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ C++ core compiled successfully${NC}"
else
    echo -e "${RED}✗ C++ compilation failed${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${BLUE}Step 2: Installing Backend Dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Backend installation failed${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${BLUE}Step 3: Installing Frontend Dependencies...${NC}"
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Frontend installation failed${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}======================================"
echo "✓ Setup Complete!"
echo "======================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open browser: http://localhost:3000"
echo ""
echo -e "${BLUE}Happy Coding! 🚀${NC}"
