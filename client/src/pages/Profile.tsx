import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { ArrowLeft, Mail, User, Shield, Bell, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className={`p-2 rounded-lg hover:${isDarkMode ? "bg-gray-700" : "bg-gray-100"} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* User Info Card */}
        <Card className={`p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Name</label>
              <p className="text-lg font-medium">{user?.name || "User"}</p>
            </div>
            <div>
              <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Email</label>
              <p className="text-lg font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email || "Not provided"}
              </p>
            </div>
            <div>
              <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>User ID</label>
              <p className="text-sm font-mono">{user?.id || "N/A"}</p>
            </div>
          </div>
        </Card>

        {/* Preferences Card */}
        <Card className={`p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium">Dark Mode</label>
              <button
                onClick={toggleDarkMode}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                {isDarkMode ? "On" : "Off"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="font-medium">Notifications</label>
              <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
                Manage
              </button>
            </div>
          </div>
        </Card>

        {/* Privacy & Security Card */}
        <Card className={`p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium">Two-Factor Authentication</label>
              <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition-colors">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="font-medium">Privacy Settings</label>
              <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition-colors">
                Configure
              </button>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
