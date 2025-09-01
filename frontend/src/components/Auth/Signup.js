import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import SocialLogin from './SocialLogin';
import toast from 'react-hot-toast';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const watchedPassword = watch('password', '');
  const watchedFields = watch();

  // Password strength checker
  React.useEffect(() => {
    if (watchedPassword) {
      const strength = checkPasswordStrength(watchedPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [watchedPassword]);

  const checkPasswordStrength = (password) => {
    const minLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]
      .filter(Boolean).length;

    let level = 'Weak';
    let color = 'error';
    if (score >= 4) {
      level = 'Strong';
      color = 'success';
    } else if (score >= 3) {
      level = 'Medium';
      color = 'warning';
    }

    return {
      score,
      level,
      color,
      requirements: {
        minLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecialChar
      }
    };
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      await signup(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordProgressValue = () => {
    return passwordStrength ? (passwordStrength.score / 5) * 100 : 0;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Full Name"
        autoComplete="name"
        autoFocus
        margin="normal"
        {...register('name', {
          required: 'Full name is required',
          minLength: {
            value: 2,
            message: 'Name must be at least 2 characters long'
          },
          maxLength: {
            value: 50,
            message: 'Name cannot exceed 50 characters'
          },
          pattern: {
            value: /^[a-zA-Z\s]+$/,
            message: 'Name can only contain letters and spaces'
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
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Email Address"
        type="email"
        autoComplete="email"
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
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Mobile Number"
        type="tel"
        autoComplete="tel"
        margin="normal"
        {...register('mobile', {
          required: 'Mobile number is required',
          pattern: {
            value: /^[6-9]\d{9}$/,
            message: 'Please enter a valid 10-digit Indian mobile number'
          }
        })}
        error={!!errors.mobile}
        helperText={errors.mobile?.message || 'Enter 10-digit mobile number'}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone color={errors.mobile ? 'error' : 'action'} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        margin="normal"
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters long'
          },
          validate: (value) => {
            const strength = checkPasswordStrength(value);
            if (strength.score < 3) {
              return 'Password is too weak. Include uppercase, lowercase, and numbers.';
            }
            return true;
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
                onClick={togglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />

      {/* Password Strength Indicator */}
      {passwordStrength && (
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption">Password Strength:</Typography>
            <Chip
              label={passwordStrength.level}
              color={passwordStrength.color}
              size="small"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={getPasswordProgressValue()}
            color={passwordStrength.color}
            sx={{ mb: 1 }}
          />
          <Box>
            {Object.entries({
              'At least 6 characters': passwordStrength.requirements.minLength,
              'Uppercase letter': passwordStrength.requirements.hasUppercase,
              'Lowercase letter': passwordStrength.requirements.hasLowercase,
              'Number': passwordStrength.requirements.hasNumber,
              'Special character': passwordStrength.requirements.hasSpecialChar
            }).map(([requirement, met]) => (
              <Box key={requirement} display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                {met ? (
                  <CheckCircle color="success" sx={{ fontSize: 16, mr: 1 }} />
                ) : (
                  <Cancel color="error" sx={{ fontSize: 16, mr: 1 }} />
                )}
                <Typography variant="caption" color={met ? 'success.main' : 'error.main'}>
                  {requirement}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading || !watchedFields.name || !watchedFields.email || !watchedFields.mobile || !watchedFields.password}
        sx={{ mb: 2, py: 1.5 }}
      >
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <Box textAlign="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Sign in here
          </Link>
        </Typography>
      </Box>

      <SocialLogin />
    </Box>
  );
};

export default Signup;
