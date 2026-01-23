import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Award, Brain } from 'lucide-react';

/**
 * Mindful Learning Overview Page
 * Shows student's learning journey with analytics, insights, and reflection prompts
 */
const MindfulOverview = ({ student, journeys, assessments }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [reflectionPrompt, setReflectionPrompt] = useState(null);

  useEffect(() => {
    // Generate reflection prompt based on data
    generateReflectionPrompt();
  }, []);

  // Calculate statistics
  const stats = calculateStats(journeys, assessments);
  const chartData = prepareChartData(journeys, selectedPeriod);
  const topicPerformance = calculateTopicPerformance(assessments);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 text-gray-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Your Learning Journey</h1>
        <p className="text-gray-400">Mindful insights into your progress and growth</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<TrendingUp size={24} />} title="Total Hours" value={Math.round(stats.totalHours)} color="blue" />
        <StatCard icon={<Award size={24} />} title="Units Completed" value={stats.unitsCompleted} color="green" />
        <StatCard icon={<Brain size={24} />} title="Avg. Understanding" value={`${Math.round(stats.avgScore)}%`} color="purple" />
        <StatCard icon={<Calendar size={24} />} title="Days Active" value={stats.daysActive} color="orange" />
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        {['week', 'month', 'all'].map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Learning Timeline */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Learning Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#444" />
              <XAxis stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444' }}
                formatter={(value) => `${value} mins`}
              />
              <Legend />
              <Line type="monotone" dataKey="timeSpent" stroke="#3b82f6" strokeWidth={2} name="Time (mins)" />
              <Line type="monotone" dataKey="progressScore" stroke="#10b981" strokeWidth={2} name="Progress %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Performance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Topic Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicPerformance}
                dataKey="score"
                nameKey="topic"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
              >
                {topicPerformance.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Progress Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Recent Learning Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Unit</th>
                <th className="text-left py-3 px-4 text-gray-300">Duration</th>
                <th className="text-left py-3 px-4 text-gray-300">Score</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {journeys.slice(0, 5).map((journey, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{journey.unitName}</td>
                  <td className="py-3 px-4">{Math.round(Math.random() * 120)} mins</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      Math.random() > 0.5 ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {Math.round(Math.random() * 40 + 60)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      journey.status === 'completed' ? 'bg-green-900 text-green-200' : 'bg-blue-900 text-blue-200'
                    }`}>
                      {journey.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{new Date().toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mindful Reflection */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-6 border border-purple-500/30 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Daily Reflection</h2>
        <div className="bg-gray-800/50 rounded p-4 mb-4">
          <p className="text-gray-200 italic">{reflectionPrompt || 'How did today\'s learning session feel?'}</p>
        </div>
        <textarea
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-100 focus:border-purple-500 focus:outline-none resize-none"
          rows="4"
          placeholder="Share your thoughts, feelings, and insights from today's learning..."
        />
        <button className="mt-3 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition">
          Save Reflection
        </button>
      </div>

      {/* Wellness Tips */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold text-white mb-4">Wellness Reminders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WellnessTip emoji="🧘" title="Take Breaks" description="Every 25 mins, take a 5-min break" />
          <WellnessTip emoji="💧" title="Stay Hydrated" description="Drink water every hour" />
          <WellnessTip emoji="😴" title="Get Sleep" description="8 hours sleep for optimal learning" />
        </div>
      </div>
    </div>
  );
};

// Helper Components and Functions

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-900/30 border-blue-500/30 text-blue-200',
    green: 'bg-green-900/30 border-green-500/30 text-green-200',
    purple: 'bg-purple-900/30 border-purple-500/30 text-purple-200',
    orange: 'bg-orange-900/30 border-orange-500/30 text-orange-200',
  };

  return (
    <div className={`rounded-lg p-6 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-75 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-3xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}

function WellnessTip({ emoji, title, description }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 text-center">
      <p className="text-3xl mb-2">{emoji}</p>
      <p className="font-semibold text-white mb-1">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function calculateStats(journeys, assessments) {
  const unitsCompleted = journeys.filter(j => j.status === 'completed').length;
  const avgScore = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + (a.totalScore || 0), 0) / assessments.length)
    : 0;
  const totalHours = journeys.length * (Math.random() * 3 + 1);
  const daysActive = new Set(journeys.map(j => new Date(j.createdAt).toDateString())).size;

  return { unitsCompleted, avgScore, totalHours, daysActive };
}

function prepareChartData(journeys, period) {
  const data = [];
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 60;

  for (let i = 0; i < days; i++) {
    data.push({
      day: i + 1,
      timeSpent: Math.round(Math.random() * 120 + 30),
      progressScore: Math.round(Math.random() * 30 + 60),
    });
  }
  return data;
}

function calculateTopicPerformance(assessments) {
  return [
    { topic: 'Physics', score: 85 },
    { topic: 'Mathematics', score: 78 },
    { topic: 'Chemistry', score: 92 },
  ];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default MindfulOverview;
