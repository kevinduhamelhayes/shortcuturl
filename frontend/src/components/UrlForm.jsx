import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UrlForm = ({ onUrlCreated }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      // Configurar headers con token si el usuario está autenticado
      const config = user
        ? {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
          }
        : {};

      const { data } = await axios.post(
        'http://localhost:5000/api/urls',
        { originalUrl: url },
        config
      );

      setShortUrl(`http://localhost:5000/${data.shortCode}`);
      setUrl('');
      
      // Si hay una función de callback, llámala con los datos de la URL creada
      if (onUrlCreated) {
        onUrlCreated(data);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 'Error al acortar la URL. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Acorta tu URL</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="url" className="block text-gray-700 mb-2">
            URL a acortar
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com/ruta-muy-larga-que-quieres-acortar"
            required
            className="input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Acortando...' : 'Acortar URL'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {shortUrl && (
        <div className="mt-4 p-4 bg-green-100 rounded-md">
          <p className="text-green-800 mb-2">¡URL acortada con éxito!</p>
          <div className="flex items-center">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {shortUrl}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shortUrl);
                alert('URL copiada al portapapeles');
              }}
              className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              title="Copiar al portapapeles"
            >
              📋
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForm; 