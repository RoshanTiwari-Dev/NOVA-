import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Users, MessageSquare, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { Card } from '@/components/ui/card';

interface AnalyticsData {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  microphoneUsage: number;
  speakerUsage: number;
  toolsUsage: Record<string, number>;
  dailyActivity: Array<{ date: string; count: number }>;
}

export default function AnalyticsDashboard() {
  const { isDarkMode } = useDarkMode();
  const [, setLocation] = useLocation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockData: AnalyticsData = {
      totalUsers: 142,
      totalConversations: 487,
      totalMessages: 3294,
      avgMessagesPerConversation: 6.8,
      microphoneUsage: 156,
      speakerUsage: 298,
      toolsUsage: {
        'Web Search': 89,
        'Code Interpreter': 67,
        'Documents': 45,
        'Projects': 34,
      },
      dailyActivity: [
        { date: 'Mon', count: 45 },
        { date: 'Tue', count: 52 },
        { date: 'Wed', count: 48 },
        { date: 'Thu', count: 61 },
        { date: 'Fri', count: 55 },
        { date: 'Sat', count: 38 },
        { date: 'Sun', count: 42 },
      ],
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation('/')}
            className={`p-2 rounded-lg hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
                    <p className="text-3xl font-bold mt-2">{data.totalUsers}</p>
                  </div>
                  <Users className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>

              <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conversations</p>
                    <p className="text-3xl font-bold mt-2">{data.totalConversations}</p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Messages</p>
                    <p className="text-3xl font-bold mt-2">{data.totalMessages}</p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-purple-600 opacity-20" />
                </div>
              </Card>

              <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Messages</p>
                    <p className="text-3xl font-bold mt-2">{data.avgMessagesPerConversation.toFixed(1)}</p>
                  </div>
                  <Zap className="w-10 h-10 text-yellow-600 opacity-20" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <h2 className="text-lg font-semibold mb-4">Voice Features Usage</h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Microphone</span>
                      <span className="text-sm font-medium">{data.microphoneUsage}</span>
                    </div>
                    <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{ width: `${(data.microphoneUsage / Math.max(data.microphoneUsage, data.speakerUsage)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Speaker</span>
                      <span className="text-sm font-medium">{data.speakerUsage}</span>
                    </div>
                    <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${(data.speakerUsage / Math.max(data.microphoneUsage, data.speakerUsage)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <h2 className="text-lg font-semibold mb-4">Tools Usage</h2>
                <div className="space-y-3">
                  {Object.entries(data.toolsUsage).map(([tool, count]) => (
                    <div key={tool}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{tool}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-2 rounded-full bg-purple-600"
                          style={{ width: `${(count / Math.max(...Object.values(data.toolsUsage))) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
