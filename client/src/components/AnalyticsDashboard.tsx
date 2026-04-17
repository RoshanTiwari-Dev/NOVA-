import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MessageSquare, Zap, Clock, TrendingUp } from "lucide-react";

export function AnalyticsDashboard() {
  const { data: conversations } = trpc.chat.getConversations.useQuery();

  const analytics = useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerConversation: 0,
        avgResponseTime: 0,
        conversationsByDate: [],
        toolUsage: [],
      };
    }

    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce((sum, conv: any) => sum + (conv.messageCount || 0), 0);
    const avgMessagesPerConversation = totalMessages / totalConversations;
    const avgResponseTime = 2.5; // Mock average response time in seconds

    // Generate conversation trend data
    const conversationsByDate = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      conversations: Math.floor(Math.random() * 5) + 1,
    }));

    // Mock tool usage data
    const toolUsage = [
      { name: "Chat", value: 65 },
      { name: "Web Search", value: 15 },
      { name: "Code", value: 12 },
      { name: "Documents", value: 8 },
    ];

    return {
      totalConversations,
      totalMessages,
      avgMessagesPerConversation: avgMessagesPerConversation.toFixed(1),
      avgResponseTime,
      conversationsByDate,
      toolUsage,
    };
  }, [conversations]);

  const COLORS = ["#10a37f", "#34d399", "#6ee7b7", "#a7f3d0"];

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="text-sm text-gray-500">Last 7 days</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Conversations</p>
              <p className="text-3xl font-bold text-green-600">{analytics.totalConversations}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.totalMessages}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Messages/Chat</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.avgMessagesPerConversation}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-orange-600">{analytics.avgResponseTime}s</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation Trend */}
        <Card className="p-4 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.conversationsByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }} />
              <Line type="monotone" dataKey="conversations" stroke="#10a37f" strokeWidth={2} dot={{ fill: "#10a37f" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tool Usage */}
        <Card className="p-4 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analytics.toolUsage} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                {analytics.toolUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Message Distribution */}
        <Card className="p-4 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Message Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.conversationsByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }} />
              <Bar dataKey="conversations" fill="#10a37f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Activity Summary */}
        <Card className="p-4 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Most Active Hour</span>
              <span className="font-semibold text-gray-900">2:00 PM - 3:00 PM</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Most Used Tool</span>
              <span className="font-semibold text-gray-900">Chat (65%)</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">Avg Session Duration</span>
              <span className="font-semibold text-gray-900">12 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversations This Week</span>
              <span className="font-semibold text-gray-900">{analytics.totalConversations}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
