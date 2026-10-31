import { api } from '@/services/api';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  amountInRupees: number;
  currency: string;
  keyId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    outstanding: number;
  };
}

export interface RazorpayVerificationResult {
  success: boolean;
  message: string;
  payment: any;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay checkout flow:
 * 1. Requests server-side order creation for invoice outstanding amount
 * 2. Launches Razorpay modal
 * 3. Verifies HMAC signature on backend upon completion
 */
export const launchRazorpayCheckout = async (params: {
  invoiceId: string;
  onSuccess: (result: RazorpayVerificationResult) => void;
  onError: (error: string) => void;
  onDismiss?: () => void;
}): Promise<void> => {
  const { invoiceId, onSuccess, onError, onDismiss } = params;

  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Razorpay Checkout SDK could not be loaded. Please check your network connection.');
    }

    // 1. Create server-side order
    const orderRes = await api.post('/payments/razorpay/order', { invoiceId });
    const orderData: RazorpayOrderResponse = orderRes.data?.data;

    if (!orderData || !orderData.orderId) {
      throw new Error(orderRes.data?.message || 'Failed to create payment order on server');
    }

    // 2. Configure Razorpay modal
    const options = {
      key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TuRyvEsUuxvjrd',
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: 'Brightloop Subscriptions',
      description: `Payment for Invoice ${orderData.invoice.invoiceNumber}`,
      order_id: orderData.orderId,
      prefill: {
        name: orderData.customer?.name || '',
        email: orderData.customer?.email || '',
        contact: orderData.customer?.phone || '',
      },
      theme: {
        color: '#4f46e5',
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // 3. Cryptographically verify signature on backend
          const verifyRes = await api.post('/payments/razorpay/verify', {
            invoiceId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          onSuccess(verifyRes.data?.data);
        } catch (err: any) {
          const message =
            err.response?.data?.message ||
            err.message ||
            'Backend payment signature verification failed';
          onError(message);
        }
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (failResp: any) => {
      const errMsg =
        failResp.error?.description ||
        failResp.error?.reason ||
        'Payment authorization failed by gateway';
      onError(errMsg);
    });

    rzp.open();
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Failed to initialize Razorpay checkout';
    onError(message);
  }
};

