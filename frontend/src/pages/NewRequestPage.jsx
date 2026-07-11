import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { createRequest } from '../api/request';
import { useAuth } from '../context/AuthContext';

const bloodGroups = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const componentTypes = ['WHOLE_BLOOD', 'PLASMA', 'PLATELETS'];
const urgencyLevels = ['NORMAL', 'URGENT', 'EMERGENCY'];

const formatBloodGroup = (bg) => {
  const map = { POS: '+', NEG: '-' };
  const [type, sign] = bg.split('_');
  return `${type}${map[sign]}`;
};

const formatComponent = (c) =>
  c.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

const urgencyStyles = {
  NORMAL: 'border-gray-300 text-gray-600',
  URGENT: 'border-yellow-400 bg-yellow-50 text-yellow-700',
  EMERGENCY: 'border-red-500 bg-red-50 text-red-600',
};

const NewRequestPage = () => {
  const [requesterName, setRequesterName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [componentType, setComponentType] = useState('WHOLE_BLOOD');
  const [unitsNeeded, setUnitsNeeded] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createRequest(token, {
        requesterName,
        hospitalName,
        bloodGroup,
        componentType,
        unitsNeeded: Number(unitsNeeded),
        urgency,
      });
      setSuccess(true);
      setRequesterName('');
      setHospitalName('');
      setBloodGroup('');
      setUnitsNeeded('');
      setUrgency('NORMAL');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold mb-1">Request Blood</h1>
        <p className="text-gray-500 text-sm mb-6">
          Submit a request for blood units on behalf of a patient or hospital.
        </p>

        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-md mb-4">
            Request submitted successfully.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Requester name</label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Hospital name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block">Blood group needed</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodGroups.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`py-2 rounded-md border text-sm font-medium transition ${
                    bloodGroup === bg
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {formatBloodGroup(bg)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Component</label>
              <select
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {componentTypes.map((c) => (
                  <option key={c} value={c}>{formatComponent(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Units needed</label>
              <input
                type="number"
                min="1"
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-2 block">Urgency</label>
            <div className="grid grid-cols-3 gap-2">
              {urgencyLevels.map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setUrgency(level)}
                  className={`py-2 rounded-md border text-sm font-medium transition flex items-center justify-center gap-1 ${
                    urgency === level ? urgencyStyles[level] : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {level === 'EMERGENCY' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !bloodGroup}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition text-white font-medium py-2.5 rounded-md text-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewRequestPage;