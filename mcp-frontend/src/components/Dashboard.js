import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="user-profile">
          <h3>{user.name}</h3>
          <p className="role-badge">{user.role}</p>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            {user.role === 'mcp' && (
              <>
                {/* <li>
                  <Link to="/dashboard/orders">My Orders</Link>
                </li> */}
                <li>
                  <Link to="/dashboard/partners">Partners</Link>
                </li>
              </>
            )}
            <li>
              <Link to="/dashboard/wallet">Wallet</Link>
            </li>
            <li>
              <button onClick={onLogout} className="btn btn-secondary">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;