import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/Layout/AppLayout';
import AuthGuard from './components/AuthGuard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import CustomersPage from './pages/CustomersPage';
import ReportPage from './pages/ReportPage';
import AlertsPage from './pages/AlertsPage';
import FeedbackPage from './pages/FeedbackPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 10,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        },
      }}
    >
      <AntApp>
        <HashRouter>
          <Routes>
            {/* 公开页面 */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 需要登录的页面 */}
            <Route
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route path="/home" element={<WelcomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route
              element={
                <AuthGuard requireAdmin>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  );
}
