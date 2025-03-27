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

  if (loading) return <div>Loading partners...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="partner-list">
      <h3>Available Delivery Partners</h3>
      {partners.length === 0 ? (
        <p>No delivery partners available</p>
      ) : (
        <ul>
          {partners.map(partner => (
            <li key={partner._id}>
              <div>
                <strong>{partner.name}</strong>
                <p>Email: {partner.email}</p>
                <p>Wallet Balance: ${partner.wallet || 0}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PartnerList;