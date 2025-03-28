import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import PartnerList from './components/PartnerList';
import Wallet from './components/Wallet';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />}>
          <Route index element={user?.role === 'mcp' ? (
            <>
              <OrderForm user={user} />
              <OrderList user={user} />
            </>
          ) : (
            <OrderList user={user} />
          )} />
          <Route path="partners" element={<PartnerList user={user} />} />
          <Route path="wallet" element={<Wallet user={user} />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;