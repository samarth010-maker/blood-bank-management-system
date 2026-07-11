import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { createDonorProfile } from '../api/donor';
import { useAuth } from '../context/AuthContext';

const bloodGroups = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

const formatBloodGroup = (bg) => {
  const map = { POS: '+', NEG: '-' };
  const [type, sign] = bg.split('_');
  return `${type}${map[sign]}`;
};

const DonorRegistrationPage = () => {
  const [bloodGroup, setBloodGroup] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleUseLocation = () => {
    setError('');
    setLocating(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setError('Could not get your location. You can still continue without it.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createDonorProfile(token, {
        bloodGroup,
        dateOfBirth,
        address,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold mb-1">Complete your donor profile</h1>
        <p className="text-gray-500 text-sm mb-6">
          This helps us match you with nearby blood requests.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block">Blood group</label>
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

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Date of birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Address (optional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Gurugram, Haryana"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
            />
          </div>

          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-sm text-gray-700 mb-6 hover:bg-gray-50 transition disabled:opacity-60"
          >
            <MapPin className="w-4 h-4" />
            {locating
              ? 'Getting your location...'
              : coords
              ? 'Location captured ✓'
              : 'Use my current location'}
          </button>

          <button
            type="submit"
            disabled={loading || !bloodGroup || !dateOfBirth}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition text-white font-medium py-2.5 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonorRegistrationPage;