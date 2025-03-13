import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container-narrow py-16 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <div className="mt-4 mb-8">
          <div className="text-3xl font-bold text-gray-800 mb-2">Página no encontrada</div>
          <p className="text-gray-600 max-w-md mx-auto">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 