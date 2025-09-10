'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Settings as SettingsIcon, 
  Palette, 
  Lock, 
  Database, 
  Zap,
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Moon,
  Sun,
  Monitor,
  Type,
  BarChart3,
  Bell,
  Smartphone,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';
import ProtectedRoute from '@/components/protected-route';

// Settings interface for type safety
interface AppSettings {
  // Analysis preferences
  analysisSensitivity: 'conservative' | 'balanced' | 'aggressive';
  autoSaveAnalyses: boolean;
  defaultDetailLevel: 'brief' | 'standard' | 'detailed';
  riskThresholdAlert: number;
  
  // Appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactView: boolean;
  highContrast: boolean;
  
  // Security
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  
  // Data management
  dataRetention: '1month' | '6months' | '1year' | 'forever';
  autoDeleteOld: boolean;
  usageAnalytics: boolean;
  
  // Advanced
  betaFeatures: boolean;
  debugMode: boolean;
  performanceMonitoring: boolean;
}

function SettingsContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    // Analysis preferences
    analysisSensitivity: 'balanced',
    autoSaveAnalyses: true,
    defaultDetailLevel: 'standard',
    riskThresholdAlert: 70,
    
    // Appearance
    theme: 'system',
    fontSize: 'medium',
    compactView: false,
    highContrast: false,
    
    // Security
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    
    // Data management
    dataRetention: '1year',
    autoDeleteOld: false,
    usageAnalytics: true,
    
    // Advanced
    betaFeatures: false,
    debugMode: false,
    performanceMonitoring: true,
  });

  const [activeTab, setActiveTab] = useState('analysis');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Apply theme changes immediately
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Font size
    root.style.fontSize = settings.fontSize === 'small' ? '14px' : 
                         settings.fontSize === 'large' ? '18px' : '16px';

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings.theme, settings.fontSize, settings.highContrast]);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Save to localStorage immediately
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, you'd save to Firebase/backend here
      localStorage.setItem('appSettings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwords.new.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // In a real app, you'd use Firebase auth here
    alert('Password change functionality would be implemented with Firebase Auth');
    setShowPasswordChange(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleClearCache = () => {
    localStorage.removeItem('analysisCache');
    localStorage.removeItem('tempFiles');
    alert('Cache cleared successfully');
  };

  const handleExportSettings = () => {
    const dataToExport = {
      settings,
      exportDate: new Date().toISOString(),
      user: user?.email
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `misinfo-combat-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('appSettings');
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Analysis Preferences */}
            {activeTab === 'analysis' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Analysis Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Analysis Sensitivity
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'conservative', label: 'Conservative', desc: 'Lower false positives' },
                        { value: 'balanced', label: 'Balanced', desc: 'Recommended setting' },
                        { value: 'aggressive', label: 'Aggressive', desc: 'Higher detection rate' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSettingChange('analysisSensitivity', option.value)}
                          className={`p-3 text-left border rounded-lg transition-colors ${
                            settings.analysisSensitivity === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-900'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-700 mt-1">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Default Detail Level
                    </label>
                    <select
                      value={settings.defaultDetailLevel}
                      onChange={(e) => handleSettingChange('defaultDetailLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="brief">Brief - Quick summary only</option>
                      <option value="standard">Standard - Balanced detail</option>
                      <option value="detailed">Detailed - Comprehensive analysis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Risk Threshold Alert: {settings.riskThresholdAlert}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={settings.riskThresholdAlert}
                      onChange={(e) => handleSettingChange('riskThresholdAlert', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                      <span>10% (Low)</span>
                      <span>90% (High)</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.autoSaveAnalyses}
                        onChange={(e) => handleSettingChange('autoSaveAnalyses', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Auto-save analysis results</span>
                    </label>
                    <p className="text-xs text-gray-700 mt-1 ml-6">
                      Automatically save analyses to your history
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Appearance</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor }
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSettingChange('theme', option.value)}
                            className={`p-3 text-center border rounded-lg transition-colors ${
                              settings.theme === option.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400 text-gray-900'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="font-medium text-gray-900">{option.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Font Size
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'small', label: 'Small', size: 'text-sm' },
                        { value: 'medium', label: 'Medium', size: 'text-base' },
                        { value: 'large', label: 'Large', size: 'text-lg' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSettingChange('fontSize', option.value)}
                          className={`p-3 text-center border rounded-lg transition-colors ${
                            settings.fontSize === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-900'
                          }`}
                        >
                          <Type className="w-6 h-6 mx-auto mb-2" />
                          <div className={`font-medium text-gray-900 ${option.size}`}>{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.compactView}
                        onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Compact view</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.highContrast}
                        onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">High contrast mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Password
                    </label>
                    {!showPasswordChange ? (
                      <button
                        onClick={() => setShowPasswordChange(true)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
                      >
                        Change Password
                      </button>
                    ) : (
                      <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <input
                          type="password"
                          placeholder="Current password"
                          value={passwords.current}
                          onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          value={passwords.new}
                          onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handlePasswordChange}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => setShowPasswordChange(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                        <p className="text-xs text-gray-700 mt-1">Add extra security to your account</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorEnabled}
                          onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                          className="sr-only"
                        />
                        <button
                          onClick={() => handleSettingChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.loginAlerts}
                        onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Login alerts for new devices</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Session Timeout: {settings.sessionTimeout} days
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="90"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                      <span>1 day</span>
                      <span>90 days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management */}
            {activeTab === 'data' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Data Management</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Data Retention Period
                    </label>
                    <select
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="1month">1 Month</option>
                      <option value="6months">6 Months</option>
                      <option value="1year">1 Year</option>
                      <option value="forever">Forever</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.autoDeleteOld}
                        onChange={(e) => handleSettingChange('autoDeleteOld', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Auto-delete old analyses</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.usageAnalytics}
                        onChange={(e) => handleSettingChange('usageAnalytics', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Share usage analytics</span>
                    </label>
                    <p className="text-xs text-gray-700 mt-1 ml-6">
                      Help improve the app by sharing anonymous usage data
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Data Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={handleExportSettings}
                        className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Settings</span>
                      </button>
                      
                      <button
                        onClick={handleClearCache}
                        className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear Cache</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced */}
            {activeTab === 'advanced' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.betaFeatures}
                        onChange={(e) => handleSettingChange('betaFeatures', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Enable beta features</span>
                    </label>
                    <p className="text-xs text-gray-700 mt-1 ml-6">
                      Get early access to experimental features
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.debugMode}
                        onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Debug mode</span>
                    </label>
                    <p className="text-xs text-gray-700 mt-1 ml-6">
                      Show detailed logging information
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.performanceMonitoring}
                        onChange={(e) => handleSettingChange('performanceMonitoring', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Performance monitoring</span>
                    </label>
                    <p className="text-xs text-gray-700 mt-1 ml-6">
                      Monitor app performance and report issues
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Options</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-800">Reset All Settings</h4>
                          <p className="text-sm text-red-700 mt-1">
                            This will reset all your preferences to default values. This action cannot be undone.
                          </p>
                          <button
                            onClick={handleResetSettings}
                            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reset All Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
