const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to C++ executable (will be compiled)
const CPP_EXECUTABLE = path.join(__dirname, '../cpp-core/banking_system');
const DATA_FILE = path.join(__dirname, '../cpp-core/customers.json');

// ================== HELPER FUNCTIONS ==================

// Execute C++ command and return result
function executeCppCommand(command, args) {
  return new Promise((resolve, reject) => {
    const cpp = spawn(CPP_EXECUTABLE, [command, ...args]);
    
    let output = '';
    let error = '';
    
    cpp.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    cpp.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    cpp.on('close', (code) => {
      if (code !== 0) {
        reject({ success: false, error: error || 'Command failed' });
      } else {
        resolve({ success: true, data: output });
      }
    });
  });
}

// Read customers data from JSON
function getCustomersData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return { customers: [] };
  } catch (err) {
    console.error('Error reading data:', err);
    return { customers: [] };
  }
}

// ================== API ENDPOINTS ==================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Banking API is running' });
});

// Get all customers
app.get('/api/customers', (req, res) => {
  try {
    const data = getCustomersData();
    res.json({ success: true, customers: data.customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get customer by account number
app.get('/api/customers/:accountNumber', (req, res) => {
  try {
    const data = getCustomersData();
    const customer = data.customers.find(
      c => c.accountNumber === parseInt(req.params.accountNumber)
    );
    
    if (customer) {
      res.json({ success: true, customer });
    } else {
      res.status(404).json({ success: false, error: 'Customer not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, accountNumber, balance, accountType } = req.body;
    
    // Validation
    if (!name || !accountNumber || balance === undefined || !accountType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Add customer to in-memory store (for demo)
    // In production, this would interact with C++ core
    const data = getCustomersData();
    
    // Check if account already exists
    if (data.customers.find(c => c.accountNumber === accountNumber)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Account number already exists' 
      });
    }
    
    const newCustomer = {
      name,
      accountNumber,
      balance: parseFloat(balance),
      accountType,
      fraudScore: 0,
      transactions: []
    };
    
    data.customers.push(newCustomer);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ success: true, customer: newCustomer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deposit
app.post('/api/transactions/deposit', async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;
    
    if (!accountNumber || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid deposit data' 
      });
    }
    
    const data = getCustomersData();
    const customer = data.customers.find(c => c.accountNumber === accountNumber);
    
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    // Update balance
    customer.balance += parseFloat(amount);
    
    // Add transaction
    const transaction = {
      type: 'Credit',
      amount: parseFloat(amount),
      dateTime: new Date().toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    };
    
    customer.transactions.push(transaction);
    
    // Save
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Deposit successful',
      balance: customer.balance,
      transaction
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Withdraw
app.post('/api/transactions/withdraw', async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;
    
    if (!accountNumber || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid withdrawal data' 
      });
    }
    
    const data = getCustomersData();
    const customer = data.customers.find(c => c.accountNumber === accountNumber);
    
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    if (customer.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient balance' 
      });
    }
    
    // Update balance
    customer.balance -= parseFloat(amount);
    
    // Add transaction
    const transaction = {
      type: 'Debit',
      amount: parseFloat(amount),
      dateTime: new Date().toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    };
    
    customer.transactions.push(transaction);
    
    // Save
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Withdrawal successful',
      balance: customer.balance,
      transaction
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Transfer
app.post('/api/transactions/transfer', async (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;
    
    if (!fromAccount || !toAccount || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid transfer data' 
      });
    }
    
    if (fromAccount === toAccount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot transfer to same account' 
      });
    }
    
    const data = getCustomersData();
    const sender = data.customers.find(c => c.accountNumber === fromAccount);
    const receiver = data.customers.find(c => c.accountNumber === toAccount);
    
    if (!sender || !receiver) {
      return res.status(404).json({ 
        success: false, 
        error: 'One or both accounts not found' 
      });
    }
    
    if (sender.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient balance' 
      });
    }
    
    // Update balances
    sender.balance -= parseFloat(amount);
    receiver.balance += parseFloat(amount);
    
    // Add transactions
    const dateTime = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-');
    
    sender.transactions.push({
      type: 'Transfer-Out',
      amount: parseFloat(amount),
      dateTime,
      to: toAccount
    });
    
    receiver.transactions.push({
      type: 'Transfer-In',
      amount: parseFloat(amount),
      dateTime,
      from: fromAccount
    });
    
    // Save
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Transfer successful',
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== FRAUD DETECTION ENDPOINTS ==================

// Run fraud detection for account
app.post('/api/fraud/detect', async (req, res) => {
  try {
    const { accountNumber } = req.body;
    
    if (!accountNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Account number required' 
      });
    }
    
    const data = getCustomersData();
    const customer = data.customers.find(c => c.accountNumber === accountNumber);
    
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    // Sliding window fraud detection
    const fraudAnalysis = analyzeFraud(customer);
    
    // Update fraud score
    customer.fraudScore = fraudAnalysis.fraudScore;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      fraudAnalysis
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get top suspicious accounts
app.get('/api/fraud/suspicious', (req, res) => {
  try {
    const data = getCustomersData();
    
    // Sort by fraud score
    const suspicious = data.customers
      .filter(c => c.fraudScore > 0)
      .sort((a, b) => b.fraudScore - a.fraudScore)
      .slice(0, 5)
      .map(c => ({
        accountNumber: c.accountNumber,
        name: c.name,
        fraudScore: c.fraudScore,
        balance: c.balance
      }));
    
    res.json({ success: true, suspicious });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== ANALYTICS ENDPOINTS ==================

// Get yearly summary
app.get('/api/analytics/yearly/:accountNumber/:year', (req, res) => {
  try {
    const { accountNumber, year } = req.params;
    
    const data = getCustomersData();
    const customer = data.customers.find(
      c => c.accountNumber === parseInt(accountNumber)
    );
    
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    let totalCredit = 0;
    let totalDebit = 0;
    
    customer.transactions.forEach(txn => {
      const txnYear = txn.dateTime.split('-')[2].split(' ')[0];
      
      if (txnYear === year) {
        if (txn.type === 'Credit' || txn.type === 'Transfer-In') {
          totalCredit += txn.amount;
        } else {
          totalDebit += txn.amount;
        }
      }
    });
    
    res.json({ 
      success: true, 
      summary: {
        year,
        totalCredit,
        totalDebit,
        netChange: totalCredit - totalDebit
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== DIJKSTRA ROUTE FINDING ==================

app.post('/api/transfer/optimal-route', (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;
    
    // For demo, return simple direct route
    // In production, implement Dijkstra's algorithm
    res.json({
      success: true,
      route: [fromAccount, toAccount],
      totalFee: amount * 0.01,
      steps: [
        { from: fromAccount, to: toAccount, fee: amount * 0.01 }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== FRAUD ANALYSIS HELPER ==================

function analyzeFraud(customer) {
  const WINDOW_MINUTES = 10;
  const THRESHOLD_COUNT = 5;
  const THRESHOLD_AMOUNT = 50000;
  
  let fraudScore = customer.fraudScore || 0;
  const issues = [];
  
  // Sliding window analysis
  const transactions = customer.transactions;
  
  if (transactions.length >= THRESHOLD_COUNT) {
    // Check for rapid transactions
    for (let i = transactions.length - 1; i >= Math.max(0, transactions.length - THRESHOLD_COUNT); i--) {
      // Simplified check (in real implementation, parse timestamps)
      if (transactions[i].type === 'Debit' || transactions[i].type === 'Transfer-Out') {
        fraudScore += 2;
      }
    }
    
    // Check for large withdrawals
    const recentTotal = transactions
      .slice(-5)
      .filter(t => t.type === 'Debit' || t.type === 'Transfer-Out')
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (recentTotal > THRESHOLD_AMOUNT) {
      fraudScore += 20;
      issues.push('Large withdrawal amount detected');
    }
  }
  
  // Pattern detection
  const pattern = transactions
    .slice(-10)
    .map(t => {
      if (t.type === 'Credit') return 'D';
      if (t.type === 'Debit') return 'W';
      if (t.type.includes('Transfer')) return 'T';
      return '';
    })
    .join('');
  
  if (pattern.includes('WWWWT')) {
    fraudScore += 15;
    issues.push('Structuring pattern detected');
  }
  
  if (pattern.includes('TTTTT')) {
    fraudScore += 15;
    issues.push('Circular transfer pattern detected');
  }
  
  let riskLevel = 'LOW';
  if (fraudScore > 50) riskLevel = 'HIGH';
  else if (fraudScore > 20) riskLevel = 'MEDIUM';
  
  return {
    fraudScore,
    riskLevel,
    issues,
    timestamp: new Date().toISOString()
  };
}

// ================== START SERVER ==================

app.listen(PORT, () => {
  console.log(`🏦 Banking API running on http://localhost:${PORT}`);
  console.log(`📊 Fraud detection system active`);
  console.log(`🔍 DSA algorithms loaded`);
  
  // Initialize data file if doesn't exist
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ customers: [] }, null, 2));
    console.log('✓ Data file initialized');
  }
});

module.exports = app;
