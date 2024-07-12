import { useCallback, useState } from 'react';

const DODO_MODE = (import.meta.env.VITE_DODO_MODE as 'test' | 'live') || 'test';

const CHECKOUT_DOMAINS: Record<string, string> = {
  test: 'https://test.checkout.dodopayments.com',
  live: 'https://checkout.dodopayments.com',
};

const PRODUCT_IDS: Record<string, string> = {
  student: import.meta.env.VITE_DODO_STUDENT_PRODUCT_ID || '',
  starter: import.meta.env.VITE_DODO_STARTER_PRODUCT_ID || '',
  professional: import.meta.env.VITE_DODO_PROFESSIONAL_PRODUCT_ID || '',
  enterprise: import.meta.env.VITE_DODO_ENTERPRISE_PRODUCT_ID || '',
};

interface CheckoutOptions {
  plan: 'student' | 'starter' | 'professional' | 'enterprise';
  quantity?: number;
  email?: string;
  name?: string;
}

export function useDodoCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);

  const openCheckout = useCallback((options: CheckoutOptions) => {
    const productId = PRODUCT_IDS[options.plan];

    if (!productId) {
      alert('Payment gateway is being set up. Please try again later or contact support.');
      return;
    }

    setIsProcessing(true);

    const params = new URLSearchParams();
    params.set('quantity', String(options.quantity || 1));
    params.set('redirect_url', `${window.location.origin}/checkout/success`);
    if (options.email) params.set('email', options.email);
    if (options.name) params.set('firstName', options.name);

    const checkoutUrl = `${CHECKOUT_DOMAINS[DODO_MODE]}/buy/${productId}?${params.toString()}`;

    // Redirect to Dodo Payments checkout page
    window.location.href = checkoutUrl;
  }, []);

  return { openCheckout, isProcessing };
}
