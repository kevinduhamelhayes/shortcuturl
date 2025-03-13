const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const User = require('../models/User');

// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'premium',
        name: 'Premium',
        description: 'Acceso a todas las funciones premium',
        price: 9.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'URLs personalizadas',
          'Análisis detallado de clics',
          'Protección con contraseña',
          'Hasta 100 URLs',
          'Soporte prioritario',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Para equipos y empresas',
        price: 29.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'URLs personalizadas',
          'Análisis detallado de clics',
          'Protección con contraseña',
          'URLs ilimitadas',
          'Soporte prioritario 24/7',
          'API de integración',
          'Dominios personalizados',
        ],
      },
    ];

    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create checkout session
// @route   POST /api/subscriptions/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // En modo desarrollo, simular la suscripción sin Stripe
    if (process.env.NODE_ENV === 'development' && (!stripe || !process.env.STRIPE_SECRET_KEY.startsWith('sk_'))) {
      // Actualizar usuario directamente
      user.subscription = planId;
      
      // Establecer fecha de expiración a 1 mes desde ahora
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      user.subscriptionExpiry = expiryDate;

      // Habilitar características premium
      if (planId === 'premium' || planId === 'enterprise') {
        user.customUrlsEnabled = true;
        user.analyticsEnabled = true;
        user.urlExpiryEnabled = true;
        user.maxUrls = planId === 'premium' ? 100 : 1000;
      }

      await user.save();

      return res.json({ 
        success: true, 
        message: 'Suscripción simulada activada en modo desarrollo',
        redirectUrl: `${process.env.FRONTEND_URL}/dashboard`
      });
    }

    // Verificar que Stripe esté configurado
    if (!stripe) {
      return res.status(500).json({ 
        message: 'Stripe no está configurado. Por favor, configura STRIPE_SECRET_KEY en el archivo .env' 
      });
    }

    // Determine price based on plan
    let priceId;
    if (planId === 'premium') {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    } else if (planId === 'enterprise') {
      priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
    } else {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId: user._id.toString(),
        planId: planId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Handle webhook events from Stripe
// @route   POST /api/subscriptions/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  // Si Stripe no está configurado, devolver éxito simulado
  if (!stripe) {
    return res.json({ received: true, simulated: true });
  }

  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;
    case 'invoice.paid':
      const invoice = event.data.object;
      await handleInvoicePaid(invoice);
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionDeleted(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Helper function to handle checkout session completed
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const userId = session.metadata.userId;
    const planId = session.metadata.planId;
    const user = await User.findById(userId);

    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    // Update user subscription
    user.subscription = planId;
    
    // Set expiry date to 1 month from now
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    user.subscriptionExpiry = expiryDate;

    // Enable premium features based on plan
    if (planId === 'premium' || planId === 'enterprise') {
      user.customUrlsEnabled = true;
      user.analyticsEnabled = true;
      user.urlExpiryEnabled = true;
      user.maxUrls = planId === 'premium' ? 100 : 1000;
    }

    await user.save();
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
};

// Helper function to handle invoice paid
const handleInvoicePaid = async (invoice) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customer = await stripe.customers.retrieve(invoice.customer);
    const userId = customer.metadata.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    // Extend subscription expiry date
    const expiryDate = new Date(user.subscriptionExpiry);
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    user.subscriptionExpiry = expiryDate;
    
    await user.save();
  } catch (error) {
    console.error('Error handling invoice paid:', error);
  }
};

// Helper function to handle subscription deleted
const handleSubscriptionDeleted = async (subscription) => {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    // Downgrade user to free plan
    user.subscription = 'free';
    user.subscriptionExpiry = null;
    user.customUrlsEnabled = false;
    user.analyticsEnabled = false;
    user.urlExpiryEnabled = false;
    user.maxUrls = 10;
    
    await user.save();
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
};

// @desc    Get user subscription
// @route   GET /api/subscriptions/me
// @access  Private
const getUserSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if subscription has expired
    if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
      user.subscription = 'free';
      user.subscriptionExpiry = null;
      user.customUrlsEnabled = false;
      user.analyticsEnabled = false;
      user.urlExpiryEnabled = false;
      user.maxUrls = 10;
      await user.save();
    }

    res.json({
      subscription: user.subscription,
      subscriptionExpiry: user.subscriptionExpiry,
      features: {
        customUrlsEnabled: user.customUrlsEnabled,
        analyticsEnabled: user.analyticsEnabled,
        urlExpiryEnabled: user.urlExpiryEnabled,
        maxUrls: user.maxUrls,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // En modo desarrollo, simular la cancelación sin Stripe
    if (process.env.NODE_ENV === 'development' && (!stripe || !process.env.STRIPE_SECRET_KEY.startsWith('sk_'))) {
      // No cancelar inmediatamente, simular que se cancela al final del período
      res.json({ message: 'Subscription will be canceled at the end of the billing period' });
      return;
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Get subscriptions for customer
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Cancel subscription at period end
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });

    res.json({ message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSubscriptionPlans,
  createCheckoutSession,
  handleWebhook,
  getUserSubscription,
  cancelSubscription,
}; 