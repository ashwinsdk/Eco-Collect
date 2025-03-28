import React, { useState } from 'react';

function OrderForm({ user }) {
  const [formData, setFormData] = useState({ description: '', amount: 0 });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/mcp/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');
      
      // Reset form on success
      setFormData({ description: '', amount: 0 });
      alert('Order created successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modern-form-container">
      <div className="form-card">
        <h2>Create New Order</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              name="description"
              placeholder="What needs to be collected?"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input
              type="number"
              name="amount"
              placeholder="Estimated value"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              required
              className="form-control"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="auth-btn">Create Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;