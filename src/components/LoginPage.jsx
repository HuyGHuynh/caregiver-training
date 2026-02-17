import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [loginType, setLoginType] = useState('email'); // 'email' or 'username'
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Sample demo credentials
  const demoCredentials = {
    email: 'demo@eduplatform.com',
    username: 'demouser',
    password: 'demo123'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginType === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate credentials
      const isValidCredential = loginType === 'email' 
        ? formData.email === demoCredentials.email
        : formData.username === demoCredentials.username;
      
      const isValidPassword = formData.password === demoCredentials.password;
      
      if (isValidCredential && isValidPassword) {
        // Successful login
        console.log('Login successful:', {
          type: loginType,
          user: loginType === 'email' ? formData.email : formData.username
        });
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // Invalid credentials
        setErrors({ 
          general: loginType === 'email' 
            ? 'Invalid email or password. Please try again.' 
            : 'Invalid username or password. Please try again.'
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Here you would implement Google OAuth
    alert('Google login functionality would be implemented here!');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Here you would navigate to forgot password page
    alert('Forgot password functionality would be implemented here!');
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: demoCredentials.email,
      username: demoCredentials.username,
      password: demoCredentials.password
    });
    // Clear any existing errors
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="heading-2">Welcome Back</h1>
            <p className="body-base text-secondary">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Demo Credentials Info */}
          <div className="demo-credentials">
            <h3 className="demo-title">Demo Credentials</h3>
            <div className="demo-info">
              <div className="demo-item">
                <strong>Email:</strong> demo@eduplatform.com
              </div>
              <div className="demo-item">
                <strong>Username:</strong> demouser
              </div>
              <div className="demo-item">
                <strong>Password:</strong> demo123
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-small demo-fill-btn"
              onClick={fillDemoCredentials}
              disabled={isLoading}
            >
              Auto-fill Demo Credentials
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            {/* Login Type Toggle */}
            <div className="login-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${loginType === 'email' ? 'active' : ''}`}
                onClick={() => setLoginType('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`toggle-btn ${loginType === 'username' ? 'active' : ''}`}
                onClick={() => setLoginType('username')}
              >
                Username
              </button>
            </div>

            {/* Email/Username Input */}
            <div className="form-group">
              <label className="form-label" htmlFor={loginType}>
                {loginType === 'email' ? 'Email Address' : 'Username'}
              </label>
              <input
                type={loginType === 'email' ? 'email' : 'text'}
                id={loginType}
                name={loginType}
                value={formData[loginType]}
                onChange={handleInputChange}
                className={`form-input ${errors[loginType] ? 'error' : ''}`}
                placeholder={loginType === 'email' ? 'Enter your email' : 'Enter your username'}
                disabled={isLoading}
              />
              {errors[loginType] && (
                <span className="error-message">{errors[loginType]}</span>
              )}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password-container">
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`btn btn-primary btn-large login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span className="divider-text">or</span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              className="btn btn-secondary btn-large google-login-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="signup-prompt">
            <p className="body-small text-secondary">
              Don't have an account yet?{' '}
              <button 
                type="button" 
                className="signup-link"
                onClick={() => onNavigateToRegister && onNavigateToRegister()}
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Demo Navigation */}
          {onLoginSuccess && (
            <div className="demo-navigation">
              <p className="body-small text-secondary">
                For demo purposes:{' '}
                <button 
                  type="button" 
                  className="demo-link"
                  onClick={onLoginSuccess}
                >
                  Skip to Main App
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;