import { useEffect, useRef, useCallback, useState } from 'react';
import { DodoPayments } from 'dodopayments-checkout';

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
  const initialized = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    DodoPayments.Initialize({
      mode: DODO_MODE,
      displayType: 'overlay',
      onEvent: (event: any) => {
        if (event.event_type === 'checkout.opened') {
          setIsProcessing(false);
        }
        if (event.event_type === 'checkout.status') {
          const status = event.data?.message?.status;
          if (status === 'succeeded') {
            setIsProcessing(false);
          }
        }
        if (event.event_type === 'checkout.closed') {
          setIsProcessing(false);
        }
        if (event.event_type === 'checkout.error') {
          setIsProcessing(false);
        }
      },
    });
  }, []);

  const openCheckout = useCallback(async (options: CheckoutOptions) => {
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

    try {
      await DodoPayments.Checkout.open({ checkoutUrl });
    } catch {
      setIsProcessing(false);
    }
  }, []);

  return { openCheckout, isProcessing };
}
