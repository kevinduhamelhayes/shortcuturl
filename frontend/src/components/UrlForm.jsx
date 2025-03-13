import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UrlForm = ({ onUrlCreated }) => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPremiumOptions, setShowPremiumOptions] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [password, setPassword] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);
  const [captchaResponse, setCaptchaResponse] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Fetch user subscription if user is logged in
    const fetchUserSubscription = async () => {
      if (user) {
        try {
          const { data } = await axios.get('http://localhost:5000/api/subscriptions/me', {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          setUserSubscription(data);
        } catch (error) {
          console.error('Error fetching user subscription:', error);
        }
      }
    };

    fetchUserSubscription();
  }, [user]);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    if (!url) {
      setError('Por favor, introduce una URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Por favor, introduce una URL válida (incluyendo http:// o https://)');
      return;
    }

    try {
      setLoading(true);

      // Prepare request data
      const requestData = {
        originalUrl: url,
      };

      // Add premium options if available
      if (userSubscription) {
        if (userSubscription.features.customUrlsEnabled && customCode) {
          requestData.customCode = customCode;
        }
        
        if (userSubscription.features.urlExpiryEnabled && expiresIn) {
          requestData.expiresIn = expiresIn;
        }
        
        if (userSubscription.subscription !== 'free' && password) {
          requestData.password = password;
        }
      }

      // Add CAPTCHA response for non-authenticated users
      if (!user && captchaResponse) {
        requestData.captchaResponse = captchaResponse;
      }

      // Configure headers
      const config = {};
      if (user) {
        config.headers = {
          Authorization: `Bearer ${user.token}`,
        };
      }

      const { data } = await axios.post('http://localhost:5000/api/urls', requestData, config);

      setShortUrl(`http://localhost:5000/${data.shortCode}`);
      
      // Reset form
      setUrl('');
      setCustomCode('');
      setExpiresIn('');
      setPassword('');
      setShowPremiumOptions(false);
      
      // Notify parent component
      if (onUrlCreated) {
        onUrlCreated(data);
      }
    } catch (error) {
      console.error('Error creating short URL:', error);
      
      if (error.response && error.response.data) {
        // Check if it's a premium feature error
        if (error.response.data.isPremiumFeature) {
          setError(`${error.response.data.message} 🔒`);
        } else {
          setError(error.response.data.message || 'Error al acortar la URL');
        }
      } else {
        setError('Error al acortar la URL. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Acorta tu URL
        </h2>
        <p className="text-gray-600">
          Crea un enlace corto y fácil de compartir en segundos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL a acortar
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com/pagina-con-url-muy-larga"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Introduce la URL completa, incluyendo http:// o https://
          </p>
        </div>

        {user && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowPremiumOptions(!showPremiumOptions)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showPremiumOptions ? (
                <>
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                  Ocultar opciones avanzadas
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  Mostrar opciones avanzadas
                </>
              )}
            </button>
          </div>
        )}

        {showPremiumOptions && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-md">
            <div>
              <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                URL personalizada
                {!userSubscription?.features.customUrlsEnabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Premium
                  </span>
                )}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  localhost:5000/
                </span>
                <input
                  type="text"
                  id="customCode"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="mi-url"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!userSubscription?.features.customUrlsEnabled}
                />
              </div>
              {!userSubscription?.features.customUrlsEnabled && (
                <p className="mt-1 text-xs text-gray-500">
                  Actualiza a Premium para personalizar tus URLs.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="expiresIn" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Expiración
                {!userSubscription?.features.urlExpiryEnabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Premium
                  </span>
                )}
              </label>
              <select
                id="expiresIn"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!userSubscription?.features.urlExpiryEnabled}
              >
                <option value="">Sin expiración</option>
                <option value="1">1 día</option>
                <option value="7">7 días</option>
                <option value="30">30 días</option>
                <option value="90">90 días</option>
              </select>
              {!userSubscription?.features.urlExpiryEnabled && (
                <p className="mt-1 text-xs text-gray-500">
                  Actualiza a Premium para establecer fechas de expiración.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Protección con contraseña
                {userSubscription?.subscription === 'free' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Premium
                  </span>
                )}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña para acceder a la URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={userSubscription?.subscription === 'free'}
              />
              {userSubscription?.subscription === 'free' && (
                <p className="mt-1 text-xs text-gray-500">
                  Actualiza a Premium para proteger tus URLs con contraseña.
                </p>
              )}
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <a href="/login" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                    Inicia sesión
                  </a> o <a href="/register" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                    regístrate
                  </a> para guardar tus URLs y acceder a funciones premium.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            <p className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
            {error.includes('Premium') && (
              <a href="/pricing" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800">
                Ver planes premium →
              </a>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Acortando...
            </span>
          ) : (
            'Acortar URL'
          )}
        </button>
      </form>

      {shortUrl && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-medium text-green-800 mb-2">¡URL acortada con éxito!</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={shortUrl}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-l-md bg-white"
            />
            <button
              onClick={copyToClipboard}
              className={`p-2 rounded-r-md ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {copied ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-green-600">
            Comparte este enlace con quien quieras.
          </p>
        </div>
      )}
    </div>
  );
};

export default UrlForm; 