import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UrlForm from '../components/UrlForm';
import UrlList from '../components/UrlList';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [urls, setUrls] = useState([]);

  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  // Función para actualizar la lista de URLs cuando se crea una nueva
  const handleUrlCreated = (newUrl) => {
    setUrls([newUrl, ...urls]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user?.name}. Aquí puedes gestionar tus URLs acortadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <UrlForm onUrlCreated={handleUrlCreated} />
        </div>
        <div className="lg:col-span-2">
          <UrlList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 