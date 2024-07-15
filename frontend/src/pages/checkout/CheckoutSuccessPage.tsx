import { Link, useSearchParams } from 'react-router-dom';

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const paymentId = params.get('payment_id');
  const status = params.get('status');

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {status === 'succeeded' || !status ? (
          <>
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
            <p className="text-gray-400 mb-2">
              Thank you for your purchase. Your student plan is now active.
            </p>
            {paymentId && (
              <p className="text-xs text-gray-500 mb-6">Payment ID: {paymentId}</p>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Payment {status}</h1>
            <p className="text-gray-400 mb-6">
              Something went wrong with your payment. Please try again.
            </p>
          </>
        )}

        <div className="flex flex-col gap-3">
          <Link
            to="/register?plan=student"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:from-primary-700 hover:to-primary-600 transition-all"
          >
            Create Your Account
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
