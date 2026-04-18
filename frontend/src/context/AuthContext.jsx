import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('timbertrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('timbertrack_user');
    const storedOrg = localStorage.getItem('timbertrack_org');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedOrg) setOrganization(JSON.parse(storedOrg));
    }
    setLoading(false);
  }, [token]);

  const _store = ({ token: newToken, user: userData, organization: orgData }) => {
    localStorage.setItem('timbertrack_token', newToken);
    localStorage.setItem('timbertrack_user', JSON.stringify(userData));
    if (orgData) localStorage.setItem('timbertrack_org', JSON.stringify(orgData));
    setToken(newToken);
    setUser(userData);
    setOrganization(orgData || null);
  };

  const login = async (phone, pin) => {
    const res = await authAPI.login({ phone, pin });
    _store(res.data);
    return res;
  };

  const register = async (payload) => {
    // payload: { name, phone, pin, organizationName } or { name, phone, pin, inviteCode }
    const res = await authAPI.register(payload);
    _store(res.data);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('timbertrack_token');
    localStorage.removeItem('timbertrack_user');
    localStorage.removeItem('timbertrack_org');
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  // Role helpers
  const isOwner = () => user?.role === 'OWNER';
  const isWorker = () => user?.role === 'WORKER';

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!token,
      isOwner,
      isWorker,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
