import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { getInventory, createInventory, deleteInventory } from '../api/inventory';
import { useAuth } from '../context/AuthContext';

const bloodGroups = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const componentTypes = ['WHOLE_BLOOD', 'PLASMA', 'PLATELETS'];
const storageLocations = [
  'Fridge A1',
  'Fridge A2',
  'Fridge B1',
  'Fridge B2',
  'Freezer C1',
  'Freezer C2',
];

const formatBloodGroup = (bg) => {
  const map = { POS: '+', NEG: '-' };
  const [type, sign] = bg.split('_');
  return `${type}${map[sign]}`;
};

const formatComponent = (c) =>
  c.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

const statusStyles = {
  HEALTHY: 'bg-green-50 text-green-700 border-green-200',
  NEAR_EXPIRY: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels = {
  HEALTHY: 'Healthy',
  NEAR_EXPIRY: 'Near Expiry',
  EXPIRED: 'Expired',
};

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bloodGroup, setBloodGroup] = useState('');
  const [componentType, setComponentType] = useState('');
  const [unitsAvailable, setUnitsAvailable] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('');

  const { token, user } = useAuth();
  const canManage = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory(token);
      setInventory(data.inventory);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createInventory(token, {
        bloodGroup,
        componentType,
        unitsAvailable: Number(unitsAvailable),
        expiryDate,
        storageLocation,
      });
      setShowForm(false);
      setBloodGroup('');
      setComponentType('');
      setUnitsAvailable('');
      setExpiryDate('');
      setStorageLocation('');
      loadInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Discard this inventory unit? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteInventory(token, id);
      loadInventory();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Blood Inventory</h1>
            <p className="text-gray-500 text-sm mt-1">
              Real-time stock across all blood groups and components.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'Add Stock'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="bg-white border border-gray-200 rounded-xl p-6 mb-6 grid grid-cols-2 md:grid-cols-5 gap-4 items-end"
          >
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
              >
                <option value="">Select</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{formatBloodGroup(bg)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Component</label>
              <select
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
              >
                <option value="">Select</option>
                {componentTypes.map((c) => (
                  <option key={c} value={c}>{formatComponent(c)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Units</label>
              <input
                type="number"
                min="1"
                value={unitsAvailable}
                onChange={(e) => setUnitsAvailable(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Location</label>
                <select
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                >
                  <option value="">Select location</option>
                  {storageLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition disabled:opacity-60 h-[38px]"
              >
                {submitting ? '...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading inventory...</div>
          ) : inventory.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No inventory yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Blood Group</th>
                  <th className="text-left px-4 py-3">Component</th>
                  <th className="text-left px-4 py-3">Units</th>
                  <th className="text-left px-4 py-3">Expiry</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Status</th>
                  {canManage && <th className="text-left px-4 py-3">Action</th>}
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatBloodGroup(item.bloodGroup)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatComponent(item.componentType)}</td>
                    <td className="px-4 py-3 text-gray-600">{item.unitsAvailable}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.storageLocation || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full border ${statusStyles[item.expiryStatus]}`}
                      >
                        {statusLabels[item.expiryStatus]}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Discard
                        </button>
                      </td>
                    )}
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

export default InventoryPage;