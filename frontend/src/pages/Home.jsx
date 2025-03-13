import { useState, useEffect } from 'react';
import axios from 'axios';
import UrlForm from '../components/UrlForm';

const Home = () => {
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalUsers: 0,
    totalClicks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/urls/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-gray-100">
      {/* Hero Section */}
      <div className="container-narrow py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Acorta tus URLs de forma <span className="text-blue-600">sencilla</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Crea enlaces cortos y fáciles de compartir con ShortcutURL
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <UrlForm />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-10">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center transform transition-transform hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="h-10 w-20 mx-auto bg-white/20 animate-pulse rounded"></div>
                ) : (
                  new Intl.NumberFormat().format(stats.totalUrls)
                )}
              </div>
              <p className="text-blue-100">URLs acortadas</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center transform transition-transform hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="h-10 w-20 mx-auto bg-white/20 animate-pulse rounded"></div>
                ) : (
                  new Intl.NumberFormat().format(stats.totalUsers)
                )}
              </div>
              <p className="text-blue-100">Usuarios registrados</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center transform transition-transform hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="h-10 w-20 mx-auto bg-white/20 animate-pulse rounded"></div>
                ) : (
                  new Intl.NumberFormat().format(stats.totalClicks)
                )}
              </div>
              <p className="text-blue-100">Clics totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 md:py-20">
        <div className="container-narrow">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué usar ShortcutURL?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center transform transition-transform hover:scale-105">
              <div className="text-4xl mb-4 text-blue-600">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Rápido y sencillo</h3>
              <p className="text-gray-600">
                Acorta tus URLs en segundos sin necesidad de registrarte. Comparte enlaces más limpios y profesionales.
              </p>
            </div>
            <div className="card text-center transform transition-transform hover:scale-105">
              <div className="text-4xl mb-4 text-blue-600">📊</div>
              <h3 className="text-xl font-semibold mb-2">Estadísticas detalladas</h3>
              <p className="text-gray-600">
                Regístrate para hacer seguimiento de los clics en tus enlaces y conocer el rendimiento de tus campañas.
              </p>
            </div>
            <div className="card text-center transform transition-transform hover:scale-105">
              <div className="text-4xl mb-4 text-blue-600">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Seguro y confiable</h3>
              <p className="text-gray-600">
                Tus enlaces son seguros y están disponibles cuando los necesites. Servicio confiable 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-12 md:py-16">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para empezar?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Crea una cuenta gratuita y comienza a gestionar tus enlaces acortados
          </p>
          <a href="/register" className="btn bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 text-lg font-medium">
            Registrarse gratis
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home; 