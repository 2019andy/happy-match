import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import UserManage from './pages/UserManage';
import LevelManage from './pages/LevelManage';
import ActivityManage from './pages/ActivityManage';
import AdManage from './pages/AdManage';
import Analytics from './pages/Analytics';
import ShopManage from './pages/ShopManage';
import PaymentManage from './pages/PaymentManage';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManage />} />
        <Route path="levels" element={<LevelManage />} />
        <Route path="activities" element={<ActivityManage />} />
        <Route path="ads" element={<AdManage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="shop" element={<ShopManage />} />
        <Route path="payments" element={<PaymentManage />} />
      </Route>
    </Routes>
  );
}

export default App;