import React from 'react';

const Login = () => {
  const handleLogin = () => {
    const clientId = '708454323810-np9k4jqdtl7npi21hri8gbjc4c6e2tas.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:3000/oauth-callback';
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/webmasters.readonly`;

    window.location.href = authUrl;
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
