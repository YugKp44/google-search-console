import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = ({ onTokenReceived }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the authorization code from the URL
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get('code');

    if (authorizationCode) {
      // Call your backend to exchange the authorization code for an access token
      fetch('http://localhost:5000/api/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authorizationCode }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
            onTokenReceived(data.access_token); // Pass the token to the parent component
            navigate('/dashboard');
          } else {
            console.error('Failed to get access token');
            navigate('/');
          }
        })
        .catch((error) => {
          console.error('Error exchanging token:', error);
          navigate('/');
        });
    }
  }, [navigate, onTokenReceived]);

  return <div>Processing...</div>;
};

export default OAuthCallback;
