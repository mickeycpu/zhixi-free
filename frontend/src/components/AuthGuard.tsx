import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { getMe } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { isAdminUser, withAdminFallback } from '../utils/admin';

export default function AuthGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || user) {
      return;
    }

    let active = true;
    async function loadUser() {
      setLoading(true);
      try {
        const res = await getMe();
        if (!active) return;
        if (res.code === 0) {
          setUser(withAdminFallback(res.data));
        } else {
          logout();
        }
      } catch {
        if (active) logout();
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [isLoggedIn, logout, setUser, user]);

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading || (isLoggedIn && !user)) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (requireAdmin && !isAdminUser(user)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
