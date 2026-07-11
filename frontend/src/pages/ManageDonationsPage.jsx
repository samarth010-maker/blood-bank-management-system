import { useState, useEffect } from 'react';
import { getAllDonations, updateDonationStatus } from '../api/donation';
import { useAuth } from '../context/AuthContext';

const formatComponent = (c) =>
  c ? c.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') : '—';

const statusStyles = {
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const ManageDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const { token } = useAuth();

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await getAllDonations(token);
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

  const handleComplete = async (id) => {
    const units = window.prompt('How many units were collected?', '1');
    if (units === null) return;

    setUpdatingId(id);
    try {
      await updateDonationStatus(token, id, { status: 'COMPLETED', unitsCollected: Number(units) });
      loadDonations();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (id) => {
    const confirmed = window.confirm('Cancel this scheduled donation?');
    if (!confirmed) return;

    setUpdatingId(id);
    try {
      await updateDonationStatus(token, id, { status: 'CANCELLED' });
      loadDonations();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Manage Donations</h1>
        <p className="text-gray-500 text-sm mb-6">Confirm, complete, or cancel scheduled donations.</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No donations scheduled.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Donor</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Component</th>
                  <th className="text-left px-4 py-3">Units</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{d.donor.user.name}</div>
                      <div className="text-gray-400 text-xs">{d.donor.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(d.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatComponent(d.componentType)}</td>
                    <td className="px-4 py-3 text-gray-600">{d.unitsCollected ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusStyles[d.status]}`}>
                        {d.status.charAt(0) + d.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.status === 'SCHEDULED' && (
                        <div className="flex gap-3">
                          <button
                            disabled={updatingId === d.id}
                            onClick={() => handleComplete(d.id)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                          >
                            Complete
                          </button>
                          <button
                            disabled={updatingId === d.id}
                            onClick={() => handleCancel(d.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
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

export default ManageDonationsPage;