import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Login() {
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nova</h1>
          <p className="text-gray-600 text-lg">Your AI-Powered Chat Assistant</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Nova</h2>
            <p className="text-gray-600 mb-4">
              Nova is an intelligent chatbot with powerful tools to help you:
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Chat with advanced AI powered by Groq
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Manage projects and organize your work
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Search the web for information
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Execute and test code instantly
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Use voice commands with listening & speaking features
              </li>
            </ul>
          </div>

          {/* Login Button */}
          <a href={loginUrl} className="block">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg rounded-lg transition-colors"
            >
              Sign in with Manus
            </Button>
          </a>

          {/* Footer Text */}
          <p className="text-center text-gray-500 text-sm mt-6">
            By signing in, you agree to our Terms of Service
          </p>
        </div>

        {/* Features Highlight */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">🎤</div>
            <p className="text-sm text-gray-600">Voice Input</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">🔊</div>
            <p className="text-sm text-gray-600">Voice Output</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">⚡</div>
            <p className="text-sm text-gray-600">Fast & Smart</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">🔒</div>
            <p className="text-sm text-gray-600">Secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
