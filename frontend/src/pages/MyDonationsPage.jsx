import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { scheduleDonation, getMyDonations } from '../api/donation';
import { useAuth } from '../context/AuthContext';

const componentTypes = ['WHOLE_BLOOD', 'PLASMA', 'PLATELETS'];

const formatComponent = (c) =>
  c.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

const statusStyles = {
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const MyDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [scheduledDate, setScheduledDate] = useState('');
  const [componentType, setComponentType] = useState('WHOLE_BLOOD');

  const { token } = useAuth();

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await getMyDonations(token);
      setDonations(data.donations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await scheduleDonation(token, { scheduledDate, componentType });
      setScheduledDate('');
      loadDonations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Donations</h1>
        <p className="text-gray-500 text-sm mb-6">Schedule and track your donation history.</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSchedule}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-8 flex flex-wrap gap-4 items-end"
        >
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date</label>
            <input
              type="date"
              min={today}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Component</label>
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {componentTypes.map((c) => (
                <option key={c} value={c}>{formatComponent(c)}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition disabled:opacity-60"
          >
            <Calendar className="w-4 h-4" />
            {submitting ? 'Scheduling...' : 'Schedule Donation'}
          </button>
        </form>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No donations scheduled yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Component</th>
                  <th className="text-left px-4 py-3">Units</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(d.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {d.componentType ? formatComponent(d.componentType) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.unitsCollected ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusStyles[d.status]}`}>
                        {d.status.charAt(0) + d.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDonationsPage;