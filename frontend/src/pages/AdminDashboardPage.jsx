import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Droplet, ClipboardList, Calendar, Users, AlertTriangle } from 'lucide-react';
import { getAdminStats, getDonationTrend, getBloodGroupDistribution, getWastageStats } from '../api/analytics';
import { useAuth } from '../context/AuthContext';

const formatBloodGroup = (bg) => {
  const map = { POS: '+', NEG: '-' };
  const [type, sign] = bg.split('_');
  return `${type}${map[sign]}`;
};

const statCards = [
  { key: 'totalUnits', label: 'Units in stock', icon: Droplet, color: 'text-red-600 bg-red-50' },
  { key: 'pendingRequests', label: 'Pending requests', icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
  { key: 'donationsThisMonth', label: 'Donations this month', icon: Calendar, color: 'text-green-600 bg-green-50' },
  { key: 'activeDonors', label: 'Active donors', icon: Users, color: 'text-purple-600 bg-purple-50' },
];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [wastage, setWastage] = useState(null);
  const [loading, setLoading] = useState(true);

  const { token, user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, trendData, distData, wastageData] = await Promise.all([
          getAdminStats(token),
          getDonationTrend(token),
          getBloodGroupDistribution(token),
          getWastageStats(token),
        ]);
        setStats(statsData);
        setTrend(trendData.trend.map((t) => ({ ...t, label: new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) })));
        setDistribution(distData.distribution.map((d) => ({ ...d, label: formatBloodGroup(d.bloodGroup) })));
        setWastage(wastageData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm mb-6">Here's what's happening across the blood bank.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                style={{ animationDelay: `${i * 80}ms` }}
                className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">{stats[card.key]}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        {stats.lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-xl mb-8">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {stats.lowStockCount} blood group{stats.lowStockCount > 1 ? 's are' : ' is'} running low on stock.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            style={{ animationDelay: '320ms' }}
            className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-6"
          >
            <p className="text-sm font-medium text-gray-700 mb-4">Donations — last 14 days</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#dc2626' }}
                  activeDot={{ r: 5 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{ animationDelay: '400ms' }}
            className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-6"
          >
            <p className="text-sm font-medium text-gray-700 mb-4">Units by blood group</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="units" fill="#dc2626" radius={[4, 4, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {wastage && (
          <div
            style={{ animationDelay: '480ms' }}
            className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-700">Wastage from expiry</p>
              <p className="text-xs text-gray-500 mt-0.5">Units and batches that expired unused</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xl font-semibold text-gray-900">{wastage.wastedUnits}</p>
                <p className="text-xs text-gray-500">units</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{wastage.wastedBatches}</p>
                <p className="text-xs text-gray-500">batches</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;