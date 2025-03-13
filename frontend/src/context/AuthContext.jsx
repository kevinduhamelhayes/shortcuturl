import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar la aplicación
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Verificar que el token sea válido
        verifyToken(parsedUser.token);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Verificar que el token sea válido
  const verifyToken = async (token) => {
    try {
      await axios.get('http://localhost:5000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Si no hay error, el token es válido
    } catch (error) {
      console.error('Token verification failed:', error);
      // Si hay error, el token no es válido
      logout();
    }
  };

  const login = async (email, password) => {
    setAuthError('');
    setLoading(true);
    
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });
      
      // Guardar usuario en el estado y localStorage
      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        token: data.token,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        setAuthError(error.response.data.message || 'Credenciales inválidas');
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        setAuthError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        // Algo ocurrió al configurar la solicitud
        setAuthError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      }
      
      return { success: false, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setAuthError('');
    setLoading(true);
    
    try {
      const { data } = await axios.post('http://localhost:5000/api/users', {
        name,
        email,
        password,
      });
      
      // Guardar usuario en el estado y localStorage
      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        token: data.token,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        setAuthError(error.response.data.message || 'Error al registrar usuario');
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        setAuthError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        // Algo ocurrió al configurar la solicitud
        setAuthError('Error al registrar usuario. Por favor, intenta de nuevo.');
      }
      
      return { success: false, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        register,
        logout,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 