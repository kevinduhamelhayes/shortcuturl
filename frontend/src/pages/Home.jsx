import UrlForm from '../components/UrlForm';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Acorta tus URLs de forma sencilla
        </h1>
        <p className="text-xl text-gray-600">
          Crea enlaces cortos y fáciles de compartir con ShortcutURL
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <UrlForm />
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-3xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold mb-2">Rápido y sencillo</h3>
          <p className="text-gray-600">
            Acorta tus URLs en segundos sin necesidad de registrarte
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Estadísticas</h3>
          <p className="text-gray-600">
            Registrate para hacer seguimiento de los clics en tus enlaces
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Seguro</h3>
          <p className="text-gray-600">
            Tus enlaces son seguros y están disponibles cuando los necesites
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 