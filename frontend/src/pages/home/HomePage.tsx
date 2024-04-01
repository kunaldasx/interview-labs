import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

// ── Pricing data (shared with PricingPage) ──────────────────────────────────

type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

const currencySymbols: Record<Currency, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const prices: Record<Currency, { starter: number; professional: number; enterprise: number; perInterview: number }> = {
  INR: { starter: 4999, professional: 14999, enterprise: 49999, perInterview: 200 },
  USD: { starter: 60, professional: 180, enterprise: 600, perInterview: 2.5 },
  EUR: { starter: 55, professional: 165, enterprise: 550, perInterview: 2.3 },
  GBP: { starter: 48, professional: 144, enterprise: 480, perInterview: 2 },
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
    cta: 'Get Started',
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
    cta: 'Get Started',
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

// ── Feature cards data ──────────────────────────────────────────────────────

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'AI-Powered Interviews',
    description: 'Conduct intelligent interviews with AI that adapts questions based on candidate responses in real-time.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '32 Industry Domains',
    description: 'Pre-built question banks across Healthcare, Finance, Manufacturing, Logistics, and Engineering.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Smart Resume Screening',
    description: 'AI-powered resume parsing and screening to shortlist the best candidates automatically.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Real-time Evaluation',
    description: 'Instant scoring and detailed evaluation reports with actionable hiring recommendations.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Voice + Chat + Video',
    description: 'Flexible interview modes — text chat, voice-based, or video interviews to suit every scenario.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards and reports to track hiring metrics and optimize your recruitment pipeline.',
  },
];

// ── Domain sectors ──────────────────────────────────────────────────────────

const sectors = [
  { name: 'Healthcare', count: 6, icon: '🏥' },
  { name: 'Finance', count: 5, icon: '🏦' },
  { name: 'Manufacturing', count: 6, icon: '🏭' },
  { name: 'Logistics', count: 5, icon: '🚚' },
  { name: 'Engineering', count: 10, icon: '⚙️' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [annual, setAnnual] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const currentPrices = prices[currency];
  const discount = annual ? 0.8 : 1;

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const data = await authAPI.demoLogin();
      login(data.access_token, data.user);
      localStorage.setItem('refresh_token', data.refresh_token);
      toast.success('Welcome to the demo!');
      navigate('/dashboard');
    } catch {
      toast.error('Demo login failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-lg text-white">HireEz</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#domains" className="text-sm text-gray-400 hover:text-white transition-colors">Domains</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
            <button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="text-sm bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2 rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition-all hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
            >
              {demoLoading ? 'Loading...' : 'Try Demo'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-primary-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight leading-tight">
            Hire Smarter With{' '}
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-purple-400 bg-clip-text text-transparent">
              AI-Powered
            </span>{' '}
            Interviews
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Screen, interview, and evaluate candidates across 32 industry domains — powered by AI.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:from-primary-700 hover:to-primary-600 transition-all hover:shadow-xl hover:shadow-primary-500/25 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/5 hover:border-gray-600 hover:text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
            >
              {demoLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  Try Demo
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────── */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                hire better
              </span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              A complete AI-powered interview platform built for non-IT industries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 hover:bg-gray-900/80 hover:border-gray-700/50 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 mb-4 group-hover:bg-primary-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Domains Section ────────────────────────────────────────────── */}
      <section id="domains" className="relative py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">32 domains</span>{' '}
              across 5 sectors
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              Pre-seeded question banks tailored to non-IT industry roles.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sectors.map((sector) => (
              <div
                key={sector.name}
                className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 text-center hover:bg-gray-900/80 hover:border-gray-700/50 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{sector.icon}</div>
                <h3 className="font-semibold text-white mb-1">{sector.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  {sector.count} domains
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ────────────────────────────────────────────── */}
      <section id="pricing" className="relative py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Simple, transparent{' '}
              <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                pricing
              </span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              Choose the plan that fits your hiring needs. Scale up or down anytime.
            </p>

            {/* Toggles */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Billing toggle */}
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                <button
                  onClick={() => setAnnual(!annual)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-primary-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-6' : ''}`} />
                </button>
                <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>
                  Annual <span className="text-emerald-400 font-semibold">(Save 20%)</span>
                </span>
              </div>

              {/* Currency toggle */}
              <div className="flex items-center bg-gray-900 rounded-lg border border-gray-800 p-1">
                {(Object.keys(prices) as Currency[]).map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      currency === cur
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-2xl shadow-primary-500/25 md:scale-105 z-10'
                    : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${tier.highlight ? 'text-white' : 'text-white'}`}>
                    {tier.name}
                  </h3>
                  <p className={`mt-2 text-sm ${tier.highlight ? 'text-primary-100' : 'text-gray-400'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(Math.round(currentPrices[tier.key] * discount), currency)}
                    </span>
                    <span className={`text-sm ${tier.highlight ? 'text-primary-200' : 'text-gray-500'}`}>
                      /mo
                    </span>
                  </div>
                  {annual && (
                    <p className={`text-xs mt-1 ${tier.highlight ? 'text-primary-200' : 'text-gray-500'}`}>
                      Billed annually ({formatPrice(Math.round(currentPrices[tier.key] * discount * 12), currency)}/yr)
                    </p>
                  )}
                </div>

                <Link
                  to={tier.key === 'enterprise' ? '/register?plan=enterprise' : `/register?plan=${tier.key}`}
                  className={`block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 ${
                    tier.highlight
                      ? 'bg-white text-primary-700 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
                      : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]'
                  }`}
                >
                  {tier.cta}
                </Link>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlight ? 'text-primary-200' : 'text-primary-400'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${tier.highlight ? 'text-primary-50' : 'text-gray-300'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Per-interview pricing */}
          <div className="max-w-3xl mx-auto mt-16">
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-8 text-center">
              <h3 className="text-lg font-bold text-white">Need more interviews?</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Additional interviews beyond your plan limit are billed per interview.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  {formatPrice(currentPrices.perInterview, currency)}
                </span>
                <span className="text-gray-500 text-sm">/ interview</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                {(Object.keys(prices) as Currency[]).map((cur) => (
                  <span key={cur}>
                    {currencySymbols[cur]}{prices[cur].perInterview} {cur}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">AI</span>
            </div>
            <span className="text-sm text-gray-500">HireEz &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-gray-300 transition-colors">Register</Link>
            <a href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
