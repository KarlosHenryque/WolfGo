import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    localStorage.setItem('usuarioLogado', 'true'); 
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('usuarioLogado');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
