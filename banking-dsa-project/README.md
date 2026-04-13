# 🏦 Advanced Banking System with DSA

A full-stack banking application showcasing advanced Data Structures and Algorithms including **Fraud Detection**, **Dijkstra's Shortest Path**, **Trie Pattern Matching**, and **Max Heap** implementations.

## 🚀 Live Demo

![Banking System Demo](https://img.shields.io/badge/Status-Production%20Ready-success)
![C++](https://img.shields.io/badge/C++-17-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-61dafb)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [DSA Implementations](#dsa-implementations)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## ✨ Features

### Core Banking Operations
- ✅ Customer Account Management
- ✅ Deposits & Withdrawals
- ✅ Money Transfers
- ✅ Transaction History
- ✅ Year-wise Analytics

### Advanced Features
- 🔍 **Real-time Fraud Detection** (Sliding Window Algorithm)
- 🌳 **Pattern Matching** (Trie Data Structure)
- 🗺️ **Optimal Transfer Routing** (Dijkstra's Algorithm)
- 📊 **Suspicious Account Ranking** (Max Heap)
- 💾 **LRU Cache** for performance optimization
- 📈 **Analytics Dashboard**

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **CSS3** - Responsive design with gradients
- **Fetch API** - HTTP client

### Backend
- **Node.js + Express** - REST API server
- **CORS** - Cross-origin support
- **JSON** - Data persistence

### Core Engine
- **C++17** - High-performance DSA implementation
- **STL** - Standard Template Library
- **Custom DSA** - Hand-coded algorithms

---

## 🧠 DSA Implementations

### 1. Fraud Detection (Sliding Window)

**Algorithm Complexity**: O(n) where n = number of transactions

```cpp
// Detects suspicious patterns in transaction windows
bool detectSlidingWindowFraud(int accountNumber) {
    deque<Transaction> window;
    
    for (auto& txn : transactions) {
        // Remove old transactions outside time window
        while (!window.empty() && 
               (txn.timestamp - window.front().timestamp) > WINDOW_MINUTES * 60) {
            window.pop_front();
        }
        
        window.push_back(txn);
        
        // Alert if too many transactions
        if (window.size() >= THRESHOLD_COUNT) {
            fraudScore += 10;
        }
    }
}
```

**Detects:**
- 5+ transactions within 10 minutes
- Large amounts (>₹50,000) in short timeframes
- Rapid deposit-withdrawal cycles

---

### 2. Pattern Matching (Trie)

**Algorithm Complexity**: O(m) where m = pattern length

```cpp
class SuspiciousPatternTrie {
    TrieNode* root;
    
public:
    void insert(string pattern, string name);
    vector<string> searchPatterns(string sequence);
};
```

**Patterns Detected:**
- **"WWWWT"** - Structuring (Smurfing): Multiple small withdrawals → Large transfer
- **"DDDWWW"** - Rapid Cycling: Quick deposits and withdrawals
- **"DTTT"** - Money Laundering: Deposit → Multiple transfers
- **"TTTTT"** - Circular Transfers: Round-robin money movement

---

### 3. Dijkstra's Shortest Path

**Algorithm Complexity**: O((V + E) log V) using min-heap

```cpp
vector<int> dijkstraOptimalRoute(int source, int destination, double& totalFee) {
    priority_queue<DijkstraNode, vector<DijkstraNode>, greater<>> pq;
    unordered_map<int, double> dist;
    unordered_map<int, int> parent;
    
    // Find shortest path considering transfer fees
    // Returns: [source, intermediate1, intermediate2, ..., destination]
}
```

**Use Case:**
- Find cheapest money transfer route through intermediary accounts
- Minimize total transaction fees
- Multi-hop transfers

---

### 4. Max Heap (Top-K Suspicious Accounts)

**Algorithm Complexity**: O(k log k) for top-K extraction

```cpp
priority_queue<SuspiciousAccount> suspiciousHeap;

void updateSuspiciousHeap() {
    for (auto& [acc, customer] : customers) {
        if (customer.fraudScore > 0) {
            heap.push({acc, customer.fraudScore});
        }
    }
}
```

**Features:**
- Efficiently tracks most suspicious accounts
- Real-time ranking updates
- O(1) access to highest fraud score

---

### 5. LRU Cache

**Algorithm Complexity**: O(1) for get/put operations

```cpp
class LRUCache {
    list<pair<int, Customer*>> cache;
    unordered_map<int, list<...>::iterator> map;
    
public:
    Customer* get(int accountNumber);  // O(1)
    void put(int accountNumber, Customer* customer);  // O(1)
};
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (Dashboard, Analytics, Fraud Detection UI)              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP REST API
                     │
┌────────────────────▼────────────────────────────────────┐
│              Node.js + Express Backend                   │
│  (API Routes, Business Logic, Data Validation)           │
└────────────────────┬────────────────────────────────────┘
                     │ JSON Data Exchange
                     │
┌────────────────────▼────────────────────────────────────┐
│                C++ Banking Core                          │
│  (DSA Implementations, Performance-Critical Logic)       │
│  • Fraud Detection (Sliding Window, Trie)                │
│  • Dijkstra's Algorithm                                  │
│  • Max Heap, LRU Cache                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites
- **C++ Compiler** (g++ with C++17 support)
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/banking-dsa-project.git
cd banking-dsa-project
```

### Step 2: Compile C++ Core
```bash
cd cpp-core
g++ -std=c++17 -o banking_system banking_system.cpp
cd ..
```

### Step 3: Setup Backend
```bash
cd backend
npm install
```

### Step 4: Setup Frontend
```bash
cd ../frontend
npm install
```

---

## 🚀 Usage

### Start Backend Server
```bash
cd backend
npm start
```
Server runs on `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

### Run C++ Core (Standalone)
```bash
cd cpp-core
./banking_system
```

---

## 📡 API Documentation

### Customers

#### Get All Customers
```http
GET /api/customers
```

**Response:**
```json
{
  "success": true,
  "customers": [
    {
      "accountNumber": 1001,
      "name": "John Doe",
      "balance": 50000,
      "accountType": "SAVINGS",
      "fraudScore": 0,
      "transactions": [...]
    }
  ]
}
```

#### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "name": "Jane Smith",
  "accountNumber": 1002,
  "balance": 10000,
  "accountType": "CURRENT"
}
```

### Transactions

#### Deposit
```http
POST /api/transactions/deposit
Content-Type: application/json

{
  "accountNumber": 1001,
  "amount": 5000
}
```

#### Withdraw
```http
POST /api/transactions/withdraw
Content-Type: application/json

{
  "accountNumber": 1001,
  "amount": 2000
}
```

#### Transfer
```http
POST /api/transactions/transfer
Content-Type: application/json

{
  "fromAccount": 1001,
  "toAccount": 1002,
  "amount": 1000
}
```

### Fraud Detection

#### Run Fraud Detection
```http
POST /api/fraud/detect
Content-Type: application/json

{
  "accountNumber": 1001
}
```

**Response:**
```json
{
  "success": true,
  "fraudAnalysis": {
    "fraudScore": 25,
    "riskLevel": "MEDIUM",
    "issues": [
      "Large withdrawal amount detected",
      "Circular transfer pattern detected"
    ],
    "timestamp": "2024-02-06T10:30:00Z"
  }
}
```

#### Get Suspicious Accounts
```http
GET /api/fraud/suspicious
```

### Analytics

#### Yearly Summary
```http
GET /api/analytics/yearly/:accountNumber/:year
```

---

## 📁 Project Structure

```
banking-dsa-project/
│
├── cpp-core/                    # C++ Banking Engine
│   ├── banking_system.cpp       # Main DSA implementation
│   └── customers.json           # Data persistence
│
├── backend/                     # Node.js REST API
│   ├── server.js                # Express server
│   └── package.json
│
├── frontend/                    # React Web App
│   ├── src/
│   │   ├── App.jsx              # Main component
│   │   ├── App.css              # Styling
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── README.md                    # This file
```

---

## 🎯 Key Algorithms Summary

| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| **Sliding Window** | O(n) | O(k) | Fraud detection |
| **Trie Search** | O(m) | O(ALPHABET_SIZE * m * n) | Pattern matching |
| **Dijkstra** | O((V+E) log V) | O(V) | Optimal routing |
| **Max Heap** | O(log k) | O(k) | Top-K ranking |
| **LRU Cache** | O(1) | O(capacity) | Performance |
| **HashMap** | O(1) avg | O(n) | Account lookup |

---

## 🔬 Testing

### Test Fraud Detection
1. Create account with ID 1001
2. Perform 5+ transactions within 10 minutes
3. Run fraud detection → Should show MEDIUM/HIGH risk

### Test Pattern Matching
1. Create account
2. Perform: Withdraw → Withdraw → Withdraw → Withdraw → Transfer
3. System detects "Structuring (Smurfing)" pattern

### Test Dijkstra Routing
1. Create accounts: 1001, 1002, 1003
2. Create transfer edges with fees
3. Find optimal route from 1001 → 1003

---

## 🌟 Future Enhancements

- [ ] PostgreSQL integration
- [ ] JWT authentication
- [ ] WebSocket real-time updates
- [ ] Machine Learning fraud detection
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## 👨‍💻 Author

**Your Name**
- GitHub: https://github.com/hariipriyaaa
- LinkedIn: https://www.linkedin.com/in/hari-priya-l/

---

##  License

MIT License - feel free to use this project for learning and portfolio purposes!

---

##  Acknowledgments

- Data Structures and Algorithms concepts
- Modern C++ STL
- React ecosystem
- Node.js community

---

**⭐ Star this repo if you found it helpful!**
