import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Database } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "privacy" | "appearance" | "data">("account");
  const [settings, setSettings] = useState({
    username: "User",
    email: "user@example.com",
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    autoSave: true,
    dataCollection: true,
  });

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="space-y-2 sticky top-6">
              {[
                { id: "account", label: "Account", icon: User },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "privacy", label: "Privacy & Security", icon: Lock },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "data", label: "Data & Storage", icon: Database },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-100 text-green-700 border-l-4 border-green-500"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            {/* Account Settings */}
            {activeTab === "account" && (
              <Card className="p-6 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={settings.username}
                      onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <Button onClick={handleSaveSettings} className="bg-green-500 hover:bg-green-600 text-white">
                    Save Changes
                  </Button>
                </div>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <Card className="p-6 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications in the app</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                      className="w-5 h-5 text-green-500 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      className="w-5 h-5 text-green-500 rounded"
                    />
                  </div>
                  <Button onClick={handleSaveSettings} className="bg-green-500 hover:bg-green-600 text-white">
                    Save Preferences
                  </Button>
                </div>
              </Card>
            )}

            {/* Privacy & Security */}
            {activeTab === "privacy" && (
              <Card className="p-6 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Security</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">Your conversations are encrypted and stored securely. You can delete them anytime.</p>
                  </div>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">Change Password</Button>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">Enable Two-Factor Authentication</Button>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">Delete Account</Button>
                </div>
              </Card>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <Card className="p-6 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Dark Mode</p>
                      <p className="text-sm text-gray-600">Use dark theme for the interface</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                      className="w-5 h-5 text-green-500 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Theme Color</label>
                    <div className="flex gap-3">
                      {["green", "blue", "purple", "orange"].map((color) => (
                        <div key={color} className={`w-10 h-10 rounded-lg bg-${color}-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-${color}-500`} />
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings} className="bg-green-500 hover:bg-green-600 text-white">
                    Save Appearance
                  </Button>
                </div>
              </Card>
            )}

            {/* Data & Storage */}
            {activeTab === "data" && (
              <Card className="p-6 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Data & Storage</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Auto-save Conversations</p>
                      <p className="text-sm text-gray-600">Automatically save your chats</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                      className="w-5 h-5 text-green-500 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Data Collection</p>
                      <p className="text-sm text-gray-600">Help improve Nova by sharing usage data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.dataCollection}
                      onChange={(e) => setSettings({ ...settings, dataCollection: e.target.checked })}
                      className="w-5 h-5 text-green-500 rounded"
                    />
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-700">Storage Used: <span className="font-semibold">2.4 GB / 10 GB</span></p>
                  </div>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">Clear All Data</Button>
                  <Button onClick={handleSaveSettings} className="w-full bg-green-500 hover:bg-green-600 text-white">
                    Save Settings
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
