#include <iostream>
#include <unordered_map>
#include <vector>
#include <queue>
#include <ctime>
#include <limits>
#include <iomanip>
#include <algorithm>
#include <set>
#include <deque>
#include <sstream>
#include <fstream>
#include <cmath>
#include <list>

using namespace std;

// ================== ENUMS & CONSTANTS ==================

enum AccountType { SAVINGS, CURRENT };

const int FRAUD_WINDOW_MINUTES = 10;
const int FRAUD_THRESHOLD_COUNT = 5;
const double FRAUD_THRESHOLD_AMOUNT = 50000.0;
const int TOP_K_SUSPICIOUS = 5;

// ================== STRUCTS ==================

struct Transaction {
    string type;
    long double amount;
    string dateTime;
    time_t timestamp;
    
    Transaction() {}
    Transaction(string t, long double a, string dt, time_t ts)
        : type(t), amount(a), dateTime(dt), timestamp(ts) {}
};

struct Customer {
    string name;
    int accountNumber;
    long double balance;
    AccountType accountType;
    vector<Transaction> history;
    int fraudScore;
    
    Customer() : fraudScore(0) {}
    Customer(string n, int acc, long double bal, AccountType t)
        : name(n), accountNumber(acc), balance(bal), accountType(t), fraudScore(0) {}
};

struct TransferEdge {
    int to;
    double fee;
    TransferEdge(int t, double f) : to(t), fee(f) {}
};

struct SuspiciousAccount {
    int accountNumber;
    int fraudScore;
    
    bool operator<(const SuspiciousAccount& other) const {
        return fraudScore < other.fraudScore; // Max heap
    }
};

// ================== TRIE FOR PATTERN MATCHING ==================

class TrieNode {
public:
    unordered_map<char, TrieNode*> children;
    bool isEndOfPattern;
    string patternName;
    
    TrieNode() : isEndOfPattern(false) {}
};

class SuspiciousPatternTrie {
private:
    TrieNode* root;
    
public:
    SuspiciousPatternTrie() {
        root = new TrieNode();
        initializeSuspiciousPatterns();
    }
    
    void insert(string pattern, string name) {
        TrieNode* curr = root;
        for (char c : pattern) {
            if (!curr->children.count(c)) {
                curr->children[c] = new TrieNode();
            }
            curr = curr->children[c];
        }
        curr->isEndOfPattern = true;
        curr->patternName = name;
    }
    
    vector<string> searchPatterns(string sequence) {
        vector<string> matches;
        TrieNode* curr = root;
        
        for (char c : sequence) {
            if (!curr->children.count(c)) break;
            curr = curr->children[c];
            if (curr->isEndOfPattern) {
                matches.push_back(curr->patternName);
            }
        }
        return matches;
    }
    
    void initializeSuspiciousPatterns() {
        // Pattern: Multiple small withdrawals followed by large transfer
        insert("WWWWT", "Structuring (Smurfing)");
        
        // Pattern: Rapid deposits and withdrawals
        insert("DDDWWW", "Rapid Cycling");
        
        // Pattern: Large deposit followed by immediate transfers
        insert("DTTT", "Money Laundering");
        
        // Pattern: Round-robin transfers
        insert("TTTTT", "Circular Transfer");
    }
};

// ================== GLOBAL DATA STRUCTURES ==================

unordered_map<int, Customer> customers;
unordered_map<int, vector<TransferEdge>> transferGraph;
priority_queue<SuspiciousAccount> suspiciousHeap;
SuspiciousPatternTrie patternTrie;

// LRU Cache for frequently accessed accounts
class LRUCache {
private:
    int capacity;
    list<pair<int, Customer*>> cache;
    unordered_map<int, list<pair<int, Customer*>>::iterator> map;
    
public:
    LRUCache(int cap) : capacity(cap) {}
    
    Customer* get(int accountNumber) {
        if (!map.count(accountNumber)) return nullptr;
        
        auto it = map[accountNumber];
        cache.splice(cache.begin(), cache, it);
        return it->second;
    }
    
    void put(int accountNumber, Customer* customer) {
        if (map.count(accountNumber)) {
            cache.erase(map[accountNumber]);
        }
        
        cache.push_front({accountNumber, customer});
        map[accountNumber] = cache.begin();
        
        if (cache.size() > capacity) {
            auto last = cache.back();
            map.erase(last.first);
            cache.pop_back();
        }
    }
};

LRUCache accountCache(100);

// ================== UTILITY FUNCTIONS ==================

void clearInput() {
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

time_t stringToTimestamp(const string& dateTime) {
    struct tm tm = {};
    istringstream ss(dateTime);
    ss >> get_time(&tm, "%d-%m-%Y %H:%M:%S");
    return mktime(&tm);
}

string getCurrentDateTime() {
    time_t now = time(0);
    tm* ltm = localtime(&now);
    char buffer[30];
    strftime(buffer, sizeof(buffer), "%d-%m-%Y %H:%M:%S", ltm);
    return string(buffer);
}

time_t getCurrentTimestamp() {
    return time(0);
}

// ================== FRAUD DETECTION (SLIDING WINDOW) ==================

bool detectSlidingWindowFraud(int acc) {
    if (!customers.count(acc)) return false;
    
    auto& history = customers[acc].history;
    if (history.size() < FRAUD_THRESHOLD_COUNT) return false;
    
    deque<Transaction> window;
    int suspiciousCount = 0;
    
    for (auto& txn : history) {
        // Remove transactions outside time window
        while (!window.empty() && 
               (txn.timestamp - window.front().timestamp) > FRAUD_WINDOW_MINUTES * 60) {
            window.pop_front();
        }
        
        window.push_back(txn);
        
        // Check if window has too many transactions
        if (window.size() >= FRAUD_THRESHOLD_COUNT) {
            suspiciousCount++;
            customers[acc].fraudScore += 10;
        }
        
        // Check for large amount in short time
        double totalAmount = 0;
        for (auto& w : window) {
            if (w.type == "Debit" || w.type == "Transfer-Out") {
                totalAmount += w.amount;
            }
        }
        
        if (totalAmount > FRAUD_THRESHOLD_AMOUNT && window.size() <= 3) {
            customers[acc].fraudScore += 20;
            suspiciousCount++;
        }
    }
    
    return suspiciousCount > 0;
}

// Detect suspicious patterns using Trie
vector<string> detectSuspiciousPatterns(int acc) {
    if (!customers.count(acc)) return {};
    
    string sequence = "";
    auto& history = customers[acc].history;
    
    // Build sequence string (last 10 transactions)
    int start = max(0, (int)history.size() - 10);
    for (int i = start; i < history.size(); i++) {
        if (history[i].type == "Credit") sequence += 'D';
        else if (history[i].type == "Debit") sequence += 'W';
        else if (history[i].type.find("Transfer") != string::npos) sequence += 'T';
    }
    
    auto patterns = patternTrie.searchPatterns(sequence);
    
    if (!patterns.empty()) {
        customers[acc].fraudScore += 15 * patterns.size();
    }
    
    return patterns;
}

// Update top-K suspicious accounts heap
void updateSuspiciousHeap() {
    priority_queue<SuspiciousAccount> newHeap;
    
    for (auto it = customers.begin(); it != customers.end(); ++it) {
        int acc = it->first;
        Customer& customer = it->second;
        if (customer.fraudScore > 0) {
            newHeap.push({acc, customer.fraudScore});
        }
    }
    
    suspiciousHeap = newHeap;
}

void showTopSuspiciousAccounts() {
    updateSuspiciousHeap();
    
    cout << "\n🚨 TOP " << TOP_K_SUSPICIOUS << " SUSPICIOUS ACCOUNTS 🚨\n";
    cout << "==========================================\n";
    
    priority_queue<SuspiciousAccount> temp = suspiciousHeap;
    int count = 0;
    
    while (!temp.empty() && count < TOP_K_SUSPICIOUS) {
        auto acc = temp.top();
        temp.pop();
        
        cout << count + 1 << ". Account: " << acc.accountNumber 
             << " | Fraud Score: " << acc.fraudScore 
             << " | Name: " << customers[acc.accountNumber].name << endl;
        count++;
    }
    
    if (count == 0) {
        cout << "No suspicious accounts detected.\n";
    }
}

void runFraudDetection(int acc) {
    if (!customers.count(acc)) {
        cout << "Account not found.\n";
        return;
    }
    
    cout << "\n🔍 FRAUD DETECTION REPORT\n";
    cout << "==========================================\n";
    cout << "Account: " << acc << " (" << customers[acc].name << ")\n\n";
    
    // Sliding window detection
    bool slidingWindowFraud = detectSlidingWindowFraud(acc);
    cout << "Sliding Window Analysis: " 
         << (slidingWindowFraud ? "⚠️  SUSPICIOUS" : "✓ Clear") << endl;
    
    // Pattern detection
    auto patterns = detectSuspiciousPatterns(acc);
    cout << "Pattern Analysis: ";
    if (patterns.empty()) {
        cout << "✓ Clear\n";
    } else {
        cout << "⚠️  SUSPICIOUS\n";
        for (auto& p : patterns) {
            cout << "  - Detected: " << p << endl;
        }
    }
    
    cout << "\nFraud Score: " << customers[acc].fraudScore << endl;
    
    if (customers[acc].fraudScore > 50) {
        cout << "⛔ HIGH RISK - Recommend account review\n";
    } else if (customers[acc].fraudScore > 20) {
        cout << "⚠️  MEDIUM RISK - Monitor closely\n";
    } else {
        cout << "✓ LOW RISK\n";
    }
}

// ================== DIJKSTRA'S ALGORITHM ==================

struct DijkstraNode {
    int account;
    double cost;
    
    bool operator>(const DijkstraNode& other) const {
        return cost > other.cost;
    }
};

vector<int> dijkstraOptimalRoute(int source, int destination, double& totalFee) {
    if (!customers.count(source) || !customers.count(destination)) {
        return {};
    }
    
    unordered_map<int, double> dist;
    unordered_map<int, int> parent;
    priority_queue<DijkstraNode, vector<DijkstraNode>, greater<DijkstraNode>> pq;
    
    for (auto it = customers.begin(); it != customers.end(); ++it) {
        int acc = it->first;
        dist[acc] = numeric_limits<double>::max();
    }
    
    dist[source] = 0;
    pq.push({source, 0});
    
    while (!pq.empty()) {
        DijkstraNode current = pq.top();
        pq.pop();
        int u = current.account;
        double cost = current.cost;
        
        if (cost > dist[u]) continue;
        
        for (auto& edge : transferGraph[u]) {
            int v = edge.to;
            double newCost = dist[u] + edge.fee;
            
            if (newCost < dist[v]) {
                dist[v] = newCost;
                parent[v] = u;
                pq.push({v, newCost});
            }
        }
    }
    
    if (dist[destination] == numeric_limits<double>::max()) {
        return {};
    }
    
    totalFee = dist[destination];
    
    // Reconstruct path
    vector<int> path;
    int curr = destination;
    while (curr != source) {
        path.push_back(curr);
        curr = parent[curr];
    }
    path.push_back(source);
    reverse(path.begin(), path.end());
    
    return path;
}

void findOptimalTransferRoute(int from, int to, double amount) {
    double totalFee = 0;
    auto route = dijkstraOptimalRoute(from, to, totalFee);
    
    if (route.empty()) {
        cout << "No transfer route available.\n";
        return;
    }
    
    cout << "\n💰 OPTIMAL TRANSFER ROUTE\n";
    cout << "==========================================\n";
    cout << "From: " << from << " → To: " << to << endl;
    cout << "Amount: $" << fixed << setprecision(2) << amount << endl;
    cout << "Total Fee: $" << totalFee << endl;
    cout << "\nRoute: ";
    
    for (int i = 0; i < route.size(); i++) {
        cout << route[i];
        if (i < route.size() - 1) cout << " → ";
    }
    cout << "\n\nExecute transfer? (1=Yes, 0=No): ";
}

// ================== CORE BANKING OPERATIONS ==================

void addCustomer() {
    string name;
    int acc;
    long double bal;
    int type;
    
    cout << "Customer Name: ";
    cin >> name;
    cout << "Account Number: ";
    cin >> acc;
    cout << "Initial Balance: ";
    cin >> bal;
    
    if (cin.fail() || bal < 0) {
        cout << "Invalid balance input.\n";
        clearInput();
        return;
    }
    
    cout << "Account Type (1=Savings, 2=Current): ";
    cin >> type;
    
    AccountType accType = (type == 1) ? SAVINGS : CURRENT;
    
    if ((accType == SAVINGS && bal < 1000) ||
        (accType == CURRENT && bal < 500)) {
        bal = (accType == SAVINGS) ? 1000 : 500;
        cout << "Minimum balance enforced.\n";
    }
    
    customers[acc] = Customer(name, acc, bal, accType);
    accountCache.put(acc, &customers[acc]);
    
    cout << "✓ Customer added successfully.\n";
}

void deposit(int acc, long double amt) {
    if (!customers.count(acc) || amt <= 0) {
        cout << "Invalid deposit.\n";
        return;
    }
    
    customers[acc].balance += amt;
    time_t now = getCurrentTimestamp();
    customers[acc].history.push_back(
        Transaction("Credit", amt, getCurrentDateTime(), now)
    );
    
    accountCache.put(acc, &customers[acc]);
    
    cout << fixed << setprecision(2);
    cout << "✓ Deposit successful. Balance: $" << customers[acc].balance << endl;
}

void withdraw(int acc, long double amt) {
    if (!customers.count(acc) || amt <= 0) {
        cout << "Invalid withdrawal.\n";
        return;
    }
    if (amt > customers[acc].balance) {
        cout << "Insufficient balance.\n";
        return;
    }
    
    customers[acc].balance -= amt;
    time_t now = getCurrentTimestamp();
    customers[acc].history.push_back(
        Transaction("Debit", amt, getCurrentDateTime(), now)
    );
    
    accountCache.put(acc, &customers[acc]);
    
    cout << fixed << setprecision(2);
    cout << "✓ Withdrawal successful. Balance: $" << customers[acc].balance << endl;
}

void transferMoney(int from, int to, long double amt) {
    if (from == to || amt <= 0 ||
        !customers.count(from) || !customers.count(to)) {
        cout << "Invalid transfer.\n";
        return;
    }
    if (amt > customers[from].balance) {
        cout << "Insufficient balance for transfer.\n";
        return;
    }
    
    customers[from].balance -= amt;
    customers[to].balance += amt;
    
    time_t now = getCurrentTimestamp();
    customers[from].history.push_back(
        Transaction("Transfer-Out", amt, getCurrentDateTime(), now)
    );
    customers[to].history.push_back(
        Transaction("Transfer-In", amt, getCurrentDateTime(), now)
    );
    
    // Add edge to transfer graph with random fee
    double fee = amt * 0.01; // 1% fee
    transferGraph[from].push_back(TransferEdge(to, fee));
    
    accountCache.put(from, &customers[from]);
    accountCache.put(to, &customers[to]);
    
    cout << "✓ Transfer successful.\n";
}

void yearlyCreditDebitSummary(int acc, int year) {
    if (!customers.count(acc)) {
        cout << "Account not found.\n";
        return;
    }
    
    long double credit = 0, debit = 0;
    
    for (auto& t : customers[acc].history) {
        int txnYear = stoi(t.dateTime.substr(6, 4));
        if (txnYear == year) {
            if (t.type == "Credit" || t.type == "Transfer-In")
                credit += t.amount;
            else
                debit += t.amount;
        }
    }
    
    cout << fixed << setprecision(2);
    cout << "\n📊 YEAR " << year << " SUMMARY\n";
    cout << "==========================================\n";
    cout << "Total Credit:  $" << credit << endl;
    cout << "Total Debit:   $" << debit << endl;
    cout << "Net Change:    $" << (credit - debit) << endl;
}

void exportToJSON() {
    ofstream file("customers.json");
    
    file << "{\n  \"customers\": [\n";
    
    bool first = true;
    for (auto it = customers.begin(); it != customers.end(); ++it) {
        int acc = it->first;
        Customer& cust = it->second;
        
        if (!first) file << ",\n";
        first = false;
        
        file << "    {\n";
        file << "      \"accountNumber\": " << acc << ",\n";
        file << "      \"name\": \"" << cust.name << "\",\n";
        file << "      \"balance\": " << cust.balance << ",\n";
        file << "      \"accountType\": \"" << (cust.accountType == SAVINGS ? "SAVINGS" : "CURRENT") << "\",\n";
        file << "      \"fraudScore\": " << cust.fraudScore << ",\n";
        file << "      \"transactions\": [\n";
        
        for (int i = 0; i < cust.history.size(); i++) {
            auto& txn = cust.history[i];
            file << "        {\"type\": \"" << txn.type << "\", \"amount\": " 
                 << txn.amount << ", \"dateTime\": \"" << txn.dateTime << "\"}";
            if (i < cust.history.size() - 1) file << ",";
            file << "\n";
        }
        
        file << "      ]\n";
        file << "    }";
    }
    
    file << "\n  ]\n}\n";
    file.close();
    
    cout << "✓ Data exported to customers.json\n";
}

// ================== MAIN MENU ==================

int main() {
    int choice;
    
    cout << "🏦 ADVANCED BANKING SYSTEM WITH DSA 🏦\n";
    cout << "=====================================\n\n";
    
    while (true) {
        cout << "\n--- MAIN MENU ---\n";
        cout << "1.  Add Customer\n";
        cout << "2.  Deposit\n";
        cout << "3.  Withdraw\n";
        cout << "4.  Transfer Money\n";
        cout << "5.  Year-wise Summary\n";
        cout << "6.  🔍 Run Fraud Detection\n";
        cout << "7.  🚨 Show Top Suspicious Accounts\n";
        cout << "8.  🗺️  Find Optimal Transfer Route\n";
        cout << "9.  💾 Export Data to JSON\n";
        cout << "10. Exit\n";
        cout << "Choice: ";
        
        cin >> choice;
        clearInput();
        
        if (choice == 1) {
            addCustomer();
        }
        else if (choice == 2) {
            int acc; long double amt;
            cout << "Account Number: "; cin >> acc;
            cout << "Amount: "; cin >> amt;
            deposit(acc, amt);
        }
        else if (choice == 3) {
            int acc; long double amt;
            cout << "Account Number: "; cin >> acc;
            cout << "Amount: "; cin >> amt;
            withdraw(acc, amt);
        }
        else if (choice == 4) {
            int from, to; long double amt;
            cout << "From Account: "; cin >> from;
            cout << "To Account: "; cin >> to;
            cout << "Amount: "; cin >> amt;
            transferMoney(from, to, amt);
        }
        else if (choice == 5) {
            int acc, year;
            cout << "Account Number: "; cin >> acc;
            cout << "Year (YYYY): "; cin >> year;
            yearlyCreditDebitSummary(acc, year);
        }
        else if (choice == 6) {
            int acc;
            cout << "Account Number: "; cin >> acc;
            runFraudDetection(acc);
        }
        else if (choice == 7) {
            showTopSuspiciousAccounts();
        }
        else if (choice == 8) {
            int from, to; double amt;
            cout << "From Account: "; cin >> from;
            cout << "To Account: "; cin >> to;
            cout << "Amount: "; cin >> amt;
            findOptimalTransferRoute(from, to, amt);
        }
        else if (choice == 9) {
            exportToJSON();
        }
        else if (choice == 10) {
            cout << "Exiting program. Goodbye!\n";
            break;
        }
        else {
            cout << "Invalid choice.\n";
        }
    }
    
    return 0;
}
