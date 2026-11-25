import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usersAPI, authAPI } from '../services/api';

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const onProfileSubmit = async (data) => {
    try {
      await usersAPI.update(user.id, { name: data.name });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await authAPI.changePassword(data.currentPassword, data.newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
        <button
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        {isAdmin && (
          <button
            className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="settings-content">
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit(onProfileSubmit)} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Name is required' })}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                disabled
                {...register('email')}
              />
              <span className="help-text">Email cannot be changed</span>
            </div>

            <div className="form-group">
              <label>Role</label>
              <input type="text" value={user?.role} disabled />
            </div>

            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                {...register('currentPassword', { required: 'Current password is required' })}
                className={errors.currentPassword ? 'error' : ''}
              />
              {errors.currentPassword && (
                <span className="error-text">{errors.currentPassword.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                className={errors.newPassword ? 'error' : ''}
              />
              {errors.newPassword && (
                <span className="error-text">{errors.newPassword.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value, formValues) =>
                    value === formValues.newPassword || 'Passwords do not match'
                })}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button type="submit" className="btn-primary">
              Change Password
            </button>
          </form>
        )}

        {activeTab === 'preferences' && (
          <div className="settings-form">
            <div className="form-group">
              <label>Theme</label>
              <div className="theme-options">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                >
                  ☀️ Light
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme();
                  }}
                >
                  🌙 Dark
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Email Notifications</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" defaultChecked />
                  Receive email notifications for critical errors
                </label>
                <label>
                  <input type="checkbox" defaultChecked />
                  Receive daily summary
                </label>
                <label>
                  <input type="checkbox" />
                  Receive weekly report
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="settings-form">
            <h3>Admin Settings</h3>
            <div className="form-group">
              <label>User Management</label>
              <p className="help-text">Manage user accounts and permissions</p>
              <a href="/users" className="btn-secondary">
                Manage Users
              </a>
            </div>

            <div className="form-group">
              <label>System Settings</label>
              <p className="help-text">Configure system-wide settings</p>
              <button className="btn-secondary">
                System Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;