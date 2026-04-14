# 🚀 Quick Start Guide

## Get Started in 5 Minutes!

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/banking-dsa-project.git
cd banking-dsa-project

# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### Option 2: Manual Setup

#### Step 1: Compile C++ Core
```bash
cd cpp-core
g++ -std=c++17 -o banking_system banking_system.cpp
cd ..
```

#### Step 2: Install Backend
```bash
cd backend
npm install
cd ..
```

#### Step 3: Install Frontend
```bash
cd frontend
npm install
cd ..
```

---

## Running the Application

### Terminal 1 - Start Backend
```bash
cd backend
npm start

# Output:
# 🏦 Banking API running on http://localhost:5000
# 📊 Fraud detection system active
# 🔍 DSA algorithms loaded
```

### Terminal 2 - Start Frontend
```bash
cd frontend
npm start

# Browser will open automatically at http://localhost:3000
```

---

## First Time Usage

### 1. Create Your First Customer

In the web interface:
1. Go to **"👥 Customers"** tab
2. Fill in the form:
   - Name: `John Doe`
   - Account Number: `1001`
   - Balance: `10000`
   - Type: `Savings`
3. Click **"➕ Add Customer"**

### 2. Perform a Transaction

1. Go to **"💸 Transactions"** tab
2. Try a **Deposit**:
   - Account Number: `1001`
   - Amount: `5000`
3. Click **"Deposit"**

### 3. Test Fraud Detection

1. Create 5+ rapid transactions on the same account
2. Go to **"🚨 Fraud Detection"** tab
3. Click **"Run Analysis"** on an account
4. See the fraud score and risk level!

---

## Testing Fraud Detection

### Scenario 1: Rapid Transactions (Sliding Window)
```bash
# Create account 1001 with ₹10,000
# Perform these transactions quickly:
1. Withdraw ₹1,000
2. Withdraw ₹1,000
3. Withdraw ₹1,000
4. Withdraw ₹1,000
5. Withdraw ₹1,000

# Run fraud detection
# Expected: Fraud Score ~10-20 (MEDIUM RISK)
```

### Scenario 2: Structuring Pattern (Trie)
```bash
# Perform this exact sequence:
1. Withdraw ₹500
2. Withdraw ₹500
3. Withdraw ₹500
4. Withdraw ₹500
5. Transfer ₹2,000 to account 1002

# Run fraud detection
# Expected: Pattern detected: "Structuring (Smurfing)"
# Fraud Score increases by 15
```

### Scenario 3: Large Amount
```bash
# Single large withdrawal
1. Withdraw ₹60,000 from account

# Run fraud detection
# Expected: "Large withdrawal amount detected"
# Fraud Score +20 (HIGH RISK)
```

---

## API Testing with cURL

### Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "accountNumber": 1002,
    "balance": 5000,
    "accountType": "CURRENT"
  }'
```

### Deposit
```bash
curl -X POST http://localhost:5000/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": 1001,
    "amount": 3000
  }'
```

### Transfer
```bash
curl -X POST http://localhost:5000/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccount": 1001,
    "toAccount": 1002,
    "amount": 1500
  }'
```

### Run Fraud Detection
```bash
curl -X POST http://localhost:5000/api/fraud/detect \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": 1001
  }'
```

---

## Troubleshooting

### Issue: Backend won't start
```bash
# Check if port 5000 is already in use
lsof -ti:5000

# Kill the process if needed
kill -9 $(lsof -ti:5000)
```

### Issue: Frontend won't start
```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill the process if needed
kill -9 $(lsof -ti:3000)
```

### Issue: C++ compilation failed
```bash
# Install g++ if not present (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install g++

# Install g++ (macOS)
xcode-select --install
```

### Issue: npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

---

## Understanding the Interface

### 📊 Dashboard
- **Total Customers**: Number of registered accounts
- **Total Balance**: Sum of all account balances
- **Suspicious Accounts**: Number of accounts with fraud scores > 0
- **Total Transactions**: All transactions across all accounts

### 👥 Customers Tab
- **Add New Customer**: Create accounts
- **All Customers Table**: View and manage all accounts
- **View Button**: See transaction history

### 💸 Transactions Tab
- **Deposit**: Add money to account
- **Withdraw**: Remove money from account
- **Transfer**: Send money between accounts

### 🚨 Fraud Detection Tab
- **Top Suspicious Accounts**: Max heap ranking (top 5)
- **Fraud Detection Tools**: Explanation of algorithms
- **Run Analysis**: Detailed fraud report for any account

---

## Next Steps

1. **Explore the Code**
   - Check `cpp-core/banking_system.cpp` for DSA implementations
   - Review `backend/server.js` for API logic
   - Study `frontend/src/App.jsx` for React components

2. **Customize**
   - Adjust fraud thresholds in C++ code
   - Add new suspicious patterns to Trie
   - Create new API endpoints

3. **Extend**
   - Add PostgreSQL database
   - Implement JWT authentication
   - Create admin dashboard

4. **Deploy**
   - Use Heroku for backend
   - Use Vercel for frontend
   - Compile C++ to WebAssembly

---

## Performance Tips

1. **Cache Warmup**: Access frequently used accounts first
2. **Batch Operations**: Group multiple transactions when possible
3. **Periodic Cleanup**: Clear old transaction data (implement retention policy)
4. **Index Optimization**: When adding database, index account numbers

---

## Demo Flow for Presentations

```bash
# 1. Show Dashboard (empty state)
# 2. Create 3 customers
#    - Alice (1001, ₹10,000)
#    - Bob (1002, ₹8,000)
#    - Charlie (1003, ₹12,000)

# 3. Perform normal transactions
#    - Alice deposits ₹5,000
#    - Bob withdraws ₹2,000

# 4. Simulate fraud
#    - Charlie: 5 rapid withdrawals
#    - Transfer pattern: W-W-W-W-T

# 5. Run fraud detection
#    - Show sliding window detection
#    - Show pattern matching
#    - Show suspicious accounts heap

# 6. Demonstrate Dijkstra (if time)
#    - Create transfer network
#    - Find optimal route
```

---

## Support

- **Issues**: Open a GitHub issue 
- **Email**: haripriyal1604@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/hari-priya-l/

---

**Happy Banking! 🏦**
