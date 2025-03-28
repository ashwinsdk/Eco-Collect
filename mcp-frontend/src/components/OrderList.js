import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function OrderList({ user }) {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
  
        // Fetch orders
        const ordersEndpoint = user.role === 'mcp' ? '/mcp/orders' : '/partner/orders';
        const ordersRes = await fetch(`http://localhost:5001${ordersEndpoint}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (ordersRes.status === 401) {
          // Handle unauthorized (token expired/invalid)
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/auth');
          return;
        }
  
        if (!ordersRes.ok) {
          throw new Error('Failed to fetch orders');
        }
  
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
  
        // Fetch partners if MCP user
        if (user.role === 'mcp') {
          const partnersRes = await fetch('http://localhost:5001/mcp/partners', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
  
          if (partnersRes.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/auth');
            return;
          }
  
          if (!partnersRes.ok) {
            throw new Error('Failed to fetch partners');
          }
  
          const partnersData = await partnersRes.json();
          setPartners(partnersData);
        }
  
      } catch (err) {
        setError(err.message);
        if (err.message.includes('401')) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user.role, navigate]);

  const assignOrder = async (orderId) => {
    try {
      if (!selectedPartner) throw new Error('Please select a partner');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/orders/${orderId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ partnerId: selectedPartner })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
        return;
      }
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to assign order');
      
      setOrders(orders.map(order => 
        order._id === orderId ? data : order
      ));
      setSelectedPartner('');
      alert('Order assigned successfully!');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('401')) {
        navigate('/auth');
      }
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
        return;
      }
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update order');
      
      setOrders(orders.map(order => 
        order._id === orderId ? data : order
      ));
      
      if (status === 'rejected') {
        alert('Order rejected. Amount has been refunded to MCP wallet.');
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('401')) {
        navigate('/auth');
      }
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="modern-order-list">
      <div className="list-header">
        <h2>{user.role === 'mcp' ? 'Your Orders' : 'Assigned Orders'}</h2>
        <div className="status-filters">{/* Add status filters if needed */}</div>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found</p>
          {user.role === 'mcp' && (
            <Link to="/dashboard/new-order" className="landing-btn landing-btn-primary">Create New Order</Link>
          )}
        </div>
      ) : (
        <div className="order-grid">
          {orders.map(order => (
            <div key={order._id} className={`order-card ${order.status}`}>
              <div className="card-header">
                <h3 className="card-title">{order.description}</h3>
                <span className={`status-badge ${order.status}`}>{order.status}</span>
              </div>
              <div className="card-body">
                <div className="order-meta">
                  <div>
                    <span className="meta-label">Amount</span>
                    <span className="meta-value">${order.amount}</span>
                  </div>
                  {order.partner && (
                    <div>
                      <span className="meta-label">Partner</span>
                      <span className="meta-value">
                        {typeof order.partner === 'object' ? order.partner.name : partners.find(p => p._id === order.partner)?.name || 'Unassigned'}
                      </span>
                    </div>
                  )}
                </div>
                {/* Action Buttons */}
                <div className="card-actions">
                  {user.role === 'mcp' && order.status === 'pending' && (
                    <div className="assign-section">
                      <select value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value)} className="partner-select">
                        <option value="">Select Partner</option>
                        {partners.map(partner => (
                          <option key={partner._id} value={partner._id}>{partner.name}</option>
                        ))}
                      </select>
                      <button onClick={() => assignOrder(order._id)} disabled={!selectedPartner} className="action-btn accept">
                        Assign
                      </button>
                    </div>
                  )}
                  {user.role === 'partner' && order.status === 'assigned' && (
                    <div className="action-buttons">
                      <button onClick={() => updateOrderStatus(order._id, 'accepted')} className="action-btn accept">
                        Accept
                      </button>
                      <button onClick={() => updateOrderStatus(order._id, 'rejected')} className="action-btn reject">
                        Reject
                      </button>
                    </div>
                  )}
                  {user.role === 'partner' && order.status === 'accepted' && (
                    <button onClick={() => updateOrderStatus(order._id, 'completed')} className="action-btn complete">
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default OrderList;