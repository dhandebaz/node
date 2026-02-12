import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
  private static instance: Razorpay;

  private static getInstance() {
    if (!this.instance) {
      this.instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_missing',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_missing',
      });
    }
    return this.instance;
  }

  /**
   * Create a payment link
   */
  static async createPaymentLink(tenantId: string, options: {
    amount: number;
    currency: string;
    description: string;
    customer: {
      name: string;
      email?: string;
      contact?: string;
    };
    reference_id: string;
    callback_url: string;
    notes?: Record<string, any>;
  }) {
    const instance = this.getInstance();

    try {
      const paymentLink = await instance.paymentLink.create({
        amount: options.amount * 100, // Convert to paise
        currency: options.currency,
        accept_partial: false,
        description: options.description,
        customer: {
          name: options.customer.name,
          email: options.customer.email,
          contact: options.customer.contact
        },
        notify: {
          sms: true,
          email: true
        },
        reminder_enable: true,
        reference_id: options.reference_id,
        callback_url: options.callback_url,
        callback_method: "get",
        notes: {
          ...options.notes,
          tenant_id: tenantId
        }
      });
      return paymentLink;
    } catch (error) {
      console.error('Razorpay Create Payment Link Error:', error);
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
          return {
              id: `plink_mock_${Date.now()}`,
              short_url: `http://localhost:3000/mock-payment/${options.reference_id}`,
              status: 'created'
          };
      }
      throw new Error('Failed to create payment link');
    }
  }

  /**
   * Create a new order for top-up
   */
  static async createOrder(tenantId: string, options: { amount: number, currency: string, receipt: string, notes?: Record<string, any> }) {
    const instance = this.getInstance();
    
    const orderOptions = {
      amount: options.amount, // Expecting amount in paise
      currency: options.currency,
      receipt: options.receipt,
      payment_capture: 1, // Auto capture
      notes: {
        ...options.notes,
        tenant_id: tenantId
      }
    };

    try {
      const order = await instance.orders.create(orderOptions);
      return order;
    } catch (error) {
      console.error('Razorpay Create Order Error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify payment signature
   */
  static verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_missing';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generated_signature === signature;
  }

  /**
   * Create a subscription
   */
  static async createSubscription(planId: string, tenantId: string) {
    const instance = this.getInstance();
    
    const PLAN_MAP: Record<string, string> = {
        pro: process.env.RAZORPAY_PLAN_PRO || 'plan_pro_test',
        business: process.env.RAZORPAY_PLAN_BUSINESS || 'plan_business_test'
    };
    
    const razorpayPlanId = PLAN_MAP[planId] || planId;

    try {
      const subscription = await instance.subscriptions.create({
        plan_id: razorpayPlanId,
        customer_notify: 1,
        total_count: 120, // 10 years
        quantity: 1,
        notes: {
            internal_plan: planId,
            tenant_id: tenantId
        }
      });
      return subscription;
    } catch (error) {
      console.error('Razorpay Create Subscription Error:', error);
      // Fallback for development if plan doesn't exist
      if (process.env.NODE_ENV === 'development') {
          return {
              id: `sub_mock_${Date.now()}`,
              plan_id: razorpayPlanId,
              status: 'created'
          };
      }
      throw new Error('Failed to create subscription');
    }
  }
}
