import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('usuarioId');
    if (id) {
      setUsuarioId(id);
    }
  }, []);

  const login = (id, token) => {
    setUsuarioId(id);
    localStorage.setItem('usuarioId', id);
    localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setUsuarioId(null);
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ usuarioId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
