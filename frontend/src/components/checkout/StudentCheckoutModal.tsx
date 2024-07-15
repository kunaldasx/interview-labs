import { useState } from 'react';

interface StudentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (quantity: number) => void;
  pricePerStudent: number;
  currencySymbol: string;
  currency: string;
  formatPrice: (amount: number) => string;
}

export default function StudentCheckoutModal({
  isOpen,
  onClose,
  onProceed,
  pricePerStudent,
  currencySymbol,
  currency,
  formatPrice,
}: StudentCheckoutModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const total = pricePerStudent * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Placement Plan</h3>
          <p className="text-sm text-gray-400 mt-1">Enter the number of students</p>
        </div>

        {/* Quantity input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Number of Students</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-white font-bold hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={999}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, Math.min(999, val)));
              }}
              className="flex-1 h-10 rounded-lg bg-gray-800 border border-gray-700 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            <button
              onClick={() => setQuantity(Math.min(999, quantity + 1))}
              className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-white font-bold hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Price per student</span>
            <span className="text-gray-300">{formatPrice(pricePerStudent)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Students</span>
            <span className="text-gray-300">x {quantity}</span>
          </div>
          <div className="border-t border-gray-700/50 pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Total</span>
            <span className="text-xl font-bold text-emerald-400">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => onProceed(quantity)}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
        >
          Proceed to Payment
        </button>
        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
