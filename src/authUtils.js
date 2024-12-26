import axios from 'axios';

// Utility to get the access token
const getAccessToken = async () => {
  // Retrieve access token and its expiration time from localStorage
  const token = localStorage.getItem('accessToken');
  const expirationTime = localStorage.getItem('accessTokenExpiration');

  // Check if token is expired or not present, and refresh if needed
  if (!token || !expirationTime || Date.now() >= expirationTime) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error("No refresh token available. Please reauthenticate.");
    }
    return await refreshAccessToken(refreshToken); // Refresh the token if expired
  }

  return token;  // Return the current valid access token
};

// OAuth credentials (move these to environment variables in production)
const clientId = '708454323810-9m98pf3hjc29njec4uspmajaf9rhfhbp.apps.googleusercontent.com'; 
const clientSecret = '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';

// Function to refresh the access token using the refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    // Request to Google's OAuth2 token endpoint to refresh the access token
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken, // Use stored refresh token
      grant_type: 'refresh_token',  // Grant type for refreshing tokens
    });

    const { access_token, expires_in } = response.data;
    console.log('New Access Token:', access_token);

    // Store the new access token and its expiration time in localStorage
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('accessTokenExpiration', Date.now() + expires_in * 1000);

    return access_token;  // Return the new access token
  } catch (error) {
    console.error('Error refreshing access token:', error.response?.data || error.message);
    throw new Error('Failed to refresh access token');
  }
};

// Utility to store the refresh token in localStorage (you can call this once when you get the refresh token)
const storeRefreshToken = (refreshToken) => {
  localStorage.setItem('refreshToken', refreshToken);
};

// Example usage (after getting refresh token via your OAuth flow)
storeRefreshToken('1//0giJxSZTaD6BvCgYIARAAGBASNwF-L9Ir3pyVqKzRDQROCW6sDoHO0IAv9uvSSC1Ms_v1ZWEBr2o9EFy65jW8XEoKCKqyI7j-m4E');  // Replace with actual refresh token from OAuth

// Export the functions for use in other parts of the application
export { getAccessToken, refreshAccessToken, storeRefreshToken };
