import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Heart, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { getDonorStats } from '../api/analytics';
import { useAuth } from '../context/AuthContext';

const formatBloodGroup = (bg) => {
  const map = { POS: '+', NEG: '-' };
  const [type, sign] = bg.split('_');
  return `${type}${map[sign]}`;
};

const DonorDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDonorStats(token);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 mb-4">Complete your donor profile to see your dashboard.</p>
        <button
          onClick={() => navigate('/donor-registration')}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
        >
          Complete profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Hi, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm mb-8">Thank you for being a donor. Here's your impact so far.</p>

        <div
          className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-6 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <span className="absolute w-14 h-14 rounded-full border border-red-100 animate-pulseRing" />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.isEligible ? 'bg-green-50' : 'bg-yellow-50'}`}>
                {stats.isEligible ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Clock className="w-6 h-6 text-yellow-600" />
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {stats.isEligible ? "You're eligible to donate" : 'Not yet eligible'}
              </p>
              <p className="text-sm text-gray-500">
                {stats.isEligible
                  ? 'You can schedule your next donation anytime.'
                  : `${stats.daysUntilEligible} day(s) remaining until you're eligible again.`}
              </p>
            </div>
          </div>
          {stats.isEligible && (
            <button
              onClick={() => navigate('/my-donations')}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-md transition"
            >
              Schedule now
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div style={{ animationDelay: '100ms' }} className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-5 text-center">
            <Droplet className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{formatBloodGroup(stats.bloodGroup)}</p>
            <p className="text-xs text-gray-500 mt-1">Blood group</p>
          </div>
          <div style={{ animationDelay: '180ms' }} className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-5 text-center">
            <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{stats.totalDonations}</p>
            <p className="text-xs text-gray-500 mt-1">Total donations</p>
          </div>
          <div style={{ animationDelay: '260ms' }} className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-5 text-center">
            <Droplet className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{stats.totalUnitsContributed}</p>
            <p className="text-xs text-gray-500 mt-1">Units contributed</p>
          </div>
        </div>

        {stats.nextDonation && (
          <div style={{ animationDelay: '340ms' }} className="opacity-0 animate-fadeUp bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Upcoming donation</p>
              <p className="text-xs text-gray-500">
                {new Date(stats.nextDonation.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboardPage;