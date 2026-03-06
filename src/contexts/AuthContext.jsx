import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  createOrUpdateUser,
  getUserProfile,
  updateUserPreferences
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Create or update user profile in backend
  const createUserProfile = async (user, additionalData = {}) => {
    try {
      setProfileLoading(true);
      const userData = {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.displayName || '',
        photoURL: user.photoURL || null,
        ...additionalData
      };

      const profile = await createOrUpdateUser(userData);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async (firebaseUid) => {
    try {
      setProfileLoading(true);
      const profile = await getUserProfile(firebaseUid);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  // Register new user
  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create backend profile
      await createUserProfile(user, { displayName });

      return user;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Profile will be fetched in the auth state change listener
    return result;
  };

  // Logout user
  const logout = async () => {
    setUserProfile(null);
    return signOut(auth);
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    if (!currentUser) return;

    try {
      const updatedProfile = await updateUserPreferences(currentUser.uid, preferences);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (!currentUser) return null;
    return await fetchUserProfile(currentUser.uid);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Try to fetch existing profile or create one
        let profile = await fetchUserProfile(user.uid);
        if (!profile) {
          // Create profile if it doesn't exist
          profile = await createUserProfile(user);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  const value = {
    // Auth state
    currentUser,
    userProfile,
    loading,
    profileLoading,

    // Auth functions
    signup,
    login,
    logout,

    // Profile functions
    createUserProfile,
    fetchUserProfile,
    updatePreferences,
    refreshProfile,

    // Helper functions
    isAuthenticated: !!currentUser,
    hasProfile: !!userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};