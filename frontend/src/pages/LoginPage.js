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
  Divider,
  Grid,
  Card,
  CardContent,
  Fade,
  useTheme
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Chat,
  Security,
  Speed,
  CloudSync
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import SocialLogin from '../components/Auth/SocialLogin';
import '../styles/Auth.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
      await login(data);
      toast.success('Welcome back to Alpha Chat!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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
                    Connect, Chat, Collaborate
                  </Typography>
                </Box>

                {/* Features Grid */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {features.map((feature, index) => (
                    <Grid item xs={6} sm={3} lg={6} key={index}>
                      <Fade in timeout={1000 + index * 200}>
                        <Card 
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            textAlign: 'center',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              backgroundColor: 'rgba(255,255,255,0.2)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ color: 'white', mb: 1 }}>
                              {feature.icon}
                            </Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {feature.title}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {feature.desc}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 4, justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold">1M+</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Active Users</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold">99.9%</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Uptime</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold">24/7</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Support</Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Grid>

          {/* Right Side - Login Form */}
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
                    Welcome Back!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign in to continue your conversations
                  </Typography>
                </Box>

                {/* Login Form */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    autoFocus
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
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                            aria-label="toggle password visibility"
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
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  {/* Forgot Password */}
                  <Box textAlign="center" sx={{ mb: 3 }}>
                    <Link 
                      to="/forgot-password" 
                      style={{ 
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>

                  {/* Social Login */}
                  <SocialLogin />

                  {/* Sign Up Link */}
                  <Divider sx={{ my: 3 }} />
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link 
                        to="/signup" 
                        style={{ 
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Create one now
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

export default LoginPage;
