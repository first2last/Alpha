import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const SocialLogin = () => {
  const [loading, setLoading] = useState({
    facebook: false,
    linkedin: false
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      
      // Decode the JWT token from Google
      const userDetails = jwtDecode(credentialResponse.credential);
      console.log('Google user details:', userDetails);
      
      const userData = {
        googleId: userDetails.sub,
        email: userDetails.email,
        name: userDetails.name,
        avatar: userDetails.picture
      };

      // Send to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        
        toast.success('Successfully signed in with Google!');
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google authentication failed. Please try again.');
      toast.error('Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login was cancelled or failed.');
    toast.error('Google login failed');
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(prev => ({ ...prev, facebook: true }));
      setError('');
      toast.info('Facebook login will be implemented with backend integration');
    } catch (err) {
      setError('Facebook login is not available. Please try email login.');
      toast.error('Facebook login failed');
    } finally {
      setLoading(prev => ({ ...prev, facebook: false }));
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      setLoading(prev => ({ ...prev, linkedin: true }));
      setError('');
      toast.info('LinkedIn login will be implemented with backend integration');
    } catch (err) {
      setError('LinkedIn login is not available. Please try email login.');
      toast.error('LinkedIn login failed');
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  return (
    <Box>
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
          Or continue with
        </Typography>
      </Divider>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Google Login - Using new @react-oauth/google */}
        <Grid item xs={12}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
          />
        </Grid>

        {/* Facebook Login */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleFacebookLogin}
            disabled={loading.facebook}
            startIcon={
              loading.facebook ? (
                <CircularProgress size={18} />
              ) : (
                <FaFacebookF style={{ fontSize: '18px' }} />
              )
            }
            sx={{
              py: 1.2,
              textTransform: 'none',
              borderColor: '#4267B2',
              color: '#4267B2',
              '&:hover': {
                borderColor: '#4267B2',
                backgroundColor: '#4267B210'
              }
            }}
          >
            {loading.facebook ? 'Connecting...' : 'Continue with Facebook'}
          </Button>
        </Grid>

        {/* LinkedIn Login */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLinkedInLogin}
            disabled={loading.linkedin}
            startIcon={
              loading.linkedin ? (
                <CircularProgress size={18} />
              ) : (
                <FaLinkedinIn style={{ fontSize: '18px' }} />
              )
            }
            sx={{
              py: 1.2,
              textTransform: 'none',
              borderColor: '#0A66C2',
              color: '#0A66C2',
              '&:hover': {
                borderColor: '#0A66C2',
                backgroundColor: '#0A66C210'
              }
            }}
          >
            {loading.linkedin ? 'Connecting...' : 'Continue with LinkedIn'}
          </Button>
        </Grid>
      </Grid>

      <Typography 
        variant="caption" 
        color="text.secondary" 
        align="center" 
        display="block"
        sx={{ mt: 3 }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Typography>
    </Box>
  );
};

export default SocialLogin;
