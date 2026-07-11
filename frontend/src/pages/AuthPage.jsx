import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import { login, signup } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DONOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data =
        mode === 'login'
          ? await login(email, password)
          : await signup(name, email, password, role);

      saveAuth(data.token, data.user);
      if (mode === 'signup' && role === 'DONOR') {
        navigate('/donor-registration');
        } else {
        navigate('/dashboard');
        }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-900">
      <div className="flex flex-col justify-center px-10 md:px-20 py-12">
        <div className="relative flex bg-gray-800 rounded-lg p-1 mb-8 max-w-xs">
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gray-700 rounded-md transition-all duration-300 ease-out"
            style={{ left: mode === 'login' ? '4px' : 'calc(50% + 0px)' }}
          />
          <button
            onClick={() => setMode('login')}
            className={`relative z-10 flex-1 py-2 rounded-md text-sm font-medium transition ${
              mode === 'login' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`relative z-10 flex-1 py-2 rounded-md text-sm font-medium transition ${
              mode === 'signup' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            Sign up
          </button>
        </div>

        <h1 className="text-2xl font-semibold mb-1 text-white">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {mode === 'login'
            ? 'Log in to manage donations and requests.'
            : 'Join the network as a donor, staff, or admin.'}
        </p>

        {error && (
          <div className="bg-red-950 text-red-400 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-sm">
          {mode === 'signup' && (
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-1 block">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Reyes"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@hospital.org"
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={8}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            />
          </div>

          {mode === 'signup' && (
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {['DONOR', 'STAFF', 'ADMIN'].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-md border text-sm transition ${
                      role === r
                        ? 'border-red-500 bg-red-500/10 text-red-400 font-medium'
                        : 'border-gray-700 text-gray-400'
                    }`}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition text-white font-medium py-2.5 rounded-md text-sm disabled:opacity-60"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>

      <div className="hidden md:flex flex-col items-center justify-center bg-green-100 px-10">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <span className="absolute rounded-full border border-red-200 animate-pulseRing" />
          <span className="absolute rounded-full border border-red-200 animate-pulseRing [animation-delay:1.3s]" />
          <Droplet className="w-14 h-14 text-red-600 fill-red-600 animate-drip relative z-10" />        </div>
        <h2 className="text-xl font-semibold mt-8 text-center text-gray-900">
          Save lives, donate blood
        </h2>
        <p className="text-sm text-gray-500 text-center mt-1 max-w-xs">
          Real-time inventory across every blood group and component.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;