import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DonorRegistrationPage from './pages/DonorRegistrationPage';
import InventoryPage from './pages/InventoryPage';
import MyDonationsPage from './pages/MyDonationsPage';
import ManageDonationsPage from './pages/ManageDonationsPage';
import NewRequestPage from './pages/NewRequestPage';
import ManageRequestsPage from './pages/ManageRequestsPage';
import AuditLogPage from './pages/AuditLogPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DonorDashboardPage from './pages/DonorDashboardPage';
import { useAuth } from './context/AuthContext';

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'DONOR') return <DonorDashboardPage />;
  return <AdminDashboardPage />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/donor-registration" element={<DonorRegistrationPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/my-donations" element={<MyDonationsPage />} />
        <Route path="/manage-donations" element={<ManageDonationsPage />} />
        <Route path="/new-request" element={<NewRequestPage />} />
        <Route path="/manage-requests" element={<ManageRequestsPage />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;