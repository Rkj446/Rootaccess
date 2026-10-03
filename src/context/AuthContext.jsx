import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me', {
      validateStatus: (status) => status >= 200 && status < 500,
    })
      .then(({ status, data }) => {
        if (status === 200 && data?.data?.user) {
          setUser(data.data.user);
          return;
        }
        setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user, loading,
    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.data.user);
      return data.data.user;
    },
    async logout() {
      await api.post('/auth/logout').catch(() => {});
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
