import React, { useState, useEffect } from 'react';

// In src/components/Wallet.js
function Wallet({ user }) {
    const [walletData, setWalletData] = useState({
      balance: user?.wallet || 0,
      transactions: user?.transactions || []
    });
  
    // Add this useEffect to keep wallet data updated
    useEffect(() => {
      const fetchWalletData = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5001/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setWalletData({
            balance: data.wallet,
            transactions: data.transactions
          });
        } catch (err) {
          console.error('Failed to fetch wallet data:', err);
        }
      };
      
      fetchWalletData();
    }, [user]);
  
    return (
      <div className="container">
        <div className="wallet-summary">
          <h2 className="content-title">Wallet Balance: <span className="wallet-amount">${walletData.balance}</span></h2>
        </div>
        <div className="transaction-history">
          <h3 className="content-subtitle">Transaction History</h3>
          {walletData.transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet</p>
            </div>
          ) : (
            <ul className="transaction-list">
              {walletData.transactions.map((txn, index) => (
                <li key={index} className={`transaction-item ${txn.amount > 0 ? "credit" : "debit"}`}>
                  <div className="txn-main">
                    <p className="txn-desc">{txn.description}</p>
                    <p className={`txn-amount ${txn.amount < 0 ? "negative" : ""}`}>
  {txn.amount > 0 ? "+" : "-"}${Math.abs(txn.amount).toFixed(2)}
</p>
                  </div>
                  <div className="txn-meta">
                    <p className="txn-date">{new Date(txn.date).toLocaleDateString()}</p>
                    <p className="txn-status">{txn.type}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

export default Wallet;