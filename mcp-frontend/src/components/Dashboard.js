import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { FiHome, FiUsers, FiDollarSign, FiLogOut } from 'react-icons/fi';

// Replace the icon components with:
const DashboardIcon = () => <FiHome />;
const PeopleIcon = () => <FiUsers />;
const WalletIcon = () => <FiDollarSign />;
const LogoutIcon = () => <FiLogOut />;

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <div className="modern-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <h3 className="user-name">{user.name}</h3>
              <span className={`role-badge ${user.role}`}>{user.role}</span>
            </div>
          </div>
        </div>
        <nav className="modern-nav">
          <NavLink to="/dashboard" className="nav-item">
            <DashboardIcon />
            <span>Dashboard</span>
          </NavLink>
          {user.role === 'mcp' && (
            <NavLink to="/dashboard/partners" className="nav-item">
              <PeopleIcon />
              <span>Partners</span>
            </NavLink>
          )}
          <NavLink to="/dashboard/wallet" className="nav-item">
            <WalletIcon />
            <span>Wallet</span>
          </NavLink>
        </nav>
        <button onClick={onLogout} className="logout-btn">
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
      <div className="modern-content">
        <div className="content-header">
          <h2>{/* Dynamic title based on route */}</h2>
        </div>
        <div className="content-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;