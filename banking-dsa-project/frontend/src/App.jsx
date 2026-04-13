import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [customers, setCustomers] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [suspiciousAccounts, setSuspiciousAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    accountNumber: '',
    balance: '',
    accountType: 'SAVINGS'
  });

  const [transaction, setTransaction] = useState({
    accountNumber: '',
    amount: ''
  });

  const [transfer, setTransfer] = useState({
    fromAccount: '',
    toAccount: '',
    amount: ''
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`);
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch suspicious accounts
  const fetchSuspicious = async () => {
    try {
      const response = await fetch(`${API_URL}/fraud/suspicious`);
      const data = await response.json();
      if (data.success) {
        setSuspiciousAccounts(data.suspicious);
      }
    } catch (error) {
      console.error('Error fetching suspicious accounts:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchSuspicious();
    const interval = setInterval(() => {
      fetchCustomers();
      fetchSuspicious();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add customer
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCustomer,
          accountNumber: parseInt(newCustomer.accountNumber),
          balance: parseFloat(newCustomer.balance)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✓ Customer added successfully!');
        setNewCustomer({ name: '', accountNumber: '', balance: '', accountType: 'SAVINGS' });
        fetchCustomers();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error adding customer: ' + error.message);
    }
    
    setLoading(false);
  };

  // Deposit
  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/transactions/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: parseInt(transaction.accountNumber),
          amount: parseFloat(transaction.amount)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✓ Deposit successful! New balance: ₹${data.balance.toFixed(2)}`);
        setTransaction({ accountNumber: '', amount: '' });
        fetchCustomers();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    
    setLoading(false);
  };

  // Withdraw
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/transactions/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: parseInt(transaction.accountNumber),
          amount: parseFloat(transaction.amount)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✓ Withdrawal successful! New balance: ₹${data.balance.toFixed(2)}`);
        setTransaction({ accountNumber: '', amount: '' });
        fetchCustomers();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    
    setLoading(false);
  };

  // Transfer
  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/transactions/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount: parseInt(transfer.fromAccount),
          toAccount: parseInt(transfer.toAccount),
          amount: parseFloat(transfer.amount)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✓ Transfer successful!');
        setTransfer({ fromAccount: '', toAccount: '', amount: '' });
        fetchCustomers();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    
    setLoading(false);
  };

  // Run fraud detection
  const runFraudDetection = async (accountNumber) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/fraud/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const { fraudAnalysis } = data;
        alert(
          `🔍 Fraud Detection Results\n\n` +
          `Risk Level: ${fraudAnalysis.riskLevel}\n` +
          `Fraud Score: ${fraudAnalysis.fraudScore}\n` +
          `Issues: ${fraudAnalysis.issues.length > 0 ? fraudAnalysis.issues.join(', ') : 'None'}`
        );
        fetchCustomers();
        fetchSuspicious();
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1>🏦 Advanced Banking System</h1>
          <p className="subtitle">Powered by DSA: Dijkstra • Trie • Heap • Sliding Window</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <div className="container">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'customers' ? 'active' : ''} 
            onClick={() => setActiveTab('customers')}
          >
            👥 Customers
          </button>
          <button 
            className={activeTab === 'transactions' ? 'active' : ''} 
            onClick={() => setActiveTab('transactions')}
          >
            💸 Transactions
          </button>
          <button 
            className={activeTab === 'fraud' ? 'active' : ''} 
            onClick={() => setActiveTab('fraud')}
          >
            🚨 Fraud Detection
          </button>
        </div>
      </nav>

      <div className="container main-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Customers</h3>
                <div className="stat-value">{customers.length}</div>
              </div>
              <div className="stat-card">
                <h3>Total Balance</h3>
                <div className="stat-value">
                  ₹{customers.reduce((sum, c) => sum + c.balance, 0).toFixed(2)}
                </div>
              </div>
              <div className="stat-card alert">
                <h3>Suspicious Accounts</h3>
                <div className="stat-value">{suspiciousAccounts.length}</div>
              </div>
              <div className="stat-card">
                <h3>Total Transactions</h3>
                <div className="stat-value">
                  {customers.reduce((sum, c) => sum + (c.transactions?.length || 0), 0)}
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Customers</h2>
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Name</th>
                    <th>Balance</th>
                    <th>Type</th>
                    <th>Fraud Score</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 5).map(customer => (
                    <tr key={customer.accountNumber}>
                      <td>{customer.accountNumber}</td>
                      <td>{customer.name}</td>
                      <td>₹{customer.balance.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${customer.accountType.toLowerCase()}`}>
                          {customer.accountType}
                        </span>
                      </td>
                      <td>
                        <span className={`fraud-score ${customer.fraudScore > 20 ? 'high' : 'low'}`}>
                          {customer.fraudScore || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="customers-section">
            <div className="section-header">
              <h2>Customer Management</h2>
            </div>

            <div className="form-card">
              <h3>Add New Customer</h3>
              <form onSubmit={handleAddCustomer}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Account Number"
                    value={newCustomer.accountNumber}
                    onChange={(e) => setNewCustomer({...newCustomer, accountNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Initial Balance"
                    value={newCustomer.balance}
                    onChange={(e) => setNewCustomer({...newCustomer, balance: e.target.value})}
                    required
                  />
                  <select 
                    value={newCustomer.accountType}
                    onChange={(e) => setNewCustomer({...newCustomer, accountType: e.target.value})}
                  >
                    <option value="SAVINGS">Savings</option>
                    <option value="CURRENT">Current</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : '➕ Add Customer'}
                </button>
              </form>
            </div>

            <div className="customers-list">
              <h3>All Customers</h3>
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Name</th>
                    <th>Balance</th>
                    <th>Type</th>
                    <th>Transactions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.accountNumber}>
                      <td>{customer.accountNumber}</td>
                      <td>{customer.name}</td>
                      <td>₹{customer.balance.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${customer.accountType.toLowerCase()}`}>
                          {customer.accountType}
                        </span>
                      </td>
                      <td>{customer.transactions?.length || 0}</td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => setSelectedAccount(customer)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="transactions-section">
            <div className="transaction-forms">
              <div className="form-card">
                <h3>💰 Deposit</h3>
                <form onSubmit={handleDeposit}>
                  <input
                    type="number"
                    placeholder="Account Number"
                    value={transaction.accountNumber}
                    onChange={(e) => setTransaction({...transaction, accountNumber: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={transaction.amount}
                    onChange={(e) => setTransaction({...transaction, amount: e.target.value})}
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Deposit'}
                  </button>
                </form>
              </div>

              <div className="form-card">
                <h3>💸 Withdraw</h3>
                <form onSubmit={handleWithdraw}>
                  <input
                    type="number"
                    placeholder="Account Number"
                    value={transaction.accountNumber}
                    onChange={(e) => setTransaction({...transaction, accountNumber: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={transaction.amount}
                    onChange={(e) => setTransaction({...transaction, amount: e.target.value})}
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Withdraw'}
                  </button>
                </form>
              </div>

              <div className="form-card">
                <h3>🔄 Transfer</h3>
                <form onSubmit={handleTransfer}>
                  <input
                    type="number"
                    placeholder="From Account"
                    value={transfer.fromAccount}
                    onChange={(e) => setTransfer({...transfer, fromAccount: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="To Account"
                    value={transfer.toAccount}
                    onChange={(e) => setTransfer({...transfer, toAccount: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={transfer.amount}
                    onChange={(e) => setTransfer({...transfer, amount: e.target.value})}
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Transfer'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Fraud Detection Tab */}
        {activeTab === 'fraud' && (
          <div className="fraud-section">
            <div className="fraud-header">
              <h2>🚨 Fraud Detection System</h2>
              <p>Powered by Sliding Window Algorithm, Trie Pattern Matching & Max Heap</p>
            </div>

            <div className="suspicious-accounts">
              <h3>Top Suspicious Accounts</h3>
              {suspiciousAccounts.length === 0 ? (
                <div className="empty-state">
                  <p>✓ No suspicious activity detected</p>
                </div>
              ) : (
                <div className="suspicious-grid">
                  {suspiciousAccounts.map((acc, index) => (
                    <div 
                      key={acc.accountNumber} 
                      className={`suspicious-card ${acc.fraudScore > 50 ? 'high-risk' : 'medium-risk'}`}
                    >
                      <div className="rank">#{index + 1}</div>
                      <h4>{acc.name}</h4>
                      <p>Account: {acc.accountNumber}</p>
                      <div className="fraud-score-large">{acc.fraudScore}</div>
                      <p className="risk-label">
                        {acc.fraudScore > 50 ? '⛔ HIGH RISK' : '⚠️ MEDIUM RISK'}
                      </p>
                      <button 
                        className="btn-small"
                        onClick={() => runFraudDetection(acc.accountNumber)}
                      >
                        Run Analysis
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="fraud-tools">
              <h3>Fraud Detection Tools</h3>
              <div className="tool-cards">
                <div className="tool-card">
                  <h4>🔍 Sliding Window Analysis</h4>
                  <p>Detects rapid transaction patterns within time windows</p>
                  <ul>
                    <li>5+ transactions in 10 minutes</li>
                    <li>Large amounts in short time</li>
                  </ul>
                </div>
                <div className="tool-card">
                  <h4>🌳 Trie Pattern Matching</h4>
                  <p>Identifies suspicious transaction sequences</p>
                  <ul>
                    <li>Structuring (Smurfing)</li>
                    <li>Money Laundering</li>
                    <li>Circular Transfers</li>
                  </ul>
                </div>
                <div className="tool-card">
                  <h4>📊 Max Heap Ranking</h4>
                  <p>Tracks top-K suspicious accounts efficiently</p>
                  <ul>
                    <li>O(log k) insertion</li>
                    <li>Real-time updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedAccount && (
        <div className="modal-overlay" onClick={() => setSelectedAccount(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Account Details</h2>
              <button className="close-btn" onClick={() => setSelectedAccount(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="account-info">
                <p><strong>Name:</strong> {selectedAccount.name}</p>
                <p><strong>Account Number:</strong> {selectedAccount.accountNumber}</p>
                <p><strong>Balance:</strong> ₹{selectedAccount.balance.toFixed(2)}</p>
                <p><strong>Type:</strong> {selectedAccount.accountType}</p>
                <p><strong>Fraud Score:</strong> {selectedAccount.fraudScore || 0}</p>
              </div>
              <h3>Transaction History</h3>
              <div className="transaction-history">
                {selectedAccount.transactions && selectedAccount.transactions.length > 0 ? (
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Date/Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAccount.transactions.map((txn, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`badge ${txn.type.toLowerCase()}`}>
                              {txn.type}
                            </span>
                          </td>
                          <td>₹{txn.amount.toFixed(2)}</td>
                          <td>{txn.dateTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No transactions yet</p>
                )}
              </div>
              <button 
                className="btn-primary"
                onClick={() => runFraudDetection(selectedAccount.accountNumber)}
              >
                🔍 Run Fraud Detection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default App;
