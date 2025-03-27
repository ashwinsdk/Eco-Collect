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
    <div className="order-form">
      <h3>Create New Order</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="description"
          placeholder="Order Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          min="1"
          required
        />
        <button type="submit">Create Order</button>
      </form>
    </div>
  );
}

export default OrderForm;