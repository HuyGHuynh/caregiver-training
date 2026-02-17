import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = ({ user, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'demo@eduplatform.com',
    phone: user?.phone || '+1 (555) 123-4567',
    dateOfBirth: user?.dateOfBirth || '1990-05-15',
    location: user?.location || 'San Francisco, CA',
    joinDate: user?.joinDate || '2024-01-15',
    bio: user?.bio || 'Passionate about continuous learning and helping others grow through education.'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving user data:', formData);
    // Here you would typically call an API to update user data
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || 'Alex Johnson',
      email: user?.email || 'demo@eduplatform.com',
      phone: user?.phone || '+1 (555) 123-4567',
      dateOfBirth: user?.dateOfBirth || '1990-05-15',
      location: user?.location || 'San Francisco, CA',
      joinDate: user?.joinDate || '2024-01-15',
      bio: user?.bio || 'Passionate about continuous learning and helping others grow through education.'
    });
    setIsEditing(false);
  };

  return (
    <div className="user-profile">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <div className="profile-header-content">
            <div className="profile-avatar-large">
              {formData.name?.[0] || 'U'}
            </div>
            <div className="profile-header-info">
              <h1 className="heading-2">{formData.name}</h1>
              <p className="body-base text-secondary">{formData.email}</p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{user?.completedLessons || 24}</span>
                  <span className="stat-label">Lessons Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user?.streak || 7}</span>
                  <span className="stat-label">Day Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user?.points || 1250}</span>
                  <span className="stat-label">Points Earned</span>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-success"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <div className="profile-sections">
            {/* Personal Information */}
            <div className="profile-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <div className="form-value">{formData.name}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <div className="form-value">{formData.email}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <div className="form-value">{formData.phone}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <div className="form-value">
                        {new Date(formData.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <div className="form-value">{formData.location}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Member Since</label>
                    <div className="form-value">
                      {new Date(formData.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-group bio-group">
                  <label className="form-label">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="form-textarea"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="form-value bio-value">{formData.bio}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="profile-section">
              <h3 className="section-title">Account Settings</h3>
              <div className="section-content">
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Change Password</h4>
                      <p className="text-secondary">Update your account password</p>
                    </div>
                    <button className="btn btn-secondary btn-small">Change</button>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Email Notifications</h4>
                      <p className="text-secondary">Manage your email preferences</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Two-Factor Authentication</h4>
                      <p className="text-secondary">Add an extra layer of security</p>
                    </div>
                    <button className="btn btn-secondary btn-small">Enable</button>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Privacy Settings</h4>
                      <p className="text-secondary">Control who can see your profile</p>
                    </div>
                    <button className="btn btn-secondary btn-small">Manage</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="profile-section">
              <h3 className="section-title">Learning Preferences</h3>
              <div className="section-content">
                <div className="preferences-grid">
                  <div className="preference-item">
                    <h4>Difficulty Level</h4>
                    <select className="form-select">
                      <option>Beginner</option>
                      <option selected>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  
                  <div className="preference-item">
                    <h4>Study Schedule</h4>
                    <select className="form-select">
                      <option>Flexible</option>
                      <option selected>Daily 30 minutes</option>
                      <option>Daily 1 hour</option>
                      <option>Weekends only</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <h4>Learning Style</h4>
                    <select className="form-select">
                      <option>Visual</option>
                      <option selected>Interactive</option>
                      <option>Reading</option>
                      <option>Mixed</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <h4>Reminder Frequency</h4>
                    <select className="form-select">
                      <option selected>Daily</option>
                      <option>3 times per week</option>
                      <option>Weekly</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;