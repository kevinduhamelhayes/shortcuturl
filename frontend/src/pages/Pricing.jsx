import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const [userSubscription, setUserSubscription] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/subscriptions/plans');
        setPlans(data);
      } catch (error) {
        setError('Error al cargar los planes. Por favor, intenta de nuevo.');
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

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

    fetchPlans();
    fetchUserSubscription();
  }, [user]);

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/login?redirect=pricing');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        'http://localhost:5000/api/subscriptions/create-checkout-session',
        { planId },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // Manejar respuesta de simulación en modo desarrollo
      if (data.success && data.redirectUrl) {
        navigate('/dashboard');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      setError('Error al procesar la suscripción. Por favor, intenta de nuevo.');
      console.error('Error creating checkout session:', error);
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    if (window.confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      try {
        setLoading(true);
        await axios.post(
          'http://localhost:5000/api/subscriptions/cancel',
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        
        alert('Tu suscripción se cancelará al final del período de facturación.');
        
        // Refresh subscription data
        const { data } = await axios.get('http://localhost:5000/api/subscriptions/me', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setUserSubscription(data);
        setLoading(false);
      } catch (error) {
        setError('Error al cancelar la suscripción. Por favor, intenta de nuevo.');
        console.error('Error canceling subscription:', error);
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="container-wide py-12">
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-12 md:py-20">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes y Precios</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Todos los planes incluyen funciones básicas de acortamiento de URLs.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-8 max-w-3xl mx-auto">
            <p className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {userSubscription && userSubscription.subscription !== 'free' && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-8 max-w-3xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  Actualmente tienes el plan <span className="font-bold">{userSubscription.subscription.toUpperCase()}</span>.
                  {userSubscription.subscriptionExpiry && (
                    <span> Tu suscripción se renovará el {new Date(userSubscription.subscriptionExpiry).toLocaleDateString()}.</span>
                  )}
                </p>
                <div className="mt-2">
                  <button
                    onClick={handleCancelSubscription}
                    className="text-sm text-blue-800 underline hover:text-blue-600"
                  >
                    Cancelar suscripción
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="card border-2 border-gray-200 hover:border-gray-300 transition-all">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratis</h3>
              <p className="text-gray-600 mb-6">Para uso personal básico</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">€0 <span className="text-base font-normal text-gray-600">/ mes</span></p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Acortamiento de URLs ilimitado</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Estadísticas básicas de clics</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Hasta 10 URLs guardadas</span>
                </li>
                <li className="flex items-start text-gray-500">
                  <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>URLs personalizadas</span>
                </li>
                <li className="flex items-start text-gray-500">
                  <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Análisis detallado</span>
                </li>
                <li className="flex items-start text-gray-500">
                  <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Protección con contraseña</span>
                </li>
              </ul>
              
              <button
                className="btn btn-outline w-full"
                disabled={true}
              >
                Plan actual
              </button>
            </div>
          </div>

          {/* Premium Plans */}
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`card border-2 ${plan.id === 'premium' ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'} transition-all`}
            >
              {plan.id === 'premium' && (
                <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                  RECOMENDADO
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <p className="text-4xl font-bold text-gray-900 mb-6">€{plan.price} <span className="text-base font-normal text-gray-600">/ {plan.interval}</span></p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={userSubscription && userSubscription.subscription === plan.id}
                  className={`w-full ${
                    plan.id === 'premium'
                      ? 'btn btn-primary'
                      : 'btn btn-secondary'
                  } ${
                    userSubscription && userSubscription.subscription === plan.id
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {userSubscription && userSubscription.subscription === plan.id
                    ? 'Plan actual'
                    : 'Suscribirse'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card">
              <h3 className="font-bold text-lg mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-gray-600">Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán al final del período de facturación actual.</p>
            </div>
            
            <div className="card">
              <h3 className="font-bold text-lg mb-2">¿Cómo funciona la facturación?</h3>
              <p className="text-gray-600">La facturación es mensual y se renueva automáticamente. Puedes cancelar tu suscripción en cualquier momento desde tu panel de control.</p>
            </div>
            
            <div className="card">
              <h3 className="font-bold text-lg mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-gray-600">Aceptamos todas las tarjetas de crédito principales (Visa, Mastercard, American Express) a través de nuestra pasarela de pago segura.</p>
            </div>
            
            <div className="card">
              <h3 className="font-bold text-lg mb-2">¿Ofrecen soporte técnico?</h3>
              <p className="text-gray-600">Sí, todos los planes incluyen soporte técnico. Los planes premium y enterprise incluyen soporte prioritario con tiempos de respuesta más rápidos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 