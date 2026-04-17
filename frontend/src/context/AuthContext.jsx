import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('timbertrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('timbertrack_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (phone, pin) => {
    const res = await authAPI.login({ phone, pin });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('timbertrack_token', newToken);
    localStorage.setItem('timbertrack_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res;
  };

  const register = async (phone, name, pin) => {
    const res = await authAPI.register({ phone, name, pin });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('timbertrack_token', newToken);
    localStorage.setItem('timbertrack_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('timbertrack_token');
    localStorage.removeItem('timbertrack_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
