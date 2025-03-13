import { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UrlForm from '../components/UrlForm';
import UrlList from '../components/UrlList';
import axios from 'axios';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    mostClicked: null
  });

  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchUrls = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await axios.get('http://localhost:5000/api/urls', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        setUrls(data);
        
        // Calcular estadísticas
        const totalUrls = data.length;
        const totalClicks = data.reduce((sum, url) => sum + url.clicks, 0);
        const mostClicked = data.length > 0 
          ? data.reduce((prev, current) => (prev.clicks > current.clicks) ? prev : current) 
          : null;
        
        setStats({
          totalUrls,
          totalClicks,
          mostClicked
        });
      } catch (error) {
        setError('Error al cargar tus URLs. Por favor, intenta de nuevo.');
        console.error('Error fetching URLs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, [user]);

  // Función para actualizar la lista de URLs cuando se crea una nueva
  const handleUrlCreated = (newUrl) => {
    setUrls([newUrl, ...urls]);
    setStats(prev => ({
      totalUrls: prev.totalUrls + 1,
      totalClicks: prev.totalClicks,
      mostClicked: prev.mostClicked && prev.mostClicked.clicks > 0 ? prev.mostClicked : newUrl
    }));
  };

  // Función para actualizar la lista de URLs cuando se elimina una
  const handleUrlDeleted = (deletedUrlId) => {
    const deletedUrl = urls.find(url => url._id === deletedUrlId);
    const updatedUrls = urls.filter(url => url._id !== deletedUrlId);
    setUrls(updatedUrls);
    
    // Actualizar estadísticas
    const totalClicks = updatedUrls.reduce((sum, url) => sum + url.clicks, 0);
    const mostClicked = updatedUrls.length > 0 
      ? updatedUrls.reduce((prev, current) => (prev.clicks > current.clicks) ? prev : current) 
      : null;
    
    setStats({
      totalUrls: updatedUrls.length,
      totalClicks,
      mostClicked
    });
  };

  return (
    <div className="bg-gray-50 py-8 md:py-12">
      <div className="container-wide">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bienvenido, <span className="font-medium">{user?.name}</span>. Aquí puedes gestionar tus URLs acortadas.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card bg-white border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de URLs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUrls}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-white border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de clics</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-white border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">URL más visitada</p>
                {stats.mostClicked ? (
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.mostClicked.clicks} clics</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{stats.mostClicked.originalUrl}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No hay datos</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <UrlForm onUrlCreated={handleUrlCreated} />
          </div>
          <div className="lg:col-span-2">
            <UrlList urls={urls} isLoading={isLoading} error={error} onUrlDeleted={handleUrlDeleted} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 