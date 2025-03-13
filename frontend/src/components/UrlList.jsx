import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UrlList = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUrls = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get('http://localhost:5000/api/urls', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setUrls(data);
      } catch (error) {
        setError('Error al cargar tus URLs. Por favor, intenta de nuevo.');
        console.error('Error fetching URLs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta URL?')) {
      try {
        await axios.delete(`http://localhost:5000/api/urls/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setUrls(urls.filter((url) => url._id !== id));
      } catch (error) {
        setError('Error al eliminar la URL. Por favor, intenta de nuevo.');
        console.error('Error deleting URL:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="card mt-8">
        <p className="text-center text-gray-600">
          Inicia sesión para ver tus URLs acortadas.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card mt-8">
        <p className="text-center text-gray-600">Cargando tus URLs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card mt-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="card mt-8">
        <p className="text-center text-gray-600">
          No tienes URLs acortadas. ¡Crea una ahora!
        </p>
      </div>
    );
  }

  return (
    <div className="card mt-8">
      <h2 className="text-2xl font-bold mb-4">Tus URLs acortadas</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL Original
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL Acortada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creada
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {urls.map((url) => (
              <tr key={url._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {url.originalUrl}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a
                    href={`http://localhost:5000/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {`http://localhost:5000/${url.shortCode}`}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `http://localhost:5000/${url.shortCode}`
                      );
                      alert('URL copiada al portapapeles');
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    title="Copiar al portapapeles"
                  >
                    📋
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {url.clicks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(url.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(url._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UrlList; 