import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { isAdminUser } from '../utils/admin';

export default function AdminRedirect() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAdminUser(user) && location.pathname !== '/admin') {
      navigate('/admin', { replace: true });
    }
  }, [location.pathname, navigate, user]);

  return null;
}
