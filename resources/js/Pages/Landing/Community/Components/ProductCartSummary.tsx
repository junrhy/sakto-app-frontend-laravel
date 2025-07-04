interface CartItem {
  id: number;
  quantity: number;
  variant?: any;
}

interface ProductCartSummaryProps {
  cartItems: CartItem[];
  getCartItemCount: () => number;
  getCartTotal: () => number;
  formatPrice: (price: number | string) => string;
  handleCheckout: () => void;
}

export default function ProductCartSummary({
  cartItems,
  getCartItemCount,
  getCartTotal,
  formatPrice,
  handleCheckout
}: ProductCartSummaryProps) {
  if (getCartItemCount() === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center justify-between sm:justify-start">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''} in cart
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 sm:ml-4">
            Total: {formatPrice(getCartTotal())}
          </span>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
        Checkout
      </button>
    </div>
  );
} 