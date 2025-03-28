import React, { useState, useEffect } from 'react';

function PartnerList({ user }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5001/mcp/partners', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch partners');
        }

        const data = await response.json();
        setPartners(data);
      } catch (err) {
        console.error('Partner fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) return <div className="loading-spinner">Loading partners...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="container">
      <h2 className="content-title">Available Delivery Partners</h2>
      {partners.length === 0 ? (
        <div className="empty-state">
          <p>No delivery partners available</p>
        </div>
      ) : (
        <div className="partner-grid">
          {partners.map((partner) => (
            <div key={partner._id} className="partner-card">
              <h2 className="card-title">{partner.name}</h2>
              <p className="card-text"><strong>Email:</strong> {partner.email}</p>
              <p className="card-text">
                <strong>Wallet Balance:</strong> <span className="wallet-amount">${partner.wallet || 0}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default PartnerList;