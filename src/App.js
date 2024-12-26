import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router and Routes at the root level
import Login from './Login';
import OAuthCallback from './OAuth';
import Dashboard from './DashBoard';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken); // If the token exists, set it to state
    }
  }, []);

  const handleTokenReceived = (receivedToken) => {
    localStorage.setItem('accessToken', receivedToken); // Store the token in localStorage
    setToken(receivedToken); // Update state with the token
  };

  return (
    <Router> {/* Only one Router component at the root level */}
      <Routes>
        {/* Define routes and their respective components */}
        <Route path="/" element={!token ? <Login /> : <Dashboard token={token} />} />
        <Route path="/oauth-callback" element={<OAuthCallback onTokenReceived={handleTokenReceived} />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} /> : <Login />} />
      </Routes>
    </Router>
  );
};

export default App;
