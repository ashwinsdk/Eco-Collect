import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <header>
        <h2>Welcome, {user?.name} ({user?.role})</h2>
        <button onClick={onLogout}>Logout</button>
      </header>
      <nav>
        <Link to="/dashboard">Orders</Link>
        {user?.role === 'mcp' && <Link to="/dashboard/partners">Partners</Link>}
        <Link to="/dashboard/wallet">Wallet</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// Make sure to export as default
export default Dashboard;