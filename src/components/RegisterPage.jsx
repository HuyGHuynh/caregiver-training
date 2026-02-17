import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import './RegisterPage.css';

const RegisterPage = ({ onRegisterSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // ✅ Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // ✅ Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      console.log('✅ Registration successful:', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      });

      // TODO: Save additional user info (phone, dob, location, bio) to your backend
      // You would call your backend API here to store this info with the Firebase UID
      
      if (onRegisterSuccess) {
        onRegisterSuccess({
          uid: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          location: formData.location,
          bio: formData.bio
        });
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle Firebase errors
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign up clicked');
    // TODO: Implement Google OAuth with Firebase
    alert('Google sign up will be implemented with Firebase Auth!');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <button className="back-to-login-btn" onClick={onBackToLogin}>
              ← Back to Login
            </button>
            <h1 className="heading-2">Create Your Account</h1>
            <p className="body-base text-secondary">
              Join our platform and start your learning journey today
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="dateOfBirth">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.dateOfBirth && (
                    <span className="error-message">{errors.dateOfBirth}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`form-input ${errors.location ? 'error' : ''}`}
                  placeholder="City, State/Province, Country"
                  disabled={isLoading}
                />
                {errors.location && (
                  <span className="error-message">{errors.location}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bio">
                  Bio (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className={`form-input ${errors.bio ? 'error' : ''}`}
                  placeholder="Tell us a little about yourself..."
                  rows="3"
                  disabled={isLoading}
                />
                {errors.bio && (
                  <span className="error-message">{errors.bio}</span>
                )}
              </div>
            </div>

            {/* Account Security Section */}
            <div className="form-section">
              <h3 className="section-title">Account Security</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Create a password"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>or</span>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              className="btn btn-secondary btn-large google-btn"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
              Sign up with Google
            </button>

            {/* Login Link */}
            <div className="login-link">
              Already have an account?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={onBackToLogin}
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;