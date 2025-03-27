import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
        
        // Fetch orders based on user role
        const ordersEndpoint = user.role === 'mcp' ? '/mcp/orders' : '/partner/orders';
        const ordersRes = await fetch(`http://localhost:5001${ordersEndpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

        // Fetch partners if MCP user
        if (user.role === 'mcp') {
          const partnersRes = await fetch('http://localhost:5001/mcp/partners', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const partnersData = await partnersRes.json();
          setPartners(partnersData);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role]);

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
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to assign order');
      
      // Update local orders state
      setOrders(orders.map(order => 
        order._id === orderId ? data : order
      ));
      setSelectedPartner('');
      alert('Order assigned successfully!');
    } catch (err) {
      setError(err.message);
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
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="order-list">
      <h3>{user.role === 'mcp' ? 'Your Orders' : 'Assigned Orders'}</h3>
      
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order._id}>
              <div>
                <strong>{order.description}</strong>
                <p>Amount: ${order.amount}</p>
                <p>Status: {order.status}</p>
                {order.partner && <p>Partner: {order.partner.name}</p>}
              </div>

              {/* MCP: Assign order to partner */}
              {user.role === 'mcp' && order.status === 'pending' && (
                <div className="assign-section">
                  <select
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                  >
                    <option value="">Select Partner</option>
                    {partners.map(partner => (
                      <option key={partner._id} value={partner._id}>
                        {partner.name} ({partner.email})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => assignOrder(order._id)}
                    disabled={!selectedPartner}
                  >
                    Assign
                  </button>
                </div>
              )}

              {/* Partner: Accept/Reject assigned order */}
              {user.role === 'partner' && order.status === 'assigned' && (
                <div className="partner-actions">
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'accepted')}
                    className="accept-btn"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'rejected')}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* Partner: Mark as completed */}
              {user.role === 'partner' && order.status === 'accepted' && (
                <button 
                  onClick={() => updateOrderStatus(order._id, 'completed')}
                  className="complete-btn"
                >
                  Mark Completed
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OrderList;