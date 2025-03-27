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
      <div className="wallet">
        <h3>Wallet Balance: ${walletData.balance}</h3>
        
        <h4>Transaction History</h4>
        {walletData.transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <ul>
            {walletData.transactions.map((txn, index) => (
              <li key={index}>
                <p>{txn.description}</p>
                <p>Amount: {txn.amount > 0 ? '+' : ''}{txn.amount}</p>
                <p>Date: {new Date(txn.date).toLocaleString()}</p>
                <p>Type: {txn.type}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

export default Wallet;