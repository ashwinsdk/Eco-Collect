import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  // const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);


  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    role: 'mcp' 
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };
  if (!showAuth) {
    return (
      <div className="landing-page">
        <div className="landing-content">
          <h1 className="brand-heading">ECO-Collect</h1>
          <p className="tagline">Sustainable waste management for a cleaner future</p>
          <div className="auth-options">
            <button className="auth-option-btn landing-btn-primary" onClick={() => { setShowAuth(true); setIsLogin(true); }}>
              Login
            </button>
            <button className="auth-option-btn landing-btn-secondary" onClick={() => { setShowAuth(true); setIsLogin(false); }}>
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-wrapper">
      <h1 className="brand-heading">ECO-Collect</h1>
      <div className="auth-container">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
  
              <div className="input-group">
                <label className="input-label">Account Type</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="role"
                      value="mcp"
                      checked={formData.role === 'mcp'}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radio-label">MCP User</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="role"
                      value="partner"
                      checked={formData.role === 'partner'}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radio-label">Delivery Partner</span>
                  </label>
                </div>
              </div>
            </>
          )}
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="auth-btn">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        
        <button 
          className="toggle-btn"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? (
            <>Don't have an account? <span>Register</span></>
          ) : (
            <>Already have an account? <span>Login</span></>
          )}
        </button>
      </div>
    </div>
  );
}

export default Auth;