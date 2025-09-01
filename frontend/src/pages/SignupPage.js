import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Grid,
  Fade,
  useTheme
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  Phone,
  Security,
  Speed,
  CloudSync,
  Chat
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import SocialLogin from '../components/Auth/SocialLogin';
import '../styles/Auth.css';

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data);
      toast.success('Welcome to Alpha Chat!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Chat />, title: 'Real-time Chat', desc: 'Instant messaging' },
    { icon: <Security />, title: 'Secure', desc: 'End-to-end encryption' },
    { icon: <Speed />, title: 'Fast', desc: 'Lightning quick' },
    { icon: <CloudSync />, title: 'Sync', desc: 'Cross-device sync' }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Branding & Features */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={1000}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', lg: 'left' } }}>
                {/* Logo & Brand */}
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 2,
                      fontSize: { xs: '3rem', md: '4rem' }
                    }}
                  >
                    Alpha Chat
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      opacity: 0.9,
                      fontWeight: 300,
                      mb: 4
                    }}
                  >
                    Join the conversation today
                  </Typography>
                </Box>

                {/* Features Grid */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {features.map((feature, index) => (
                    <Grid item xs={6} sm={3} lg={6} key={index}>
                      <Fade in timeout={1000 + index * 200}>
                        <Box 
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 2,
                            p: 2,
                            textAlign: 'center',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              backgroundColor: 'rgba(255,255,255,0.2)'
                            }
                          }}
                        >
                          <Box sx={{ color: 'white', mb: 1 }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {feature.title}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {feature.desc}
                          </Typography>
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>

                {/* Stats */}
               
              </Box>
            </Fade>
          </Grid>

          {/* Right Side - Signup Form */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={1500}>
              <Paper 
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  maxWidth: 450,
                  mx: 'auto'
                }}
              >
                {/* Header */}
                <Box textAlign="center" sx={{ mb: 4 }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color="primary"
                    sx={{ mb: 1 }}
                  >
                    Create Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Join thousands of users worldwide
                  </Typography>
                </Box>

                {/* Signup Form */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    autoFocus
                    margin="normal"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color={errors.name ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    margin="normal"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color={errors.email ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Mobile Number"
                    margin="normal"
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Please enter a valid 10-digit mobile number'
                      }
                    })}
                    error={!!errors.mobile}
                    helperText={errors.mobile?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color={errors.mobile ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    margin="normal"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long'
                      }
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color={errors.password ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      mb: 3, 
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        background: 'rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  {/* Social Login */}
                  <SocialLogin />

                  {/* Sign In Link */}
                  <Box textAlign="center" sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link 
                        to="/login" 
                        style={{ 
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Sign in here
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SignupPage;
