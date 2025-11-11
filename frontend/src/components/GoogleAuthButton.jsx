import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function GoogleAuthButton() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google credential token to backend
      const response = await api.post('/oauth/google', {
        access_token: credentialResponse.credential
      });

      const data = response.data;
      
      // Store the JWT token
      if (data?.token) {
        localStorage.setItem('kh_token', data.token);
      }
      
      // Update auth context
      if (data?.user) {
        // Manually update the auth state (or you could call login with the returned data)
        window.location.href = '/'; // Simple redirect to refresh auth state
      }
      
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('Google login was cancelled or failed.');
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        text="continue_with"
        width="100%"
      />
    </div>
  );
}
