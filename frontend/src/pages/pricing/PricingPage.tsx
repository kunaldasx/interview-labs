import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDodoCheckout } from '../../hooks/useDodoCheckout';

type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

const currencySymbols: Record<Currency, string> = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' };

const prices: Record<Currency, { starter: number; professional: number; enterprise: number; perInterview: number; student: number }> = {
  INR: { starter: 4999, professional: 14999, enterprise: 49999, perInterview: 200, student: 500 },
  USD: { starter: 60, professional: 180, enterprise: 600, perInterview: 2.5, student: 6 },
  EUR: { starter: 55, professional: 165, enterprise: 550, perInterview: 2.3, student: 5.5 },
  GBP: { starter: 48, professional: 144, enterprise: 480, perInterview: 2, student: 5 },
};

const tiers = [
  {
    name: 'Starter',
    key: 'starter' as const,
    description: 'Perfect for small teams getting started with AI interviews.',
    features: [
      '25 interviews / month',
      'AI Chat interviews',
      '5 industry domains',
      'Basic reports & analytics',
      'Email support',
      '2 user accounts',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Professional',
    key: 'professional' as const,
    description: 'Best for growing companies scaling their hiring process.',
    badge: 'MOST POPULAR',
    features: [
      '100 interviews / month',
      'Chat + Voice interviews',
      'All 32 industry domains',
      'Custom question banks',
      'Advanced analytics & reports',
      'Priority support',
      '10 user accounts',
      'Resume screening AI',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    key: 'enterprise' as const,
    description: 'For large organizations with advanced needs.',
    features: [
      '500 interviews / month',
      'Chat + Voice + Video',
      'All 32 domains + custom',
      'White-label branding',
      'API access & webhooks',
      'SSO / SAML integration',
      'Unlimited user accounts',
      'Dedicated account manager',
      'Custom AI model tuning',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

function formatPrice(amount: number, currency: Currency): string {
  const sym = currencySymbols[currency];
  if (currency === 'INR') {
    return `${sym}${amount.toLocaleString('en-IN')}`;
  }
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: amount % 1 !== 0 ? 2 : 0 })}`;
}

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [annual, setAnnual] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const { openCheckout, isProcessing: isCheckoutProcessing } = useDodoCheckout();

  const currentPrices = prices[currency];
  const discount = annual ? 0.8 : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      {/* Nav */}
      <nav className="relative z-10 border-b border-gray-200/60 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">HireEz</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 animate-fade-in-up">
          Simple, transparent <span className="text-gradient-vibrant">pricing</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          Choose the plan that fits your hiring needs. Scale up or down anytime.
        </p>

        {/* Toggles */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          {/* Billing toggle — hidden for student */}
          {!isStudent && (
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
                Annual <span className="text-emerald-600 font-semibold">(Save 20%)</span>
              </span>
            </div>
          )}

          {/* Student toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${!isStudent ? 'text-gray-900' : 'text-gray-400'}`}>Business</span>
            <button
              onClick={() => setIsStudent(!isStudent)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isStudent ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isStudent ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${isStudent ? 'text-gray-900' : 'text-gray-400'}`}>
              Student
            </span>
          </div>

          {/* Currency toggle */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            {(Object.keys(prices) as Currency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  currency === cur
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        {isStudent ? (
          /* Student pricing */
          <div className="max-w-lg mx-auto animate-fade-in-up">
            <div className="relative rounded-2xl p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-2xl shadow-emerald-500/25">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  COLLEGE STUDENT
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Student Plan</h3>
                <p className="mt-2 text-sm text-emerald-100">
                  Affordable AI interview practice for college students preparing for placements.
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">
                    {formatPrice(currentPrices.student, currency)}
                  </span>
                  <span className="text-sm text-emerald-200">/ student</span>
                </div>
                <p className="text-xs mt-2 text-emerald-200">One-time per interview session</p>
              </div>

              <button
                onClick={() => openCheckout({ plan: 'student' })}
                disabled={isCheckoutProcessing}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-emerald-700 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
              >
                {isCheckoutProcessing ? 'Processing...' : 'Get Started'}
              </button>

              <ul className="mt-8 space-y-3">
                {[
                  'AI-powered mock interviews',
                  'All 32 industry domains',
                  'Instant AI feedback & scoring',
                  'Strengths & improvement areas',
                  'Resume screening practice',
                  'Chat + Voice interview modes',
                  'Detailed performance report',
                  'Valid college email required',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-emerald-50">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Placement cell note */}
              <div className="mt-6 pt-5 border-t border-emerald-500/30">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    College placement cells can use HireEz to conduct AI-powered mock interviews for students, helping them practice and prepare for real placements with instant AI feedback, scoring, and detailed performance reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Business pricing */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 animate-fade-in-up ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-2xl shadow-primary-500/25 scale-105 z-10'
                    : 'bg-white border border-gray-200/80 shadow-card hover-lift'
                }`}
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {tier.name}
                  </h3>
                  <p className={`mt-2 text-sm ${tier.highlight ? 'text-primary-100' : 'text-gray-500'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(Math.round(currentPrices[tier.key] * discount), currency)}
                    </span>
                    <span className={`text-sm ${tier.highlight ? 'text-primary-200' : 'text-gray-400'}`}>
                      /mo
                    </span>
                  </div>
                  {annual && (
                    <p className={`text-xs mt-1 ${tier.highlight ? 'text-primary-200' : 'text-gray-400'}`}>
                      Billed annually ({formatPrice(Math.round(currentPrices[tier.key] * discount * 12), currency)}/yr)
                    </p>
                  )}
                </div>

                <button
                  onClick={() => openCheckout({ plan: tier.key })}
                  disabled={isCheckoutProcessing}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${
                    tier.highlight
                      ? 'bg-white text-primary-700 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
                      : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]'
                  }`}
                >
                  {isCheckoutProcessing ? 'Processing...' : tier.cta}
                </button>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlight ? 'text-primary-200' : 'text-primary-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${tier.highlight ? 'text-primary-50' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-interview pricing — hidden for student */}
      {!isStudent && <div className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-8 text-center shadow-card animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900">Need more interviews?</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Additional interviews beyond your plan limit are billed per interview.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-gradient">
              {formatPrice(currentPrices.perInterview, currency)}
            </span>
            <span className="text-gray-400 text-sm">/ interview</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
            {(Object.keys(prices) as Currency[]).map((cur) => (
              <span key={cur}>
                {currencySymbols[cur]}{prices[cur].perInterview} {cur}
              </span>
            ))}
          </div>
        </div>
      </div>}

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">AI</span>
            </div>
            <span className="text-sm text-gray-500">HireEz &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/login" className="hover:text-gray-600 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-gray-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
