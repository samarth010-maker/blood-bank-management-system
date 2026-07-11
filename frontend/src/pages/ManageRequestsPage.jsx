import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllRequests, getMatchesForRequest, fulfillRequest, rejectRequest } from '../api/request';
import { useAuth } from '../context/AuthContext';

const formatBloodGroup = (bg) => {
  const map = { POS: '+', NEG: '-' };
  const [type, sign] = bg.split('_');
  return `${type}${map[sign]}`;
};

const formatComponent = (c) =>
  c.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

const urgencyStyles = {
  NORMAL: 'bg-gray-100 text-gray-600',
  URGENT: 'bg-yellow-100 text-yellow-700',
  EMERGENCY: 'bg-red-100 text-red-700',
};

const statusStyles = {
  PENDING: 'bg-blue-50 text-blue-700 border-blue-200',
  FULFILLED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const ManageRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [matchesById, setMatchesById] = useState({});
  const [actingId, setActingId] = useState(null);

  const { token } = useAuth();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllRequests(token);
      setRequests(data.requests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (!matchesById[id]) {
      try {
        const data = await getMatchesForRequest(token, id);
        setMatchesById((prev) => ({ ...prev, [id]: data }));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFulfill = async (id) => {
    setActingId(id);
    try {
      await fulfillRequest(token, id);
      loadRequests();
      setExpandedId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm('Reject this blood request?');
    if (!confirmed) return;

    setActingId(id);
    try {
      await rejectRequest(token, id);
      loadRequests();
      setExpandedId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Blood Requests</h1>
        <p className="text-gray-500 text-sm mb-6">
          Sorted by urgency. Expand a request to see available matches.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
              Loading...
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
              No requests yet.
            </div>
          ) : (
            requests.map((r) => {
              const isExpanded = expandedId === r.id;
              const matches = matchesById[r.id];

              return (
                <div key={r.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleExpand(r.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${urgencyStyles[r.urgency]}`}>
                        {r.urgency === 'EMERGENCY' && <AlertTriangle className="w-3 h-3" />}
                        {r.urgency}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatBloodGroup(r.bloodGroup)} · {formatComponent(r.componentType)} · {r.unitsNeeded} units
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.hospitalName} — {r.requesterName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusStyles[r.status]}`}>
                        {r.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                      {!matches ? (
                        <div className="text-sm text-gray-400">Loading matches...</div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-600">
                              Total available: <strong>{matches.totalAvailableUnits}</strong> units
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              matches.canFulfill ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {matches.canFulfill ? 'Can fulfill' : 'Insufficient stock'}
                            </span>
                          </div>

                          {matches.exactMatches.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-gray-500 mb-1">Exact matches</div>
                              <div className="flex flex-wrap gap-2">
                                {matches.exactMatches.map((m) => (
                                  <span key={m.id} className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1">
                                    {formatBloodGroup(m.bloodGroup)} — {m.unitsAvailable} units ({m.storageLocation})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {matches.substituteMatches.length > 0 && (
                            <div className="mb-4">
                              <div className="text-xs text-gray-500 mb-1">Compatible substitutes</div>
                              <div className="flex flex-wrap gap-2">
                                {matches.substituteMatches.map((m) => (
                                  <span key={m.id} className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1">
                                    {formatBloodGroup(m.bloodGroup)} — {m.unitsAvailable} units ({m.storageLocation})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {r.status === 'PENDING' && (
                            <div className="flex gap-3">
                              <button
                                disabled={!matches.canFulfill || actingId === r.id}
                                onClick={() => handleFulfill(r.id)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Fulfill Request
                              </button>
                              <button
                                disabled={actingId === r.id}
                                onClick={() => handleReject(r.id)}
                                className="border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-medium px-3 py-1.5 rounded-md transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRequestsPage;